"use server";

import { db } from "@/db";
import { onboardingTemplates, onboardingProgress, users, tasks } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireHR, requireAuth, requireOrgContext } from "@/lib/authorize";

type OnboardingStep = {
    title: string;
    description?: string;
    type: "task" | "document" | "checklist";
    required: boolean;
};

/**
 * Create an onboarding template - requires HR or admin role
 * MULTI-TENANT: Associates template with user's organization
 */
export async function createOnboardingTemplate(formData: FormData) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized to manage onboarding" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const stepsJson = formData.get("steps")?.toString();

    if (!name) return { error: "Name required" };

    let steps: OnboardingStep[] = [];
    if (stepsJson) {
        try {
            steps = JSON.parse(stepsJson);
        } catch { }
    }

    await db.insert(onboardingTemplates).values({
        organizationId: orgContext.orgId,
        name,
        description: description || null,
        steps,
    });

    revalidatePath("/onboarding");
    return { success: true };
}

/**
 * Get onboarding templates - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getOnboardingTemplates() {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select()
        .from(onboardingTemplates)
        .where(eq(onboardingTemplates.organizationId, orgContext.orgId))
        .orderBy(desc(onboardingTemplates.createdAt));
}

/**
 * Get a single onboarding template - requires HR or admin role
 * MULTI-TENANT: Verifies template belongs to user's organization
 */
export async function getOnboardingTemplate(id: string) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return null;
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    const result = await db.select()
        .from(onboardingTemplates)
        .where(and(
            eq(onboardingTemplates.id, id),
            eq(onboardingTemplates.organizationId, orgContext.orgId)
        ));
    return result[0] || null;
}

/**
 * Start onboarding for a user - requires HR or admin role
 * MULTI-TENANT: Verifies user is in same organization
 */
export async function startOnboarding(userId: string, templateId: string) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized to start onboarding" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Verify user belongs to this org
    const user = await db.select({ id: users.id })
        .from(users)
        .where(and(
            eq(users.id, userId),
            eq(users.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!user[0]) return { error: "User not found" };

    // Verify template belongs to this org
    const template = await db.select({ id: onboardingTemplates.id })
        .from(onboardingTemplates)
        .where(and(
            eq(onboardingTemplates.id, templateId),
            eq(onboardingTemplates.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!template[0]) return { error: "Template not found" };

    // Check if already started
    const existing = await db.select().from(onboardingProgress)
        .where(eq(onboardingProgress.userId, userId));

    if (existing.length > 0) {
        return { error: "User already has onboarding in progress" };
    }

    await db.insert(onboardingProgress).values({
        userId,
        templateId,
        status: "in-progress",
        completedSteps: [],
    });

    revalidatePath("/onboarding");
    revalidatePath(`/team/${userId}`);
    return { success: true };
}

/**
 * Get onboarding progress - HR sees all, employees see only their own
 * MULTI-TENANT: Filters by organization
 */
export async function getOnboardingProgress(userId?: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const query = db.select({
        id: onboardingProgress.id,
        userId: onboardingProgress.userId,
        userName: users.name,
        userEmail: users.email,
        templateId: onboardingProgress.templateId,
        templateName: onboardingTemplates.name,
        status: onboardingProgress.status,
        completedSteps: onboardingProgress.completedSteps,
        startedAt: onboardingProgress.startedAt,
        completedAt: onboardingProgress.completedAt,
        steps: onboardingTemplates.steps,
    })
        .from(onboardingProgress)
        .innerJoin(users, eq(onboardingProgress.userId, users.id))
        .innerJoin(onboardingTemplates, eq(onboardingProgress.templateId, onboardingTemplates.id))
        .where(eq(users.organizationId, orgContext.orgId))
        .orderBy(desc(onboardingProgress.startedAt));

    const results = await query;

    // Filter by userId if provided
    let filtered = results;
    if (userId) {
        filtered = results.filter(p => p.userId === userId);
    }

    // Non-managers can only see their own onboarding progress
    if (authResult.user.role === "member") {
        filtered = filtered.filter(p => p.userId === authResult.user!.id);
    }

    return filtered;
}

/**
 * Complete an onboarding step - user can complete their own, HR can complete any
 * MULTI-TENANT: Verifies progress belongs to user in same organization
 */
export async function completeOnboardingStep(progressId: string, stepIndex: number) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: "Not authenticated" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Get progress and verify user is in same org
    const progressWithUser = await db.select({
        id: onboardingProgress.id,
        userId: onboardingProgress.userId,
        templateId: onboardingProgress.templateId,
        completedSteps: onboardingProgress.completedSteps,
        userOrgId: users.organizationId,
    })
        .from(onboardingProgress)
        .innerJoin(users, eq(onboardingProgress.userId, users.id))
        .where(eq(onboardingProgress.id, progressId))
        .limit(1);

    const progress = progressWithUser[0];
    if (!progress) return { error: "Progress not found" };
    if (progress.userOrgId !== orgContext.orgId) return { error: "Progress not found" };

    // Check authorization - user can complete own steps, HR/manager can complete any
    if (progress.userId !== authResult.user.id && authResult.user.role === "member") {
        return { error: "You can only complete your own onboarding steps" };
    }

    const completed = (progress.completedSteps as number[]) || [];
    if (!completed.includes(stepIndex)) {
        completed.push(stepIndex);
    }

    // Get template to check if all done
    const [template] = await db.select().from(onboardingTemplates)
        .where(eq(onboardingTemplates.id, progress.templateId));

    const totalSteps = (template?.steps as OnboardingStep[])?.length || 0;
    const allDone = completed.length >= totalSteps;

    await db.update(onboardingProgress)
        .set({
            completedSteps: completed,
            status: allDone ? "completed" : "in-progress",
            completedAt: allDone ? new Date() : null,
        })
        .where(eq(onboardingProgress.id, progressId));

    revalidatePath("/onboarding");
    return { success: true, completed: allDone };
}

/**
 * Delete an onboarding template - requires HR or admin role
 * MULTI-TENANT: Verifies template belongs to user's organization
 */
export async function deleteOnboardingTemplate(id: string) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized to delete templates" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(onboardingTemplates).where(and(
        eq(onboardingTemplates.id, id),
        eq(onboardingTemplates.organizationId, orgContext.orgId)
    ));
    revalidatePath("/onboarding");
    return { success: true };
}


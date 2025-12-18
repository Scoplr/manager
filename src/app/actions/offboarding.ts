"use server";

/**
 * Offboarding Actions
 * 
 * Employee offboarding workflow management
 */

import { db } from "@/db";
import { offboardingTemplates, offboardingProgress, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireHR, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

// Types
export interface OffboardingTemplate {
    id: string;
    name: string;
    description?: string | null;
    steps: Array<{
        title: string;
        description?: string;
        type: "task" | "checklist" | "document";
        assignedTo: "hr" | "manager" | "it" | "employee";
        required: boolean;
    }>;
    createdAt: Date;
}

export interface OffboardingProgressRecord {
    id: string;
    userId: string;
    userName?: string | null;
    templateId: string;
    templateName?: string | null;
    status: string;
    completedSteps: number[];
    lastWorkingDay?: Date | null;
    startedAt: Date;
    completedAt?: Date | null;
    progress: number;
}

// ============ CREATE TEMPLATE ============

export async function createOffboardingTemplate(formData: FormData) {
    const { authorized, error } = await requireHR();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim();
    const stepsJson = formData.get("steps")?.toString();
    const steps = stepsJson ? JSON.parse(stepsJson) : [];

    if (!name) {
        return { error: "Template name is required" };
    }

    try {
        const [template] = await db.insert(offboardingTemplates).values({
            organizationId: orgContext.orgId,
            name,
            description: description || null,
            steps,
        }).returning();

        revalidatePath("/settings/offboarding");
        return { success: true, template };
    } catch (error) {
        console.error("Failed to create offboarding template:", error);
        return { error: "Failed to create template" };
    }
}

// ============ GET TEMPLATES ============

export async function getOffboardingTemplates(): Promise<OffboardingTemplate[]> {
    const { authorized } = await requireHR();
    if (!authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const templates = await db
            .select()
            .from(offboardingTemplates)
            .where(eq(offboardingTemplates.organizationId, orgContext.orgId))
            .orderBy(desc(offboardingTemplates.createdAt));

        return templates.map((t) => ({
            ...t,
            steps: t.steps || [],
        }));
    } catch (error) {
        console.error("Failed to get offboarding templates:", error);
        return [];
    }
}

// ============ START OFFBOARDING ============

export async function startOffboarding(formData: FormData) {
    const { authorized, error } = await requireHR();
    if (!authorized) return { error };

    const userId = formData.get("userId")?.toString();
    const templateId = formData.get("templateId")?.toString();
    const lastWorkingDayStr = formData.get("lastWorkingDay")?.toString();

    if (!userId || !templateId) {
        return { error: "User and template are required" };
    }

    // Check if user already has active offboarding
    const existing = await db
        .select({ id: offboardingProgress.id })
        .from(offboardingProgress)
        .where(
            and(
                eq(offboardingProgress.userId, userId),
                eq(offboardingProgress.status, "in-progress")
            )
        )
        .limit(1);

    if (existing[0]) {
        return { error: "User already has an active offboarding process" };
    }

    try {
        const [progress] = await db.insert(offboardingProgress).values({
            userId,
            templateId,
            status: "in-progress",
            lastWorkingDay: lastWorkingDayStr ? new Date(lastWorkingDayStr) : null,
        }).returning();

        revalidatePath("/offboarding");
        revalidatePath(`/team/${userId}`);
        return { success: true, progress };
    } catch (error) {
        console.error("Failed to start offboarding:", error);
        return { error: "Failed to start offboarding" };
    }
}

// ============ GET OFFBOARDING PROGRESS ============

export async function getOffboardingProgress(userId?: string): Promise<OffboardingProgressRecord[]> {
    const { authorized } = await requireAuth();
    if (!authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const conditions = [eq(users.organizationId, orgContext.orgId)];
        if (userId) {
            conditions.push(eq(offboardingProgress.userId, userId));
        }

        const progressRecords = await db
            .select({
                id: offboardingProgress.id,
                userId: offboardingProgress.userId,
                userName: users.name,
                templateId: offboardingProgress.templateId,
                templateName: offboardingTemplates.name,
                status: offboardingProgress.status,
                completedSteps: offboardingProgress.completedSteps,
                lastWorkingDay: offboardingProgress.lastWorkingDay,
                startedAt: offboardingProgress.startedAt,
                completedAt: offboardingProgress.completedAt,
            })
            .from(offboardingProgress)
            .leftJoin(users, eq(offboardingProgress.userId, users.id))
            .leftJoin(offboardingTemplates, eq(offboardingProgress.templateId, offboardingTemplates.id))
            .where(and(...conditions))
            .orderBy(desc(offboardingProgress.startedAt));

        // Calculate progress percentage
        return await Promise.all(
            progressRecords.map(async (record) => {
                const template = await db
                    .select({ steps: offboardingTemplates.steps })
                    .from(offboardingTemplates)
                    .where(eq(offboardingTemplates.id, record.templateId))
                    .limit(1);

                const totalSteps = (template[0]?.steps as unknown[])?.length || 1;
                const completed = record.completedSteps?.length || 0;

                return {
                    ...record,
                    completedSteps: record.completedSteps || [],
                    progress: Math.round((completed / totalSteps) * 100),
                };
            })
        );
    } catch (error) {
        console.error("Failed to get offboarding progress:", error);
        return [];
    }
}

// ============ COMPLETE STEP ============

export async function completeOffboardingStep(progressId: string, stepIndex: number) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return { error: "Not authenticated" };

    try {
        const record = await db
            .select({
                id: offboardingProgress.id,
                templateId: offboardingProgress.templateId,
                completedSteps: offboardingProgress.completedSteps,
            })
            .from(offboardingProgress)
            .where(eq(offboardingProgress.id, progressId))
            .limit(1);

        if (!record[0]) {
            return { error: "Progress record not found" };
        }

        const completedSteps = record[0].completedSteps || [];
        if (!completedSteps.includes(stepIndex)) {
            completedSteps.push(stepIndex);
        }

        // Check if all steps complete
        const template = await db
            .select({ steps: offboardingTemplates.steps })
            .from(offboardingTemplates)
            .where(eq(offboardingTemplates.id, record[0].templateId))
            .limit(1);

        const totalSteps = (template[0]?.steps as unknown[])?.length || 0;
        const isComplete = completedSteps.length >= totalSteps;

        await db
            .update(offboardingProgress)
            .set({
                completedSteps,
                status: isComplete ? "completed" : "in-progress",
                completedAt: isComplete ? new Date() : null,
            })
            .where(eq(offboardingProgress.id, progressId));

        revalidatePath("/offboarding");
        return { success: true, isComplete };
    } catch (error) {
        console.error("Failed to complete step:", error);
        return { error: "Failed to complete step" };
    }
}

// ============ CANCEL OFFBOARDING ============

export async function cancelOffboarding(progressId: string) {
    const { authorized, error } = await requireHR();
    if (!authorized) return { error };

    try {
        await db
            .update(offboardingProgress)
            .set({ status: "cancelled" })
            .where(eq(offboardingProgress.id, progressId));

        revalidatePath("/offboarding");
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel offboarding:", error);
        return { error: "Failed to cancel offboarding" };
    }
}

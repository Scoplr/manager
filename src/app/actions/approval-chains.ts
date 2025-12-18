"use server";

/**
 * Multi-Level Approval Chains
 * 
 * Configurable approval workflows
 */

import { db } from "@/db";
import { approvalChains, approvalProgress, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAdmin, requireAuth, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

// Types
export interface ApprovalChain {
    id: string;
    name: string;
    type: string;
    steps: Array<{
        order: number;
        approverRole?: string;
        approverUserId?: string;
        requiredApprovals: number;
    }>;
    conditions: {
        minAmount?: number;
        maxAmount?: number;
        minDays?: number;
        categories?: string[];
    };
    isActive: boolean | null;
    createdAt: Date;
}

export interface ApprovalProgressRecord {
    id: string;
    chainId: string;
    entityType: string;
    entityId: string;
    currentStep: number | null;
    status: string;
    stepApprovals: Array<{
        step: number;
        approvedBy: string;
        approvedAt: string;
        comment?: string;
    }>;
    createdAt: Date;
    completedAt?: Date | null;
}

// ============ CREATE CHAIN ============

export async function createApprovalChain(formData: FormData) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString()?.trim();
    const type = formData.get("type")?.toString();
    const stepsJson = formData.get("steps")?.toString();
    const conditionsJson = formData.get("conditions")?.toString();

    if (!name || !type) {
        return { error: "Name and type are required" };
    }

    const steps = stepsJson ? JSON.parse(stepsJson) : [];
    const conditions = conditionsJson ? JSON.parse(conditionsJson) : {};

    try {
        const [chain] = await db.insert(approvalChains).values({
            organizationId: orgContext.orgId,
            name,
            type,
            steps,
            conditions,
        }).returning();

        revalidatePath("/settings/approvals");
        return { success: true, chain };
    } catch (error) {
        console.error("Failed to create approval chain:", error);
        return { error: "Failed to create chain" };
    }
}

// ============ GET CHAINS ============

export async function getApprovalChains(type?: string): Promise<ApprovalChain[]> {
    const { authorized } = await requireAuth();
    if (!authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const conditions = [eq(approvalChains.organizationId, orgContext.orgId)];
        if (type) {
            conditions.push(eq(approvalChains.type, type));
        }

        const chains = await db
            .select()
            .from(approvalChains)
            .where(and(...conditions))
            .orderBy(desc(approvalChains.createdAt));

        return chains.map((c) => ({
            ...c,
            steps: c.steps || [],
            conditions: c.conditions || {},
        }));
    } catch (error) {
        console.error("Failed to get approval chains:", error);
        return [];
    }
}

// ============ INITIATE APPROVAL ============

export async function initiateApproval(
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown>
) {
    const { authorized } = await requireAuth();
    if (!authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Find applicable chain
    const chains = await db
        .select()
        .from(approvalChains)
        .where(
            and(
                eq(approvalChains.organizationId, orgContext.orgId),
                eq(approvalChains.type, entityType),
                eq(approvalChains.isActive, true)
            )
        );

    // Find chain that matches conditions
    let matchingChain = null;
    for (const chain of chains) {
        const conditions = chain.conditions || {};
        let matches = true;

        if (conditions.minAmount && metadata.amount && Number(metadata.amount) < conditions.minAmount) {
            matches = false;
        }
        if (conditions.maxAmount && metadata.amount && Number(metadata.amount) > conditions.maxAmount) {
            matches = false;
        }
        if (conditions.minDays && metadata.days && Number(metadata.days) < conditions.minDays) {
            matches = false;
        }

        if (matches) {
            matchingChain = chain;
            break;
        }
    }

    if (!matchingChain) {
        // No chain found - auto approve or use default
        return { success: true, autoApproved: true };
    }

    try {
        const [progress] = await db.insert(approvalProgress).values({
            chainId: matchingChain.id,
            entityType,
            entityId,
            currentStep: 0,
            status: "pending",
        }).returning();

        return { success: true, progress, chainId: matchingChain.id };
    } catch (error) {
        console.error("Failed to initiate approval:", error);
        return { error: "Failed to initiate approval" };
    }
}

// ============ PROCESS APPROVAL ============

export async function processApproval(
    progressId: string,
    approved: boolean,
    comment?: string
) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return { error: "Not authenticated" };

    const progress = await db
        .select()
        .from(approvalProgress)
        .where(eq(approvalProgress.id, progressId))
        .limit(1);

    if (!progress[0]) {
        return { error: "Approval not found" };
    }

    const chain = await db
        .select()
        .from(approvalChains)
        .where(eq(approvalChains.id, progress[0].chainId))
        .limit(1);

    if (!chain[0]) {
        return { error: "Chain not found" };
    }

    const steps = chain[0].steps || [];
    const currentStep = progress[0].currentStep || 0;
    const stepApprovals = progress[0].stepApprovals || [];

    if (!approved) {
        // Rejected - update status
        await db
            .update(approvalProgress)
            .set({
                status: "rejected",
                stepApprovals: [
                    ...stepApprovals,
                    {
                        step: currentStep,
                        approvedBy: user.id,
                        approvedAt: new Date().toISOString(),
                        comment,
                    },
                ],
                completedAt: new Date(),
            })
            .where(eq(approvalProgress.id, progressId));

        return { success: true, status: "rejected" };
    }

    // Add approval
    const newApprovals = [
        ...stepApprovals,
        {
            step: currentStep,
            approvedBy: user.id,
            approvedAt: new Date().toISOString(),
            comment,
        },
    ];

    const nextStep = currentStep + 1;
    const isComplete = nextStep >= steps.length;

    await db
        .update(approvalProgress)
        .set({
            currentStep: isComplete ? currentStep : nextStep,
            status: isComplete ? "approved" : "pending",
            stepApprovals: newApprovals,
            completedAt: isComplete ? new Date() : null,
        })
        .where(eq(approvalProgress.id, progressId));

    return {
        success: true,
        status: isComplete ? "approved" : "pending",
        nextStep: isComplete ? null : nextStep,
    };
}

// ============ GET PENDING APPROVALS ============

export async function getPendingApprovals(): Promise<ApprovalProgressRecord[]> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return [];

    try {
        const pending = await db
            .select()
            .from(approvalProgress)
            .where(eq(approvalProgress.status, "pending"))
            .orderBy(desc(approvalProgress.createdAt));

        return pending.map((p) => ({
            ...p,
            currentStep: p.currentStep || 0,
            stepApprovals: p.stepApprovals || [],
        }));
    } catch (error) {
        console.error("Failed to get pending approvals:", error);
        return [];
    }
}

// ============ DELETE CHAIN ============

export async function deleteApprovalChain(chainId: string) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    try {
        await db
            .delete(approvalChains)
            .where(
                and(
                    eq(approvalChains.id, chainId),
                    eq(approvalChains.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/settings/approvals");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete chain:", error);
        return { error: "Failed to delete chain" };
    }
}

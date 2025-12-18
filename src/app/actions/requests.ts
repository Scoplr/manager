"use server";

/**
 * Internal Requests Actions
 * 
 * IT, HR, Facilities requests management
 * MULTI-TENANT: All operations scoped by organization
 */

import { db } from "@/db";
import { internalRequests, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth, requireOrgContext } from "@/lib/authorize";

/**
 * Create internal request
 * MULTI-TENANT: Associates request with user's organization
 */
export async function createRequest(formData: FormData) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: "Not authenticated" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const category = formData.get("category")?.toString() as any;
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const priority = formData.get("priority")?.toString() || "normal";

    if (!category || !title) {
        return { error: "Category and title required" };
    }

    await db.insert(internalRequests).values({
        organizationId: orgContext.orgId,
        requesterId: authResult.user.id,
        category,
        title,
        description: description || null,
        priority,
    });

    revalidatePath("/requests");
    return { success: true };
}

/**
 * Get requests
 * MULTI-TENANT: Filters by organization
 */
export async function getRequests(status?: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const results = await db.select({
        id: internalRequests.id,
        requesterId: internalRequests.requesterId,
        requesterName: users.name,
        assigneeId: internalRequests.assigneeId,
        category: internalRequests.category,
        title: internalRequests.title,
        description: internalRequests.description,
        status: internalRequests.status,
        priority: internalRequests.priority,
        resolvedAt: internalRequests.resolvedAt,
        createdAt: internalRequests.createdAt,
    })
        .from(internalRequests)
        .leftJoin(users, eq(internalRequests.requesterId, users.id))
        .where(eq(internalRequests.organizationId, orgContext.orgId))
        .orderBy(desc(internalRequests.createdAt));

    if (status) {
        return results.filter(r => r.status === status);
    }
    return results;
}

/**
 * Update request status
 * MULTI-TENANT: Verifies request belongs to organization
 */
export async function updateRequestStatus(id: string, status: "open" | "in-progress" | "resolved" | "closed") {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const updates: any = { status };
    if (status === "resolved" || status === "closed") {
        updates.resolvedAt = new Date();
    }

    await db.update(internalRequests)
        .set(updates)
        .where(and(
            eq(internalRequests.id, id),
            eq(internalRequests.organizationId, orgContext.orgId)
        ));

    revalidatePath("/requests");
    return { success: true };
}

/**
 * Assign request
 * MULTI-TENANT: Verifies request belongs to organization
 */
export async function assignRequest(id: string, assigneeId: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.update(internalRequests)
        .set({ assigneeId, status: "in-progress" })
        .where(and(
            eq(internalRequests.id, id),
            eq(internalRequests.organizationId, orgContext.orgId)
        ));

    revalidatePath("/requests");
    return { success: true };
}

/**
 * Delete request
 * MULTI-TENANT: Verifies request belongs to organization
 */
export async function deleteRequest(id: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(internalRequests).where(and(
        eq(internalRequests.id, id),
        eq(internalRequests.organizationId, orgContext.orgId)
    ));
    revalidatePath("/requests");
    return { success: true };
}

/**
 * Get request statistics
 * MULTI-TENANT: Filters by organization
 */
export async function getRequestStats() {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { open: 0, inProgress: 0, resolved: 0, total: 0 };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { open: 0, inProgress: 0, resolved: 0, total: 0 };

    const all = await db.select({ status: internalRequests.status })
        .from(internalRequests)
        .where(eq(internalRequests.organizationId, orgContext.orgId));

    return {
        open: all.filter(r => r.status === "open").length,
        inProgress: all.filter(r => r.status === "in-progress").length,
        resolved: all.filter(r => r.status === "resolved" || r.status === "closed").length,
        total: all.length,
    };
}

"use server";

import { db } from "@/db";
import { assets, users, notifications } from "@/db/schema";
import { eq, desc, and, lte, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { requireHR, requireAuth, getCurrentUser, requireOrgContext } from "@/lib/authorize";

/**
 * Create an asset - requires HR or admin role
 * MULTI-TENANT: Associates asset with user's organization
 */
export async function createAsset(formData: FormData) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized to manage assets" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString();
    const type = formData.get("type")?.toString() as "hardware" | "license" | "subscription";
    const serialNumber = formData.get("serialNumber")?.toString();
    const assignedTo = formData.get("assignedTo")?.toString() || null;
    const purchaseDate = formData.get("purchaseDate")?.toString();
    const renewalDate = formData.get("renewalDate")?.toString();
    const cost = formData.get("cost")?.toString();
    const notes = formData.get("notes")?.toString();

    if (!name || !type) {
        return { error: "Name and type required" };
    }

    await db.insert(assets).values({
        organizationId: orgContext.orgId,
        name,
        type,
        serialNumber: serialNumber || null,
        assignedTo: assignedTo || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        cost: cost || null,
        notes: notes || null,
        status: "active",
    });

    revalidatePath("/assets");
    return { success: true };
}

/**
 * Get assets - HR/admin see all, employees see only their assigned assets
 * MULTI-TENANT: Filters by organization
 */
export async function getAssets(filters?: { type?: string; status?: string; assignedTo?: string }) {
    const authResult = await getCurrentUser();
    if (!authResult.authorized || !authResult.user) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const results = await db.select({
        id: assets.id,
        name: assets.name,
        type: assets.type,
        serialNumber: assets.serialNumber,
        assignedTo: assets.assignedTo,
        assignedToName: users.name,
        purchaseDate: assets.purchaseDate,
        renewalDate: assets.renewalDate,
        cost: assets.cost,
        notes: assets.notes,
        status: assets.status,
        createdAt: assets.createdAt,
    })
        .from(assets)
        .leftJoin(users, eq(assets.assignedTo, users.id))
        .where(eq(assets.organizationId, orgContext.orgId))
        .orderBy(desc(assets.createdAt));

    // Apply type filter
    let filtered = results;
    if (filters?.type) {
        filtered = filtered.filter(a => a.type === filters.type);
    }

    // Apply status filter
    if (filters?.status) {
        filtered = filtered.filter(a => a.status === filters.status);
    }

    // Non-managers can only see assets assigned to them
    if (authResult.user.role === "member") {
        filtered = filtered.filter(a => a.assignedTo === authResult.user!.id);
    }

    return filtered;
}

/**
 * Update an asset - requires HR or admin role
 * MULTI-TENANT: Verifies asset belongs to user's organization
 */
export async function updateAsset(id: string, data: Partial<{
    name: string;
    type: "hardware" | "license" | "subscription";
    serialNumber: string;
    assignedTo: string | null;
    renewalDate: Date | null;
    cost: string;
    notes: string;
    status: "active" | "retired" | "pending";
}>) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized to manage assets" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.update(assets)
        .set(data)
        .where(and(
            eq(assets.id, id),
            eq(assets.organizationId, orgContext.orgId)
        ));

    revalidatePath("/assets");
    return { success: true };
}

/**
 * Delete an asset - requires HR or admin role
 * MULTI-TENANT: Verifies asset belongs to user's organization
 */
export async function deleteAsset(id: string) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized to manage assets" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(assets)
        .where(and(
            eq(assets.id, id),
            eq(assets.organizationId, orgContext.orgId)
        ));

    revalidatePath("/assets");
    return { success: true };
}

/**
 * Get upcoming asset renewals - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getUpcomingRenewals(daysAhead: number = 30) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const today = new Date();
    const futureDate = addDays(today, daysAhead);

    return await db.select({
        id: assets.id,
        name: assets.name,
        type: assets.type,
        renewalDate: assets.renewalDate,
        assignedToName: users.name,
        cost: assets.cost,
    })
        .from(assets)
        .leftJoin(users, eq(assets.assignedTo, users.id))
        .where(
            and(
                eq(assets.organizationId, orgContext.orgId),
                eq(assets.status, "active"),
                lte(assets.renewalDate, futureDate),
                gte(assets.renewalDate, today)
            )
        )
        .orderBy(assets.renewalDate);
}

/**
 * Assign an asset to a user - requires HR or admin role
 * MULTI-TENANT: Verifies asset belongs to user's organization
 */
export async function assignAsset(assetId: string, userId: string | null) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized to assign assets" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.update(assets)
        .set({ assignedTo: userId })
        .where(and(
            eq(assets.id, assetId),
            eq(assets.organizationId, orgContext.orgId)
        ));

    revalidatePath("/assets");
    return { success: true };
}


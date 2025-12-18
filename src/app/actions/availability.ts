"use server";

import { db } from "@/db";
import { users, leaves } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth, requireOrgContext } from "@/lib/authorize";

/**
 * Update availability status for a user
 * MULTI-TENANT: Verifies user is in same organization
 */
export async function updateAvailabilityStatus(
    userId: string,
    status: "in-office" | "remote" | "away" | "vacation"
) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: "Not authenticated" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Users can only update their own status, or managers can update others in their org
    if (userId !== authResult.user.id && authResult.user.role === "member") {
        return { error: "Cannot update other users' status" };
    }

    await db.update(users)
        .set({ availabilityStatus: status })
        .where(and(
            eq(users.id, userId),
            eq(users.organizationId, orgContext.orgId)
        ));

    revalidatePath("/");
    revalidatePath("/team");
    return { success: true };
}

/**
 * Get team availability
 * MULTI-TENANT: Filters by organization
 */
export async function getTeamAvailability() {
    const authResult = await requireAuth();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all users with their status - scoped by org
    const orgUsers = await db.select({
        id: users.id,
        name: users.name,
        department: users.department,
        designation: users.designation,
        availabilityStatus: users.availabilityStatus,
        workingHours: users.workingHours,
    })
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId));

    // Get users on leave today - scoped by org
    const onLeaveToday = await db.select({
        userId: leaves.userId,
        type: leaves.type
    })
        .from(leaves)
        .where(
            and(
                eq(leaves.organizationId, orgContext.orgId),
                eq(leaves.status, "approved"),
                lte(leaves.startDate, tomorrow),
                gte(leaves.endDate, today)
            )
        );

    const leaveMap = new Map(onLeaveToday.map(l => [l.userId, l.type]));

    return orgUsers.map(user => ({
        ...user,
        isOnLeave: leaveMap.has(user.id),
        leaveType: leaveMap.get(user.id) || null,
        // Override status if on approved leave
        effectiveStatus: leaveMap.has(user.id) ? "vacation" : user.availabilityStatus
    }));
}


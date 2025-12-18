"use server";

import { db } from "@/db";
import { activityFeed, users } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { getCurrentUser, requireOrgContext, requireAdmin } from "@/lib/authorize";

/**
 * Log activity - internal use
 * MULTI-TENANT: Associates activity with user's organization
 */
export async function logActivity(
    action: string,
    entityType: string,
    description: string,
    entityId?: string,
    actorId?: string,
    metadata?: Record<string, unknown>
) {
    const orgContext = await requireOrgContext();
    const orgId = "error" in orgContext ? undefined : orgContext.orgId;

    await db.insert(activityFeed).values({
        organizationId: orgId,
        action,
        entityType,
        entityId,
        actorId,
        description,
        metadata: metadata || {},
    });
}

/**
 * Log sensitive data access for audit purposes
 * Used for: salary views, role changes, data exports, profile access
 * MULTI-TENANT: Associates with user's organization
 */
export async function logSensitiveAccess(
    action: "viewed_salary" | "changed_role" | "exported_data" | "accessed_profile" | "bulk_action",
    targetUserId?: string,
    details?: string
) {
    const authResult = await getCurrentUser();
    const actorId = authResult.user?.id;
    const actorName = authResult.user?.name || authResult.user?.email || "Unknown";

    const orgContext = await requireOrgContext();
    const orgId = "error" in orgContext ? undefined : orgContext.orgId;

    const descriptions: Record<string, string> = {
        viewed_salary: `${actorName} viewed salary information`,
        changed_role: `${actorName} changed a user's role`,
        exported_data: `${actorName} exported data`,
        accessed_profile: `${actorName} accessed sensitive profile data`,
        bulk_action: `${actorName} performed a bulk action`,
    };

    await db.insert(activityFeed).values({
        organizationId: orgId,
        action: `audit:${action}`,
        entityType: "audit",
        entityId: targetUserId,
        actorId,
        description: details || descriptions[action],
        metadata: {
            sensitive: true,
            targetUserId,
            timestamp: new Date().toISOString(),
        },
    });
}

/**
 * Get audit log entries (sensitive actions only)
 * MULTI-TENANT: Filters by organization
 */
export async function getAuditLog(limit = 100) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select({
        id: activityFeed.id,
        action: activityFeed.action,
        entityType: activityFeed.entityType,
        entityId: activityFeed.entityId,
        description: activityFeed.description,
        metadata: activityFeed.metadata,
        createdAt: activityFeed.createdAt,
        actorName: users.name,
        actorEmail: users.email,
    })
        .from(activityFeed)
        .leftJoin(users, eq(activityFeed.actorId, users.id))
        .where(and(
            eq(activityFeed.organizationId, orgContext.orgId),
            eq(activityFeed.entityType, "audit")
        ))
        .orderBy(desc(activityFeed.createdAt))
        .limit(limit);
}

/**
 * Get activity feed
 * MULTI-TENANT: Filters by organization
 */
export async function getActivityFeed(limit = 50) {
    const authResult = await getCurrentUser();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select({
        id: activityFeed.id,
        action: activityFeed.action,
        entityType: activityFeed.entityType,
        entityId: activityFeed.entityId,
        description: activityFeed.description,
        metadata: activityFeed.metadata,
        createdAt: activityFeed.createdAt,
        actorName: users.name,
    })
        .from(activityFeed)
        .leftJoin(users, eq(activityFeed.actorId, users.id))
        .where(eq(activityFeed.organizationId, orgContext.orgId))
        .orderBy(desc(activityFeed.createdAt))
        .limit(limit);
}

export async function getRecentActivity(limit = 10) {
    return getActivityFeed(limit);
}



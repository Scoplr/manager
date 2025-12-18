"use server";

import { db } from "@/db";
import { announcements, announcementReads, users } from "@/db/schema";
import { eq, desc, and, or, isNull, gte, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireManager, requireAuth, requireOrgContext } from "@/lib/authorize";

/**
 * Create an announcement - requires manager or admin role
 * MULTI-TENANT: Associates announcement with user's organization
 */
export async function createAnnouncement(formData: FormData) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized to create announcements" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();
    const priority = formData.get("priority")?.toString() as "normal" | "important" | "urgent" || "normal";
    const pinned = formData.get("pinned") === "true";
    const expiresAt = formData.get("expiresAt")?.toString();

    if (!title || !content) {
        return { error: "Title and content required" };
    }

    await db.insert(announcements).values({
        organizationId: orgContext.orgId,
        title,
        content,
        priority,
        pinned,
        authorId: authResult.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    revalidatePath("/");
    revalidatePath("/announcements");
    return { success: true };
}

/**
 * Get announcements - all authenticated users can view
 * MULTI-TENANT: Filters by organization
 */
export async function getAnnouncements(options?: { activeOnly?: boolean }) {
    const authResult = await requireAuth();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const now = new Date();

    let conditions: any[] = [eq(announcements.organizationId, orgContext.orgId)];

    if (options?.activeOnly) {
        conditions.push(
            or(
                isNull(announcements.expiresAt),
                gte(announcements.expiresAt, now)
            )
        );
    }

    return await db.select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        priority: announcements.priority,
        pinned: announcements.pinned,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,
        authorName: users.name,
    })
        .from(announcements)
        .leftJoin(users, eq(announcements.authorId, users.id))
        .where(and(...conditions))
        .orderBy(desc(announcements.pinned), desc(announcements.createdAt));
}

/**
 * Delete an announcement - requires manager or admin role
 * MULTI-TENANT: Verifies announcement belongs to user's organization
 */
export async function deleteAnnouncement(id: string) {
    const authResult = await requireManager();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized to delete announcements" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(announcements)
        .where(and(
            eq(announcements.id, id),
            eq(announcements.organizationId, orgContext.orgId)
        ));

    revalidatePath("/");
    revalidatePath("/announcements");
    return { success: true };
}

/**
 * Toggle announcement pin status - requires manager or admin role
 * MULTI-TENANT: Verifies announcement belongs to user's organization
 */
export async function togglePinAnnouncement(id: string, pinned: boolean) {
    const authResult = await requireManager();
    if (!authResult.authorized) {
        return { error: authResult.error || "Not authorized" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.update(announcements)
        .set({ pinned })
        .where(and(
            eq(announcements.id, id),
            eq(announcements.organizationId, orgContext.orgId)
        ));

    revalidatePath("/");
    revalidatePath("/announcements");
    return { success: true };
}

/**
 * Mark an announcement as read by the current user
 * MULTI-TENANT: Verifies announcement belongs to user's organization
 */
export async function markAnnouncementRead(announcementId: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: "Not authenticated" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Verify announcement belongs to org
    const ann = await db.select({ id: announcements.id })
        .from(announcements)
        .where(and(
            eq(announcements.id, announcementId),
            eq(announcements.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!ann[0]) return { error: "Announcement not found" };

    // Check if already read
    const existing = await db.select()
        .from(announcementReads)
        .where(
            and(
                eq(announcementReads.announcementId, announcementId),
                eq(announcementReads.userId, authResult.user.id)
            )
        )
        .limit(1);

    if (existing.length === 0) {
        await db.insert(announcementReads).values({
            announcementId,
            userId: authResult.user.id,
        });
    }

    return { success: true };
}

/**
 * Get read count for an announcement - for admins to see engagement
 * MULTI-TENANT: Verifies announcement belongs to user's organization
 */
export async function getAnnouncementReadCount(announcementId: string) {
    const authResult = await requireManager();
    if (!authResult.authorized) {
        return { count: 0 };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { count: 0 };

    // Verify announcement belongs to org
    const ann = await db.select({ id: announcements.id })
        .from(announcements)
        .where(and(
            eq(announcements.id, announcementId),
            eq(announcements.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!ann[0]) return { count: 0 };

    const result = await db.select({ count: count() })
        .from(announcementReads)
        .where(eq(announcementReads.announcementId, announcementId));

    return { count: result[0]?.count || 0 };
}

/**
 * Get who read an announcement - for admins
 * MULTI-TENANT: Verifies announcement belongs to user's organization
 */
export async function getAnnouncementReaders(announcementId: string) {
    const authResult = await requireManager();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    // Verify announcement belongs to org
    const ann = await db.select({ id: announcements.id })
        .from(announcements)
        .where(and(
            eq(announcements.id, announcementId),
            eq(announcements.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!ann[0]) return [];

    return await db.select({
        userId: announcementReads.userId,
        userName: users.name,
        userEmail: users.email,
        readAt: announcementReads.readAt,
    })
        .from(announcementReads)
        .leftJoin(users, eq(announcementReads.userId, users.id))
        .where(eq(announcementReads.announcementId, announcementId))
        .orderBy(desc(announcementReads.readAt));
}


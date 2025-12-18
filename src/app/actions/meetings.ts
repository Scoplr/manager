"use server";

import { db } from "@/db";
import { meetings, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth, requireOrgContext } from "@/lib/authorize";

type ActionItem = { text: string; taskId?: string; completed: boolean };

/**
 * Create a meeting - requires authentication
 * MULTI-TENANT: Associates meeting with user's organization
 */
export async function createMeeting(formData: FormData) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: "Not authenticated" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const title = formData.get("title")?.toString();
    const dateStr = formData.get("date")?.toString();
    const notes = formData.get("notes")?.toString();
    const attendeesJson = formData.get("attendees")?.toString();

    if (!title || !dateStr || !notes) {
        return { error: "All fields required" };
    }

    let attendees: string[] = [];
    if (attendeesJson) {
        try {
            attendees = JSON.parse(attendeesJson);
        } catch { }
    }

    // Extract action items from notes (lines starting with [ ] or - [ ])
    const actionItems: ActionItem[] = [];
    const lines = notes.split('\n');
    for (const line of lines) {
        const match = line.match(/^[-*]?\s*\[\s*\]\s*(.+)/);
        if (match) {
            actionItems.push({ text: match[1].trim(), completed: false });
        }
    }

    await db.insert(meetings).values({
        organizationId: orgContext.orgId,
        title,
        date: new Date(dateStr),
        notes,
        attendees,
        actionItems,
        createdBy: authResult.user.id,
    });

    revalidatePath("/meetings");
    return { success: true };
}

/**
 * Get all meetings
 * MULTI-TENANT: Filters by organization
 */
export async function getMeetings() {
    const authResult = await requireAuth();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select({
        id: meetings.id,
        title: meetings.title,
        date: meetings.date,
        notes: meetings.notes,
        attendees: meetings.attendees,
        actionItems: meetings.actionItems,
        createdBy: meetings.createdBy,
        createdAt: meetings.createdAt,
    })
        .from(meetings)
        .where(eq(meetings.organizationId, orgContext.orgId))
        .orderBy(desc(meetings.date));
}

/**
 * Get a single meeting
 * MULTI-TENANT: Verifies meeting belongs to user's organization
 */
export async function getMeeting(id: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return null;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    const result = await db.select()
        .from(meetings)
        .where(and(
            eq(meetings.id, id),
            eq(meetings.organizationId, orgContext.orgId)
        ));
    return result[0] || null;
}

/**
 * Update an action item
 * MULTI-TENANT: Verifies meeting belongs to user's organization
 */
export async function updateActionItem(meetingId: string, index: number, completed: boolean) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const meeting = await getMeeting(meetingId);
    if (!meeting) return { error: "Meeting not found" };

    const items = (meeting.actionItems as ActionItem[]) || [];
    if (items[index]) {
        items[index].completed = completed;
    }

    await db.update(meetings)
        .set({ actionItems: items })
        .where(and(
            eq(meetings.id, meetingId),
            eq(meetings.organizationId, orgContext.orgId)
        ));

    revalidatePath("/meetings");
    revalidatePath(`/meetings/${meetingId}`);
    return { success: true };
}

/**
 * Delete a meeting
 * MULTI-TENANT: Verifies meeting belongs to user's organization
 */
export async function deleteMeeting(id: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(meetings).where(and(
        eq(meetings.id, id),
        eq(meetings.organizationId, orgContext.orgId)
    ));
    revalidatePath("/meetings");
    return { success: true };
}


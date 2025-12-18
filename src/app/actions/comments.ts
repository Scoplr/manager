"use server";

/**
 * Task Comments Actions
 * 
 * Full implementation for task collaboration
 */

import { db } from "@/db";
import { taskComments, users, tasks } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

// Types
export interface TaskComment {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    authorName: string | null;
}

// ============ ADD COMMENT ============

export async function addComment(taskId: string, content: string) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return { error: "Not authenticated" };
    }

    // Validate input
    if (!taskId || !content?.trim()) {
        return { error: "Task ID and content are required" };
    }

    if (content.length > 5000) {
        return { error: "Comment too long (max 5000 characters)" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Verify task exists and belongs to org
    const task = await db
        .select({ id: tasks.id, organizationId: tasks.organizationId })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!task[0]) {
        return { error: "Task not found" };
    }

    if (task[0].organizationId !== orgContext.orgId) {
        return { error: "Access denied" };
    }

    try {
        const [newComment] = await db.insert(taskComments).values({
            taskId,
            authorId: user.id,
            content: content.trim(),
        }).returning();

        revalidatePath(`/tasks/${taskId}`);
        return { success: true, comment: newComment };
    } catch (error) {
        console.error("Failed to add comment:", error);
        return { error: "Failed to add comment" };
    }
}

// ============ GET COMMENTS ============

export async function getComments(taskId: string): Promise<TaskComment[]> {
    const { authorized } = await requireAuth();
    if (!authorized) return [];

    if (!taskId) return [];

    try {
        const comments = await db
            .select({
                id: taskComments.id,
                content: taskComments.content,
                createdAt: taskComments.createdAt,
                updatedAt: taskComments.updatedAt,
                authorId: taskComments.authorId,
                authorName: users.name,
            })
            .from(taskComments)
            .innerJoin(users, eq(taskComments.authorId, users.id))
            .where(eq(taskComments.taskId, taskId))
            .orderBy(desc(taskComments.createdAt));

        return comments;
    } catch (error) {
        console.error("Failed to get comments:", error);
        return [];
    }
}

// ============ DELETE COMMENT ============

export async function deleteComment(commentId: string) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return { error: "Not authenticated" };
    }

    if (!commentId) {
        return { error: "Comment ID required" };
    }

    try {
        // Get the comment to verify ownership
        const comment = await db
            .select({
                id: taskComments.id,
                authorId: taskComments.authorId,
                taskId: taskComments.taskId,
            })
            .from(taskComments)
            .where(eq(taskComments.id, commentId))
            .limit(1);

        if (!comment[0]) {
            return { error: "Comment not found" };
        }

        // Only allow deletion by author or admin/manager
        if (comment[0].authorId !== user.id && user.role === "member") {
            return { error: "You can only delete your own comments" };
        }

        await db.delete(taskComments).where(eq(taskComments.id, commentId));

        revalidatePath(`/tasks/${comment[0].taskId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete comment:", error);
        return { error: "Failed to delete comment" };
    }
}

// ============ UPDATE COMMENT ============

export async function updateComment(commentId: string, content: string) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return { error: "Not authenticated" };
    }

    if (!commentId || !content?.trim()) {
        return { error: "Comment ID and content are required" };
    }

    if (content.length > 5000) {
        return { error: "Comment too long (max 5000 characters)" };
    }

    try {
        // Get the comment to verify ownership
        const comment = await db
            .select({
                id: taskComments.id,
                authorId: taskComments.authorId,
                taskId: taskComments.taskId,
            })
            .from(taskComments)
            .where(eq(taskComments.id, commentId))
            .limit(1);

        if (!comment[0]) {
            return { error: "Comment not found" };
        }

        // Only allow editing by author
        if (comment[0].authorId !== user.id) {
            return { error: "You can only edit your own comments" };
        }

        await db
            .update(taskComments)
            .set({
                content: content.trim(),
                updatedAt: new Date(),
            })
            .where(eq(taskComments.id, commentId));

        revalidatePath(`/tasks/${comment[0].taskId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update comment:", error);
        return { error: "Failed to update comment" };
    }
}

// ============ GET COMMENT COUNT ============

export async function getCommentCount(taskId: string): Promise<number> {
    const { authorized } = await requireAuth();
    if (!authorized) return 0;

    try {
        const result = await db
            .select({ id: taskComments.id })
            .from(taskComments)
            .where(eq(taskComments.taskId, taskId));

        return result.length;
    } catch {
        return 0;
    }
}

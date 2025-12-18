"use server";

import { db } from "@/db";
import { tasks, taskTags, taskDependencies, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc, and, inArray, gte, lte, sql } from "drizzle-orm";
import { logActivity } from "./activity";
import { requireAuth, getCurrentUser } from "@/lib/authorize";

export async function createTask(formData: FormData) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authenticated" };
    }

    const title = formData.get("title")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim();
    const tagsJson = formData.get("tags")?.toString();
    const priority = formData.get("priority")?.toString() as "low" | "medium" | "high" | "urgent" | undefined;
    const dueDateStr = formData.get("dueDate")?.toString();
    const assigneeId = formData.get("assigneeId")?.toString();

    // Validation
    if (!title) {
        return { error: "Title is required" };
    }

    if (title.length < 3) {
        return { error: "Title must be at least 3 characters" };
    }

    if (title.length > 200) {
        return { error: "Title must be less than 200 characters" };
    }

    const validPriorities = ["low", "medium", "high", "urgent"];
    if (priority && !validPriorities.includes(priority)) {
        return { error: "Invalid priority level" };
    }

    // Parse and validate due date
    let dueDate: Date | undefined;
    let dueDateWarning: string | undefined;
    if (dueDateStr) {
        dueDate = new Date(dueDateStr);
        if (isNaN(dueDate.getTime())) {
            return { error: "Invalid due date format" };
        }
        // Warn if due date is in the past (but don't block)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDate < today) {
            dueDateWarning = "Note: Due date is in the past";
        }
    }

    const [newTask] = await db.insert(tasks).values({
        title,
        description: description || null,
        priority: priority || "medium",
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
        organizationId: authResult.user.organizationId,
    }).returning();

    if (tagsJson) {
        try {
            const tagIds = JSON.parse(tagsJson) as string[];
            if (Array.isArray(tagIds) && tagIds.length > 0) {
                await Promise.all(tagIds.map(tagId =>
                    db.insert(taskTags).values({
                        taskId: newTask.id,
                        tagId
                    })
                ));
            }
        } catch (e) {
            console.error("Failed to parse tags", e);
        }
    }

    await logActivity("created", "task", `New task: ${title}`, newTask.id, authResult.user.id);

    revalidatePath("/tasks");
    return { success: true, warning: dueDateWarning };
}

export async function updateTaskStatus(id: string, status: string) {
    await db.update(tasks).set({ status }).where(eq(tasks.id, id));
    await logActivity("updated", "task", `Task marked as ${status}`, id);
    revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id));
    revalidatePath("/tasks");
}

export async function updateTaskPriority(id: string, priority: "low" | "medium" | "high" | "urgent") {
    await db.update(tasks).set({ priority }).where(eq(tasks.id, id));
    revalidatePath("/tasks");
}

// ... existing code ...

export async function getTasks(filters?: {
    status?: string[];
    priority?: string[];
    tagIds?: string[];
    dateRange?: { start?: Date; end?: Date };
    showTeam?: boolean;
}) {
    const authResult = await getCurrentUser();
    const orgId = authResult.user?.organizationId;
    const userId = authResult.user?.id;
    const userRole = authResult.user?.role || "employee";

    let conditions = [];

    // Always filter by organization if user has one
    if (orgId) {
        conditions.push(eq(tasks.organizationId, orgId));
    }

    // Data isolation: 
    // - Employees only see their own assigned tasks (unless showTeam is true for managers/admin)
    // - showTeam=true shows all org tasks for managers/admins
    if (!filters?.showTeam && userRole === "employee" && userId) {
        conditions.push(eq(tasks.assigneeId, userId));
    }

    if (filters?.status && filters.status.length > 0) {
        conditions.push(inArray(tasks.status, filters.status));
    }

    if (filters?.priority && filters.priority.length > 0) {
        // @ts-ignore - Enum type mismatch issue with Drizzle
        conditions.push(inArray(tasks.priority, filters.priority));
    }

    if (filters?.dateRange?.start) {
        conditions.push(gte(tasks.dueDate, filters.dateRange.start));
    }

    if (filters?.dateRange?.end) {
        conditions.push(lte(tasks.dueDate, filters.dateRange.end));
    }

    // Base query with assignee join
    let query = db.select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        assigneeId: tasks.assigneeId,
        assigneeName: users.name,
        createdAt: tasks.createdAt,
    })
        .from(tasks)
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .orderBy(desc(tasks.createdAt));

    if (filters?.tagIds && filters.tagIds.length > 0) {
        const subQuery = db.select({ taskId: taskTags.taskId })
            .from(taskTags)
            .where(inArray(taskTags.tagId, filters.tagIds));
        conditions.push(inArray(tasks.id, subQuery));
    }

    if (conditions.length > 0) {
        // @ts-ignore
        query = query.where(and(...conditions));
    }

    return await query;
}

export async function getTask(id: string) {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0] || null;
}

// Actions for Dependencies

export async function addTaskDependency(blockedId: string, blockerId: string) {
    if (blockedId === blockerId) return { error: "Cannot block self" };

    // Check circular dependency? (Skip for MVP, trust user)

    await db.insert(taskDependencies).values({
        blockedId,
        blockerId,
    });
    revalidatePath("/tasks");
}

export async function removeTaskDependency(blockedId: string, blockerId: string) {
    await db.delete(taskDependencies).where(
        and(
            eq(taskDependencies.blockedId, blockedId),
            eq(taskDependencies.blockerId, blockerId)
        )
    );
    revalidatePath("/tasks");
}

export async function getTaskDependencies(taskId?: string) {
    let query = db.select({
        blockedId: taskDependencies.blockedId,
        blockerId: taskDependencies.blockerId,
        blockerTitle: tasks.title,
        blockerStatus: tasks.status,
    })
        .from(taskDependencies)
        .innerJoin(tasks, eq(taskDependencies.blockerId, tasks.id));

    if (taskId) {
        // @ts-ignore - Dynamic where clause
        query = query.where(eq(taskDependencies.blockedId, taskId));
    }

    // @ts-ignore
    return await query;
}

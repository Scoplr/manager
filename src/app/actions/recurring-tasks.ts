"use server";

/**
 * Recurring Tasks Actions
 * 
 * Create and manage recurring task templates
 */

import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import { eq, and, isNull, isNotNull, lte } from "drizzle-orm";
import { requireAuth, requireManager, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

// Types
export interface RecurringTask {
    id: string;
    title: string;
    description?: string | null;
    priority: string;
    assigneeId?: string | null;
    assigneeName?: string | null;
    recurrencePattern: string;
    recurrenceInterval: number;
    recurrenceEndDate?: Date | null;
    nextDueDate?: Date | null;
    isActive: boolean;
}

// ============ CREATE RECURRING TASK ============

export async function createRecurringTask(formData: FormData) {
    const { authorized, error } = await requireManager();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const title = formData.get("title")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim();
    const priority = formData.get("priority")?.toString() || "medium";
    const assigneeId = formData.get("assigneeId")?.toString();
    const pattern = formData.get("recurrencePattern")?.toString() || "weekly";
    const interval = parseInt(formData.get("recurrenceInterval")?.toString() || "1");
    const endDate = formData.get("recurrenceEndDate")?.toString();
    const startDate = formData.get("startDate")?.toString();

    if (!title) {
        return { error: "Title is required" };
    }

    if (!["daily", "weekly", "monthly", "yearly"].includes(pattern)) {
        return { error: "Invalid recurrence pattern" };
    }

    const dueDate = startDate ? new Date(startDate) : new Date();

    try {
        // Create the template task
        const [task] = await db.insert(tasks).values({
            organizationId: orgContext.orgId,
            title,
            description: description || null,
            priority: priority as "low" | "medium" | "high" | "urgent",
            assigneeId: assigneeId || null,
            dueDate,
            isRecurring: true,
            recurrencePattern: pattern,
            recurrenceInterval: interval,
            recurrenceEndDate: endDate ? new Date(endDate) : null,
        }).returning();

        // Create the first instance
        await createTaskInstance(task.id);

        revalidatePath("/tasks");
        return { success: true, task };
    } catch (error) {
        console.error("Failed to create recurring task:", error);
        return { error: "Failed to create recurring task" };
    }
}

// ============ CREATE TASK INSTANCE ============

async function createTaskInstance(templateId: string) {
    const template = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, templateId))
        .limit(1);

    if (!template[0]) return null;

    const t = template[0];

    // Calculate next due date based on pattern
    let nextDue: Date;
    const baseDue = t.dueDate || new Date();

    switch (t.recurrencePattern) {
        case "daily":
            nextDue = addDays(baseDue, t.recurrenceInterval || 1);
            break;
        case "weekly":
            nextDue = addWeeks(baseDue, t.recurrenceInterval || 1);
            break;
        case "monthly":
            nextDue = addMonths(baseDue, t.recurrenceInterval || 1);
            break;
        case "yearly":
            nextDue = addYears(baseDue, t.recurrenceInterval || 1);
            break;
        default:
            nextDue = addWeeks(baseDue, 1);
    }

    // Check if past end date
    if (t.recurrenceEndDate && nextDue > new Date(t.recurrenceEndDate)) {
        return null;
    }

    // Create instance
    const [instance] = await db.insert(tasks).values({
        organizationId: t.organizationId,
        projectId: t.projectId,
        title: t.title,
        description: t.description,
        priority: t.priority,
        assigneeId: t.assigneeId,
        dueDate: t.dueDate, // Current due date for instance
        parentTaskId: templateId,
        isRecurring: false,
    }).returning();

    // Update template's due date to next occurrence
    await db
        .update(tasks)
        .set({ dueDate: nextDue })
        .where(eq(tasks.id, templateId));

    return instance;
}

// ============ GET RECURRING TASKS ============

export async function getRecurringTasks(): Promise<RecurringTask[]> {
    const { authorized } = await requireAuth();
    if (!authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const recurring = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                description: tasks.description,
                priority: tasks.priority,
                assigneeId: tasks.assigneeId,
                recurrencePattern: tasks.recurrencePattern,
                recurrenceInterval: tasks.recurrenceInterval,
                recurrenceEndDate: tasks.recurrenceEndDate,
                dueDate: tasks.dueDate,
            })
            .from(tasks)
            .where(
                and(
                    eq(tasks.organizationId, orgContext.orgId),
                    eq(tasks.isRecurring, true)
                )
            );

        // Get assignee names
        const enriched = await Promise.all(
            recurring.map(async (t) => {
                let assigneeName: string | null = null;
                if (t.assigneeId) {
                    const user = await db
                        .select({ name: users.name })
                        .from(users)
                        .where(eq(users.id, t.assigneeId))
                        .limit(1);
                    assigneeName = user[0]?.name || null;
                }

                const isPastEnd = t.recurrenceEndDate && new Date() > new Date(t.recurrenceEndDate);

                return {
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    priority: t.priority,
                    assigneeId: t.assigneeId,
                    assigneeName,
                    recurrencePattern: t.recurrencePattern || "weekly",
                    recurrenceInterval: t.recurrenceInterval || 1,
                    recurrenceEndDate: t.recurrenceEndDate,
                    nextDueDate: t.dueDate,
                    isActive: !isPastEnd,
                };
            })
        );

        return enriched;
    } catch (error) {
        console.error("Failed to get recurring tasks:", error);
        return [];
    }
}

// ============ STOP RECURRING ============

export async function stopRecurringTask(taskId: string) {
    const { authorized, error } = await requireManager();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    try {
        // Set end date to now to stop future occurrences
        await db
            .update(tasks)
            .set({
                recurrenceEndDate: new Date(),
            })
            .where(
                and(
                    eq(tasks.id, taskId),
                    eq(tasks.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/tasks");
        return { success: true };
    } catch (error) {
        console.error("Failed to stop recurring task:", error);
        return { error: "Failed to stop recurring task" };
    }
}

// ============ GENERATE DUE INSTANCES ============
// Run this as a cron job or scheduled function

export async function generateDueRecurringTasks() {
    const now = new Date();

    try {
        // Find recurring tasks that need new instances
        const dueTemplates = await db
            .select()
            .from(tasks)
            .where(
                and(
                    eq(tasks.isRecurring, true),
                    lte(tasks.dueDate, now)
                )
            );

        let created = 0;
        for (const template of dueTemplates) {
            // Check if past end date
            if (template.recurrenceEndDate && now > new Date(template.recurrenceEndDate)) {
                continue;
            }

            const instance = await createTaskInstance(template.id);
            if (instance) created++;
        }

        return { success: true, created };
    } catch (error) {
        console.error("Failed to generate recurring tasks:", error);
        return { error: "Failed to generate tasks" };
    }
}

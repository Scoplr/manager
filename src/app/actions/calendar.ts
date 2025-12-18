"use server";

import { db } from "@/db";
import { leaves, users, companyEvents, tasks } from "@/db/schema";
import { gte, lte, and, eq, ne } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    endDate?: Date;
    type: "leave" | "birthday" | "anniversary" | "meeting" | "event" | "task";
    color: string;
    user?: {
        id: string;
        name: string;
    };
}

/**
 * Get calendar events for a date range
 * MULTI-TENANT: Filters all data by organization
 */
export async function getCalendarEvents(
    startDate: Date,
    endDate: Date
): Promise<CalendarEvent[]> {
    const authResult = await requireAuth();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const events: CalendarEvent[] = [];

    // Get leaves in date range - scoped by org
    const leavesData = await db
        .select({
            id: leaves.id,
            type: leaves.type,
            startDate: leaves.startDate,
            endDate: leaves.endDate,
            status: leaves.status,
            userId: leaves.userId,
            userName: users.name,
        })
        .from(leaves)
        .leftJoin(users, eq(leaves.userId, users.id))
        .where(
            and(
                eq(leaves.organizationId, orgContext.orgId),
                gte(leaves.startDate, startDate),
                lte(leaves.endDate, endDate),
                eq(leaves.status, "approved")
            )
        );

    for (const leave of leavesData) {
        events.push({
            id: leave.id,
            title: `${leave.userName} - ${leave.type} leave`,
            date: leave.startDate,
            endDate: leave.endDate,
            type: "leave",
            color: leave.type === "sick" ? "#ef4444" : leave.type === "casual" ? "#3b82f6" : "#22c55e",
            user: leave.userId && leave.userName ? { id: leave.userId, name: leave.userName } : undefined,
        });
    }

    // Get birthdays and anniversaries - only for org users
    const orgUsers = await db.select()
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId));

    for (const user of orgUsers) {
        if (user.birthday) {
            const birthday = new Date(user.birthday);
            const thisYearBirthday = new Date(
                startDate.getFullYear(),
                birthday.getMonth(),
                birthday.getDate()
            );

            if (thisYearBirthday >= startDate && thisYearBirthday <= endDate) {
                events.push({
                    id: `birthday-${user.id}`,
                    title: `🎂 ${user.name}'s Birthday`,
                    date: thisYearBirthday,
                    type: "birthday",
                    color: "#ec4899",
                    user: { id: user.id, name: user.name || "Unknown" },
                });
            }
        }

        // Work anniversaries
        if (user.joinedAt) {
            const joinDate = new Date(user.joinedAt);
            const yearsWorked = startDate.getFullYear() - joinDate.getFullYear();
            if (yearsWorked > 0) {
                const anniversary = new Date(
                    startDate.getFullYear(),
                    joinDate.getMonth(),
                    joinDate.getDate()
                );

                if (anniversary >= startDate && anniversary <= endDate) {
                    events.push({
                        id: `anniversary-${user.id}`,
                        title: `🎉 ${user.name} - ${yearsWorked} year${yearsWorked > 1 ? 's' : ''}`,
                        date: anniversary,
                        type: "anniversary",
                        color: "#a855f7",
                        user: { id: user.id, name: user.name || "Unknown" },
                    });
                }
            }
        }
    }

    // Get company events - scoped by org
    try {
        const companyEventsData = await db
            .select()
            .from(companyEvents)
            .where(
                and(
                    eq(companyEvents.organizationId, orgContext.orgId),
                    gte(companyEvents.date, startDate),
                    lte(companyEvents.date, endDate)
                )
            );

        for (const event of companyEventsData) {
            events.push({
                id: event.id,
                title: event.title,
                date: event.date,
                endDate: event.endDate || undefined,
                type: "event",
                color: "#f97316",
            });
        }
    } catch {
        // Table might not exist
    }

    // Get task due dates
    try {
        const tasksData = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                dueDate: tasks.dueDate,
                status: tasks.status,
                priority: tasks.priority,
                assigneeId: tasks.assigneeId,
                assigneeName: users.name,
            })
            .from(tasks)
            .leftJoin(users, eq(tasks.assigneeId, users.id))
            .where(
                and(
                    eq(tasks.organizationId, orgContext.orgId),
                    gte(tasks.dueDate, startDate),
                    lte(tasks.dueDate, endDate),
                    ne(tasks.status, "done")
                )
            );

        for (const task of tasksData) {
            if (task.dueDate) {
                const priorityColors: Record<string, string> = {
                    urgent: "#ef4444",
                    high: "#f97316",
                    medium: "#3b82f6",
                    low: "#94a3b8",
                };
                events.push({
                    id: `task-${task.id}`,
                    title: `📋 ${task.title}`,
                    date: task.dueDate,
                    type: "task",
                    color: priorityColors[task.priority] || "#3b82f6",
                    user: task.assigneeId && task.assigneeName ? { id: task.assigneeId, name: task.assigneeName } : undefined,
                });
            }
        }
    } catch {
        // Tasks might fail
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}


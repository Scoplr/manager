"use server";

import { db } from "@/db";
import { tasks, users, leaves, feedback, onboardingProgress } from "@/db/schema";
import { desc, sql, eq, gte, and, count } from "drizzle-orm";
import { subDays } from "date-fns";
import { requireAuth, requireOrgContext, requireManager } from "@/lib/authorize";

/**
 * Task completion trends over time
 * MULTI-TENANT: Filters by organization
 */
export async function getTaskTrends(days: number = 30) {
    const authResult = await requireManager();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const startDate = subDays(new Date(), days);

    const result = await db.select({
        date: sql<string>`DATE(${tasks.updatedAt})`,
        completedCount: count(),
    })
        .from(tasks)
        .where(
            and(
                eq(tasks.organizationId, orgContext.orgId),
                eq(tasks.status, "done"),
                gte(tasks.updatedAt, startDate)
            )
        )
        .groupBy(sql`DATE(${tasks.updatedAt})`)
        .orderBy(sql`DATE(${tasks.updatedAt})`);

    return result;
}

/**
 * Workload per user
 * MULTI-TENANT: Filters by organization
 */
export async function getWorkloadDistribution() {
    const authResult = await requireManager();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const result = await db.select({
        userId: tasks.assigneeId,
        userName: users.name,
        todoCount: sql<number>`COUNT(*) FILTER (WHERE ${tasks.status} = 'todo')`,
        inProgressCount: sql<number>`COUNT(*) FILTER (WHERE ${tasks.status} = 'in-progress')`,
        doneCount: sql<number>`COUNT(*) FILTER (WHERE ${tasks.status} = 'done')`,
        totalActive: sql<number>`COUNT(*) FILTER (WHERE ${tasks.status} != 'done')`,
    })
        .from(tasks)
        .innerJoin(users, eq(tasks.assigneeId, users.id))
        .where(eq(tasks.organizationId, orgContext.orgId))
        .groupBy(tasks.assigneeId, users.name)
        .orderBy(desc(sql`COUNT(*) FILTER (WHERE ${tasks.status} != 'done')`));

    return result;
}

/**
 * Activity summary
 * MULTI-TENANT: Filters by organization
 */
export async function getActivitySummary() {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { tasksCompletedWeek: 0, tasksCompletedMonth: 0, activeLeaves: 0, feedbackMonth: 0, activeOnboarding: 0 };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { tasksCompletedWeek: 0, tasksCompletedMonth: 0, activeLeaves: 0, feedbackMonth: 0, activeOnboarding: 0 };

    const now = new Date();
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    // Tasks completed this week - scoped by org
    const [weeklyTasks] = await db.select({ count: count() })
        .from(tasks)
        .where(and(
            eq(tasks.organizationId, orgContext.orgId),
            eq(tasks.status, "done"),
            gte(tasks.updatedAt, weekAgo)
        ));

    // Tasks completed this month - scoped by org
    const [monthlyTasks] = await db.select({ count: count() })
        .from(tasks)
        .where(and(
            eq(tasks.organizationId, orgContext.orgId),
            eq(tasks.status, "done"),
            gte(tasks.updatedAt, monthAgo)
        ));

    // Active leaves - scoped by org
    const [activeLeaves] = await db.select({ count: count() })
        .from(leaves)
        .where(and(
            eq(leaves.organizationId, orgContext.orgId),
            eq(leaves.status, "approved")
        ));

    // Feedback given this month - scoped by org
    const [monthlyFeedback] = await db.select({ count: count() })
        .from(feedback)
        .where(and(
            eq(feedback.organizationId, orgContext.orgId),
            gte(feedback.createdAt, monthAgo)
        ));

    // Onboardings in progress - scope through users
    const [activeOnboarding] = await db.select({ count: count() })
        .from(onboardingProgress)
        .innerJoin(users, eq(onboardingProgress.userId, users.id))
        .where(and(
            eq(users.organizationId, orgContext.orgId),
            eq(onboardingProgress.status, "in-progress")
        ));

    return {
        tasksCompletedWeek: weeklyTasks?.count || 0,
        tasksCompletedMonth: monthlyTasks?.count || 0,
        activeLeaves: activeLeaves?.count || 0,
        feedbackMonth: monthlyFeedback?.count || 0,
        activeOnboarding: activeOnboarding?.count || 0,
    };
}

/**
 * Team velocity (tasks completed per week)
 * MULTI-TENANT: Filters by organization
 */
export async function getTeamVelocity(weeks: number = 8) {
    const authResult = await requireManager();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const startDate = subDays(new Date(), weeks * 7);

    const result = await db.select({
        week: sql<string>`TO_CHAR(${tasks.updatedAt}, 'IYYY-IW')`,
        count: count(),
    })
        .from(tasks)
        .where(
            and(
                eq(tasks.organizationId, orgContext.orgId),
                eq(tasks.status, "done"),
                gte(tasks.updatedAt, startDate)
            )
        )
        .groupBy(sql`TO_CHAR(${tasks.updatedAt}, 'IYYY-IW')`)
        .orderBy(sql`TO_CHAR(${tasks.updatedAt}, 'IYYY-IW')`);

    return result;
}

/**
 * Overloaded users (more than X active tasks)
 * MULTI-TENANT: Filters by organization
 */
export async function getOverloadedUsers(threshold: number = 5) {
    const authResult = await requireManager();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const result = await db.select({
        userId: tasks.assigneeId,
        userName: users.name,
        activeCount: sql<number>`COUNT(*)`,
    })
        .from(tasks)
        .innerJoin(users, eq(tasks.assigneeId, users.id))
        .where(and(
            eq(tasks.organizationId, orgContext.orgId),
            sql`${tasks.status} != 'done'`
        ))
        .groupBy(tasks.assigneeId, users.name)
        .having(sql`COUNT(*) >= ${threshold}`)
        .orderBy(desc(sql`COUNT(*)`));

    return result;
}

/**
 * Headcount trends over time (monthly)
 * MULTI-TENANT: Filters by organization
 */
export async function getHeadcountTrends(months: number = 12) {
    const authResult = await requireManager();
    if (!authResult.authorized) return { currentCount: 0, trends: [] };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { currentCount: 0, trends: [] };

    // Get current headcount
    const [currentCount] = await db.select({ count: count() })
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId));

    return {
        currentCount: currentCount?.count || 0,
        trends: [], // Would need historical tracking for real trends
    };
}

/**
 * Leave analytics - usage patterns
 * MULTI-TENANT: Filters by organization
 */
export async function getLeaveAnalytics() {
    const authResult = await requireManager();
    if (!authResult.authorized) return { totalUsed: 0, pending: 0, approved: 0 };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { totalUsed: 0, pending: 0, approved: 0 };

    const [approved] = await db.select({ count: count() })
        .from(leaves)
        .where(and(
            eq(leaves.organizationId, orgContext.orgId),
            eq(leaves.status, "approved")
        ));

    const [pending] = await db.select({ count: count() })
        .from(leaves)
        .where(and(
            eq(leaves.organizationId, orgContext.orgId),
            eq(leaves.status, "pending")
        ));

    return {
        totalUsed: approved?.count || 0,
        pending: pending?.count || 0,
        approved: approved?.count || 0,
    };
}

/**
 * Department statistics - headcount by department
 * MULTI-TENANT: Filters by organization
 */
export async function getDepartmentStats() {
    const authResult = await requireManager();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const result = await db.select({
        name: users.department,
        count: count(),
    })
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId))
        .groupBy(users.department);

    // Filter out null departments and format
    return result
        .filter(r => r.name)
        .map(r => ({ name: r.name || "Unknown", count: r.count }));
}

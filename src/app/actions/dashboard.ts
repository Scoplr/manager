"use server";

/**
 * Consolidated Dashboard Actions
 * 
 * Merged from: dashboard.ts, my-dashboard.ts, team-dashboard.ts
 * Single source for all dashboard-related data
 */

import { db } from "@/db";
import { tasks, documents, leaves, expenses, users } from "@/db/schema";
import { eq, and, sql, gte, lte, desc, inArray, count } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";

// ============ TYPES ============

export interface TodayTask {
    id: string;
    title: string;
    dueDate: Date | null;
    priority: string;
    status: string;
}

export interface TeamMemberStatus {
    id: string;
    name: string;
    status: "available" | "busy" | "away" | "vacation";
    avatarUrl?: string;
}

interface TeamMember {
    id: string;
    name: string | null;
    email: string;
    department: string | null;
    designation: string | null;
    availabilityStatus: string | null;
}

interface TeamMemberWithStatus extends TeamMember {
    onLeave: boolean;
    isOverloaded: boolean;
    overdueTaskCount: number;
    pendingTaskCount: number;
}

// ============ GENERAL STATS ============

export async function getDashboardStats() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return { totalTasks: 0, completedTasks: 0, pendingTasks: 0, totalDocs: 0 };
    }

    if (user.id === "super-admin") {
        return { totalTasks: 0, completedTasks: 0, pendingTasks: 0, totalDocs: 0 };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) {
        return { totalTasks: 0, completedTasks: 0, pendingTasks: 0, totalDocs: 0 };
    }

    const [totalTasks, completedTasks, totalDocs] = await Promise.all([
        db.select({ count: sql<number>`count(*)` })
            .from(tasks)
            .where(eq(tasks.organizationId, orgContext.orgId)),
        db.select({ count: sql<number>`count(*)` })
            .from(tasks)
            .where(and(
                eq(tasks.organizationId, orgContext.orgId),
                eq(tasks.status, "done")
            )),
        db.select({ count: sql<number>`count(*)` })
            .from(documents)
            .where(eq(documents.organizationId, orgContext.orgId)),
    ]);

    const total = Number(totalTasks[0].count);
    const completed = Number(completedTasks[0].count);

    return {
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: total - completed,
        totalDocs: Number(totalDocs[0].count),
    };
}

export async function getTaskStatusDistribution() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user || user.id === "super-admin") return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const result = await db.select({
        status: tasks.status,
        count: sql<number>`count(*)`,
    })
        .from(tasks)
        .where(eq(tasks.organizationId, orgContext.orgId))
        .groupBy(tasks.status);

    return result.map(r => ({
        name: r.status.charAt(0).toUpperCase() + r.status.slice(1),
        value: Number(r.count),
    }));
}

export async function getTaskPriorityDistribution() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user || user.id === "super-admin") return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const result = await db.select({
        priority: tasks.priority,
        count: sql<number>`count(*)`,
    })
        .from(tasks)
        .where(eq(tasks.organizationId, orgContext.orgId))
        .groupBy(tasks.priority);

    const orderMap: Record<string, number> = { low: 1, medium: 2, high: 3, urgent: 4 };

    return result
        .sort((a, b) => (orderMap[a.priority] || 0) - (orderMap[b.priority] || 0))
        .map(r => ({
            name: r.priority.charAt(0).toUpperCase() + r.priority.slice(1),
            count: Number(r.count),
        }));
}

// ============ MY DASHBOARD ============

export async function getMyTodayTasks(): Promise<TodayTask[]> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user || user.id === "super-admin") return [];

    try {
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);

        const myTasks = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                dueDate: tasks.dueDate,
                priority: tasks.priority,
                status: tasks.status,
            })
            .from(tasks)
            .where(and(
                eq(tasks.assigneeId, user.id),
                lte(tasks.dueDate, tomorrow)
            ))
            .orderBy(desc(tasks.dueDate));

        return myTasks.map(t => ({
            ...t,
            priority: t.priority || "low",
            status: t.status || "pending",
        }));
    } catch (error) {
        console.error("Failed to get today tasks:", error);
        return [];
    }
}

export async function isNewHire(): Promise<boolean> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user || user.id === "super-admin") return false;

    try {
        const userRecord = await db
            .select({ createdAt: users.createdAt })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!userRecord.length) return false;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return new Date(userRecord[0].createdAt) > sevenDaysAgo;
    } catch {
        return false;
    }
}

export async function getPendingApprovalsCount(): Promise<number> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user || user.id === "super-admin") return 0;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return 0;

    try {
        const [pendingLeaves, pendingExpenses] = await Promise.all([
            db.select({ id: leaves.id })
                .from(leaves)
                .where(and(
                    eq(leaves.organizationId, orgContext.orgId),
                    eq(leaves.status, "pending")
                )),
            db.select({ id: expenses.id })
                .from(expenses)
                .where(and(
                    eq(expenses.organizationId, orgContext.orgId),
                    eq(expenses.status, "pending")
                )),
        ]);

        return pendingLeaves.length + pendingExpenses.length;
    } catch {
        return 0;
    }
}

export async function getTeamMembersWithStatus(): Promise<TeamMemberStatus[]> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user || user.id === "super-admin") return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const orgUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                availabilityStatus: users.availabilityStatus,
            })
            .from(users)
            .where(eq(users.organizationId, orgContext.orgId));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeLeaves = await db
            .select({ userId: leaves.userId })
            .from(leaves)
            .where(and(
                eq(leaves.organizationId, orgContext.orgId),
                eq(leaves.status, "approved"),
                lte(leaves.startDate, today),
                gte(leaves.endDate, today)
            ));

        const onLeaveUserIds = new Set(activeLeaves.map(l => l.userId));

        return orgUsers.map(u => ({
            id: u.id,
            name: u.name || u.email,
            status: onLeaveUserIds.has(u.id)
                ? "vacation"
                : (u.availabilityStatus === "away" ? "away" : "available") as TeamMemberStatus["status"],
            avatarUrl: undefined,
        }));
    } catch {
        return [];
    }
}

// ============ TEAM DASHBOARD ============

export async function getTeamDashboardData() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return { error: "Not authorized" };

    if (user.id === "super-admin") {
        return { members: [], onLeaveCount: 0, overloadedCount: 0, pendingLeaves: 0, pendingExpenses: 0 };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    try {
        const allMembers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                department: users.department,
                designation: users.designation,
                availabilityStatus: users.availabilityStatus,
            })
            .from(users)
            .where(eq(users.organizationId, orgContext.orgId));

        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

        const todayLeaves = await db
            .select({ userId: leaves.userId })
            .from(leaves)
            .where(and(
                eq(leaves.organizationId, orgContext.orgId),
                eq(leaves.status, "approved"),
                lte(leaves.startDate, endOfDay),
                gte(leaves.endDate, startOfDay)
            ));

        const usersOnLeave = new Set(todayLeaves.map(l => l.userId));

        const pendingLeavesResult = await db
            .select({ count: count() })
            .from(leaves)
            .where(and(
                eq(leaves.organizationId, orgContext.orgId),
                eq(leaves.status, "pending")
            ));

        const memberIds = allMembers.map(m => m.id);

        const overdueTasks = memberIds.length > 0 ? await db
            .select({ assigneeId: tasks.assigneeId, count: count() })
            .from(tasks)
            .where(and(
                eq(tasks.organizationId, orgContext.orgId),
                inArray(tasks.assigneeId, memberIds),
                lte(tasks.dueDate, now),
                eq(tasks.status, "todo")
            ))
            .groupBy(tasks.assigneeId) : [];

        const tasksDueSoon = memberIds.length > 0 ? await db
            .select({ assigneeId: tasks.assigneeId, count: count() })
            .from(tasks)
            .where(and(
                eq(tasks.organizationId, orgContext.orgId),
                inArray(tasks.assigneeId, memberIds),
                gte(tasks.dueDate, now),
                lte(tasks.dueDate, threeDaysFromNow),
                eq(tasks.status, "todo")
            ))
            .groupBy(tasks.assigneeId) : [];

        const overdueByUser = new Map(overdueTasks.map(t => [t.assigneeId, Number(t.count)]));
        const pendingByUser = new Map(tasksDueSoon.map(t => [t.assigneeId, Number(t.count)]));

        const membersWithStatus: TeamMemberWithStatus[] = allMembers.map(member => {
            const overdueCount = overdueByUser.get(member.id) || 0;
            const pendingCount = pendingByUser.get(member.id) || 0;

            return {
                ...member,
                onLeave: usersOnLeave.has(member.id),
                isOverloaded: overdueCount >= 3 || pendingCount >= 5,
                overdueTaskCount: overdueCount,
                pendingTaskCount: pendingCount,
            };
        });

        return {
            members: membersWithStatus,
            onLeaveCount: membersWithStatus.filter(m => m.onLeave).length,
            overloadedCount: membersWithStatus.filter(m => m.isOverloaded && !m.onLeave).length,
            pendingLeaves: pendingLeavesResult[0]?.count || 0,
            pendingExpenses: 0,
        };
    } catch (error) {
        console.error("Failed to get team dashboard data:", error);
        return { error: "Failed to load team data" };
    }
}

export async function getTeamMembersOnLeave() {
    const data = await getTeamDashboardData();
    if ("error" in data) return [];
    return data.members.filter(m => m.onLeave);
}

export async function getOverloadedTeamMembers() {
    const data = await getTeamDashboardData();
    if ("error" in data) return [];
    return data.members.filter(m => m.isOverloaded && !m.onLeave);
}

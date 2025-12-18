"use server";

/**
 * Compliance Reports Actions
 * 
 * Generate compliance and HR reports
 */

import { db } from "@/db";
import { users, leaves, expenses, tasks, feedback, employmentRecords } from "@/db/schema";
import { eq, and, gte, lte, count, sql, desc } from "drizzle-orm";
import { requireHR, requireAdmin, requireOrgContext } from "@/lib/authorize";

// Types
export interface LeaveReport {
    period: string;
    totalRequests: number;
    approved: number;
    rejected: number;
    pending: number;
    byType: Record<string, number>;
    topUsers: Array<{ name: string; days: number }>;
}

export interface ExpenseReport {
    period: string;
    totalAmount: number;
    totalCount: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    topSpenders: Array<{ name: string; amount: number }>;
}

export interface HeadcountReport {
    totalEmployees: number;
    byDepartment: Record<string, number>;
    byRole: Record<string, number>;
    recentHires: number;
    upcomingProbationEnds: number;
    contractsEnding: number;
}

// ============ LEAVE COMPLIANCE REPORT ============

export async function getLeaveReport(startDate: Date, endDate: Date): Promise<LeaveReport | null> {
    const { authorized } = await requireHR();
    if (!authorized) return null;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    try {
        const leaveData = await db
            .select({
                status: leaves.status,
                type: leaves.type,
                startDate: leaves.startDate,
                endDate: leaves.endDate,
                userId: leaves.userId,
            })
            .from(leaves)
            .where(
                and(
                    eq(leaves.organizationId, orgContext.orgId),
                    gte(leaves.startDate, startDate),
                    lte(leaves.endDate, endDate)
                )
            );

        const byType: Record<string, number> = {};
        const byStatus: Record<string, number> = { approved: 0, rejected: 0, pending: 0 };
        const userDays: Record<string, number> = {};

        for (const leave of leaveData) {
            byType[leave.type] = (byType[leave.type] || 0) + 1;
            byStatus[leave.status]++;

            if (leave.status === "approved") {
                const days = Math.ceil(
                    (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1;
                userDays[leave.userId] = (userDays[leave.userId] || 0) + days;
            }
        }

        // Get user names for top users
        const userIds = Object.keys(userDays).slice(0, 5);
        const userNames: Record<string, string> = {};
        for (const id of userIds) {
            const user = await db
                .select({ name: users.name })
                .from(users)
                .where(eq(users.id, id))
                .limit(1);
            userNames[id] = user[0]?.name || "Unknown";
        }

        const topUsers = Object.entries(userDays)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, days]) => ({ name: userNames[id] || id, days }));

        return {
            period: `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
            totalRequests: leaveData.length,
            approved: byStatus.approved,
            rejected: byStatus.rejected,
            pending: byStatus.pending,
            byType,
            topUsers,
        };
    } catch (error) {
        console.error("Failed to generate leave report:", error);
        return null;
    }
}

// ============ EXPENSE COMPLIANCE REPORT ============

export async function getExpenseReport(startDate: Date, endDate: Date): Promise<ExpenseReport | null> {
    const { authorized } = await requireHR();
    if (!authorized) return null;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    try {
        const expenseData = await db
            .select({
                status: expenses.status,
                category: expenses.category,
                amount: expenses.amount,
                userId: expenses.userId,
            })
            .from(expenses)
            .where(
                and(
                    eq(expenses.organizationId, orgContext.orgId),
                    gte(expenses.submittedAt, startDate),
                    lte(expenses.submittedAt, endDate)
                )
            );

        const byCategory: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        const userAmounts: Record<string, number> = {};
        let totalAmount = 0;

        for (const expense of expenseData) {
            const amount = parseFloat(expense.amount) || 0;
            totalAmount += amount;

            byCategory[expense.category] = (byCategory[expense.category] || 0) + amount;
            byStatus[expense.status] = (byStatus[expense.status] || 0) + 1;
            userAmounts[expense.userId] = (userAmounts[expense.userId] || 0) + amount;
        }

        // Get user names for top spenders
        const userIds = Object.keys(userAmounts).slice(0, 5);
        const userNames: Record<string, string> = {};
        for (const id of userIds) {
            const user = await db
                .select({ name: users.name })
                .from(users)
                .where(eq(users.id, id))
                .limit(1);
            userNames[id] = user[0]?.name || "Unknown";
        }

        const topSpenders = Object.entries(userAmounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, amount]) => ({ name: userNames[id] || id, amount }));

        return {
            period: `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
            totalAmount,
            totalCount: expenseData.length,
            byCategory,
            byStatus,
            topSpenders,
        };
    } catch (error) {
        console.error("Failed to generate expense report:", error);
        return null;
    }
}

// ============ HEADCOUNT REPORT ============

export async function getHeadcountReport(): Promise<HeadcountReport | null> {
    const { authorized } = await requireHR();
    if (!authorized) return null;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    try {
        const allUsers = await db
            .select({
                id: users.id,
                department: users.department,
                role: users.role,
                joinedAt: users.joinedAt,
            })
            .from(users)
            .where(eq(users.organizationId, orgContext.orgId));

        const byDepartment: Record<string, number> = {};
        const byRole: Record<string, number> = {};
        let recentHires = 0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const user of allUsers) {
            const dept = user.department || "Unassigned";
            byDepartment[dept] = (byDepartment[dept] || 0) + 1;
            byRole[user.role] = (byRole[user.role] || 0) + 1;

            if (user.joinedAt && new Date(user.joinedAt) > thirtyDaysAgo) {
                recentHires++;
            }
        }

        // Get employment records for probation/contract info
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const records = await db
            .select()
            .from(employmentRecords)
            .where(eq(employmentRecords.organizationId, orgContext.orgId));

        let upcomingProbationEnds = 0;
        let contractsEnding = 0;

        for (const record of records) {
            if (
                record.probationEndDate &&
                new Date(record.probationEndDate) <= thirtyDaysFromNow &&
                new Date(record.probationEndDate) >= new Date() &&
                record.probationStatus === "ongoing"
            ) {
                upcomingProbationEnds++;
            }

            if (
                record.endDate &&
                new Date(record.endDate) <= thirtyDaysFromNow &&
                new Date(record.endDate) >= new Date()
            ) {
                contractsEnding++;
            }
        }

        return {
            totalEmployees: allUsers.length,
            byDepartment,
            byRole,
            recentHires,
            upcomingProbationEnds,
            contractsEnding,
        };
    } catch (error) {
        console.error("Failed to generate headcount report:", error);
        return null;
    }
}

// ============ TASK PRODUCTIVITY REPORT ============

export async function getProductivityReport(startDate: Date, endDate: Date) {
    const { authorized } = await requireHR();
    if (!authorized) return null;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    try {
        const taskData = await db
            .select({
                status: tasks.status,
                assigneeId: tasks.assigneeId,
                priority: tasks.priority,
            })
            .from(tasks)
            .where(
                and(
                    eq(tasks.organizationId, orgContext.orgId),
                    gte(tasks.createdAt, startDate),
                    lte(tasks.createdAt, endDate)
                )
            );

        const byStatus: Record<string, number> = {};
        const byPriority: Record<string, number> = {};
        const userTasks: Record<string, { total: number; completed: number }> = {};

        for (const task of taskData) {
            byStatus[task.status] = (byStatus[task.status] || 0) + 1;
            byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;

            if (task.assigneeId) {
                if (!userTasks[task.assigneeId]) {
                    userTasks[task.assigneeId] = { total: 0, completed: 0 };
                }
                userTasks[task.assigneeId].total++;
                if (task.status === "done") {
                    userTasks[task.assigneeId].completed++;
                }
            }
        }

        return {
            period: `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
            totalTasks: taskData.length,
            byStatus,
            byPriority,
            completionRate: taskData.length > 0
                ? Math.round((byStatus.done || 0) / taskData.length * 100)
                : 0,
        };
    } catch (error) {
        console.error("Failed to generate productivity report:", error);
        return null;
    }
}

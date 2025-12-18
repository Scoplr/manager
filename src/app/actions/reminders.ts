"use server";

import { db } from "@/db";
import { leaves, tasks, expenses, assets, employmentRecords, users } from "@/db/schema";
import { eq, lt, and, gte, lte } from "drizzle-orm";
import { addDays } from "date-fns";
import { requireAuth, requireOrgContext } from "@/lib/authorize";

interface Reminder {
    id: string;
    type: "leave_pending" | "task_overdue" | "expense_pending" | "asset_renewal" | "probation_ending" | "contract_ending";
    title: string;
    description: string;
    priority: "low" | "normal" | "high" | "urgent";
    dueDate?: Date;
    relatedId?: string;
}

/**
 * Get reminders for the current user's organization
 * MULTI-TENANT: Filters all data by organization
 */
export async function getReminders(): Promise<Reminder[]> {
    const authResult = await requireAuth();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const reminders: Reminder[] = [];
    const now = new Date();
    const soon = addDays(now, 7);
    const verySoon = addDays(now, 3);

    // 1. Pending leave requests (awaiting approval) - scoped by org
    const pendingLeaves = await db.select({
        id: leaves.id,
        userName: users.name,
        startDate: leaves.startDate,
        type: leaves.type,
    })
        .from(leaves)
        .leftJoin(users, eq(leaves.userId, users.id))
        .where(and(
            eq(leaves.organizationId, orgContext.orgId),
            eq(leaves.status, "pending")
        ));

    for (const leave of pendingLeaves) {
        reminders.push({
            id: `leave-${leave.id}`,
            type: "leave_pending",
            title: "Leave pending approval",
            description: `${leave.userName}'s ${leave.type} leave request is waiting`,
            priority: "high",
            dueDate: leave.startDate,
            relatedId: leave.id,
        });
    }

    // 2. Overdue tasks - scoped by org
    const overdueTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        assigneeName: users.name,
    })
        .from(tasks)
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .where(and(
            eq(tasks.organizationId, orgContext.orgId),
            eq(tasks.status, "in_progress"),
            lt(tasks.dueDate, now)
        ));

    for (const task of overdueTasks) {
        reminders.push({
            id: `task-${task.id}`,
            type: "task_overdue",
            title: "Task overdue",
            description: `"${task.title}" assigned to ${task.assigneeName || "unassigned"}`,
            priority: "urgent",
            dueDate: task.dueDate || undefined,
            relatedId: task.id,
        });
    }

    // 3. Pending expenses - scoped by org
    const pendingExpenses = await db.select({
        id: expenses.id,
        amount: expenses.amount,
        userName: users.name,
    })
        .from(expenses)
        .leftJoin(users, eq(expenses.userId, users.id))
        .where(and(
            eq(expenses.organizationId, orgContext.orgId),
            eq(expenses.status, "pending")
        ));

    if (pendingExpenses.length > 0) {
        reminders.push({
            id: `expenses-pending`,
            type: "expense_pending",
            title: "Expenses pending",
            description: `${pendingExpenses.length} expense(s) awaiting approval`,
            priority: "normal",
        });
    }

    // 4. Asset renewals coming up - scoped by org
    const upcomingRenewals = await db.select({
        id: assets.id,
        name: assets.name,
        renewalDate: assets.renewalDate,
    })
        .from(assets)
        .where(and(
            eq(assets.organizationId, orgContext.orgId),
            gte(assets.renewalDate, now),
            lte(assets.renewalDate, soon)
        ));

    for (const asset of upcomingRenewals) {
        reminders.push({
            id: `asset-${asset.id}`,
            type: "asset_renewal",
            title: "Asset renewal soon",
            description: `${asset.name} renews soon`,
            priority: asset.renewalDate && asset.renewalDate <= verySoon ? "high" : "normal",
            dueDate: asset.renewalDate || undefined,
            relatedId: asset.id,
        });
    }

    // 5. Probation endings - scoped by org through users
    const probationEnding = await db.select({
        id: employmentRecords.id,
        userName: users.name,
        probationEndDate: employmentRecords.probationEndDate,
    })
        .from(employmentRecords)
        .innerJoin(users, eq(employmentRecords.userId, users.id))
        .where(and(
            eq(users.organizationId, orgContext.orgId),
            eq(employmentRecords.probationStatus, "ongoing"),
            gte(employmentRecords.probationEndDate, now),
            lte(employmentRecords.probationEndDate, soon)
        ));

    for (const record of probationEnding) {
        reminders.push({
            id: `probation-${record.id}`,
            type: "probation_ending",
            title: "Probation ending",
            description: `${record.userName}'s probation ends soon`,
            priority: "high",
            dueDate: record.probationEndDate || undefined,
            relatedId: record.id,
        });
    }

    // 6. Contract endings - scoped by org through users
    const contractEnding = await db.select({
        id: employmentRecords.id,
        userName: users.name,
        endDate: employmentRecords.endDate,
    })
        .from(employmentRecords)
        .innerJoin(users, eq(employmentRecords.userId, users.id))
        .where(and(
            eq(users.organizationId, orgContext.orgId),
            eq(employmentRecords.employmentType, "contract"),
            gte(employmentRecords.endDate, now),
            lte(employmentRecords.endDate, soon)
        ));

    for (const record of contractEnding) {
        reminders.push({
            id: `contract-${record.id}`,
            type: "contract_ending",
            title: "Contract ending",
            description: `${record.userName}'s contract expires soon`,
            priority: "urgent",
            dueDate: record.endDate || undefined,
            relatedId: record.id,
        });
    }

    // Sort by priority and due date
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    return reminders.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
        return 0;
    });
}


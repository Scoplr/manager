"use server";

import { db } from "@/db";
import { leaves, expenses, internalRequests, users, assets } from "@/db/schema";
import { eq, desc, and, or, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { requireManager, getCurrentUser, requireOrgContext } from "@/lib/authorize";

// Combined approval item type
interface ApprovalItem {
    id: string;
    type: "leave" | "expense" | "request";
    title: string;
    description: string;
    requesterName: string;
    requesterId: string;
    createdAt: Date;
    priority?: string;
    amount?: string;
    status: string;
    // Leave-specific
    startDate?: Date;
    endDate?: Date;
    leaveType?: string;
    // Expense-specific
    category?: string;
}

/**
 * Get all pending approval items - requires manager or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getPendingApprovals(): Promise<ApprovalItem[]> {
    const authResult = await requireManager();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    const items: ApprovalItem[] = [];
    const currentUserId = authResult.user?.id;

    // 1. Pending leaves (exclude own leaves) - SCOPED BY ORG
    const pendingLeaves = await db.select({
        id: leaves.id,
        type: leaves.type,
        startDate: leaves.startDate,
        endDate: leaves.endDate,
        reason: leaves.reason,
        status: leaves.status,
        createdAt: leaves.createdAt,
        userId: leaves.userId,
        userName: users.name,
    })
        .from(leaves)
        .leftJoin(users, eq(leaves.userId, users.id))
        .where(and(
            eq(leaves.status, "pending"),
            eq(leaves.organizationId, orgContext.orgId)
        ))
        .orderBy(desc(leaves.createdAt));

    for (const leave of pendingLeaves) {
        // Skip own leave requests
        if (leave.userId === currentUserId) continue;

        const days = Math.ceil(
            (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

        items.push({
            id: leave.id,
            type: "leave",
            title: `${leave.type} Leave Request`,
            description: `${days} day(s): ${leave.reason || "No reason provided"}`,
            requesterName: leave.userName || "Unknown",
            requesterId: leave.userId,
            createdAt: leave.createdAt,
            status: leave.status,
            startDate: leave.startDate,
            endDate: leave.endDate,
            leaveType: leave.type,
        });
    }

    // 2. Pending expenses (exclude own expenses) - SCOPED BY ORG
    const pendingExpenses = await db.select({
        id: expenses.id,
        amount: expenses.amount,
        currency: expenses.currency,
        category: expenses.category,
        description: expenses.description,
        status: expenses.status,
        submittedAt: expenses.submittedAt,
        userId: expenses.userId,
        userName: users.name,
    })
        .from(expenses)
        .leftJoin(users, eq(expenses.userId, users.id))
        .where(and(
            eq(expenses.status, "pending"),
            eq(expenses.organizationId, orgContext.orgId)
        ))
        .orderBy(desc(expenses.submittedAt));

    for (const expense of pendingExpenses) {
        // Skip own expense requests
        if (expense.userId === currentUserId) continue;

        items.push({
            id: expense.id,
            type: "expense",
            title: `Expense: ${expense.category}`,
            description: expense.description,
            requesterName: expense.userName || "Unknown",
            requesterId: expense.userId,
            createdAt: expense.submittedAt,
            status: expense.status,
            amount: `${expense.currency} ${expense.amount}`,
            category: expense.category,
        });
    }

    // 3. Open requests (exclude own requests) - SCOPED BY ORG
    const openRequests = await db.select({
        id: internalRequests.id,
        title: internalRequests.title,
        description: internalRequests.description,
        category: internalRequests.category,
        priority: internalRequests.priority,
        status: internalRequests.status,
        createdAt: internalRequests.createdAt,
        requesterId: internalRequests.requesterId,
        requesterName: users.name,
    })
        .from(internalRequests)
        .leftJoin(users, eq(internalRequests.requesterId, users.id))
        .where(and(
            eq(internalRequests.status, "open"),
            eq(internalRequests.organizationId, orgContext.orgId)
        ))
        .orderBy(desc(internalRequests.createdAt));

    for (const req of openRequests) {
        // Skip own requests
        if (req.requesterId === currentUserId) continue;

        items.push({
            id: req.id,
            type: "request",
            title: req.title,
            description: req.description || "",
            requesterName: req.requesterName || "Unknown",
            requesterId: req.requesterId,
            createdAt: req.createdAt,
            status: req.status,
            priority: req.priority || "normal",
            category: req.category,
        });
    }

    // Sort all by date
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get counts of pending approvals - requires manager or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getApprovalCounts() {
    const authResult = await requireManager();
    if (!authResult.authorized) {
        return { leaves: 0, expenses: 0, requests: 0, total: 0 };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { leaves: 0, expenses: 0, requests: 0, total: 0 };

    const currentUserId = authResult.user?.id;

    const leavesArr = await db.select().from(leaves).where(and(
        eq(leaves.status, "pending"),
        eq(leaves.organizationId, orgContext.orgId)
    ));
    const expensesArr = await db.select().from(expenses).where(and(
        eq(expenses.status, "pending"),
        eq(expenses.organizationId, orgContext.orgId)
    ));
    const requestsArr = await db.select().from(internalRequests).where(and(
        eq(internalRequests.status, "open"),
        eq(internalRequests.organizationId, orgContext.orgId)
    ));

    // Exclude own items from counts
    const filteredLeaves = leavesArr.filter(l => l.userId !== currentUserId);
    const filteredExpenses = expensesArr.filter(e => e.userId !== currentUserId);
    const filteredRequests = requestsArr.filter(r => r.requesterId !== currentUserId);

    return {
        leaves: filteredLeaves.length,
        expenses: filteredExpenses.length,
        requests: filteredRequests.length,
        total: filteredLeaves.length + filteredExpenses.length + filteredRequests.length,
    };
}

/**
 * Bulk approve leaves - requires manager or admin role
 */
export async function bulkApproveLeaves(ids: string[]) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized", approved: 0, failed: ids.length };
    }

    let approved = 0;
    let failed = 0;

    for (const id of ids) {
        try {
            const { approveLeave } = await import("./leave");
            const result = await approveLeave(id);
            if (result.success) approved++;
            else failed++;
        } catch {
            failed++;
        }
    }

    revalidatePath("/approvals");
    revalidatePath("/leaves");

    return { approved, failed };
}

/**
 * Bulk reject leaves - requires manager or admin role
 */
export async function bulkRejectLeaves(ids: string[]) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    for (const id of ids) {
        const { rejectLeave } = await import("./leave");
        await rejectLeave(id);
    }

    await logActivity("rejected", "leave", `${ids.length} leave request(s) rejected`);
    revalidatePath("/approvals");
    revalidatePath("/leaves");

    return { success: true, count: ids.length };
}

/**
 * Bulk approve expenses - requires manager or admin role
 */
export async function bulkApproveExpenses(ids: string[]) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    for (const id of ids) {
        const { approveExpense } = await import("./expenses");
        await approveExpense(id);
    }

    await logActivity("approved", "expense", `${ids.length} expense(s) approved`);
    revalidatePath("/approvals");
    revalidatePath("/expenses");

    return { success: true, count: ids.length };
}

/**
 * Approve a single item - requires manager or admin role
 */
export async function approveItem(type: "leave" | "expense" | "request", id: string) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    if (type === "leave") {
        const { approveLeave } = await import("./leave");
        return await approveLeave(id);
    } else if (type === "expense") {
        const { approveExpense } = await import("./expenses");
        return await approveExpense(id);
    } else if (type === "request") {
        await db.update(internalRequests)
            .set({ status: "resolved", resolvedAt: new Date() })
            .where(eq(internalRequests.id, id));
        await logActivity("resolved", "request", "Request resolved");
        revalidatePath("/approvals");
        revalidatePath("/requests");
        return { success: true };
    }
}

/**
 * Reject a single item - requires manager or admin role
 */
export async function rejectItem(type: "leave" | "expense" | "request", id: string) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    if (type === "leave") {
        const { rejectLeave } = await import("./leave");
        return await rejectLeave(id);
    } else if (type === "expense") {
        const { rejectExpense } = await import("./expenses");
        return await rejectExpense(id);
    } else if (type === "request") {
        await db.update(internalRequests)
            .set({ status: "closed", resolvedAt: new Date() })
            .where(eq(internalRequests.id, id));
        await logActivity("closed", "request", "Request closed");
        revalidatePath("/approvals");
        return { success: true };
    }
}

/**
 * Bulk approve multiple items - requires manager or admin role
 * PRODUCTIVITY: Handle multiple approvals in one action
 */
export async function bulkApprove(items: { type: "leave" | "expense" | "request"; id: string }[]) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const item of items) {
        try {
            const result = await approveItem(item.type, item.id);
            if (result && "error" in result) {
                results.failed++;
                results.errors.push(`${item.type}:${item.id} - ${result.error}`);
            } else {
                results.success++;
            }
        } catch (e) {
            results.failed++;
            results.errors.push(`${item.type}:${item.id} - Unknown error`);
        }
    }

    revalidatePath("/approvals");
    return {
        success: true,
        approved: results.success,
        failed: results.failed,
        errors: results.errors
    };
}

/**
 * Bulk reject multiple items - requires manager or admin role
 * PRODUCTIVITY: Handle multiple rejections in one action
 */
export async function bulkReject(items: { type: "leave" | "expense" | "request"; id: string }[]) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const item of items) {
        try {
            const result = await rejectItem(item.type, item.id);
            if (result && "error" in result) {
                results.failed++;
                results.errors.push(`${item.type}:${item.id} - ${result.error}`);
            } else {
                results.success++;
            }
        } catch (e) {
            results.failed++;
            results.errors.push(`${item.type}:${item.id} - Unknown error`);
        }
    }

    revalidatePath("/approvals");
    return {
        success: true,
        rejected: results.success,
        failed: results.failed,
        errors: results.errors
    };
}


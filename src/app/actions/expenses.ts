"use server";

import { db } from "@/db";
import { expenses, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth, requireManager, getCurrentUser } from "@/lib/authorize";

/**
 * Submit a new expense (authenticated user submits for themselves)
 */
export async function submitExpense(formData: FormData) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authenticated" };
    }

    const userId = authResult.user.id;
    const amountStr = formData.get("amount")?.toString()?.trim();
    const currency = formData.get("currency")?.toString() || "USD";
    const category = formData.get("category")?.toString() as "travel" | "meals" | "supplies" | "software" | "equipment" | "other";
    const description = formData.get("description")?.toString()?.trim();
    const receiptUrl = formData.get("receiptUrl")?.toString();

    // Validation
    if (!amountStr) {
        return { error: "Amount is required" };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
        return { error: "Amount must be a positive number" };
    }

    if (amount > 100000) {
        return { error: "Amount exceeds maximum limit. Contact finance for large expenses." };
    }

    if (!description) {
        return { error: "Description is required" };
    }

    if (description.length < 5) {
        return { error: "Description must be at least 5 characters" };
    }

    if (description.length > 500) {
        return { error: "Description must be less than 500 characters" };
    }

    const validCategories = ["travel", "meals", "supplies", "software", "equipment", "other"];
    if (!category || !validCategories.includes(category)) {
        return { error: "Please select a valid category" };
    }

    // Require receipt for expenses over $100
    if (amount > 100 && !receiptUrl) {
        return { error: "Receipt is required for expenses over $100" };
    }

    await db.insert(expenses).values({
        userId,
        organizationId: authResult.user.organizationId,
        amount: amountStr,
        currency,
        category,
        description,
        receiptUrl: receiptUrl || null,
        status: "pending",
    });

    revalidatePath("/expenses");
    revalidatePath("/approvals");
    return { success: true };
}

/**
 * Get expenses - managers see all in their org, employees see only their own
 */
export async function getExpenses(status?: string) {
    const authResult = await getCurrentUser();
    const orgId = authResult.user?.organizationId;

    let query = db.select({
        id: expenses.id,
        userId: expenses.userId,
        userName: users.name,
        amount: expenses.amount,
        currency: expenses.currency,
        category: expenses.category,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        status: expenses.status,
        submittedAt: expenses.submittedAt,
        approvedAt: expenses.approvedAt,
        reimbursedAt: expenses.reimbursedAt,
    })
        .from(expenses)
        .innerJoin(users, eq(expenses.userId, users.id))
        .orderBy(desc(expenses.submittedAt));

    // Apply org filter at database level if user has an org
    let results;
    if (orgId) {
        results = await query.where(eq(expenses.organizationId, orgId));
    } else {
        results = await query;
    }

    // Apply status filter if provided
    let filtered = results;
    if (status) {
        filtered = filtered.filter(e => e.status === status);
    }

    // Non-managers can only see their own expenses within their org
    if (authResult.user && authResult.user.role === "member") {
        filtered = filtered.filter(e => e.userId === authResult.user!.id);
    }

    return filtered;
}

/**
 * Approve an expense - requires manager or admin role
 */
export async function approveExpense(id: string) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized to approve expenses" };
    }

    // Check expense exists and is pending
    const expenseResult = await db.select().from(expenses).where(eq(expenses.id, id));
    const expense = expenseResult[0];

    if (!expense) return { error: "Expense not found" };
    if (expense.status !== "pending") return { error: "Expense is not pending" };

    // Managers cannot approve their own expenses
    if (expense.userId === authResult.user.id) {
        return { error: "You cannot approve your own expense" };
    }

    await db.update(expenses)
        .set({
            status: "approved",
            approvedBy: authResult.user.id,
            approvedAt: new Date(),
        })
        .where(eq(expenses.id, id));

    revalidatePath("/expenses");
    revalidatePath("/approvals");
    return { success: true };
}

/**
 * Reject an expense - requires manager or admin role
 */
export async function rejectExpense(id: string) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized to reject expenses" };
    }

    // Check expense exists and is pending
    const expenseResult = await db.select().from(expenses).where(eq(expenses.id, id));
    const expense = expenseResult[0];

    if (!expense) return { error: "Expense not found" };
    if (expense.status !== "pending") return { error: "Expense is not pending" };

    // Managers cannot reject their own expenses
    if (expense.userId === authResult.user.id) {
        return { error: "You cannot reject your own expense" };
    }

    await db.update(expenses)
        .set({ status: "rejected" })
        .where(eq(expenses.id, id));

    revalidatePath("/expenses");
    revalidatePath("/approvals");
    return { success: true };
}

/**
 * Mark an expense as reimbursed - requires manager or admin role
 */
export async function markReimbursed(id: string) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    const expenseResult = await db.select().from(expenses).where(eq(expenses.id, id));
    const expense = expenseResult[0];

    if (!expense) return { error: "Expense not found" };
    if (expense.status !== "approved") return { error: "Expense must be approved first" };

    await db.update(expenses)
        .set({
            status: "reimbursed",
            reimbursedAt: new Date(),
        })
        .where(eq(expenses.id, id));

    revalidatePath("/expenses");
    return { success: true };
}

/**
 * Get expense summary stats
 */
export async function getExpenseSummary() {
    const all = await getExpenses();
    const pending = all.filter(e => e.status === "pending");
    const approved = all.filter(e => e.status === "approved");
    const totalPending = pending.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalApproved = approved.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return {
        pendingCount: pending.length,
        approvedCount: approved.length,
        totalPending,
        totalApproved,
    };
}

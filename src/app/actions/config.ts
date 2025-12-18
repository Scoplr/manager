"use server";

import { db } from "@/db";
import { departments, leavePolicies, holidays, approvalRules, workingPatterns, expenseCategories, users, organizations } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireHR, requireOrgContext } from "@/lib/authorize";

// ============ DEPARTMENTS ============

/**
 * Create a department - requires admin role
 * MULTI-TENANT: Associates department with user's organization
 */
export async function createDepartment(formData: FormData) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const headId = formData.get("headId")?.toString();
    const maxLeavePerDay = parseInt(formData.get("maxLeavePerDay")?.toString() || "0") || undefined;

    if (!name) return { error: "Name required" };

    await db.insert(departments).values({
        organizationId: orgContext.orgId,
        name,
        description: description || null,
        headId: headId || null,
        settings: { maxLeavePerDay },
    });

    revalidatePath("/settings");
    return { success: true };
}

/**
 * Get departments - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getDepartments() {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select({
        id: departments.id,
        name: departments.name,
        description: departments.description,
        headId: departments.headId,
        headName: users.name,
        settings: departments.settings,
        createdAt: departments.createdAt,
    })
        .from(departments)
        .leftJoin(users, eq(departments.headId, users.id))
        .where(eq(departments.organizationId, orgContext.orgId))
        .orderBy(departments.name);
}

/**
 * Delete a department - requires admin role
 * MULTI-TENANT: Verifies department belongs to user's organization
 */
export async function deleteDepartment(id: string) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(departments).where(and(
        eq(departments.id, id),
        eq(departments.organizationId, orgContext.orgId)
    ));
    revalidatePath("/settings");
    return { success: true };
}

// ============ LEAVE POLICIES ============

/**
 * Create a leave policy - requires admin role
 * MULTI-TENANT: Associates policy with user's organization
 */
export async function createLeavePolicy(formData: FormData) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString();
    const annualAllowance = parseInt(formData.get("annualAllowance")?.toString() || "20");
    const sickAllowance = parseInt(formData.get("sickAllowance")?.toString() || "10");
    const carryOverLimit = parseInt(formData.get("carryOverLimit")?.toString() || "5");
    const halfDayEnabled = formData.get("halfDayEnabled") === "true";
    const requiresMedicalProof = formData.get("requiresMedicalProof") === "true";
    const minDaysNotice = parseInt(formData.get("minDaysNotice")?.toString() || "3");
    const isDefault = formData.get("isDefault") === "true";

    if (!name) return { error: "Name required" };

    await db.insert(leavePolicies).values({
        organizationId: orgContext.orgId,
        name,
        annualAllowance,
        sickAllowance,
        carryOverLimit,
        halfDayEnabled,
        requiresMedicalProof,
        minDaysNotice,
        isDefault,
    });

    revalidatePath("/settings");
    return { success: true };
}

/**
 * Get leave policies - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getLeavePolicies() {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select()
        .from(leavePolicies)
        .where(eq(leavePolicies.organizationId, orgContext.orgId))
        .orderBy(desc(leavePolicies.isDefault));
}

/**
 * Delete a leave policy - requires admin role
 * MULTI-TENANT: Verifies policy belongs to user's organization
 */
export async function deleteLeavePolicy(id: string) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(leavePolicies).where(and(
        eq(leavePolicies.id, id),
        eq(leavePolicies.organizationId, orgContext.orgId)
    ));
    revalidatePath("/settings");
    return { success: true };
}

// ============ HOLIDAYS ============

/**
 * Create a holiday - requires admin role
 * MULTI-TENANT: Associates holiday with user's organization
 */
export async function createHoliday(formData: FormData) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString();
    const dateStr = formData.get("date")?.toString();
    const isRecurring = formData.get("isRecurring") === "true";

    if (!name || !dateStr) return { error: "Name and date required" };

    await db.insert(holidays).values({
        organizationId: orgContext.orgId,
        name,
        date: new Date(dateStr),
        isRecurring,
    });

    revalidatePath("/settings");
    return { success: true };
}

/**
 * Get holidays - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getHolidays() {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select()
        .from(holidays)
        .where(eq(holidays.organizationId, orgContext.orgId))
        .orderBy(holidays.date);
}

/**
 * Delete a holiday - requires admin role
 * MULTI-TENANT: Verifies holiday belongs to user's organization
 */
export async function deleteHoliday(id: string) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(holidays).where(and(
        eq(holidays.id, id),
        eq(holidays.organizationId, orgContext.orgId)
    ));
    revalidatePath("/settings");
    return { success: true };
}

// ============ APPROVAL RULES ============

/**
 * Create an approval rule - requires admin role
 * MULTI-TENANT: Associates rule with user's organization
 */
export async function createApprovalRule(formData: FormData) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString();
    const type = formData.get("type")?.toString() as any;
    const autoApproveThreshold = parseInt(formData.get("autoApproveThreshold")?.toString() || "0") || undefined;
    const requiresManagerApproval = formData.get("requiresManagerApproval") === "true";
    const requiresHRApproval = formData.get("requiresHRApproval") === "true";
    const requiresFinanceApproval = formData.get("requiresFinanceApproval") === "true";

    if (!name || !type) return { error: "Name and type required" };

    await db.insert(approvalRules).values({
        organizationId: orgContext.orgId,
        name,
        type,
        conditions: {
            autoApproveThreshold,
            requiresManagerApproval,
            requiresHRApproval,
            requiresFinanceApproval,
        },
    });

    revalidatePath("/settings");
    return { success: true };
}

/**
 * Get approval rules - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getApprovalRules() {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select()
        .from(approvalRules)
        .where(eq(approvalRules.organizationId, orgContext.orgId))
        .orderBy(desc(approvalRules.priority));
}

/**
 * Delete an approval rule - requires admin role
 * MULTI-TENANT: Verifies rule belongs to user's organization
 */
export async function deleteApprovalRule(id: string) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(approvalRules).where(and(
        eq(approvalRules.id, id),
        eq(approvalRules.organizationId, orgContext.orgId)
    ));
    revalidatePath("/settings");
    return { success: true };
}

// ============ WORKING PATTERNS ============

/**
 * Get working patterns - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getWorkingPatterns() {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select()
        .from(workingPatterns)
        .where(eq(workingPatterns.organizationId, orgContext.orgId));
}

// ============ EXPENSE CATEGORIES ============

/**
 * Create an expense category - requires admin role
 * MULTI-TENANT: Associates category with user's organization
 */
export async function createExpenseCategory(formData: FormData) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString();
    const limit = parseInt(formData.get("limit")?.toString() || "0") || null;
    const requiresReceipt = formData.get("requiresReceipt") !== "false";
    const requiresApproval = formData.get("requiresApproval") !== "false";

    if (!name) return { error: "Name required" };

    await db.insert(expenseCategories).values({
        organizationId: orgContext.orgId,
        name,
        limit,
        requiresReceipt,
        requiresApproval,
    });

    revalidatePath("/settings");
    return { success: true };
}

/**
 * Get expense categories - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getExpenseCategories() {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    return await db.select()
        .from(expenseCategories)
        .where(eq(expenseCategories.organizationId, orgContext.orgId))
        .orderBy(expenseCategories.name);
}

/**
 * Delete an expense category - requires admin role
 * MULTI-TENANT: Verifies category belongs to user's organization
 */
export async function deleteExpenseCategory(id: string) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    await db.delete(expenseCategories).where(and(
        eq(expenseCategories.id, id),
        eq(expenseCategories.organizationId, orgContext.orgId)
    ));
    revalidatePath("/settings");
    return { success: true };
}


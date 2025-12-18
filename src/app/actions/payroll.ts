"use server";

import { db } from "@/db";
import { payrollRuns, payslips, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireHR, requireOrgContext } from "@/lib/authorize";
import { logSensitiveAccess } from "./activity";

/**
 * Get all payroll runs - requires HR or admin role
 * MULTI-TENANT: Filters by organization
 */
export async function getPayrollRuns() {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return [];
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    // Log sensitive data access
    await logSensitiveAccess("viewed_salary", undefined, "Viewed payroll runs list");

    return await db.select()
        .from(payrollRuns)
        .where(eq(payrollRuns.organizationId, orgContext.orgId))
        .orderBy(desc(payrollRuns.createdAt));
}

/**
 * Get a single payroll run with payslips - requires HR or admin role
 * MULTI-TENANT: Verifies run belongs to user's organization
 */
export async function getPayrollRun(id: string) {
    const authResult = await requireHR();
    if (!authResult.authorized) {
        return null;
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    const run = await db.select()
        .from(payrollRuns)
        .where(and(
            eq(payrollRuns.id, id),
            eq(payrollRuns.organizationId, orgContext.orgId)
        ));

    if (!run || run.length === 0) return null;

    // Log sensitive data access
    await logSensitiveAccess("viewed_salary", undefined, `Viewed payroll run details: ${run[0].month} ${run[0].year}`);

    const items = await db.select({
        id: payslips.id,
        userId: payslips.userId,
        userName: users.name,
        userRole: users.role,
        userDept: users.department,
        basic: payslips.basic,
        allowances: payslips.allowances,
        deductions: payslips.deductions,
        netSalary: payslips.netSalary
    })
        .from(payslips)
        .innerJoin(users, eq(payslips.userId, users.id))
        .where(eq(payslips.runId, id));

    return { ...run[0], items };
}

/**
 * Create a new payroll run - requires admin role
 * MULTI-TENANT: Associates run with user's organization
 */
export async function createPayrollRun(month: string, year: string) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const [newRun] = await db.insert(payrollRuns).values({
        organizationId: orgContext.orgId,
        month,
        year,
        status: "draft"
    }).returning();

    revalidatePath("/payroll");
    return { success: true, id: newRun.id };
}

/**
 * Generate payslips for a payroll run - requires admin role
 * MULTI-TENANT: Only generates for users in same organization
 */
export async function generatePayslips(runId: string) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Verify run belongs to this org
    const run = await db.select()
        .from(payrollRuns)
        .where(and(
            eq(payrollRuns.id, runId),
            eq(payrollRuns.organizationId, orgContext.orgId)
        ));

    if (!run[0]) {
        return { error: "Payroll run not found" };
    }

    // 1. Fetch only users from this organization
    const orgUsers = await db.select()
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId));

    // 2. Generate payslips
    const slips = [];
    for (const user of orgUsers) {
        // Skip users without salary details
        const salary = user.salaryDetails as { basic: number, allowances: number } | null;
        if (!salary) continue;

        // Simple calculation
        const basic = salary.basic || 0;
        const allowances = salary.allowances || 0;
        const deductions = 0; // Placeholder logic
        const net = basic + allowances - deductions;

        slips.push({
            runId,
            userId: user.id,
            basic: basic.toString(),
            allowances: allowances.toString(),
            deductions: deductions.toString(),
            netSalary: net.toString()
        });
    }

    if (slips.length > 0) {
        await db.insert(payslips).values(slips);
    }

    revalidatePath(`/payroll/${runId}`);
    return { success: true, count: slips.length };
}

/**
 * Finalize a payroll run - requires admin role
 * MULTI-TENANT: Verifies run belongs to user's organization
 */
export async function finalizeRun(runId: string) {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
        return { error: authResult.error || "Admin access required" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Only update if belongs to this org
    await db.update(payrollRuns)
        .set({ status: "completed" })
        .where(and(
            eq(payrollRuns.id, runId),
            eq(payrollRuns.organizationId, orgContext.orgId)
        ));

    revalidatePath("/payroll");
    revalidatePath(`/payroll/${runId}`);
    return { success: true };
}


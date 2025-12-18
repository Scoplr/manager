"use server";

/**
 * Leave Management - Consolidated Module
 * 
 * All leave-related functionality in one place:
 * - Request/approve/reject leaves
 * - Balance management
 * - Accrual calculation
 * - Conflict detection
 * - Carry-over
 */

import { db } from "@/db";
import { leaves, users, leavePolicies } from "@/db/schema";
import { eq, desc, and, gte, lte, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { requireAuth, requireManager, requireHR, requireOrgContext, getCurrentUser } from "@/lib/authorize";

// ============ TYPES ============

export interface LeaveBalance {
    casual: number;
    sick: number;
    privilege: number;
}

export interface LeaveUsage {
    type: string;
    used: number;
    remaining: number;
    total: number;
}

export interface AccrualResult {
    casual: { accrued: number; used: number; available: number; annual: number };
    sick: { accrued: number; used: number; available: number; annual: number };
    privilege: { accrued: number; used: number; available: number; annual: number };
    explanation: string;
}

export interface ConflictResult {
    hasConflict: boolean;
    conflictLevel: "none" | "warning" | "critical";
    overlappingUsers: { id: string; name: string; type: string }[];
    message: string;
}

// ============ LEAVE REQUESTS ============

/**
 * Request a new leave
 */
export async function requestLeave(formData: FormData) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authenticated" };
    }

    const userId = authResult.user.id;
    const type = formData.get("type")?.toString() as "casual" | "sick" | "privilege";
    const reason = formData.get("reason")?.toString();
    const startDate = new Date(formData.get("startDate")?.toString() || "");
    const endDate = new Date(formData.get("endDate")?.toString() || "");

    // Basic validation
    if (!type || !["casual", "sick", "privilege"].includes(type)) {
        return { error: "Invalid leave type. Choose casual, sick, or privilege." };
    }

    if (!startDate || !endDate) {
        return { error: "Start date and end date are required." };
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { error: "Invalid date format. Please select valid dates." };
    }

    if (endDate < startDate) {
        return { error: "End date must be on or after the start date." };
    }

    // No past dates (allow today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
        return { error: "Cannot request leave for past dates." };
    }

    // Check for user's own overlapping pending/approved leaves
    const existingOverlap = await db.select({ id: leaves.id, status: leaves.status })
        .from(leaves)
        .where(and(
            eq(leaves.userId, userId),
            or(eq(leaves.status, "pending"), eq(leaves.status, "approved")),
            lte(leaves.startDate, endDate),
            gte(leaves.endDate, startDate)
        ))
        .limit(1);

    if (existingOverlap.length > 0) {
        const status = existingOverlap[0].status;
        return { error: `You already have a ${status} leave request for these dates.` };
    }

    const [newLeave] = await db.insert(leaves).values({
        userId,
        organizationId: authResult.user.organizationId,
        type,
        reason,
        startDate,
        endDate,
        status: "pending"
    }).returning();

    await logActivity("requested", "leave", `${authResult.user.name || 'Someone'} requested ${type} leave`, newLeave.id, userId);

    revalidatePath("/team");
    revalidatePath("/leaves");
    revalidatePath("/approvals");
    return { success: true };
}

/**
 * Get leaves - managers see all, employees see own
 */
export async function getLeaves(filters?: { status?: string; userId?: string }) {
    const authResult = await getCurrentUser();
    const orgId = authResult.user?.organizationId;

    let query = db.select({
        id: leaves.id,
        type: leaves.type,
        startDate: leaves.startDate,
        endDate: leaves.endDate,
        reason: leaves.reason,
        status: leaves.status,
        createdAt: leaves.createdAt,
        userName: users.name,
        userRole: users.role,
        userDept: users.department,
        userId: users.id,
    })
        .from(leaves)
        .innerJoin(users, eq(leaves.userId, users.id))
        .orderBy(desc(leaves.createdAt));

    let results = orgId
        ? await query.where(eq(leaves.organizationId, orgId))
        : await query;

    if (filters?.status) {
        results = results.filter(l => l.status === filters.status);
    }
    if (filters?.userId) {
        results = results.filter(l => l.userId === filters.userId);
    }

    if (authResult.user && authResult.user.role === "member") {
        results = results.filter(l => l.userId === authResult.user!.id);
    }

    return results;
}

export async function getPendingLeaves() {
    return getLeaves({ status: "pending" });
}

export async function getMyLeaves() {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) return [];
    return getLeaves({ userId: authResult.user.id });
}

/**
 * Approve leave request
 */
export async function approveLeave(leaveId: string, comment?: string) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    const managerId = authResult.user.id;
    const [leave] = await db.select().from(leaves).where(eq(leaves.id, leaveId));

    if (!leave) return { error: "Leave not found" };
    if (leave.status !== "pending") return { error: "Leave is not pending" };
    if (leave.userId === managerId) return { error: "Cannot approve own leave" };

    const [user] = await db.select().from(users).where(eq(users.id, leave.userId));
    if (!user || !user.leaveBalance) return { error: "User not found" };

    const days = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const type = leave.type as "casual" | "sick" | "privilege";
    const balance = user.leaveBalance as LeaveBalance;

    if (balance[type] < days) {
        return { error: `Insufficient balance (Need: ${days}, Have: ${balance[type]})` };
    }

    const newBalance = { ...balance, [type]: balance[type] - days };

    await db.transaction(async (tx) => {
        await tx.update(leaves).set({ status: "approved", approvedBy: managerId }).where(eq(leaves.id, leaveId));
        await tx.update(users).set({ leaveBalance: newBalance }).where(eq(users.id, leave.userId));
    });

    await logActivity("approved", "leave", `${user.name}'s leave approved`, leaveId, managerId);
    revalidatePath("/leaves");
    revalidatePath("/approvals");
    return { success: true };
}

/**
 * Reject leave request
 */
export async function rejectLeave(leaveId: string, comment?: string) {
    const authResult = await requireManager();
    if (!authResult.authorized || !authResult.user) {
        return { error: authResult.error || "Not authorized" };
    }

    const managerId = authResult.user.id;
    const [leave] = await db.select().from(leaves).where(eq(leaves.id, leaveId));

    if (!leave) return { error: "Leave not found" };
    if (leave.status !== "pending") return { error: "Leave is not pending" };
    if (leave.userId === managerId) return { error: "Cannot reject own leave" };

    const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, leave.userId));

    await db.update(leaves).set({ status: "rejected", approvedBy: managerId }).where(eq(leaves.id, leaveId));
    await logActivity("rejected", "leave", `${user?.name}'s leave rejected`, leaveId, managerId);

    revalidatePath("/leaves");
    revalidatePath("/approvals");
    return { success: true };
}

/**
 * Cancel own pending leave
 */
export async function cancelLeave(leaveId: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: "Not authenticated" };
    }

    const [leave] = await db.select().from(leaves).where(eq(leaves.id, leaveId));

    if (!leave) return { error: "Leave not found" };
    if (leave.userId !== authResult.user.id) return { error: "Can only cancel own leaves" };
    if (leave.status !== "pending") return { error: "Can only cancel pending" };

    await db.delete(leaves).where(eq(leaves.id, leaveId));
    revalidatePath("/leaves");
    return { success: true };
}

// ============ BALANCE ============

/**
 * Get leave balance
 */
export async function getLeaveBalance(userId?: string): Promise<LeaveBalance | null> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return null;

    const targetId = userId || user.id;

    if (userId && userId !== user.id && user.role === "member") {
        return null;
    }

    const [result] = await db.select({ leaveBalance: users.leaveBalance })
        .from(users)
        .where(eq(users.id, targetId));

    return (result?.leaveBalance as LeaveBalance) || { casual: 12, sick: 10, privilege: 15 };
}

/**
 * Get leave usage for year
 */
export async function getLeaveUsage(userId?: string, year?: number): Promise<LeaveUsage[]> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return [];

    const targetId = userId || user.id;
    const targetYear = year || new Date().getFullYear();
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31);

    const approvedLeaves = await db.select({
        type: leaves.type,
        startDate: leaves.startDate,
        endDate: leaves.endDate,
    })
        .from(leaves)
        .where(and(
            eq(leaves.userId, targetId),
            eq(leaves.status, "approved"),
            gte(leaves.startDate, yearStart),
            lte(leaves.endDate, yearEnd)
        ));

    const balance = await getLeaveBalance(targetId);
    const defaults = { casual: 12, sick: 10, privilege: 15 };

    const usage: Record<string, number> = { casual: 0, sick: 0, privilege: 0 };
    for (const leave of approvedLeaves) {
        const days = calculateLeaveDays(leave.startDate, leave.endDate);
        usage[leave.type] = (usage[leave.type] || 0) + days;
    }

    return [
        { type: "casual", used: usage.casual, remaining: (balance?.casual || defaults.casual) - usage.casual, total: balance?.casual || defaults.casual },
        { type: "sick", used: usage.sick, remaining: (balance?.sick || defaults.sick) - usage.sick, total: balance?.sick || defaults.sick },
        { type: "privilege", used: usage.privilege, remaining: (balance?.privilege || defaults.privilege) - usage.privilege, total: balance?.privilege || defaults.privilege },
    ];
}

/**
 * Adjust leave balance (HR only)
 */
export async function adjustLeaveBalance(userId: string, type: "casual" | "sick" | "privilege", adjustment: number) {
    const { authorized, error } = await requireHR();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const [targetUser] = await db.select({ id: users.id, organizationId: users.organizationId, leaveBalance: users.leaveBalance })
        .from(users)
        .where(eq(users.id, userId));

    if (!targetUser || targetUser.organizationId !== orgContext.orgId) {
        return { error: "User not found" };
    }

    const currentBalance = (targetUser.leaveBalance as LeaveBalance) || { casual: 12, sick: 10, privilege: 15 };
    const newBalance = { ...currentBalance, [type]: Math.max(0, currentBalance[type] + adjustment) };

    await db.update(users).set({ leaveBalance: newBalance }).where(eq(users.id, userId));
    revalidatePath("/team");
    return { success: true, newBalance };
}

// ============ ACCRUAL ============

/**
 * Calculate leave accrual (pro-rated for new hires)
 */
export async function calculateLeaveAccrual(userId?: string): Promise<AccrualResult | { error: string }> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return { error: "Not authorized" };

    const targetId = userId || user.id;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const [userData] = await db.select().from(users).where(eq(users.id, targetId));
    if (!userData) return { error: "User not found" };

    const [policy] = await db.select()
        .from(leavePolicies)
        .where(and(eq(leavePolicies.organizationId, orgContext.orgId), eq(leavePolicies.isDefault, true)));

    const annualCasual = policy?.annualAllowance ?? 12;
    const annualSick = policy?.sickAllowance ?? 10;
    const annualPrivilege = 15;

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const joinDate = userData.joinedAt || userData.createdAt;
    const effectiveStart = joinDate > yearStart ? joinDate : yearStart;

    const monthsWorked = Math.max(1, Math.round((now.getTime() - effectiveStart.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    const monthsInYear = Math.min(12, monthsWorked);

    const casualAccrued = Math.round((annualCasual / 12) * monthsInYear * 10) / 10;
    const sickAccrued = Math.round((annualSick / 12) * monthsInYear * 10) / 10;
    const privilegeAccrued = Math.round((annualPrivilege / 12) * monthsInYear * 10) / 10;

    const yearEnd = new Date(now.getFullYear(), 11, 31);
    const takenLeaves = await db.select()
        .from(leaves)
        .where(and(eq(leaves.userId, targetId), eq(leaves.status, "approved"), gte(leaves.startDate, yearStart), lte(leaves.endDate, yearEnd)));

    let casualUsed = 0, sickUsed = 0, privilegeUsed = 0;
    for (const leave of takenLeaves) {
        const days = calculateLeaveDays(leave.startDate, leave.endDate);
        if (leave.type === "casual") casualUsed += days;
        else if (leave.type === "sick") sickUsed += days;
        else if (leave.type === "privilege") privilegeUsed += days;
    }

    const isNewHire = joinDate > yearStart;
    const explanation = isNewHire
        ? `Pro-rated for ${monthsInYear} months worked.`
        : `Full year accrual.`;

    return {
        casual: { accrued: casualAccrued, used: casualUsed, available: Math.max(0, casualAccrued - casualUsed), annual: annualCasual },
        sick: { accrued: sickAccrued, used: sickUsed, available: Math.max(0, sickAccrued - sickUsed), annual: annualSick },
        privilege: { accrued: privilegeAccrued, used: privilegeUsed, available: Math.max(0, privilegeAccrued - privilegeUsed), annual: annualPrivilege },
        explanation,
    };
}

/**
 * Carry over leave (HR only, year-end)
 */
export async function carryOverLeave(fromYear: number) {
    const { authorized, error } = await requireHR();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const [policy] = await db.select({ carryOverLimit: leavePolicies.carryOverLimit })
        .from(leavePolicies)
        .where(and(eq(leavePolicies.organizationId, orgContext.orgId), eq(leavePolicies.isDefault, true)));

    const carryOverLimit = policy?.carryOverLimit || 5;
    const orgUsers = await db.select({ id: users.id, leaveBalance: users.leaveBalance })
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId));

    let processed = 0;
    for (const user of orgUsers) {
        const usage = await getLeaveUsage(user.id, fromYear);
        const privilegeUsage = usage.find(u => u.type === "privilege");
        const carryOver = Math.min(privilegeUsage?.remaining || 0, carryOverLimit);

        await db.update(users)
            .set({ leaveBalance: { casual: 12, sick: 10, privilege: 15 + carryOver } })
            .where(eq(users.id, user.id));
        processed++;
    }

    revalidatePath("/settings/leave-policies");
    return { success: true, processed, carryOverLimit };
}

// ============ CONFLICT DETECTION ============

/**
 * Check for leave conflicts
 */
export async function checkLeaveConflicts(startDate: Date, endDate: Date, department?: string): Promise<ConflictResult> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return { hasConflict: false, conflictLevel: "none", overlappingUsers: [], message: "" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) {
        return { hasConflict: false, conflictLevel: "none", overlappingUsers: [], message: "" };
    }

    const overlapping = await db.select({
        id: leaves.id,
        userId: leaves.userId,
        userName: users.name,
        userDept: users.department,
        type: leaves.type,
    })
        .from(leaves)
        .innerJoin(users, eq(leaves.userId, users.id))
        .where(and(
            eq(leaves.organizationId, orgContext.orgId),
            or(eq(leaves.status, "approved"), eq(leaves.status, "pending")),
            lte(leaves.startDate, endDate),
            gte(leaves.endDate, startDate)
        ));

    const relevantOverlaps = overlapping
        .filter(l => l.userId !== user.id)
        .filter(l => !department || l.userDept === department);

    const teamSize = department
        ? (await db.select({ id: users.id }).from(users).where(and(eq(users.organizationId, orgContext.orgId), eq(users.department, department)))).length
        : 10;

    const overlapCount = relevantOverlaps.length;
    const overlapRatio = overlapCount / teamSize;

    let conflictLevel: "none" | "warning" | "critical" = "none";
    let message = "";

    if (overlapRatio >= 0.5 || overlapCount >= 5) {
        conflictLevel = "critical";
        message = `Critical: ${overlapCount} team members off.`;
    } else if (overlapRatio >= 0.25 || overlapCount >= 3) {
        conflictLevel = "warning";
        message = `Warning: ${overlapCount} have overlapping leave.`;
    }

    return {
        hasConflict: conflictLevel !== "none",
        conflictLevel,
        overlappingUsers: relevantOverlaps.map(l => ({ id: l.userId, name: l.userName || "Unknown", type: l.type })),
        message,
    };
}

/**
 * Get team availability for dates
 */
export async function getTeamAvailabilityForDates(startDate: Date, endDate: Date, department?: string) {
    const { authorized } = await requireAuth();
    if (!authorized) return { available: 0, onLeave: 0, total: 0, members: [] };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { available: 0, onLeave: 0, total: 0, members: [] };

    const allMembers = await db.select({ id: users.id, name: users.name, department: users.department })
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId));

    const relevantMembers = department ? allMembers.filter(m => m.department === department) : allMembers;

    const leavesInRange = await db.select({ userId: leaves.userId })
        .from(leaves)
        .where(and(
            eq(leaves.organizationId, orgContext.orgId),
            eq(leaves.status, "approved"),
            lte(leaves.startDate, endDate),
            gte(leaves.endDate, startDate)
        ));

    const onLeaveIds = new Set(leavesInRange.map(l => l.userId));
    const members = relevantMembers.map(m => ({ ...m, onLeave: onLeaveIds.has(m.id) }));

    return {
        available: members.filter(m => !m.onLeave).length,
        onLeave: members.filter(m => m.onLeave).length,
        total: members.length,
        members,
    };
}

// ============ HELPERS ============

function calculateLeaveDays(start: Date, end: Date): number {
    return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type AppRole = "admin" | "hr" | "manager" | "employee";

// Role hierarchy - higher index = more permissions
const ROLE_HIERARCHY: AppRole[] = ["employee", "manager", "hr", "admin"];

/**
 * Get the current user's role from session
 */
export async function getCurrentRole(): Promise<AppRole> {
    const session = await auth();
    const role = (session?.user as any)?.role || "employee";

    if (role === "admin" || role === "ceo") return "admin";
    if (role === "hr") return "hr";
    if (role === "manager") return "manager";
    return "employee";
}

/**
 * Check if user has minimum required role
 */
export async function hasMinRole(minRole: AppRole): Promise<boolean> {
    const currentRole = await getCurrentRole();
    const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
    const requiredIndex = ROLE_HIERARCHY.indexOf(minRole);
    return currentIndex >= requiredIndex;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: AppRole): Promise<boolean> {
    const currentRole = await getCurrentRole();
    return currentRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: AppRole[]): Promise<boolean> {
    const currentRole = await getCurrentRole();
    return roles.includes(currentRole);
}

/**
 * Redirect if user doesn't have minimum role
 * Use in page components for route protection
 */
export async function requireMinRole(minRole: AppRole, redirectTo: string = "/"): Promise<void> {
    const hasPermission = await hasMinRole(minRole);
    if (!hasPermission) {
        redirect(redirectTo);
    }
}

/**
 * Redirect if user doesn't have any of the specified roles
 */
export async function requireAnyRole(roles: AppRole[], redirectTo: string = "/"): Promise<void> {
    const hasPermission = await hasAnyRole(roles);
    if (!hasPermission) {
        redirect(redirectTo);
    }
}

/**
 * Get current user ID from session
 */
export async function getCurrentUserId(): Promise<string | null> {
    const session = await auth();
    return session?.user?.id || null;
}

/**
 * Check if user can view another user's data
 * - Admins/HR can view anyone
 * - Managers can view their team (simplified: anyone for now)
 * - Employees can only view themselves
 */
export async function canViewUser(targetUserId: string): Promise<boolean> {
    const currentRole = await getCurrentRole();
    const currentUserId = await getCurrentUserId();

    // Admins and HR can view anyone
    if (currentRole === "admin" || currentRole === "hr") {
        return true;
    }

    // Managers can view team members (simplified for now)
    if (currentRole === "manager") {
        return true;
    }

    // Employees can only view themselves
    return currentUserId === targetUserId;
}

/**
 * Check if user can edit another user's data
 * - Admins can edit anyone
 * - HR can edit non-admins
 * - Managers can edit their team (limited)
 * - Employees can only edit themselves (limited fields)
 */
export async function canEditUser(targetUserId: string): Promise<boolean> {
    const currentRole = await getCurrentRole();
    const currentUserId = await getCurrentUserId();

    // Admins can edit anyone
    if (currentRole === "admin") {
        return true;
    }

    // HR can edit most users
    if (currentRole === "hr") {
        return true;
    }

    // Others can only edit themselves
    return currentUserId === targetUserId;
}

// Note: filterUserData and PAGE_PERMISSIONS are in ./role-utils.ts 
// because they are not async functions and can't be in "use server" files

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * User roles in the system, ordered by permission level
 */
export type UserRole = "admin" | "manager" | "member";

/**
 * Authorization result returned by all auth functions
 */
export interface AuthResult {
    authorized: boolean;
    error: string | null;
    user: {
        id: string;
        email: string;
        role: UserRole;
        name: string | null;
        organizationId: string | null;
    } | null;
}

/**
 * Get the current authenticated user from session
 */
export async function getCurrentUser(): Promise<AuthResult> {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return {
                authorized: false,
                error: "Not authenticated",
                user: null,
            };
        }

        // Special Bypass for Super Admin (Non-UUID ID)
        if (session.user.id === "super-admin") {
            const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase() || "";
            return {
                authorized: true,
                error: null,
                user: {
                    id: "super-admin",
                    email: superAdminEmail,
                    role: "admin",
                    name: "Super Admin",
                    organizationId: null, // Super admin is global
                },
            };
        }

        // Get full user details from database to ensure we have the latest role
        const userResult = await db
            .select({
                id: users.id,
                email: users.email,
                role: users.role,
                name: users.name,
                organizationId: users.organizationId,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const user = userResult[0];

        if (!user) {
            return {
                authorized: false,
                error: "User not found",
                user: null,
            };
        }

        return {
            authorized: true,
            error: null,
            user: {
                id: user.id,
                email: user.email,
                role: user.role as UserRole,
                name: user.name,
                organizationId: user.organizationId,
            },
        };
    } catch (error) {
        console.error("Authorization error:", error);
        return {
            authorized: false,
            error: "Authorization failed",
            user: null,
        };
    }
}

/**
 * Require the user to have one of the specified roles
 * @param allowedRoles - Array of roles that are permitted
 * @returns AuthResult with user details if authorized
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthResult> {
    const result = await getCurrentUser();

    if (!result.authorized || !result.user) {
        return result;
    }

    if (!allowedRoles.includes(result.user.role)) {
        return {
            authorized: false,
            error: `Insufficient permissions. Required roles: ${allowedRoles.join(", ")}`,
            user: null,
        };
    }

    return result;
}

/**
 * Require any authenticated user (no specific role needed)
 */
export async function requireAuth(): Promise<AuthResult> {
    return requireRole(["admin", "manager", "member"]);
}

/**
 * Require admin role (highest privilege)
 * Use for: system configuration, user management, all settings
 */
export async function requireAdmin(): Promise<AuthResult> {
    return requireRole(["admin"]);
}

/**
 * Require manager or admin role
 * Use for: approvals, team management, announcements
 */
export async function requireManager(): Promise<AuthResult> {
    return requireRole(["admin", "manager"]);
}

/**
 * Require HR or admin role
 * For operations that are HR-specific (payroll, onboarding, etc.)
 * Note: In this system, "manager" role is used for HR as well
 */
export async function requireHR(): Promise<AuthResult> {
    return requireRole(["admin", "manager"]);
}

/**
 * Check if user can access a specific resource owned by another user
 * Admins and managers can access, or if it's the user's own resource
 */
export async function requireOwnerOrManager(resourceOwnerId: string): Promise<AuthResult> {
    const result = await getCurrentUser();

    if (!result.authorized || !result.user) {
        return result;
    }

    // Admins and managers can access any resource
    if (result.user.role === "admin" || result.user.role === "manager") {
        return result;
    }

    // Regular users can only access their own resources
    if (result.user.id === resourceOwnerId) {
        return result;
    }

    return {
        authorized: false,
        error: "You can only access your own resources",
        user: null,
    };
}

/**
 * Get the organization ID for the current user
 * Returns null if user is not authenticated or has no organization
 */
export async function getOrgId(): Promise<string | null> {
    const result = await getCurrentUser();
    return result.user?.organizationId || null;
}

/**
 * Require organization context - fail if user has no organization
 */
export async function requireOrgContext(): Promise<{ orgId: string; user: AuthResult["user"] } | { error: string }> {
    const result = await getCurrentUser();

    if (!result.authorized || !result.user) {
        return { error: result.error || "Not authenticated" };
    }

    if (!result.user.organizationId) {
        return { error: "User is not part of any organization" };
    }

    return {
        orgId: result.user.organizationId,
        user: result.user,
    };
}

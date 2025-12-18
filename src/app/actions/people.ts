"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createUserSchema, updateUserSchema, validateFormData } from "@/lib/validations";
import { logActivity } from "./activity";
import { getCurrentUser } from "@/lib/authorize";
import { getCurrentRole } from "@/lib/role-guards";

export async function getUsers() {
    const authResult = await getCurrentUser();
    const orgId = authResult.user?.organizationId;
    const currentRole = await getCurrentRole();

    // Get all users in organization
    let userList = await db.select().from(users).orderBy(desc(users.createdAt));

    // Filter to organization if user has one
    if (orgId) {
        userList = userList.filter(u => u.organizationId === orgId);
    }

    // For employees, filter out sensitive data from other users
    if (currentRole === "employee") {
        const currentUserId = authResult.user?.id;
        userList = userList.map(u => {
            const isOwnProfile = u.id === currentUserId;
            if (isOwnProfile) return u;

            // Return only public data for other users
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                department: u.department,
                designation: u.designation,
                availabilityStatus: u.availabilityStatus,
                role: u.role,
                // Hide sensitive fields
                organizationId: u.organizationId,
                createdAt: u.createdAt,
                salaryDetails: null, // Hide salary
                phone: null, // Hide phone
                birthday: null, // Hide birthday
                leaveBalance: null, // Hide leave balance
                joinedAt: null, // Hide join date
            } as typeof u;
        });
    }

    return userList;
}

export async function getUser(id: string) {
    const authResult = await getCurrentUser();
    const currentRole = await getCurrentRole();
    const currentUserId = authResult.user?.id;
    const orgId = authResult.user?.organizationId;

    const result = await db.select().from(users).where(eq(users.id, id));
    const user = result[0] || null;

    if (!user) return null;

    // Check organization access
    if (orgId && user.organizationId !== orgId) {
        return null; // Can't view users from other orgs
    }

    // For employees viewing other profiles, hide sensitive data
    if (currentRole === "employee" && user.id !== currentUserId) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            designation: user.designation,
            availabilityStatus: user.availabilityStatus,
            role: user.role,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            // Hide sensitive fields
            salaryDetails: null,
            phone: null,
            birthday: null,
            leaveBalance: null,
            joinedAt: null,
        } as typeof user;
    }

    return user;
}

export async function createUser(formData: FormData) {
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const role = formData.get("role")?.toString() as "admin" | "manager" | "member" || "member";
    const department = formData.get("department")?.toString();
    const designation = formData.get("designation")?.toString();
    const phone = formData.get("phone")?.toString();
    const birthday = formData.get("birthday")?.toString();
    const joinedAt = formData.get("joinedAt")?.toString();
    const salaryBasic = formData.get("salaryBasic")?.toString();
    const salaryAllowances = formData.get("salaryAllowances")?.toString();

    if (!name || !email) {
        return { error: "Name and email are required" };
    }

    // Check if email exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
        return { error: "Email already exists" };
    }

    try {
        const [newUser] = await db.insert(users).values({
            name,
            email,
            role,
            department: department || null,
            designation: designation || null,
            phone: phone || null,
            birthday: birthday ? new Date(birthday) : null,
            joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
            salaryDetails: salaryBasic ? {
                basic: parseFloat(salaryBasic) || 0,
                allowances: parseFloat(salaryAllowances || "0") || 0,
            } : null,
            leaveBalance: { casual: 12, sick: 10, privilege: 15 },
        }).returning();

        await logActivity("created", "user", `${name} was added to the team`);

        revalidatePath("/team");
        return { success: true, userId: newUser.id };
    } catch (error) {
        return { error: "Failed to create user" };
    }
}

export async function updateUser(formData: FormData) {
    const id = formData.get("id")?.toString();
    const name = formData.get("name")?.toString();
    const role = formData.get("role")?.toString() as "admin" | "manager" | "member";
    const department = formData.get("department")?.toString();
    const designation = formData.get("designation")?.toString();
    const phone = formData.get("phone")?.toString();
    const birthday = formData.get("birthday")?.toString();
    const availabilityStatus = formData.get("availabilityStatus")?.toString() as any;

    if (!id) return { error: "User ID required" };

    try {
        await db.update(users)
            .set({
                name: name || undefined,
                role: role || undefined,
                department: department || undefined,
                designation: designation || undefined,
                phone: phone || undefined,
                birthday: birthday ? new Date(birthday) : undefined,
                availabilityStatus: availabilityStatus || undefined,
            })
            .where(eq(users.id, id));

        await logActivity("updated", "user", `${name}'s profile was updated`);

        revalidatePath(`/team/${id}`);
        revalidatePath("/team");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update user" };
    }
}

export async function deactivateUser(id: string) {
    const user = await getUser(id);
    if (!user) return { error: "User not found" };

    // For MVP, we'll just log it - actual deactivation would need status field
    await logActivity("deactivated", "user", `${user.name} was deactivated`);

    revalidatePath("/team");
    return { success: true };
}

export async function getUsersByRole(role: "admin" | "manager" | "member") {
    return await db.select().from(users).where(eq(users.role, role));
}

export async function searchUsers(query: string) {
    const allUsers = await getUsers();
    const lowerQuery = query.toLowerCase();
    return allUsers.filter(u =>
        u.name?.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery) ||
        u.department?.toLowerCase().includes(lowerQuery)
    );
}

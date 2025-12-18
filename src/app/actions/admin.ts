"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendInviteEmail } from "@/lib/email";
import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { count, eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
    const session = await auth();
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
    if (!superAdminEmail || session?.user?.email?.toLowerCase() !== superAdminEmail) {
        return { authorized: false };
    }
    return { authorized: true };
}

export async function getTenants() {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) return [];

    const orgs = await db
        .select({
            id: organizations.id,
            name: organizations.name,
            createdAt: organizations.createdAt,
            userCount: sql<number>`count(${users.id})`,
        })
        .from(organizations)
        .leftJoin(users, eq(users.organizationId, organizations.id))
        .groupBy(organizations.id)
        .orderBy(desc(organizations.createdAt));

    return orgs;
}

export async function createTenantAction(formData: FormData) {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) return { error: "Unauthorized" };

    const name = formData.get("name")?.toString();
    const adminEmail = formData.get("adminEmail")?.toString();
    const adminName = formData.get("adminName")?.toString();
    const password = formData.get("password")?.toString() || "password123"; // Default or form input

    if (!name || !adminEmail || !adminName) {
        return { error: "All fields are required" };
    }

    try {
        // Check user
        const existing = await db.select().from(users).where(eq(users.email, adminEmail));
        if (existing.length > 0) {
            return { error: "User with this email already exists" };
        }

        // Create Org
        const [org] = await db.insert(organizations).values({ name }).returning();

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Admin
        await db.insert(users).values({
            email: adminEmail,
            name: adminName,
            role: "admin",
            organizationId: org.id,
            password: hashedPassword,
        });

        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create tenant" };
    }
}

export async function getTenantUsers(orgId: string) {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) return [];

    return await db.select().from(users).where(eq(users.organizationId, orgId)).orderBy(desc(users.role));
}

export async function provisionUserAction(formData: FormData) {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) return { error: "Unauthorized" };

    const orgId = formData.get("orgId")?.toString();
    const email = formData.get("email")?.toString();
    const name = formData.get("name")?.toString();
    const role = formData.get("role")?.toString() as "admin" | "manager" | "member";
    const password = formData.get("password")?.toString();

    if (!orgId || !email || !name) {
        return { error: "Name and Email are required" };
    }

    try {
        // Check user
        const existing = await db.select().from(users).where(eq(users.email, email));
        if (existing.length > 0) {
            return { error: "User with this email already exists" };
        }

        if (password) {
            // Direct provisioning
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.insert(users).values({
                email,
                name,
                role: role || "member",
                organizationId: orgId,
                password: hashedPassword,
                status: "active",
            });
        } else {
            // Invitation flow
            const token = crypto.randomBytes(32).toString("hex");
            const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

            await db.insert(users).values({
                email,
                name,
                role: role || "member",
                organizationId: orgId,
                status: "invited",
                inviteToken: token,
                inviteExpires: expires,
            });

            await sendInviteEmail(email, token);
        }

        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to provision user" };
    }
}

export async function bulkProvisionUsers(orgId: string, usersList: Array<{ name: string; email: string; role: string; password?: string }>) {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) return { error: "Unauthorized" };

    try {
        const results = [];
        for (const u of usersList) {
            // Check existing
            const existing = await db.select().from(users).where(eq(users.email, u.email));
            if (existing.length > 0) {
                results.push({ email: u.email, status: "failed", error: "User exists" });
                continue;
            }

            if (u.password && u.password.length > 0) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await db.insert(users).values({
                    email: u.email,
                    name: u.name,
                    role: (u.role as "member" | "manager" | "admin") || "member",
                    organizationId: orgId,
                    password: hashedPassword,
                    status: "active",
                });
            } else {
                // Invite
                const token = crypto.randomBytes(32).toString("hex");
                const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

                await db.insert(users).values({
                    email: u.email,
                    name: u.name,
                    role: (u.role as "member" | "manager" | "admin") || "member",
                    organizationId: orgId,
                    status: "invited",
                    inviteToken: token,
                    inviteExpires: expires,
                });

                // Send email (async, don't block bulk loop too much? Resend is fast)
                await sendInviteEmail(u.email, token);
            }

            results.push({ email: u.email, status: "success" });
        }

        revalidatePath("/admin/tenants");
        return { success: true, results };
    } catch (error) {
        console.error(error);
        return { error: "Failed to bulk provision" };
    }
}

export async function updateUserRole(userId: string, role: string) {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) return { error: "Unauthorized" };

    try {
        await db.update(users).set({ role: role as any }).where(eq(users.id, userId));
        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update role" };
    }
}

export async function toggleUserStatus(userId: string, status: string) {
    const { authorized } = await requireSuperAdmin();
    if (!authorized) return { error: "Unauthorized" };

    try {
        await db.update(users).set({ status }).where(eq(users.id, userId));
        revalidatePath("/admin/tenants");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update status" };
    }
}

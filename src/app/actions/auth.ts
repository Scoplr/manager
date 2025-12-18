"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function verifyInviteToken(token: string) {
    if (!token) return { valid: false };

    const user = await db.query.users.findFirst({
        where: and(
            eq(users.inviteToken, token),
            gt(users.inviteExpires, new Date())
        )
    });

    if (!user) return { valid: false };

    return { valid: true, email: user.email, name: user.name };
}

export async function acceptInviteAction(token: string, password: string) {
    if (!token || !password) return { error: "Missing fields" };

    const user = await db.query.users.findFirst({
        where: and(
            eq(users.inviteToken, token),
            gt(users.inviteExpires, new Date())
        )
    });

    if (!user) return { error: "Invalid or expired token" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.update(users)
        .set({
            password: hashedPassword,
            status: "active",
            inviteToken: null,
            inviteExpires: null,
        })
        .where(eq(users.id, user.id));

    return { success: true };
}

import { requireAuth, requireOrgContext } from "@/lib/authorize";
import { randomBytes } from "crypto";

export async function sendInvite(formData: FormData) {
    // Auth check
    const { authorized, user: currentUser } = await requireAuth();
    if (!authorized || !['admin', 'hr'].includes((currentUser as any)?.role || '')) {
        return { error: "Not authorized to invite users" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const email = formData.get("email")?.toString().trim().toLowerCase();
    const name = formData.get("name")?.toString().trim();
    const role = (formData.get("role")?.toString() || "member") as "admin" | "manager" | "member";

    if (!email) return { error: "Email is required" };
    if (!email.includes("@")) return { error: "Invalid email format" };

    // Check if user already exists
    const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existing) {
        return { error: "A user with this email already exists" };
    }

    // Generate invite token
    const token = randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days to accept

    // Create user with invited status
    const [newUser] = await db.insert(users)
        .values({
            email,
            name: name || null,
            role,
            organizationId: orgContext.orgId,
            status: "invited",
            inviteToken: token,
            inviteExpires: expires,
        })
        .returning();

    // Generate invite URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite?token=${token}`;

    return {
        success: true,
        inviteUrl,
        message: `Invite created for ${email}. Share the link with them.`,
    };
}

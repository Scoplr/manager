"use server";

import { db } from "@/db";
import { demoRequests, organizations, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

// ============ PUBLIC ACTIONS ============

export async function createDemoRequest(data: {
    email: string;
    name: string;
    designation?: string;
    organizationName: string;
}) {
    // Check if email already has a pending request
    const existing = await db.select()
        .from(demoRequests)
        .where(eq(demoRequests.email, data.email.toLowerCase()))
        .limit(1);

    if (existing.length > 0) {
        const status = existing[0].status;
        if (status === "pending") {
            return { error: "You already have a pending request. We'll email you when it's approved." };
        }
        if (status === "approved") {
            return { error: "Your request was already approved. Check your email for login instructions." };
        }
    }

    // Check if user already exists
    const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, data.email.toLowerCase()))
        .limit(1);

    if (existingUser.length > 0) {
        return { error: "An account with this email already exists. Try logging in instead." };
    }

    // Create the request
    const [request] = await db.insert(demoRequests).values({
        email: data.email.toLowerCase(),
        name: data.name,
        designation: data.designation || null,
        organizationName: data.organizationName,
    }).returning();

    return { success: true, requestId: request.id };
}

export async function checkUserExists(email: string) {
    const user = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

    return user.length > 0;
}

// ============ ADMIN ACTIONS ============

export async function getPendingDemoRequests() {
    const requests = await db.select()
        .from(demoRequests)
        .where(eq(demoRequests.status, "pending"))
        .orderBy(desc(demoRequests.createdAt));

    return requests;
}

export async function getAllDemoRequests() {
    const requests = await db.select()
        .from(demoRequests)
        .orderBy(desc(demoRequests.createdAt));

    return requests;
}

export async function approveDemoRequest(requestId: string, adminId: string) {
    // Get the request
    const [request] = await db.select()
        .from(demoRequests)
        .where(eq(demoRequests.id, requestId));

    if (!request) {
        return { error: "Request not found" };
    }

    if (request.status !== "pending") {
        return { error: "Request already processed" };
    }

    // Create organization
    const [org] = await db.insert(organizations).values({
        name: request.organizationName,
        settings: {
            setupCompleted: false,
        },
        plan: "free",
        subscriptionStatus: "trialing",
    }).returning();

    // Generate a temporary password (will be reset via magic link)
    const tempPassword = crypto.randomBytes(16).toString("hex");

    // Create user
    const [user] = await db.insert(users).values({
        email: request.email,
        name: request.name,
        password: tempPassword, // They'll reset via magic link
        role: "admin",
        organizationId: org.id,
        status: "active",
    }).returning();

    // Update the demo request
    await db.update(demoRequests)
        .set({
            status: "approved",
            approvedBy: adminId,
            approvedAt: new Date(),
            createdOrganizationId: org.id,
            createdUserId: user.id,
        })
        .where(eq(demoRequests.id, requestId));

    // Generate magic link token
    const magicToken = crypto.randomBytes(32).toString("hex");

    // Store token (you might want a separate tokens table, but for now we'll use a simple approach)
    // For MVP, we'll just send them to login with temp password info

    // Send welcome email
    try {
        await sendEmail({
            to: request.email,
            subject: "Your wrkspace trial is ready! 🎉",
            html: `
                <h1>Welcome to wrkspace, ${request.name}!</h1>
                <p>Great news! Your 30-day free trial has been activated.</p>
                <p><strong>Organization:</strong> ${request.organizationName}</p>
                <p><strong>Your temporary password:</strong> ${tempPassword}</p>
                <p><a href="${process.env.NEXTAUTH_URL}/login">Click here to sign in</a></p>
                <p>You can change your password after logging in from Settings.</p>
                <p>If you have any questions, just reply to this email.</p>
                <p>— The wrkspace team</p>
            `,
        });
    } catch (e) {
        console.error("Failed to send welcome email:", e);
    }

    return { success: true, organizationId: org.id, userId: user.id };
}

export async function rejectDemoRequest(requestId: string, adminId: string, reason?: string) {
    const [request] = await db.select()
        .from(demoRequests)
        .where(eq(demoRequests.id, requestId));

    if (!request) {
        return { error: "Request not found" };
    }

    await db.update(demoRequests)
        .set({
            status: "rejected",
            approvedBy: adminId,
            approvedAt: new Date(),
            notes: reason,
        })
        .where(eq(demoRequests.id, requestId));

    return { success: true };
}

"use server";

import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { sendNotificationEmail } from "@/lib/email";
import { requireAuth } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

export async function createNotification(userId: string, title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") {
    try {
        await db.insert(notifications).values({
            userId,
            title,
            message,
            type,
        });

        // Email logic (Fire and Forget)
        const u = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
        if (u[0]) {
            await sendNotificationEmail(u[0].email, title, `<p>${message}</p>`);
        }
    } catch (e) {
        console.error("Create notification failed:", e);
    }
}

export async function getNotifications() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return [];

    // Super Admin bypass (non-UUID ID would crash DB query)
    if (user.id === "super-admin") return [];

    return await db.select().from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(20);
}

export async function markNotificationAsRead(id: string) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return;

    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
    revalidatePath("/");
}

export async function markAllAsRead() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return;

    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.id));
    revalidatePath("/");
}

export async function deleteNotification(id: string) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return;

    await db.delete(notifications).where(eq(notifications.id, id));
    revalidatePath("/");
}

export async function triggerTestNotification() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return { error: "Unauthorized" };

    await createNotification(
        user.id,
        "Test Notification",
        "This is a test notification triggered from the UI.",
        "info"
    );
    revalidatePath("/");
    return { success: true };
}

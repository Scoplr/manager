"use server";

/**
 * Webhooks Actions
 * 
 * Outgoing webhook management for integrations
 */

import { db } from "@/db";
import { webhooks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAdmin, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";
import { randomBytes, createHmac } from "crypto";

// Types
export interface Webhook {
    id: string;
    name: string;
    url: string;
    events: string[];
    isActive: boolean;
    lastTriggeredAt?: Date | null;
    createdAt: Date;
}

export type WebhookConfig = Webhook;

// Available webhook events
import { WEBHOOK_EVENTS } from "@/lib/constants";

// ============ CREATE WEBHOOK ============

export async function createWebhook(formData: FormData) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString()?.trim();
    const url = formData.get("url")?.toString()?.trim();
    const eventsJson = formData.get("events")?.toString();
    const events = eventsJson ? JSON.parse(eventsJson) : [];

    if (!name || !url) {
        return { error: "Name and URL are required" };
    }

    // Validate URL
    try {
        new URL(url);
    } catch {
        return { error: "Invalid URL" };
    }

    // Generate secret
    const secret = randomBytes(32).toString("hex");

    try {
        const [webhook] = await db.insert(webhooks).values({
            organizationId: orgContext.orgId,
            name,
            url,
            events,
            secret,
        }).returning();

        revalidatePath("/settings/webhooks");
        return { success: true, webhook, secret }; // Return secret once for user to save
    } catch (error) {
        console.error("Failed to create webhook:", error);
        return { error: "Failed to create webhook" };
    }
}

// ============ GET WEBHOOKS ============

export async function getWebhooks(): Promise<Webhook[]> {
    const { authorized } = await requireAdmin();
    if (!authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const webhookList = await db
            .select({
                id: webhooks.id,
                name: webhooks.name,
                url: webhooks.url,
                events: webhooks.events,
                isActive: webhooks.isActive,
                lastTriggeredAt: webhooks.lastTriggeredAt,
                createdAt: webhooks.createdAt,
            })
            .from(webhooks)
            .where(eq(webhooks.organizationId, orgContext.orgId))
            .orderBy(desc(webhooks.createdAt));

        return webhookList.map((w) => ({
            ...w,
            events: w.events || [],
            isActive: w.isActive ?? true,
        }));
    } catch (error) {
        console.error("Failed to get webhooks:", error);
        return [];
    }
}

// ============ UPDATE WEBHOOK ============

export async function updateWebhook(webhookId: string, formData: FormData) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const updates: Record<string, unknown> = {};

    const name = formData.get("name")?.toString()?.trim();
    if (name) updates.name = name;

    const url = formData.get("url")?.toString()?.trim();
    if (url) {
        try {
            new URL(url);
            updates.url = url;
        } catch {
            return { error: "Invalid URL" };
        }
    }

    const eventsJson = formData.get("events")?.toString();
    if (eventsJson) updates.events = JSON.parse(eventsJson);

    const isActive = formData.get("isActive")?.toString();
    if (isActive !== undefined) updates.isActive = isActive === "true";

    try {
        await db
            .update(webhooks)
            .set(updates)
            .where(
                and(
                    eq(webhooks.id, webhookId),
                    eq(webhooks.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/settings/webhooks");
        return { success: true };
    } catch (error) {
        console.error("Failed to update webhook:", error);
        return { error: "Failed to update webhook" };
    }
}

// ============ DELETE WEBHOOK ============

export async function deleteWebhook(webhookId: string) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    try {
        await db
            .delete(webhooks)
            .where(
                and(
                    eq(webhooks.id, webhookId),
                    eq(webhooks.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/settings/webhooks");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete webhook:", error);
        return { error: "Failed to delete webhook" };
    }
}

// ============ TEST WEBHOOK ============

export async function testWebhook(webhookId: string) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const webhook = await db
        .select()
        .from(webhooks)
        .where(
            and(
                eq(webhooks.id, webhookId),
                eq(webhooks.organizationId, orgContext.orgId)
            )
        )
        .limit(1);

    if (!webhook[0]) {
        return { error: "Webhook not found" };
    }

    const payload = {
        event: "test.ping",
        timestamp: new Date().toISOString(),
        data: { message: "Test webhook from Manager" },
    };

    try {
        const signature = createHmac("sha256", webhook[0].secret)
            .update(JSON.stringify(payload))
            .digest("hex");

        const response = await fetch(webhook[0].url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Webhook-Signature": signature,
            },
            body: JSON.stringify(payload),
        });

        await db
            .update(webhooks)
            .set({ lastTriggeredAt: new Date() })
            .where(eq(webhooks.id, webhookId));

        return {
            success: true,
            status: response.status,
            ok: response.ok,
        };
    } catch (error) {
        console.error("Webhook test failed:", error);
        return { error: "Failed to send test webhook" };
    }
}

// ============ TRIGGER WEBHOOK (Internal) ============

export async function triggerWebhook(
    orgId: string,
    event: string,
    data: Record<string, unknown>
) {
    try {
        const activeWebhooks = await db
            .select()
            .from(webhooks)
            .where(
                and(
                    eq(webhooks.organizationId, orgId),
                    eq(webhooks.isActive, true)
                )
            );

        const results = await Promise.allSettled(
            activeWebhooks
                .filter((w) => (w.events || []).includes(event))
                .map(async (webhook) => {
                    const payload = {
                        event,
                        timestamp: new Date().toISOString(),
                        data,
                    };

                    const signature = createHmac("sha256", webhook.secret)
                        .update(JSON.stringify(payload))
                        .digest("hex");

                    await fetch(webhook.url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Webhook-Signature": signature,
                        },
                        body: JSON.stringify(payload),
                    });

                    await db
                        .update(webhooks)
                        .set({ lastTriggeredAt: new Date() })
                        .where(eq(webhooks.id, webhook.id));
                })
        );

        return { triggered: results.length };
    } catch (error) {
        console.error("Failed to trigger webhooks:", error);
        return { error: "Failed to trigger webhooks" };
    }
}

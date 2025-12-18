"use server";

/**
 * API Keys Actions
 * 
 * Public API key management
 */

import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAdmin, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";
import { randomBytes, createHash } from "crypto";

// Types
export interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string;
    scopes: string[];
    expiresAt?: Date | null;
    lastUsedAt?: Date | null;
    createdAt: Date;
}

// Available API scopes
import { API_SCOPES } from "@/lib/constants";

// ============ CREATE API KEY ============

export async function createApiKey(formData: FormData) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString()?.trim();
    const scopesJson = formData.get("scopes")?.toString();
    const scopes = scopesJson ? JSON.parse(scopesJson) : ["read"];
    const expiresInDays = formData.get("expiresInDays")?.toString();

    if (!name) {
        return { error: "Key name is required" };
    }

    // Generate key: manager_xxxxxxxx...
    const rawKey = `manager_${randomBytes(32).toString("hex")}`;
    const keyPrefix = rawKey.substring(0, 16); // First 16 chars for display
    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    const expiresAt = expiresInDays
        ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000)
        : null;

    try {
        const [apiKey] = await db.insert(apiKeys).values({
            organizationId: orgContext.orgId,
            name,
            keyHash,
            keyPrefix,
            scopes,
            expiresAt,
        }).returning();

        revalidatePath("/settings/api");
        // Return the raw key ONCE - it won't be shown again
        return { success: true, apiKey, rawKey };
    } catch (error) {
        console.error("Failed to create API key:", error);
        return { error: "Failed to create API key" };
    }
}

// ============ GET API KEYS ============

export async function getApiKeys(): Promise<ApiKey[]> {
    const { authorized } = await requireAdmin();
    if (!authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const keys = await db
            .select({
                id: apiKeys.id,
                name: apiKeys.name,
                keyPrefix: apiKeys.keyPrefix,
                scopes: apiKeys.scopes,
                expiresAt: apiKeys.expiresAt,
                lastUsedAt: apiKeys.lastUsedAt,
                createdAt: apiKeys.createdAt,
            })
            .from(apiKeys)
            .where(eq(apiKeys.organizationId, orgContext.orgId))
            .orderBy(desc(apiKeys.createdAt));

        return keys.map((k) => ({
            ...k,
            scopes: k.scopes || [],
        }));
    } catch (error) {
        console.error("Failed to get API keys:", error);
        return [];
    }
}

// ============ DELETE API KEY ============

export async function deleteApiKey(keyId: string) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    try {
        await db
            .delete(apiKeys)
            .where(
                and(
                    eq(apiKeys.id, keyId),
                    eq(apiKeys.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/settings/api");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete API key:", error);
        return { error: "Failed to delete API key" };
    }
}

// ============ VERIFY API KEY (For API routes) ============

export async function verifyApiKey(rawKey: string): Promise<{
    valid: boolean;
    orgId?: string;
    scopes?: string[];
    error?: string;
}> {
    if (!rawKey || !rawKey.startsWith("manager_")) {
        return { valid: false, error: "Invalid key format" };
    }

    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    try {
        const key = await db
            .select({
                id: apiKeys.id,
                organizationId: apiKeys.organizationId,
                scopes: apiKeys.scopes,
                expiresAt: apiKeys.expiresAt,
            })
            .from(apiKeys)
            .where(eq(apiKeys.keyHash, keyHash))
            .limit(1);

        if (!key[0]) {
            return { valid: false, error: "Key not found" };
        }

        // Check expiration
        if (key[0].expiresAt && new Date(key[0].expiresAt) < new Date()) {
            return { valid: false, error: "Key expired" };
        }

        // Update last used
        await db
            .update(apiKeys)
            .set({ lastUsedAt: new Date() })
            .where(eq(apiKeys.id, key[0].id));

        return {
            valid: true,
            orgId: key[0].organizationId || undefined,
            scopes: key[0].scopes || [],
        };
    } catch (error) {
        console.error("Failed to verify API key:", error);
        return { valid: false, error: "Verification failed" };
    }
}

// ============ UPDATE API KEY ============

export async function updateApiKey(keyId: string, formData: FormData) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const updates: Record<string, unknown> = {};

    const name = formData.get("name")?.toString()?.trim();
    if (name) updates.name = name;

    const scopesJson = formData.get("scopes")?.toString();
    if (scopesJson) updates.scopes = JSON.parse(scopesJson);

    try {
        await db
            .update(apiKeys)
            .set(updates)
            .where(
                and(
                    eq(apiKeys.id, keyId),
                    eq(apiKeys.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/settings/api");
        return { success: true };
    } catch (error) {
        console.error("Failed to update API key:", error);
        return { error: "Failed to update API key" };
    }
}

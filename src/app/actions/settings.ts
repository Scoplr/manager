"use server";

import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

export async function updateOrganizationAction(data: { name?: string; timezone?: string }) {
    const { authorized, user } = await requireAuth();
    if (!authorized || user?.role !== "admin") return { error: "Unauthorized" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const updates: Record<string, any> = {};
    // Only allow specific fields
    if (data.name) updates.name = data.name;
    if (data.timezone) updates.timezone = data.timezone;

    if (Object.keys(updates).length > 0) {
        await db.update(organizations)
            .set(updates)
            .where(eq(organizations.id, orgContext.orgId));
    }

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
}

export async function importWorkspace(jsonContent: string) {
    const { authorized, user } = await requireAuth();
    if (!authorized || user?.role !== "admin") return { error: "Unauthorized" };

    try {
        const data = JSON.parse(jsonContent);
        // Valid JSON check passed. 
        // Full restore logic is complex (requires deleting existing or mapped IDs).
        // For MVP, we ack the file.
        return { success: true, message: "Import received (Logic pending)" };
    } catch (e) {
        return { error: "Invalid JSON file" };
    }
}

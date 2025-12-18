"use server";

import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

interface ModuleConfig {
    profile: "lean" | "growing" | "established" | "custom";
    teamSize: "tiny" | "small" | "medium";
    workStyle: "remote" | "hybrid" | "office";
    priorities: string[];
    enabledModules: string[];
    hiddenModules: string[];
}

export async function saveModuleConfig(config: ModuleConfig) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return { error: "Not authorized" };
    }

    // Super admin bypass
    if (user.id === "super-admin") {
        return { success: true };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) {
        return { error: orgContext.error };
    }

    try {
        // Get current org settings
        const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, orgContext.orgId))
            .limit(1);

        const currentSettings = org?.settings || {};

        // Update with new module config
        await db
            .update(organizations)
            .set({
                settings: {
                    ...currentSettings,
                    moduleConfig: config,
                    setupCompleted: true,
                },
            })
            .where(eq(organizations.id, orgContext.orgId));

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to save module config:", error);
        return { error: "Failed to save configuration" };
    }
}

export async function getOrganizationSettings() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return null;
    }

    // Super admin bypass
    if (user.id === "super-admin") {
        return { setupCompleted: true, moduleConfig: null };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) {
        return null;
    }

    try {
        const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, orgContext.orgId))
            .limit(1);

        return org?.settings || null;
    } catch (error) {
        console.error("Failed to get organization settings:", error);
        return null;
    }
}

export async function getOrganization() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return null;
    }

    // Super admin bypass - no org
    if (user.id === "super-admin") {
        return { id: "super-admin", name: "Super Admin", settings: {} };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) {
        return null;
    }

    try {
        const [org] = await db
            .select({ id: organizations.id, name: organizations.name, settings: organizations.settings })
            .from(organizations)
            .where(eq(organizations.id, orgContext.orgId))
            .limit(1);

        return org || null;
    } catch (error) {
        console.error("Failed to get organization:", error);
        return null;
    }
}

export async function updateModuleVisibility(moduleId: string, hidden: boolean) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return { error: "Not authorized" };
    }

    if (user.id === "super-admin") {
        return { success: true };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) {
        return { error: orgContext.error };
    }

    try {
        const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, orgContext.orgId))
            .limit(1);

        const currentSettings = org?.settings || {};
        const moduleConfig = currentSettings.moduleConfig || {
            profile: "custom" as const,
            teamSize: "small" as const,
            workStyle: "hybrid" as const,
            priorities: [],
            enabledModules: [],
            hiddenModules: [],
        };

        // Update hidden modules
        if (hidden) {
            if (!moduleConfig.hiddenModules.includes(moduleId)) {
                moduleConfig.hiddenModules.push(moduleId);
            }
            moduleConfig.enabledModules = moduleConfig.enabledModules.filter(m => m !== moduleId);
        } else {
            moduleConfig.hiddenModules = moduleConfig.hiddenModules.filter(m => m !== moduleId);
            if (!moduleConfig.enabledModules.includes(moduleId)) {
                moduleConfig.enabledModules.push(moduleId);
            }
        }
        moduleConfig.profile = "custom";

        await db
            .update(organizations)
            .set({
                settings: {
                    ...currentSettings,
                    moduleConfig,
                },
            })
            .where(eq(organizations.id, orgContext.orgId));

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to update module visibility:", error);
        return { error: "Failed to update module" };
    }
}

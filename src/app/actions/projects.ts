"use server";

/**
 * Projects Actions
 * 
 * Task grouping with projects
 */

import { db } from "@/db";
import { projects, tasks, users } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAuth, requireManager, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

// Types
export interface Project {
    id: string;
    name: string;
    description?: string | null;
    color: string;
    status: string;
    ownerId?: string | null;
    ownerName?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    taskCount?: number;
    createdAt: Date;
}

// ============ CREATE PROJECT ============

export async function createProject(formData: FormData) {
    const { authorized, error } = await requireManager();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim();
    const color = formData.get("color")?.toString() || "#3b82f6";
    const ownerId = formData.get("ownerId")?.toString();
    const startDate = formData.get("startDate")?.toString();
    const endDate = formData.get("endDate")?.toString();

    if (!name) {
        return { error: "Project name is required" };
    }

    try {
        const [project] = await db.insert(projects).values({
            organizationId: orgContext.orgId,
            name,
            description: description || null,
            color,
            ownerId: ownerId || null,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
        }).returning();

        revalidatePath("/projects");
        return { success: true, project };
    } catch (error) {
        console.error("Failed to create project:", error);
        return { error: "Failed to create project" };
    }
}

// ============ GET PROJECTS ============

export async function getProjects(): Promise<Project[]> {
    const { authorized } = await requireAuth();
    if (!authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const projectList = await db
            .select({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                color: projects.color,
                status: projects.status,
                ownerId: projects.ownerId,
                ownerName: users.name,
                startDate: projects.startDate,
                endDate: projects.endDate,
                createdAt: projects.createdAt,
            })
            .from(projects)
            .leftJoin(users, eq(projects.ownerId, users.id))
            .where(eq(projects.organizationId, orgContext.orgId))
            .orderBy(desc(projects.createdAt));

        return projectList.map(p => ({
            ...p,
            color: p.color || "#3b82f6" // Default blue
        }));
    } catch (error) {
        console.error("Failed to get projects:", error);
        return [];
    }
}

// ============ GET PROJECT ============

export async function getProject(projectId: string): Promise<Project | null> {
    const { authorized } = await requireAuth();
    if (!authorized) return null;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    try {
        const project = await db
            .select({
                id: projects.id,
                name: projects.name,
                description: projects.description,
                color: projects.color,
                status: projects.status,
                ownerId: projects.ownerId,
                ownerName: users.name,
                startDate: projects.startDate,
                endDate: projects.endDate,
                createdAt: projects.createdAt,
            })
            .from(projects)
            .leftJoin(users, eq(projects.ownerId, users.id))
            .where(
                and(
                    eq(projects.id, projectId),
                    eq(projects.organizationId, orgContext.orgId)
                )
            )
            .limit(1);

        if (!project[0]) return null;

        return {
            ...project[0],
            color: project[0].color || "#3b82f6"
        };
    } catch (error) {
        console.error("Failed to get project:", error);
        return null;
    }
}

// ============ UPDATE PROJECT ============

export async function updateProject(projectId: string, formData: FormData) {
    const { authorized, error } = await requireManager();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const updates: Record<string, unknown> = {};

    const name = formData.get("name")?.toString()?.trim();
    if (name) updates.name = name;

    const description = formData.get("description")?.toString();
    if (description !== undefined) updates.description = description || null;

    const color = formData.get("color")?.toString();
    if (color) updates.color = color;

    const status = formData.get("status")?.toString();
    if (status) updates.status = status;

    const ownerId = formData.get("ownerId")?.toString();
    if (ownerId !== undefined) updates.ownerId = ownerId || null;

    try {
        await db
            .update(projects)
            .set(updates)
            .where(
                and(
                    eq(projects.id, projectId),
                    eq(projects.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/projects");
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update project:", error);
        return { error: "Failed to update project" };
    }
}

// ============ DELETE PROJECT ============

export async function deleteProject(projectId: string) {
    const { authorized, error } = await requireManager();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    try {
        await db
            .delete(projects)
            .where(
                and(
                    eq(projects.id, projectId),
                    eq(projects.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete project:", error);
        return { error: "Failed to delete project" };
    }
}

// ============ ARCHIVE PROJECT ============

export async function archiveProject(projectId: string) {
    const { authorized, error } = await requireManager();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    try {
        await db
            .update(projects)
            .set({ status: "archived" })
            .where(
                and(
                    eq(projects.id, projectId),
                    eq(projects.organizationId, orgContext.orgId)
                )
            );

        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to archive project:", error);
        return { error: "Failed to archive project" };
    }
}

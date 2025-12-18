"use server";

/**
 * Global Search Action
 * 
 * Searches across tasks, documents, users, and announcements
 */

import { db } from "@/db";
import { tasks, documents, users, announcements, projects, goals } from "@/db/schema";
import { or, ilike, eq, and, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/authorize";

// Types
export interface SearchResult {
    type: "task" | "document" | "user" | "announcement" | "project" | "goal";
    id: string;
    title: string;
    description?: string;
    url: string;
    icon?: string;
}

export interface SearchResponse {
    results: SearchResult[];
    query: string;
    total: number;
}

/**
 * Global search across all entities
 */
export async function globalSearch(query: string): Promise<SearchResponse> {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return { results: [], query, total: 0 };
    }

    // Minimum query length
    if (!query || query.trim().length < 2) {
        return { results: [], query, total: 0 };
    }

    const searchTerm = `%${query.trim()}%`;
    const results: SearchResult[] = [];
    const orgId = user.organizationId;

    // Search tasks
    try {
        const conditions = [
            or(
                ilike(tasks.title, searchTerm),
                ilike(tasks.description, searchTerm)
            ),
        ];

        if (orgId) {
            conditions.push(eq(tasks.organizationId, orgId));
        }

        const matchingTasks = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                description: tasks.description,
            })
            .from(tasks)
            .where(and(...conditions))
            .orderBy(desc(tasks.updatedAt))
            .limit(5);

        results.push(
            ...matchingTasks.map((t) => ({
                type: "task" as const,
                id: t.id,
                title: t.title,
                description: t.description?.slice(0, 100) || undefined,
                url: `/tasks/${t.id}`,
                icon: "CheckSquare",
            }))
        );
    } catch (error) {
        console.error("Error searching tasks:", error);
    }

    // Search documents/knowledge base
    try {
        const conditions = [
            or(
                ilike(documents.title, searchTerm),
                ilike(documents.content, searchTerm)
            ),
        ];

        if (orgId) {
            conditions.push(eq(documents.organizationId, orgId));
        }

        const matchingDocs = await db
            .select({
                id: documents.id,
                title: documents.title,
            })
            .from(documents)
            .where(and(...conditions))
            .limit(5);

        results.push(
            ...matchingDocs.map((d) => ({
                type: "document" as const,
                id: d.id,
                title: d.title,
                url: `/knowledge/${d.id}`,
                icon: "FileText",
            }))
        );
    } catch (error) {
        console.error("Error searching documents:", error);
    }

    // Search users (name, email)
    try {
        const conditions = [
            or(
                ilike(users.name, searchTerm),
                ilike(users.email, searchTerm)
            ),
        ];

        if (orgId) {
            conditions.push(eq(users.organizationId, orgId));
        }

        const matchingUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                department: users.department,
            })
            .from(users)
            .where(and(...conditions))
            .limit(5);

        results.push(
            ...matchingUsers.map((u) => ({
                type: "user" as const,
                id: u.id,
                title: u.name || u.email,
                description: u.department || undefined,
                url: `/team/${u.id}`,
                icon: "User",
            }))
        );
    } catch (error) {
        console.error("Error searching users:", error);
    }

    // Search announcements
    try {
        const conditions = [
            or(
                ilike(announcements.title, searchTerm),
                ilike(announcements.content, searchTerm)
            ),
        ];

        if (orgId) {
            conditions.push(eq(announcements.organizationId, orgId));
        }

        const matchingAnnouncements = await db
            .select({
                id: announcements.id,
                title: announcements.title,
            })
            .from(announcements)
            .where(and(...conditions))
            .orderBy(desc(announcements.createdAt))
            .limit(3);

        results.push(
            ...matchingAnnouncements.map((a) => ({
                type: "announcement" as const,
                id: a.id,
                title: a.title,
                url: `/announcements`,
                icon: "Megaphone",
            }))
        );
    } catch (error) {
        console.error("Error searching announcements:", error);
    }

    // Search Projects
    try {
        const conditions = [
            or(ilike(projects.name, searchTerm), ilike(projects.description, searchTerm))
        ];
        if (orgId) conditions.push(eq(projects.organizationId, orgId));

        const matches = await db.select({ id: projects.id, name: projects.name, description: projects.description }).from(projects).where(and(...conditions)).limit(3);
        results.push(...matches.map(p => ({
            type: "project" as const,
            id: p.id,
            title: p.name,
            description: p.description || undefined,
            url: `/projects/${p.id}`,
            icon: "Folder"
        })));
    } catch (error) { console.error("Error searching projects:", error); }

    // Search Goals
    try {
        const conditions = [
            or(ilike(goals.title, searchTerm), ilike(goals.description, searchTerm))
        ];
        if (orgId) conditions.push(eq(goals.organizationId, orgId));

        const matches = await db.select({ id: goals.id, title: goals.title, description: goals.description }).from(goals).where(and(...conditions)).limit(3);
        results.push(...matches.map(g => ({
            type: "goal" as const,
            id: g.id,
            title: g.title,
            description: g.description || undefined,
            url: `/goals`,
            icon: "Target"
        })));
    } catch (error) { console.error("Error searching goals:", error); }

    return {
        results,
        query,
        total: results.length,
    };
}

/**
 * Search within a specific entity type
 */
export async function searchTasks(query: string, limit: number = 10) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return [];

    if (!query || query.trim().length < 2) return [];

    const searchTerm = `%${query.trim()}%`;
    const conditions = [
        or(
            ilike(tasks.title, searchTerm),
            ilike(tasks.description, searchTerm)
        ),
    ];

    if (user.organizationId) {
        conditions.push(eq(tasks.organizationId, user.organizationId));
    }

    return db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.updatedAt))
        .limit(limit);
}

export async function searchUsers(query: string, limit: number = 10) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return [];

    if (!query || query.trim().length < 2) return [];

    const searchTerm = `%${query.trim()}%`;
    const conditions = [
        or(
            ilike(users.name, searchTerm),
            ilike(users.email, searchTerm)
        ),
    ];

    if (user.organizationId) {
        conditions.push(eq(users.organizationId, user.organizationId));
    }

    return db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            department: users.department,
            designation: users.designation,
        })
        .from(users)
        .where(and(...conditions))
        .limit(limit);
}

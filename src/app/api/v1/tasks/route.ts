/**
 * Public API - Tasks Endpoint
 * 
 * RESTful API for external integrations
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyApiKey } from "@/app/actions/api-keys";

// GET /api/v1/tasks - List tasks
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Missing or invalid Authorization header" },
            { status: 401 }
        );
    }

    const apiKey = authHeader.substring(7);
    const { valid, orgId, scopes, error } = await verifyApiKey(apiKey);

    if (!valid || !orgId) {
        return NextResponse.json(
            { error: error || "Invalid API key" },
            { status: 401 }
        );
    }

    // Check scope
    if (!scopes?.includes("read:tasks")) {
        return NextResponse.json(
            { error: "Insufficient permissions. Required scope: read:tasks" },
            { status: 403 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    try {
        const conditions = [eq(tasks.organizationId, orgId)];

        if (status) {
            conditions.push(eq(tasks.status, status));
        }

        if (assigneeId) {
            conditions.push(eq(tasks.assigneeId, assigneeId));
        }

        const taskList = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                description: tasks.description,
                status: tasks.status,
                priority: tasks.priority,
                assigneeId: tasks.assigneeId,
                assigneeName: users.name,
                dueDate: tasks.dueDate,
                createdAt: tasks.createdAt,
                updatedAt: tasks.updatedAt,
            })
            .from(tasks)
            .leftJoin(users, eq(tasks.assigneeId, users.id))
            .where(and(...conditions))
            .orderBy(desc(tasks.createdAt))
            .limit(Math.min(limit, 100))
            .offset(offset);

        return NextResponse.json({
            data: taskList,
            pagination: {
                limit,
                offset,
                hasMore: taskList.length === limit,
            },
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/v1/tasks - Create task
export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Missing or invalid Authorization header" },
            { status: 401 }
        );
    }

    const apiKey = authHeader.substring(7);
    const { valid, orgId, scopes, error } = await verifyApiKey(apiKey);

    if (!valid || !orgId) {
        return NextResponse.json(
            { error: error || "Invalid API key" },
            { status: 401 }
        );
    }

    // Check scope
    if (!scopes?.includes("write:tasks")) {
        return NextResponse.json(
            { error: "Insufficient permissions. Required scope: write:tasks" },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const { title, description, priority, assigneeId, dueDate } = body;

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        const [newTask] = await db.insert(tasks).values({
            organizationId: orgId,
            title,
            description: description || null,
            priority: priority || "medium",
            assigneeId: assigneeId || null,
            dueDate: dueDate ? new Date(dueDate) : null,
        }).returning();

        return NextResponse.json({ data: newTask }, { status: 201 });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

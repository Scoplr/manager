/**
 * Public API - Users Endpoint
 * 
 * RESTful API for external integrations
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyApiKey } from "@/app/actions/api-keys";

// GET /api/v1/users - List users
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
    if (!scopes?.includes("read:users")) {
        return NextResponse.json(
            { error: "Insufficient permissions. Required scope: read:users" },
            { status: 403 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get("department");
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    try {
        const conditions = [eq(users.organizationId, orgId)];

        if (department) {
            conditions.push(eq(users.department, department));
        }

        if (role) {
            conditions.push(eq(users.role, role as "admin" | "manager" | "member"));
        }

        const userList = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                department: users.department,
                designation: users.designation,
                availabilityStatus: users.availabilityStatus,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(and(...conditions))
            .orderBy(users.name)
            .limit(Math.min(limit, 100))
            .offset(offset);

        return NextResponse.json({
            data: userList,
            pagination: {
                limit,
                offset,
                hasMore: userList.length === limit,
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

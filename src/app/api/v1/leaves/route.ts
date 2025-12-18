/**
 * Public API - Leaves Endpoint
 * 
 * RESTful API for external integrations
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leaves, users } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { verifyApiKey } from "@/app/actions/api-keys";

// GET /api/v1/leaves - List leaves
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
    if (!scopes?.includes("read:leaves")) {
        return NextResponse.json(
            { error: "Insufficient permissions. Required scope: read:leaves" },
            { status: 403 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    try {
        const conditions = [eq(leaves.organizationId, orgId)];

        if (status) {
            conditions.push(eq(leaves.status, status as "pending" | "approved" | "rejected"));
        }

        if (userId) {
            conditions.push(eq(leaves.userId, userId));
        }

        if (startDate) {
            conditions.push(gte(leaves.startDate, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(lte(leaves.endDate, new Date(endDate)));
        }

        const leaveList = await db
            .select({
                id: leaves.id,
                userId: leaves.userId,
                userName: users.name,
                type: leaves.type,
                startDate: leaves.startDate,
                endDate: leaves.endDate,
                reason: leaves.reason,
                status: leaves.status,
                createdAt: leaves.createdAt,
            })
            .from(leaves)
            .leftJoin(users, eq(leaves.userId, users.id))
            .where(and(...conditions))
            .orderBy(desc(leaves.createdAt))
            .limit(Math.min(limit, 100))
            .offset(offset);

        return NextResponse.json({
            data: leaveList,
            pagination: {
                limit,
                offset,
                hasMore: leaveList.length === limit,
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

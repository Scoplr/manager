/**
 * Leave Overlap API
 * 
 * Returns team members on leave during a specified date range
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leaves, users } from "@/db/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const startStr = searchParams.get("start");
        const endStr = searchParams.get("end");
        const excludeUserId = searchParams.get("exclude");
        const department = searchParams.get("department");

        if (!startStr || !endStr) {
            return NextResponse.json(
                { error: "Start and end dates required" },
                { status: 400 }
            );
        }

        const startDate = new Date(startStr);
        const endDate = new Date(endStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        // Get user's organization
        const currentUser = await db
            .select({ organizationId: users.organizationId })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const orgId = currentUser[0]?.organizationId;
        if (!orgId) {
            return NextResponse.json([]);
        }

        // Build query conditions
        const conditions = [
            eq(leaves.status, "approved"),
            // Overlapping date logic: leave overlaps if it starts before range ends AND ends after range starts
            lte(leaves.startDate, endDate),
            gte(leaves.endDate, startDate),
        ];

        // Exclude specific user if requested
        if (excludeUserId) {
            conditions.push(ne(leaves.userId, excludeUserId));
        }

        // Get overlapping leaves with user info
        const overlappingLeaves = await db
            .select({
                id: leaves.id,
                type: leaves.type,
                startDate: leaves.startDate,
                endDate: leaves.endDate,
                userName: users.name,
                userDepartment: users.department,
                userId: users.id,
            })
            .from(leaves)
            .innerJoin(users, eq(leaves.userId, users.id))
            .where(
                and(
                    ...conditions,
                    eq(users.organizationId, orgId),
                    department ? eq(users.department, department) : undefined
                )
            )
            .limit(20);

        // Format response
        const result = overlappingLeaves.map((leave) => ({
            id: leave.id,
            userName: leave.userName || "Unknown",
            type: leave.type,
            startDate: leave.startDate.toISOString(),
            endDate: leave.endDate.toISOString(),
            department: leave.userDepartment,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Leave overlap check error:", error);
        return NextResponse.json(
            { error: "Failed to check availability" },
            { status: 500 }
        );
    }
}

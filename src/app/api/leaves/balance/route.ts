/**
 * Leave Balance API
 * 
 * Returns leave balance and usage for a user
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, leaves } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get("userId") || session.user.id;

        // Get user's leave balance
        const user = await db
            .select({
                leaveBalance: users.leaveBalance,
                role: users.role,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        // Only admins/managers can view others' balances
        if (userId !== session.user.id && user[0]?.role === "member") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Get target user's balance
        const targetUser = await db
            .select({ leaveBalance: users.leaveBalance })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!targetUser[0]) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const balance = targetUser[0].leaveBalance || {
            casual: 12,
            sick: 10,
            privilege: 15,
        };

        // Get current year usage
        const year = new Date().getFullYear();
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);

        const approvedLeaves = await db
            .select({
                type: leaves.type,
                startDate: leaves.startDate,
                endDate: leaves.endDate,
            })
            .from(leaves)
            .where(
                and(
                    eq(leaves.userId, userId),
                    eq(leaves.status, "approved"),
                    gte(leaves.startDate, yearStart),
                    lte(leaves.endDate, yearEnd)
                )
            );

        // Calculate usage
        const usage: Record<string, number> = { casual: 0, sick: 0, privilege: 0 };

        for (const leave of approvedLeaves) {
            const diffTime = Math.abs(
                new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()
            );
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            usage[leave.type] = (usage[leave.type] || 0) + days;
        }

        // Build response
        const result = [
            {
                type: "casual",
                used: usage.casual,
                remaining: balance.casual - usage.casual,
                total: balance.casual,
            },
            {
                type: "sick",
                used: usage.sick,
                remaining: balance.sick - usage.sick,
                total: balance.sick,
            },
            {
                type: "privilege",
                used: usage.privilege,
                remaining: balance.privilege - usage.privilege,
                total: balance.privilege,
            },
        ];

        return NextResponse.json(result);
    } catch (error) {
        console.error("Leave balance error:", error);
        return NextResponse.json(
            { error: "Failed to get balance" },
            { status: 500 }
        );
    }
}

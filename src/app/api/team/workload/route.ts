/**
 * Team Workload API
 * 
 * Returns workload data for team members
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, tasks, leaves } from "@/db/schema";
import { eq, and, ne, gte, lte, count } from "drizzle-orm";
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
        const department = searchParams.get("department");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Get current user's org
        const currentUser = await db
            .select({
                organizationId: users.organizationId,
                role: users.role,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const orgId = currentUser[0]?.organizationId;
        if (!orgId) {
            return NextResponse.json([]);
        }

        // Only managers+ can view team workload
        if (currentUser[0].role === "member") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Get team members
        const conditions = [eq(users.organizationId, orgId)];
        if (department) {
            conditions.push(eq(users.department, department));
        }

        const teamMembers = await db
            .select({
                id: users.id,
                name: users.name,
            })
            .from(users)
            .where(and(...conditions))
            .limit(limit);

        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        // Get workload for each member
        const workloads = await Promise.all(
            teamMembers.map(async (member) => {
                // Count active tasks
                const activeTasks = await db
                    .select({ count: count() })
                    .from(tasks)
                    .where(
                        and(
                            eq(tasks.assigneeId, member.id),
                            ne(tasks.status, "done")
                        )
                    );

                // Count tasks due soon (within a week)
                const dueSoon = await db
                    .select({ count: count() })
                    .from(tasks)
                    .where(
                        and(
                            eq(tasks.assigneeId, member.id),
                            ne(tasks.status, "done"),
                            gte(tasks.dueDate, now),
                            lte(tasks.dueDate, weekFromNow)
                        )
                    );

                // Count overdue tasks
                const overdue = await db
                    .select({ count: count() })
                    .from(tasks)
                    .where(
                        and(
                            eq(tasks.assigneeId, member.id),
                            ne(tasks.status, "done"),
                            lte(tasks.dueDate, now)
                        )
                    );

                // Check if on leave today
                const onLeave = await db
                    .select({ id: leaves.id })
                    .from(leaves)
                    .where(
                        and(
                            eq(leaves.userId, member.id),
                            eq(leaves.status, "approved"),
                            lte(leaves.startDate, now),
                            gte(leaves.endDate, now)
                        )
                    )
                    .limit(1);

                return {
                    id: member.id,
                    name: member.name || "Unknown",
                    activeTasks: Number(activeTasks[0]?.count) || 0,
                    dueSoon: Number(dueSoon[0]?.count) || 0,
                    overdue: Number(overdue[0]?.count) || 0,
                    onLeave: onLeave.length > 0,
                };
            })
        );

        return NextResponse.json(workloads);
    } catch (error) {
        console.error("Team workload error:", error);
        return NextResponse.json(
            { error: "Failed to get workload" },
            { status: 500 }
        );
    }
}

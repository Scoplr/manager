import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { leaves, expenses, users } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { auth } from "@/lib/auth";

interface StaleItem {
    id: string;
    type: "leave" | "expense";
    title: string;
    requesterName: string;
    daysOld: number;
}

async function getStaleApprovals(): Promise<StaleItem[]> {
    const session = await auth();
    const orgId = (session?.user as any)?.organizationId;
    if (!orgId) return [];

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const items: StaleItem[] = [];

    try {
        // Get stale leaves
        const staleLeaves = await db
            .select({
                id: leaves.id,
                type: leaves.type,
                createdAt: leaves.createdAt,
                userName: users.name,
            })
            .from(leaves)
            .leftJoin(users, eq(leaves.userId, users.id))
            .where(
                and(
                    eq(leaves.organizationId, orgId),
                    eq(leaves.status, "pending"),
                    lt(leaves.createdAt, threeDaysAgo)
                )
            )
            .limit(5);

        for (const leave of staleLeaves) {
            const daysOld = Math.floor(
                (Date.now() - new Date(leave.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            items.push({
                id: leave.id,
                type: "leave",
                title: `${leave.type} leave request`,
                requesterName: leave.userName || "Unknown",
                daysOld,
            });
        }

        // Get stale expenses
        const staleExpenses = await db
            .select({
                id: expenses.id,
                description: expenses.description,
                submittedAt: expenses.submittedAt,
                userName: users.name,
            })
            .from(expenses)
            .leftJoin(users, eq(expenses.userId, users.id))
            .where(
                and(
                    eq(expenses.organizationId, orgId),
                    eq(expenses.status, "pending"),
                    lt(expenses.submittedAt, threeDaysAgo)
                )
            )
            .limit(5);

        for (const expense of staleExpenses) {
            const daysOld = Math.floor(
                (Date.now() - new Date(expense.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            items.push({
                id: expense.id,
                type: "expense",
                title: expense.description || "Expense claim",
                requesterName: expense.userName || "Unknown",
                daysOld,
            });
        }
    } catch (error) {
        console.error("Failed to fetch stale approvals:", error);
    }

    // Sort by age descending
    return items.sort((a, b) => b.daysOld - a.daysOld).slice(0, 5);
}

export async function StaleItemsWidget() {
    const items = await getStaleApprovals();

    if (items.length === 0) {
        return null; // Don't show widget if nothing is stale
    }

    const criticalCount = items.filter(i => i.daysOld >= 5).length;
    const warningCount = items.filter(i => i.daysOld >= 3 && i.daysOld < 5).length;

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${criticalCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                        <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Needs Attention</h3>
                        <p className="text-xs text-muted-foreground">
                            {items.length} item{items.length > 1 ? 's' : ''} waiting
                        </p>
                    </div>
                </div>
                <Link
                    href="/approvals"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    View all <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="space-y-2">
                {items.map((item) => (
                    <div
                        key={`${item.type}-${item.id}`}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.requesterName}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            {item.daysOld >= 5 ? (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium animate-pulse">
                                    ⚠️ {item.daysOld}d
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
                                    ⏰ {item.daysOld}d
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {criticalCount > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs">
                    {criticalCount} request{criticalCount > 1 ? 's' : ''} waiting more than 5 days
                </div>
            )}
        </div>
    );
}

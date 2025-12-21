import { db } from "@/db";
import { leaves, expenses, users, tasks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";
import { Suspense } from "react";
import Link from "next/link";
import { Inbox, Palmtree, Receipt, CheckSquare, ChevronRight, Check, X } from "lucide-react";

// Types
interface PendingItem {
    id: string;
    type: "leave" | "expense";
    title: string;
    subtitle: string;
    createdAt: Date;
    urgent?: boolean;
}

export default async function InboxPage() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) {
        return <div>Not authorized</div>;
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) {
        return <div>Error loading organization</div>;
    }

    // Only managers and above see the inbox
    if (!["admin", "hr", "manager", "ceo"].includes(user.role || "")) {
        return (
            <div className="text-center py-12">
                <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-xl font-semibold mb-2">No Access</h1>
                <p className="text-muted-foreground">
                    The inbox is only available to managers and administrators.
                </p>
            </div>
        );
    }

    // Fetch pending items
    const [pendingLeaves, pendingExpenses] = await Promise.all([
        db.select({
            id: leaves.id,
            userId: leaves.userId,
            type: leaves.type,
            startDate: leaves.startDate,
            reason: leaves.reason,
            createdAt: leaves.createdAt,
        })
            .from(leaves)
            .where(
                and(
                    eq(leaves.organizationId, orgContext.orgId),
                    eq(leaves.status, "pending")
                )
            )
            .orderBy(desc(leaves.createdAt)),

        db.select({
            id: expenses.id,
            userId: expenses.userId,
            amount: expenses.amount,
            description: expenses.description,
            submittedAt: expenses.submittedAt,
        })
            .from(expenses)
            .where(
                and(
                    eq(expenses.organizationId, orgContext.orgId),
                    eq(expenses.status, "pending")
                )
            )
            .orderBy(desc(expenses.submittedAt)),
    ]);

    // Get user names
    const userIds = [...new Set([
        ...pendingLeaves.map(l => l.userId),
        ...pendingExpenses.map(e => e.userId),
    ])];

    const usersData = userIds.length > 0
        ? await db.select({ id: users.id, name: users.name }).from(users)
        : [];

    const userMap = new Map(usersData.map(u => [u.id, u.name || "Unknown"]));

    // Combine and format items
    const items: PendingItem[] = [
        ...pendingLeaves.map(l => ({
            id: l.id,
            type: "leave" as const,
            title: `${userMap.get(l.userId) || "User"} - ${l.type} leave`,
            subtitle: `Starting ${new Date(l.startDate).toLocaleDateString()}`,
            createdAt: l.createdAt,
        })),
        ...pendingExpenses.map(e => ({
            id: e.id,
            type: "expense" as const,
            title: `Expense: $${e.amount}`,
            subtitle: e.description || "No description",
            createdAt: e.submittedAt || new Date(),
        })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const typeIcons = {
        leave: <Palmtree className="w-5 h-5 text-green-600" />,
        expense: <Receipt className="w-5 h-5 text-blue-600" />,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Inbox className="w-8 h-8" />
                    Inbox
                </h1>
                <p className="text-muted-foreground mt-1">
                    Items requiring your attention
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Pending Leaves</p>
                    <p className="text-2xl font-bold">{pendingLeaves.length}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Pending Expenses</p>
                    <p className="text-2xl font-bold">{pendingExpenses.length}</p>
                </div>
            </div>

            {/* Items List */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold">Pending Approvals</h2>
                    <span className="text-sm text-muted-foreground">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckSquare className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <h3 className="font-semibold text-lg mb-2">All caught up!</h3>
                        <p className="text-muted-foreground">
                            You have no pending approvals at the moment.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y">
                        {items.map(item => (
                            <li key={`${item.type}-${item.id}`}>
                                <Link
                                    href="/approvals"
                                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="p-2 rounded-lg bg-muted">
                                        {typeIcons[item.type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.title}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tasks, leaves, expenses, users } from "@/db/schema";
import { eq, and, or, sql, isNull, lt, gte } from "drizzle-orm";
import Link from "next/link";
import { AlertCircle, CheckCircle, Clock, Users, ArrowRight } from "lucide-react";

type UserRole = 'ceo' | 'hr' | 'manager' | 'employee';

interface TodayItem {
    icon: React.ReactNode;
    label: string;
    count: number;
    href: string;
    priority: 'high' | 'medium' | 'low';
}

async function getTodayData(role: UserRole, userId: string, orgId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Pending approvals (for managers+)
    const pendingApprovals = role !== 'employee' ? await db
        .select({ count: sql<number>`count(*)` })
        .from(leaves)
        .where(and(
            eq(leaves.organizationId, orgId),
            eq(leaves.status, 'pending')
        )) : [{ count: 0 }];

    // My overdue tasks
    const overdueTasks = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(and(
            eq(tasks.organizationId, orgId),
            eq(tasks.assigneeId, userId),
            or(eq(tasks.status, 'todo'), eq(tasks.status, 'in-progress')),
            lt(tasks.dueDate, today)
        ));

    // My tasks due today
    const todayTasks = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(and(
            eq(tasks.organizationId, orgId),
            eq(tasks.assigneeId, userId),
            or(eq(tasks.status, 'todo'), eq(tasks.status, 'in-progress')),
            gte(tasks.dueDate, today),
            lt(tasks.dueDate, new Date(today.getTime() + 24 * 60 * 60 * 1000))
        ));

    // People on leave today (for managers+)
    const onLeave = role !== 'employee' ? await db
        .select({ count: sql<number>`count(*)` })
        .from(leaves)
        .where(and(
            eq(leaves.organizationId, orgId),
            eq(leaves.status, 'approved'),
            sql`${leaves.startDate} <= ${today}`,
            sql`${leaves.endDate} >= ${today}`
        )) : [{ count: 0 }];

    // My pending requests (for employees)
    const myPending = role === 'employee' ? await db
        .select({ count: sql<number>`count(*)` })
        .from(leaves)
        .where(and(
            eq(leaves.organizationId, orgId),
            eq(leaves.userId, userId),
            eq(leaves.status, 'pending')
        )) : [{ count: 0 }];

    return {
        pendingApprovals: Number(pendingApprovals[0]?.count || 0),
        overdueTasks: Number(overdueTasks[0]?.count || 0),
        todayTasks: Number(todayTasks[0]?.count || 0),
        onLeave: Number(onLeave[0]?.count || 0),
        myPending: Number(myPending[0]?.count || 0),
    };
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export async function TodayFocus({ role, userName }: { role: UserRole; userName: string }) {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const orgId = (session?.user as any)?.organizationId;

    if (!userId || !orgId) return null;

    const data = await getTodayData(role, userId, orgId);

    // Build role-specific items
    const items: TodayItem[] = [];

    // High priority: Overdue tasks (always)
    if (data.overdueTasks > 0) {
        items.push({
            icon: <AlertCircle className="h-5 w-5 text-red-500" />,
            label: `${data.overdueTasks} overdue task${data.overdueTasks > 1 ? 's' : ''}`,
            count: data.overdueTasks,
            href: "/tasks?status=overdue",
            priority: 'high',
        });
    }

    // High priority: Pending approvals (managers+)
    if (role !== 'employee' && data.pendingApprovals > 0) {
        items.push({
            icon: <Clock className="h-5 w-5 text-orange-500" />,
            label: `${data.pendingApprovals} approval${data.pendingApprovals > 1 ? 's' : ''} waiting`,
            count: data.pendingApprovals,
            href: "/approvals",
            priority: 'high',
        });
    }

    // Medium: Today's tasks
    if (data.todayTasks > 0) {
        items.push({
            icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
            label: `${data.todayTasks} task${data.todayTasks > 1 ? 's' : ''} due today`,
            count: data.todayTasks,
            href: "/tasks",
            priority: 'medium',
        });
    }

    // Info: People on leave (managers+)
    if (role !== 'employee' && data.onLeave > 0) {
        items.push({
            icon: <Users className="h-5 w-5 text-green-500" />,
            label: `${data.onLeave} ${data.onLeave > 1 ? 'people' : 'person'} on leave today`,
            count: data.onLeave,
            href: "/team",
            priority: 'low',
        });
    }

    // Employee: My pending requests
    if (role === 'employee' && data.myPending > 0) {
        items.push({
            icon: <Clock className="h-5 w-5 text-yellow-500" />,
            label: `${data.myPending} pending request${data.myPending > 1 ? 's' : ''}`,
            count: data.myPending,
            href: "/leaves",
            priority: 'medium',
        });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Determine primary CTA based on role and items
    const primaryAction = role === 'employee'
        ? { label: "View My Tasks", href: "/tasks" }
        : items.length > 0 && items[0].priority === 'high'
            ? { label: items[0].label.includes('approval') ? "Review Approvals" : "View Overdue", href: items[0].href }
            : { label: "View Team", href: "/team" };

    return (
        <div className="rounded-xl border bg-gradient-to-br from-card to-muted/20 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Greeting */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {getGreeting()}, {userName.split(' ')[0]} 👋
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        {items.length > 0
                            ? "Here's what needs your attention today"
                            : "You're all caught up! 🎉"}
                    </p>
                </div>

                {/* Primary CTA */}
                <Link
                    href={primaryAction.href}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    {primaryAction.label}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Priority Items */}
            {items.length > 0 && (
                <div className="grid gap-2 mt-4 md:grid-cols-2 lg:grid-cols-4">
                    {items.slice(0, 4).map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors 
                                ${item.priority === 'high'
                                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900 hover:bg-red-100/50 dark:hover:bg-red-950/30'
                                    : item.priority === 'medium'
                                        ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900 hover:bg-yellow-100/50 dark:hover:bg-yellow-950/30'
                                        : 'bg-muted/30 border-border hover:bg-muted/50'
                                }`}
                        >
                            {item.icon}
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

import { QuickAnnouncementForm } from "@/components/hub/quick-announcement-form";
import { TeamUpdatesFeed } from "@/components/hub/team-updates-feed";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TaskStatusChart } from "@/components/dashboard/charts/task-status-chart";
import { TaskPriorityChart } from "@/components/dashboard/charts/task-priority-chart";
import { WhosInWidget } from "@/components/dashboard/whos-in-widget";
import { AnnouncementsWidget } from "@/components/dashboard/announcements-widget";
import { AssetsWidget } from "@/components/dashboard/assets-widget";
import { RemindersWidget } from "@/components/dashboard/reminders-widget";
import { ExecutivePendingWidget } from "@/components/dashboard/executive-pending-widget";
import { MyTasksWidget } from "@/components/dashboard/my-tasks-widget";
import { LeaveBalanceWidget } from "@/components/dashboard/leave-balance-widget";
import { MyPendingRequestsWidget } from "@/components/dashboard/my-pending-requests-widget";
import { ActionRequiredWidget } from "@/components/dashboard/action-required-widget";
import { QuickActionsWidget } from "@/components/dashboard/quick-actions-widget";
import { QuickLeaveButton } from "@/components/dashboard/quick-leave-button";
import { QuickExpenseButton } from "@/components/dashboard/quick-expense-button";
import { TodaysFocusWidget } from "@/components/dashboard/todays-focus-widget";
import { TodayFocus } from "@/components/dashboard/today-focus";
import { StaleItemsWidget } from "@/components/dashboard/stale-items-widget";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { FirstDayChecklist } from "@/components/onboarding/first-day-checklist";
import { getDashboardStats, getTaskStatusDistribution, getTaskPriorityDistribution, getMyTodayTasks, getTeamDashboardData } from "@/app/actions/dashboard";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import Link from "next/link";

// Helper to get user role - returns 4 distinct roles
async function getUserRole(): Promise<'ceo' | 'hr' | 'manager' | 'employee'> {
    const session = await auth();
    const role = (session?.user as any)?.role || 'admin'; // Default to admin for demo

    if (role === 'admin' || role === 'ceo') return 'ceo';
    if (role === 'hr') return 'hr';
    if (role === 'manager') return 'manager';
    return 'employee';
}

import { SetupWizard } from "@/components/dashboard/setup-wizard";
import { db } from "@/db";
import { tasks, users, organizations } from "@/db/schema";
import { count, eq } from "drizzle-orm";

// ... existing imports

// Helper to check setup status
async function getSetupStatus(userRole: string) {
    if (userRole !== 'ceo' && userRole !== 'hr') return { show: false }; // Only admins/managers

    const session = await auth();
    const orgId = (session?.user as any)?.organizationId;
    if (!orgId) return { show: false };

    const [uCount, tCount, org] = await Promise.all([
        db.select({ count: count() }).from(users).where(eq(users.organizationId, orgId)),
        db.select({ count: count() }).from(tasks).where(eq(tasks.organizationId, orgId)),
        db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1)
    ]);

    // Show if 1 user (me) and 0 tasks
    return {
        show: uCount[0].count <= 1 && tCount[0].count === 0,
        orgId,
        orgName: org[0]?.name || "Your Workspace"
    };
}

// Manager Dashboard View - shows team overview + personal tasks
async function ManagerDashboardView({ todayTasks, userName }: { todayTasks: any[], userName: string }) {
    const teamData = await getTeamDashboardData();

    const hasTeamData = !("error" in teamData);
    const onLeaveCount = hasTeamData ? teamData.onLeaveCount : 0;
    const overloadedCount = hasTeamData ? teamData.overloadedCount : 0;
    const pendingLeaves = hasTeamData ? teamData.pendingLeaves : 0;
    const teamSize = hasTeamData ? teamData.members.length : 0;

    return (
        <>
            {/* Team at a Glance */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <span className="text-lg">👥</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{teamSize}</p>
                            <p className="text-xs text-muted-foreground">Team Size</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <span className="text-lg">🌴</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{onLeaveCount}</p>
                            <p className="text-xs text-muted-foreground">On Leave</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                            <span className="text-lg">⚠️</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{overloadedCount}</p>
                            <p className="text-xs text-muted-foreground">Need Help</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <span className="text-lg">⏳</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pendingLeaves}</p>
                            <p className="text-xs text-muted-foreground">Pending Approvals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Links */}
            <div className="flex gap-4 flex-wrap">
                <Link
                    href="/team/dashboard"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    View Full Team Dashboard →
                </Link>
                {pendingLeaves > 0 && (
                    <Link
                        href="/approvals"
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                    >
                        Review {pendingLeaves} Pending Request{pendingLeaves > 1 ? 's' : ''}
                    </Link>
                )}
            </div>

            {/* Stale Approvals Warning */}
            <Suspense fallback={null}>
                <StaleItemsWidget />
            </Suspense>

            {/* Personal Tasks */}
            <TodaysFocusWidget tasks={todayTasks} userName={userName} />

            {/* Personal Widgets */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-48" />}>
                    <MyTasksWidget />
                </Suspense>
                <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-48" />}>
                    <ActionRequiredWidget />
                </Suspense>
                <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-48" />}>
                    <LeaveBalanceWidget />
                </Suspense>
            </div>
        </>
    );
}

export default async function Dashboard() {
    const [stats, statusData, priorityData, userRole, todayTasks] = await Promise.all([
        getDashboardStats(),
        getTaskStatusDistribution(),
        getTaskPriorityDistribution(),
        getUserRole(),
        getMyTodayTasks(),
    ]);

    const session = await auth();
    const userName = (session?.user as any)?.name || "there";
    const setup = await getSetupStatus(userRole);

    const roleContext = {
        ceo: "Company overview and pending decisions",
        hr: "Team management and operations",
        manager: "Your team's status and approvals",
        employee: "Your tasks, requests, and updates",
    }[userRole];

    return (
        <div className="space-y-6">
            {setup.show && (
                <SetupWizard open={true} orgId={setup.orgId || ""} orgName={setup.orgName || "Your Workspace"} />
            )}

            {/* Primary: Today Focus - Role-aware attention layer */}
            <Suspense fallback={<div className="rounded-xl border p-6 animate-pulse h-32" />}>
                <TodayFocus role={userRole} userName={userName} />
            </Suspense>

            {/* First-day checklist for new employees */}
            {userRole === 'employee' && (
                <FirstDayChecklist />
            )}

            {/* Quick actions for employees */}
            {userRole === 'employee' && (
                <div className="flex items-center gap-2">
                    <QuickLeaveButton />
                    <QuickExpenseButton />
                    <kbd className="hidden md:inline-flex px-2 py-1 text-xs bg-muted border rounded ml-auto">
                        ⌘K to search
                    </kbd>
                </div>
            )}

            {/* Role-specific top widgets */}
            {userRole === 'ceo' && (
                <>
                    <StatsCards stats={stats} />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-40" />}>
                            <ExecutivePendingWidget />
                        </Suspense>
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-40" />}>
                            <WhosInWidget />
                        </Suspense>
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-40" />}>
                            <RemindersWidget />
                        </Suspense>
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-40" />}>
                            <AnnouncementsWidget />
                        </Suspense>
                    </div>
                </>
            )}

            {userRole === 'hr' && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-48" />}>
                            <ActionRequiredWidget />
                        </Suspense>
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-48" />}>
                            <WhosInWidget />
                        </Suspense>
                        <QuickActionsWidget />
                    </div>
                    {/* Stale approvals for HR */}
                    <Suspense fallback={null}>
                        <StaleItemsWidget />
                    </Suspense>
                </>
            )}

            {userRole === 'manager' && (
                <ManagerDashboardView todayTasks={todayTasks} userName={userName} />
            )}

            {userRole === 'employee' && (
                <>
                    <TodaysFocusWidget tasks={todayTasks} userName={userName} />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-48" />}>
                            <MyTasksWidget />
                        </Suspense>
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-48" />}>
                            <LeaveBalanceWidget />
                        </Suspense>
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-48" />}>
                            <MyPendingRequestsWidget />
                        </Suspense>
                    </div>
                </>
            )}

            {/* Charts - demoted to expandable section */}
            {
                (userRole === 'ceo' || userRole === 'hr') && (
                    <ExpandableSection title="📊 Insights & Analytics" defaultExpanded={false}>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                                <h3 className="font-semibold mb-4">Task Status Distribution</h3>
                                <TaskStatusChart data={statusData} />
                            </div>
                            <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                                <h3 className="font-semibold mb-4">Tasks by Priority</h3>
                                <TaskPriorityChart data={priorityData} />
                            </div>
                        </div>
                    </ExpandableSection>
                )
            }

            {/* Announcements for employees */}
            {
                userRole === 'employee' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-32" />}>
                            <AnnouncementsWidget />
                        </Suspense>
                        <Suspense fallback={<div className="border rounded-lg p-4 animate-pulse h-32" />}>
                            <AssetsWidget />
                        </Suspense>
                    </div>
                )
            }

            {/* Team Updates - show for all but smaller for employees */}
            <div className={userRole === 'employee' ? '' : 'grid gap-8 lg:grid-cols-[1fr_400px]'}>
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Team Updates</h2>
                    <Suspense fallback={<div>Loading feed...</div>}>
                        <TeamUpdatesFeed />
                    </Suspense>
                </div>

                {userRole !== 'employee' && (
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <QuickAnnouncementForm />
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

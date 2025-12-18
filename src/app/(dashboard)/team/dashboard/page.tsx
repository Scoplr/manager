import { getTeamDashboardData } from "@/app/actions/dashboard";
import { getCurrentUser } from "@/lib/authorize";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Users,
    Palmtree,
    AlertTriangle,
    Clock,
    ChevronRight,
    CheckCircle2,
    Mail
} from "lucide-react";

export default async function TeamDashboardPage() {
    const authResult = await getCurrentUser();

    // Manager/admin only
    if (!authResult.user || (authResult.user.role !== "admin" && authResult.user.role !== "manager")) {
        redirect("/team");
    }

    const data = await getTeamDashboardData();

    if ("error" in data) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Failed to load team data
            </div>
        );
    }

    const { members, onLeaveCount, overloadedCount, pendingLeaves } = data;

    const onLeaveMembers = members.filter(m => m.onLeave);
    const overloadedMembers = members.filter(m => m.isOverloaded && !m.onLeave);
    const availableMembers = members.filter(m => !m.onLeave && !m.isOverloaded);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
                    <p className="text-muted-foreground mt-1">
                        Team status at a glance • {members.length} people
                    </p>
                </div>
                <Link
                    href="/team"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    View full directory
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{members.length}</p>
                            <p className="text-xs text-muted-foreground">Team Size</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Palmtree className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{onLeaveCount}</p>
                            <p className="text-xs text-muted-foreground">On Leave Today</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{overloadedCount}</p>
                            <p className="text-xs text-muted-foreground">Overloaded</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pendingLeaves}</p>
                            <p className="text-xs text-muted-foreground">Pending Leaves</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* On Leave Today */}
                <div className="rounded-xl border bg-card">
                    <div className="p-4 border-b flex items-center gap-2">
                        <Palmtree className="w-5 h-5 text-green-600" />
                        <h2 className="font-semibold">On Leave Today</h2>
                        <span className="ml-auto text-sm text-muted-foreground">
                            {onLeaveMembers.length} people
                        </span>
                    </div>
                    <div className="p-4">
                        {onLeaveMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Everyone is available today 🎉
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {onLeaveMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                                {member.name?.charAt(0) || "?"}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{member.name || member.email}</p>
                                            <p className="text-xs text-muted-foreground">{member.designation || member.department}</p>
                                        </div>
                                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                            On leave
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Needs Attention */}
                <div className="rounded-xl border bg-card">
                    <div className="p-4 border-b flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h2 className="font-semibold">Needs Attention</h2>
                        <span className="ml-auto text-sm text-muted-foreground">
                            {overloadedMembers.length} people
                        </span>
                    </div>
                    <div className="p-4">
                        {overloadedMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No one is overloaded right now ✨
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {overloadedMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                                {member.name?.charAt(0) || "?"}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{member.name || member.email}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {member.overdueTaskCount > 0 && `${member.overdueTaskCount} overdue`}
                                                {member.overdueTaskCount > 0 && member.pendingTaskCount > 0 && " • "}
                                                {member.pendingTaskCount > 0 && `${member.pendingTaskCount} due soon`}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/team/${member.id}`}
                                            className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full"
                                        >
                                            View
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Available Team Members */}
            <div className="rounded-xl border bg-card">
                <div className="p-4 border-b flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold">Available</h2>
                    <span className="ml-auto text-sm text-muted-foreground">
                        {availableMembers.length} people
                    </span>
                </div>
                <div className="p-4">
                    {availableMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No available team members
                        </p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {availableMembers.slice(0, 9).map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary">
                                            {member.name?.charAt(0) || "?"}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{member.name || member.email}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {member.pendingTaskCount > 0
                                                ? `${member.pendingTaskCount} tasks due soon`
                                                : "No urgent tasks"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {availableMembers.length > 9 && (
                                <Link
                                    href="/team"
                                    className="flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                                >
                                    +{availableMembers.length - 9} more
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            {pendingLeaves > 0 && (
                <div className="rounded-xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div className="flex-1">
                            <p className="font-medium">Pending Approvals</p>
                            <p className="text-sm text-muted-foreground">
                                You have {pendingLeaves} leave request{pendingLeaves > 1 ? "s" : ""} waiting for your review
                            </p>
                        </div>
                        <Link
                            href="/approvals"
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                        >
                            Review Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

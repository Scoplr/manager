import { PageHeader } from "@/components/ui/page-header";
import { getHeadcountReport, getProductivityReport } from "@/app/actions/reports";
import { EmptyState } from "@/components/ui/empty-state";
import { PieChart, Users, CheckSquare, Briefcase, ShieldAlert } from "lucide-react";
import { requireAnyRole } from "@/lib/role-guards";

export default async function ReportsPage() {
    // Only Admin can access compliance reports
    await requireAnyRole(["admin"], "/");

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [headcount, productivity] = await Promise.all([
        getHeadcountReport(),
        getProductivityReport(firstDay, lastDay)
    ]);

    if (!headcount && !productivity) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Compliance Reports"
                    description="HR and productivity insights"
                    icon="ShieldAlert"
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                />
                <EmptyState
                    icon={<ShieldAlert className="h-8 w-8 text-muted-foreground" />}
                    title="Access Denied or No Data"
                    description="You may not have permission to view these reports."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Compliance & Reports"
                description={`Overview for ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                icon="PieChart"
                iconColor="text-indigo-600"
                iconBg="bg-indigo-100"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Summary Cards */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Headcount</span>
                    </div>
                    <div className="text-2xl font-bold">{headcount?.totalEmployees || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total Employees</p>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <CheckSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">Productivity</span>
                    </div>
                    <div className="text-2xl font-bold">{productivity?.completionRate || 0}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Task Completion Rate</p>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <UserPlusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">New Hires</span>
                    </div>
                    <div className="text-2xl font-bold">{headcount?.recentHires || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 30 Days</p>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm font-medium">Tasks Created</span>
                    </div>
                    <div className="text-2xl font-bold">{productivity?.totalTasks || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">This Month</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Department Breakdown */}
                <div className="rounded-lg border bg-card shadow-sm p-6">
                    <h3 className="font-semibold text-lg mb-4">Department Headcount</h3>
                    <div className="space-y-2">
                        {headcount?.byDepartment && Object.entries(headcount.byDepartment).map(([dept, count]) => (
                            <div key={dept} className="flex items-center justify-between">
                                <span className="text-sm">{dept}</span>
                                <div className="flex items-center gap-2 w-1/2">
                                    <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${(count / (headcount.totalEmployees || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task Status Breakdown */}
                <div className="rounded-lg border bg-card shadow-sm p-6">
                    <h3 className="font-semibold text-lg mb-4">Task Status Distribution</h3>
                    <div className="space-y-2">
                        {productivity?.byStatus && Object.entries(productivity.byStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{status}</span>
                                <div className="flex items-center gap-2 w-1/2">
                                    <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className="h-full bg-green-600 rounded-full"
                                            style={{ width: `${(count / (productivity.totalTasks || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserPlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
        </svg>
    );
}

import { getTaskTrends, getWorkloadDistribution, getActivitySummary, getTeamVelocity, getOverloadedUsers } from "@/app/actions/analytics";
import { VelocityChart } from "@/components/analytics/velocity-chart";
import { WorkloadTable } from "@/components/analytics/workload-table";
import { ActivityCards } from "@/components/analytics/activity-cards";
import { OverloadAlert } from "@/components/analytics/overload-alert";
import { BarChart3 } from "lucide-react";

export default async function AnalyticsPage() {
    const activity = await getActivitySummary();
    const workload = await getWorkloadDistribution();
    const velocity = await getTeamVelocity(8);
    const overloaded = await getOverloadedUsers(5);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">Team performance and activity insights.</p>
                </div>
            </div>

            {/* Overload Alert */}
            {overloaded.length > 0 && <OverloadAlert users={overloaded} />}

            {/* Activity Summary */}
            <ActivityCards activity={activity} />

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="border rounded-lg p-6 bg-card">
                    <h2 className="font-semibold mb-4">Team Velocity</h2>
                    <p className="text-sm text-muted-foreground mb-4">Tasks completed per week</p>
                    <VelocityChart data={velocity} />
                </div>

                <div className="border rounded-lg p-6 bg-card">
                    <h2 className="font-semibold mb-4">Workload Distribution</h2>
                    <p className="text-sm text-muted-foreground mb-4">Active tasks per team member</p>
                    <WorkloadTable data={workload} />
                </div>
            </div>
        </div>
    );
}

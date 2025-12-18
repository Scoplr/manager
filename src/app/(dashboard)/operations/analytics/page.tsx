import { getHeadcountTrends, getLeaveAnalytics, getDepartmentStats } from "@/app/actions/analytics";
import { requireAnyRole } from "@/lib/role-guards";

export default async function OperationsAnalyticsPage() {
    await requireAnyRole(["admin"], "/operations");

    const [headcount, leaves, departments] = await Promise.all([
        getHeadcountTrends(12),
        getLeaveAnalytics(),
        getDepartmentStats(),
    ]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 bg-card border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Headcount</p>
                    <p className="text-3xl font-bold">{headcount.currentCount || 0}</p>
                </div>
                <div className="p-6 bg-card border rounded-lg">
                    <p className="text-sm text-muted-foreground">Departments</p>
                    <p className="text-3xl font-bold">{departments.length || 0}</p>
                </div>
                <div className="p-6 bg-card border rounded-lg">
                    <p className="text-sm text-muted-foreground">Leave Days Used</p>
                    <p className="text-3xl font-bold">{leaves.totalUsed || 0}</p>
                </div>
            </div>

            <div className="p-6 bg-card border rounded-lg">
                <h3 className="font-semibold mb-4">Department Breakdown</h3>
                <div className="space-y-3">
                    {departments.map((dept: any) => (
                        <div key={dept.name} className="flex items-center justify-between">
                            <span>{dept.name}</span>
                            <span className="text-muted-foreground">{dept.count} members</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

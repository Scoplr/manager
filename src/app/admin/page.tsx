import { getTenants } from "@/app/actions/admin";
import { getPendingDemoRequests } from "@/app/actions/demo-requests";
import { db } from "@/db";
import { Activity, Database, Server, Users, Building2, AlertTriangle, CheckCircle2, Inbox } from "lucide-react";
import Link from "next/link";
import { DemoRequestsList } from "@/components/admin/demo-requests-list";

// Get a stable admin ID for demo purposes
const SUPER_ADMIN_ID = "00000000-0000-0000-0000-000000000000";

export default async function AdminDashboard() {
    const tenants = await getTenants();
    const pendingRequests = await getPendingDemoRequests();

    // Calculate stats
    const totalTenants = tenants.length;
    const totalUsers = tenants.reduce((acc, t) => acc + (Number(t.userCount) || 0), 0);
    const activeTenants = tenants.filter(t => Number(t.userCount) > 0).length;

    // Mock system health (in production, these would come from monitoring)
    const systemHealth = {
        database: "operational",
        api: "operational",
        cache: "operational",
    };

    const statusColors = {
        operational: "text-green-600 bg-green-50 dark:bg-green-950/30",
        degraded: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
        down: "text-red-600 bg-red-50 dark:bg-red-950/30",
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Platform Dashboard</h2>
                <p className="text-muted-foreground">Monitor and manage your SaaS platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Organizations</p>
                            <p className="text-2xl font-bold">{totalTenants}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                            <p className="text-2xl font-bold">{totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950">
                            <Inbox className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                            <p className="text-2xl font-bold">{pendingRequests.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                            <Server className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">System Status</p>
                            <p className="text-2xl font-bold text-green-600">Healthy</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Demo Requests */}
            {pendingRequests.length > 0 && (
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden border-amber-200 dark:border-amber-900">
                    <div className="p-6 border-b bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Inbox className="w-5 h-5 text-amber-600" />
                            <h3 className="font-semibold">Pending Trial Requests</h3>
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-600 text-white">
                                {pendingRequests.length}
                            </span>
                        </div>
                    </div>
                    <DemoRequestsList requests={pendingRequests} adminId={SUPER_ADMIN_ID} />
                </div>
            )}

            {/* System Health */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5" />
                        System Health
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(systemHealth).map(([service, status]) => (
                            <div key={service} className="flex items-center justify-between">
                                <span className="capitalize">{service}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[status as keyof typeof statusColors]
                                    }`}>
                                    {status === "operational" ? (
                                        <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                        <AlertTriangle className="w-3 h-3" />
                                    )}
                                    {status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/admin/tenants"
                            className="p-3 rounded-lg border hover:bg-muted transition-colors text-center"
                        >
                            <Building2 className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-sm">Manage Tenants</span>
                        </Link>
                        <Link
                            href="/admin/tenants"
                            className="p-3 rounded-lg border hover:bg-muted transition-colors text-center"
                        >
                            <Users className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-sm">Provision Users</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Tenants */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Recent Organizations</h3>
                    <Link href="/admin/tenants" className="text-sm text-primary hover:underline">
                        View all →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-medium text-sm">Organization</th>
                                <th className="text-left p-4 font-medium text-sm">Users</th>
                                <th className="text-left p-4 font-medium text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {tenants.slice(0, 5).map(tenant => (
                                <tr key={tenant.id} className="hover:bg-muted/30">
                                    <td className="p-4">
                                        <p className="font-medium">{tenant.name}</p>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {tenant.userCount || 0}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import { PageHeader } from "@/components/ui/page-header";
import { getOffboardingProgress } from "@/app/actions/offboarding";
import Link from "next/link";
import { Plus, UserMinus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAnyRole } from "@/lib/role-guards";

export default async function OffboardingPage() {
    // Only HR and Admin can access offboarding
    await requireAnyRole(["hr", "admin"], "/");

    const progressList = await getOffboardingProgress();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Offboarding"
                    description="Manage employee exit processes"
                    icon="UserMinus"
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                />
                <Link
                    href="/offboarding/start"
                    className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Start Offboarding
                </Link>
            </div>

            {progressList.length === 0 ? (
                <EmptyState
                    icon="UserMinus"
                    title="No offboarding processes"
                    description="Start an offboarding process for a departing employee."
                    action={{ label: "Start Offboarding", href: "/offboarding/start" }}
                />
            ) : (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Employee</th>
                                    <th className="px-4 py-3 font-medium">Template</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Progress</th>
                                    <th className="px-4 py-3 font-medium">Last Day</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {progressList.map((record) => (
                                    <tr key={record.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium">
                                            <Link href={`/offboarding/${record.id}`} className="hover:underline">
                                                {record.userName || 'Unknown User'}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">{record.templateName || 'Default'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${record.status === 'completed'
                                                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-green-600/20'
                                                : record.status === 'cancelled'
                                                    ? 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                                    : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-yellow-600/20'
                                                }`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full"
                                                        style={{ width: `${record.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{record.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {record.lastWorkingDay ? new Date(record.lastWorkingDay).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/offboarding/${record.id}`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

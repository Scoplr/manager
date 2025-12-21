import { getLeaves } from "@/app/actions/leave";
import { PageHeader } from "@/components/ui/page-header";
import { Plus, Palmtree, Settings } from "lucide-react";
import { LeavesList } from "@/components/leaves/leaves-list";
import { LeaveFilters } from "@/components/leaves/leave-filters";
import { LeaveForm } from "@/components/leaves/leave-form";
import { LeavesExportButton } from "@/components/leaves/leaves-export-button";
import Link from "next/link";
import { auth } from "@/lib/auth";

type Props = {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function LeavesPage(props: Props) {
    const searchParams = await props.searchParams;
    const statusFilter = searchParams.status;
    const session = await auth();
    const userRole = (session?.user as any)?.role || 'employee';
    const canManageSettings = ['admin', 'hr'].includes(userRole);

    const leaves = await getLeaves(statusFilter ? { status: statusFilter } : undefined);

    const pendingCount = leaves.filter(l => l.status === "pending").length;
    const approvedCount = leaves.filter(l => l.status === "approved").length;
    const rejectedCount = leaves.filter(l => l.status === "rejected").length;

    return (
        <div>
            <div className="flex items-start justify-between gap-4 mb-6">
                <PageHeader
                    icon="Palmtree"
                    iconColor="text-green-600"
                    iconBg="bg-green-100"
                    title="Time Off"
                    description="View, request, and manage time off applications."
                />
                <div className="flex items-center gap-2">
                    {canManageSettings && (
                        <Link
                            href="/settings/leave-policies"
                            className="p-2 rounded-lg border hover:bg-muted transition-colors"
                            title="Leave Settings"
                        >
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    )}
                    <a
                        href="#request-form"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Request Leave
                    </a>
                    <LeavesExportButton />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="border rounded-lg p-3 text-center bg-card">
                    <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="border rounded-lg p-3 text-center bg-card">
                    <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <div className="border rounded-lg p-3 text-center bg-card">
                    <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
            </div>

            <LeaveFilters currentStatus={statusFilter} />

            <div className="grid gap-6 lg:grid-cols-[1fr_320px] mt-6">
                <LeavesList leaves={leaves} />
                <div className="lg:sticky lg:top-4 h-fit">
                    <div id="request-form" className="border rounded-lg p-4 bg-card scroll-mt-6">
                        <h3 className="font-semibold mb-3">Request Leave</h3>
                        <LeaveForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

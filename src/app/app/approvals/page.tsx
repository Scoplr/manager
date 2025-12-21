import { getPendingApprovals, getApprovalCounts } from "@/app/actions/approvals";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardCheck } from "lucide-react";
import { ApprovalsList } from "@/components/approvals/approvals-list";
import { requireAnyRole } from "@/lib/role-guards";

export default async function ApprovalsPage() {
    // Only Manager and above can access approvals
    await requireAnyRole(["manager", "hr", "admin"], "/");

    const items = await getPendingApprovals();
    const counts = await getApprovalCounts();

    return (
        <div>
            <PageHeader
                icon="ClipboardCheck"
                iconColor="text-emerald-600"
                iconBg="bg-emerald-100"
                title="Inbox"
                description="Everything waiting for your approval. Clear it fast, keep things moving."
                tip="Select multiple items to bulk approve or reject."
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="border rounded-lg p-4 text-center bg-card">
                    <p className="text-3xl font-bold text-orange-600">{counts.total}</p>
                    <p className="text-xs text-muted-foreground">Total Pending</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-card">
                    <p className="text-2xl font-bold text-green-600">{counts.leaves}</p>
                    <p className="text-xs text-muted-foreground">Leaves</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-card">
                    <p className="text-2xl font-bold text-blue-600">{counts.expenses}</p>
                    <p className="text-xs text-muted-foreground">Expenses</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-card">
                    <p className="text-2xl font-bold text-purple-600">{counts.requests}</p>
                    <p className="text-xs text-muted-foreground">Requests</p>
                </div>
            </div>

            <ApprovalsList items={items} />
        </div>
    );
}

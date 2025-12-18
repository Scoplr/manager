import { getApprovalChains } from "@/app/actions/approval-chains";
import { PageHeader } from "@/components/ui/page-header";
import { ApprovalChainManager } from "@/components/settings/approval-chain-manager";
import { Shield } from "lucide-react";

export default async function ApprovalsPage() {
    const chains = await getApprovalChains();

    return (
        <div className="space-y-6 max-w-5xl">
            <PageHeader
                icon="CheckSquare"
                iconColor="text-indigo-600"
                iconBg="bg-indigo-100"
                title="Approval Workflows"
                description="Configure multi-step approval chains for expenses and leaves."
            />

            <ApprovalChainManager chains={chains} />
        </div>
    );
}

import { getLeavePolicies, createLeavePolicy } from "@/app/actions/config";
import { PageHeader } from "@/components/ui/page-header";
import { LeavePoliciesList } from "@/components/settings/leave-policies-list";
import { LeavePolicyForm } from "@/components/settings/leave-policy-form";
import { Palmtree } from "lucide-react";

export default async function LeavePoliciesPage() {
    const policies = await getLeavePolicies();

    return (
        <div>
            <PageHeader
                icon="Palmtree"
                iconColor="text-orange-600"
                iconBg="bg-orange-100"
                title="Leave Policies"
                description="Configure leave allowances and rules."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <LeavePoliciesList policies={policies} />
                <div className="lg:sticky lg:top-4 h-fit">
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-3">Add Policy</h3>
                        <LeavePolicyForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

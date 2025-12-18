import { getAssets, getUpcomingRenewals } from "@/app/actions/assets";
import { getUsers } from "@/app/actions/people";
import { CreateAssetForm } from "@/components/assets/create-form";
import { AssetsList } from "@/components/assets/list";
import { RenewalsAlert } from "@/components/assets/renewals-alert";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default async function AssetsPage() {
    const assets = await getAssets();
    const users = await getUsers();
    const renewals = await getUpcomingRenewals(14);

    return (
        <div>
            <PageHeader
                icon="Package"
                iconColor="text-teal-600"
                iconBg="bg-teal-100"
                title="Equipment"
                description="Track hardware, company devices, and licenses."
                tip="Set renewal dates to get alerts before subscriptions or licenses expire."
            />

            {renewals.length > 0 && <RenewalsAlert renewals={renewals} />}

            <div className="grid gap-6 lg:grid-cols-[1fr_320px] mt-6">
                <AssetsList assets={assets} users={users} />
                <div className="lg:sticky lg:top-4 h-fit">
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-3">Add Asset</h3>
                        <CreateAssetForm users={users} />
                    </div>
                </div>
            </div>
        </div>
    );
}

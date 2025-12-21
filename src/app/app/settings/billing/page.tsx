import { PageHeader } from "@/components/ui/page-header";
import { CreditCard, Check, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/authorize";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function BillingPage() {
    const auth = await requireAdmin();
    if (!auth.authorized || !auth.user?.organizationId) {
        redirect("/");
    }

    const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, auth.user.organizationId)
    });

    if (!org) return <div>Organization not found</div>;

    const currentPlan = org.plan || "free";
    const status = org.subscriptionStatus || "active";

    return (
        <div>
            <PageHeader
                icon="Receipt"
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
                title="Billing & Subscription"
                description="Manage your plan, payment methods, and invoices."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Current Plan Card */}
                <div className="bg-card border rounded-lg p-6 shadow-sm col-span-full lg:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Current Plan</h3>
                            <p className="text-muted-foreground">You are currently on the <span className="font-bold uppercase">{currentPlan}</span> plan.</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {status.toUpperCase()}
                        </div>
                    </div>

                    <div className="my-6 p-4 bg-muted/50 rounded-md border">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Next Payment</span>
                            <span className="text-sm text-muted-foreground">-- (Free Tier)</span>
                            {/* In real app, show date */}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {currentPlan === "free" ? (
                            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                                Upgrade to Pro
                            </button>
                        ) : (
                            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                                Manage Subscription
                            </button>
                        )}
                    </div>
                </div>

                {/* Plan Comparison (Upsell) */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-100 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-2">Why Upgrade?</h3>
                    <ul className="space-y-3 mt-4">
                        {[
                            "Unlimited Users",
                            "Advanced Reporting",
                            "Priority Support",
                            "Custom Roles"
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-purple-800">
                                <Check className="h-4 w-4 text-purple-600" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Invoices (Stub) */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Invoice History</h3>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Amount</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    No invoices found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Force dynamic because we read DB
export const dynamic = 'force-dynamic';

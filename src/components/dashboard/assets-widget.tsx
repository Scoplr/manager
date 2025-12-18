import { getAssets, getUpcomingRenewals } from "@/app/actions/assets";
import { Package, AlertTriangle, Laptop, Key, CreditCard } from "lucide-react";
import Link from "next/link";

export async function AssetsWidget() {
    const assets = await getAssets();
    const renewals = await getUpcomingRenewals(14);

    const activeAssets = assets.filter(a => a.status === "active");
    const byType = {
        hardware: activeAssets.filter(a => a.type === "hardware").length,
        license: activeAssets.filter(a => a.type === "license").length,
        subscription: activeAssets.filter(a => a.type === "subscription").length,
    };

    return (
        <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Assets
                </h3>
                <Link href="/assets" className="text-xs text-blue-600 hover:underline">
                    Manage
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-blue-50 rounded">
                    <Laptop className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold">{byType.hardware}</p>
                    <p className="text-xs text-muted-foreground">Hardware</p>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                    <Key className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                    <p className="text-lg font-bold">{byType.license}</p>
                    <p className="text-xs text-muted-foreground">Licenses</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                    <CreditCard className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-lg font-bold">{byType.subscription}</p>
                    <p className="text-xs text-muted-foreground">Subs</p>
                </div>
            </div>

            {renewals.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 rounded p-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{renewals.length} renewal{renewals.length > 1 ? "s" : ""} coming up</span>
                </div>
            )}
        </div>
    );
}

import { getAssets } from "@/app/actions/assets";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { requireAnyRole } from "@/lib/role-guards";

export default async function OperationsAssetsPage() {
    await requireAnyRole(["hr", "admin"], "/operations");

    const assets = await getAssets();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{assets.length} assets</p>
                <button
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 opacity-50 cursor-not-allowed"
                    disabled
                    title="Coming soon"
                >
                    Add Asset
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assets.length === 0 ? (
                    <div className="col-span-full p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                        No assets tracked yet.
                    </div>
                ) : (
                    assets.map((asset: any) => (
                        <Link
                            key={asset.id}
                            href={`/assets/${asset.id}`}
                            className="p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-medium truncate">{asset.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {asset.type} • {asset.status}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

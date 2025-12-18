"use client";

import { deleteAsset, assignAsset, updateAsset } from "@/app/actions/assets";
import { Laptop, Key, CreditCard, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const typeIcons = {
    hardware: { icon: Laptop, color: "text-blue-600", bg: "bg-blue-100" },
    license: { icon: Key, color: "text-purple-600", bg: "bg-purple-100" },
    subscription: { icon: CreditCard, color: "text-green-600", bg: "bg-green-100" },
};

const statusColors = {
    active: "bg-green-100 text-green-700",
    retired: "bg-gray-100 text-gray-600",
    pending: "bg-yellow-100 text-yellow-700",
};

export function AssetsList({ assets, users }: { assets: any[]; users: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Delete this asset?")) {
            await deleteAsset(id);
            router.refresh();
        }
    }

    async function handleAssign(id: string, userId: string) {
        await assignAsset(id, userId || null);
        router.refresh();
    }

    async function handleRetire(id: string) {
        await updateAsset(id, { status: "retired" });
        router.refresh();
    }

    if (assets.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No assets tracked yet. Add one to get started.
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="text-left p-3 font-medium">Asset</th>
                        <th className="text-left p-3 font-medium">Assigned To</th>
                        <th className="text-left p-3 font-medium">Renewal</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset: any) => {
                        const typeConfig = typeIcons[asset.type as keyof typeof typeIcons] || typeIcons.hardware;
                        const Icon = typeConfig.icon;

                        return (
                            <tr key={asset.id} className="border-t hover:bg-muted/20">
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded ${typeConfig.bg} flex items-center justify-center`}>
                                            <Icon className={`h-4 w-4 ${typeConfig.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{asset.name}</p>
                                            {asset.serialNumber && (
                                                <p className="text-xs text-muted-foreground">{asset.serialNumber}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <select
                                        value={asset.assignedTo || ""}
                                        onChange={(e) => handleAssign(asset.id, e.target.value)}
                                        className="text-sm border rounded px-2 py-1 bg-background"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-3">
                                    {asset.renewalDate ? (
                                        <span className="text-sm">
                                            {format(new Date(asset.renewalDate), "MMM d, yyyy")}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[asset.status as keyof typeof statusColors]}`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    {asset.status === "active" && (
                                        <button
                                            onClick={() => handleRetire(asset.id)}
                                            className="text-muted-foreground hover:text-yellow-600 p-1"
                                            title="Retire"
                                        >
                                            Retire
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="text-muted-foreground hover:text-red-600 p-1 ml-2"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

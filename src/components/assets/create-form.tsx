"use client";

import { useState } from "react";
import { createAsset } from "@/app/actions/assets";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateAssetForm({ users }: { users: any[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createAsset(formData);
        e.currentTarget.reset();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="asset-name" className="block text-xs text-muted-foreground mb-1">Asset Name</label>
                <input
                    id="asset-name"
                    name="name"
                    placeholder="Asset name..."
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label htmlFor="asset-type" className="block text-xs text-muted-foreground mb-1">Type</label>
                    <select id="asset-type" name="type" className="border rounded-md p-2 bg-background text-sm w-full" required>
                        <option value="">Type...</option>
                        <option value="hardware">Hardware</option>
                        <option value="license">License</option>
                        <option value="subscription">Subscription</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="asset-cost" className="block text-xs text-muted-foreground mb-1">Cost</label>
                    <input
                        id="asset-cost"
                        name="cost"
                        placeholder="Cost"
                        className="border rounded-md p-2 bg-background text-sm w-full"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="asset-serial" className="block text-xs text-muted-foreground mb-1">Serial/License Key</label>
                <input
                    id="asset-serial"
                    name="serialNumber"
                    placeholder="Serial/License Key"
                    className="w-full border rounded-md p-2 bg-background text-sm"
                />
            </div>

            <div>
                <label htmlFor="asset-assigned" className="block text-xs text-muted-foreground mb-1">Assigned To</label>
                <select id="asset-assigned" name="assignedTo" className="w-full border rounded-md p-2 bg-background text-sm">
                    <option value="">Unassigned</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label htmlFor="asset-purchase" className="block text-xs text-muted-foreground mb-1">Purchase Date</label>
                    <input
                        id="asset-purchase"
                        type="date"
                        name="purchaseDate"
                        className="w-full border rounded-md p-2 bg-background text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="asset-renewal" className="block text-xs text-muted-foreground mb-1">Renewal Date</label>
                    <input
                        id="asset-renewal"
                        type="date"
                        name="renewalDate"
                        className="w-full border rounded-md p-2 bg-background text-sm"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="asset-notes" className="block text-xs text-muted-foreground mb-1">Notes</label>
                <textarea
                    id="asset-notes"
                    name="notes"
                    placeholder="Notes..."
                    rows={2}
                    className="w-full border rounded-md p-2 bg-background text-sm resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Asset
            </button>
        </form>
    );
}

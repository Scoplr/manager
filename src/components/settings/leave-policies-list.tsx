"use client";

import { deleteLeavePolicy } from "@/app/actions/config";
import { Trash2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function LeavePoliciesList({ policies }: { policies: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Delete this policy?")) {
            await deleteLeavePolicy(id);
            router.refresh();
        }
    }

    if (policies.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No leave policies defined yet.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {policies.map((policy: any) => (
                <div key={policy.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                {policy.name}
                                {policy.isDefault && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Default</span>
                                )}
                            </h3>
                        </div>
                        <button
                            onClick={() => handleDelete(policy.id)}
                            className="text-muted-foreground hover:text-red-600 p-1"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="font-bold">{policy.annualAllowance}</p>
                            <p className="text-xs text-muted-foreground">Annual Days</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="font-bold">{policy.sickAllowance}</p>
                            <p className="text-xs text-muted-foreground">Sick Days</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="font-bold">{policy.carryOverLimit}</p>
                            <p className="text-xs text-muted-foreground">Carry Over</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="font-bold">{policy.minDaysNotice}d</p>
                            <p className="text-xs text-muted-foreground">Notice</p>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            {policy.halfDayEnabled ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-600" />}
                            Half-days
                        </span>
                        <span className="flex items-center gap-1">
                            {policy.requiresMedicalProof ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-600" />}
                            Medical proof
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

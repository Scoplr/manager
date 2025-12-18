"use client";

import { useState } from "react";
import { createApprovalRule } from "@/app/actions/config";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApprovalRuleForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createApprovalRule(formData);
        e.currentTarget.reset();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="rule-name" className="block text-xs text-muted-foreground mb-1">Rule Name</label>
                <input
                    id="rule-name"
                    name="name"
                    placeholder="Rule name..."
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="rule-type" className="block text-xs text-muted-foreground mb-1">Type</label>
                <select id="rule-type" name="type" className="w-full border rounded-md p-2 bg-background text-sm" required>
                    <option value="">Select type...</option>
                    <option value="leave">Leave Requests</option>
                    <option value="expense">Expenses</option>
                    <option value="asset">Asset Requests</option>
                    <option value="document">Documents</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label htmlFor="rule-threshold" className="block text-xs text-muted-foreground mb-1">Auto-approve Threshold</label>
                <input
                    id="rule-threshold"
                    name="autoApproveThreshold"
                    type="number"
                    placeholder="Auto-approve threshold (days/amount)"
                    className="w-full border rounded-md p-2 bg-background text-sm"
                />
            </div>
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" id="rule-manager" name="requiresManagerApproval" value="true" defaultChecked className="rounded" />
                    <span>Requires manager approval</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" id="rule-hr" name="requiresHRApproval" value="true" className="rounded" />
                    <span>Requires HR approval</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" id="rule-finance" name="requiresFinanceApproval" value="true" className="rounded" />
                    <span>Requires Finance approval (for expenses)</span>
                </label>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Rule
            </button>
        </form>
    );
}

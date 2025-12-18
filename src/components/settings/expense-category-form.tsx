"use client";

import { useState } from "react";
import { createExpenseCategory } from "@/app/actions/config";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ExpenseCategoryForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createExpenseCategory(formData);
        e.currentTarget.reset();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="cat-name" className="block text-xs text-muted-foreground mb-1">Category Name</label>
                <input
                    id="cat-name"
                    name="name"
                    placeholder="Category name..."
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="cat-limit" className="block text-xs text-muted-foreground mb-1">Monthly Limit</label>
                <input
                    id="cat-limit"
                    name="limit"
                    type="number"
                    placeholder="Monthly limit (optional)"
                    className="w-full border rounded-md p-2 bg-background text-sm"
                />
            </div>
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" id="cat-receipt" name="requiresReceipt" value="true" defaultChecked className="rounded" />
                    <span>Requires receipt</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" id="cat-approval" name="requiresApproval" value="true" defaultChecked className="rounded" />
                    <span>Requires approval</span>
                </label>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Category
            </button>
        </form>
    );
}

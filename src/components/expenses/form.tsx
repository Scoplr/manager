"use client";

import { useState } from "react";
import { submitExpense } from "@/app/actions/expenses";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
    { value: "travel", label: "Travel" },
    { value: "meals", label: "Meals & Entertainment" },
    { value: "supplies", label: "Office Supplies" },
    { value: "software", label: "Software" },
    { value: "equipment", label: "Equipment" },
    { value: "other", label: "Other" },
];

export function ExpenseForm({ users }: { users: any[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const currentUserId = users[0]?.id;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.set("userId", currentUserId);

        await submitExpense(formData);
        e.currentTarget.reset();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label htmlFor="expense-amount" className="block text-xs text-muted-foreground mb-1">Amount</label>
                    <input
                        id="expense-amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full border rounded-md p-2 bg-background text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="expense-currency" className="block text-xs text-muted-foreground mb-1">Currency</label>
                    <select id="expense-currency" name="currency" className="w-full border rounded-md p-2 bg-background text-sm">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="AED">AED</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="expense-category" className="block text-xs text-muted-foreground mb-1">Category</label>
                <select id="expense-category" name="category" className="w-full border rounded-md p-2 bg-background text-sm" required>
                    <option value="">Select category...</option>
                    {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="expense-description" className="block text-xs text-muted-foreground mb-1">Description</label>
                <textarea
                    id="expense-description"
                    name="description"
                    placeholder="What was this expense for?"
                    rows={2}
                    className="w-full border rounded-md p-2 bg-background text-sm resize-none"
                    required
                />
            </div>

            <div>
                <label htmlFor="expense-receipt" className="block text-xs text-muted-foreground mb-1">Receipt (optional)</label>
                <input
                    id="expense-receipt"
                    type="file"
                    name="receipt"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full border rounded-lg p-2 bg-background text-sm file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-muted file:text-sm file:font-medium"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Expense
            </button>
        </form>
    );
}


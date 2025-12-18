"use client";

import { useState } from "react";
import { Receipt, X } from "lucide-react";
import { submitExpense } from "@/app/actions/expenses";
import { toast } from "sonner";

export function QuickExpenseButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const result = await submitExpense(formData);

            if (result.success) {
                toast.success("Expense submitted!");
                setIsOpen(false);
            } else {
                toast.error(result.error || "Failed to submit expense");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <Receipt className="w-4 h-4" />
                Quick Expense
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border rounded-xl shadow-xl z-50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Submit Expense</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-muted rounded-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    required
                                    placeholder="What was the expense for?"
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Amount (USD)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        step="0.01"
                                        min="0"
                                        required
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border rounded-lg bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border rounded-lg bg-background"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    name="category"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                >
                                    <option value="travel">Travel</option>
                                    <option value="meals">Meals & Entertainment</option>
                                    <option value="supplies">Office Supplies</option>
                                    <option value="software">Software & Tools</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Receipt URL (optional)</label>
                                <input
                                    type="url"
                                    name="receiptUrl"
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? "Submitting..." : "Submit Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </>
    );
}

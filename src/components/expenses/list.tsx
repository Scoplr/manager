"use client";

import { useState } from "react";
import { approveExpense, rejectExpense, markReimbursed } from "@/app/actions/expenses";
import { CheckCircle, XCircle, DollarSign, Plane, UtensilsCrossed, ShoppingBag, Monitor, Wrench, MoreHorizontal, Receipt, X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const statusColors = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    reimbursed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
    travel: { label: "Travel", icon: Plane, color: "text-blue-500" },
    meals: { label: "Meals", icon: UtensilsCrossed, color: "text-orange-500" },
    supplies: { label: "Supplies", icon: ShoppingBag, color: "text-purple-500" },
    software: { label: "Software", icon: Monitor, color: "text-green-500" },
    equipment: { label: "Equipment", icon: Wrench, color: "text-gray-500" },
    other: { label: "Other", icon: MoreHorizontal, color: "text-gray-400" },
};

export function ExpensesList({ expenses, showActions = false }: { expenses: any[]; showActions?: boolean }) {
    const router = useRouter();
    const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

    async function handleApprove(id: string) {
        await approveExpense(id);
        router.refresh();
    }

    async function handleReject(id: string) {
        await rejectExpense(id);
        router.refresh();
    }

    async function handleReimburse(id: string) {
        await markReimbursed(id);
        router.refresh();
    }

    if (expenses.length === 0) {
        return (
            <div className="border rounded-xl p-12 text-center bg-card">
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No expenses to show</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Expenses you submit or need to review will appear here.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Receipt Preview Modal */}
            {previewReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewReceipt(null)}>
                    <div className="relative max-w-3xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 border-b">
                            <h3 className="font-semibold">Receipt Preview</h3>
                            <div className="flex gap-2">
                                <a href={previewReceipt} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-muted">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                <button onClick={() => setPreviewReceipt(null)} className="p-1.5 rounded hover:bg-muted">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 max-h-[80vh] overflow-auto">
                            <img src={previewReceipt} alt="Receipt" className="max-w-full rounded" />
                        </div>
                    </div>
                </div>
            )}

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left p-3 font-medium">Employee</th>
                            <th className="text-left p-3 font-medium">Amount</th>
                            <th className="text-left p-3 font-medium">Category</th>
                            <th className="text-left p-3 font-medium">Date</th>
                            <th className="text-left p-3 font-medium">Receipt</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            {showActions && <th className="text-right p-3 font-medium">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((exp: any) => {
                            const category = categoryConfig[exp.category] || categoryConfig.other;
                            const CategoryIcon = category.icon;

                            return (
                                <tr key={exp.id} className="border-t hover:bg-muted/20">
                                    <td className="p-3">
                                        <p className="font-medium">{exp.userName}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{exp.description}</p>
                                    </td>
                                    <td className="p-3 font-semibold">
                                        {exp.currency} {parseFloat(exp.amount).toFixed(2)}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                                            <span className="text-muted-foreground">{category.label}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {format(new Date(exp.submittedAt), "MMM d")}
                                    </td>
                                    <td className="p-3">
                                        {exp.receiptUrl ? (
                                            <button
                                                onClick={() => setPreviewReceipt(exp.receiptUrl)}
                                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                                <Receipt className="h-3 w-3" />
                                                View
                                            </button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded-full uppercase font-medium ${statusColors[exp.status as keyof typeof statusColors]}`}>
                                            {exp.status}
                                        </span>
                                    </td>
                                    {showActions && (
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {exp.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(exp.id)}
                                                            className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(exp.id)}
                                                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {exp.status === "approved" && (
                                                    <button
                                                        onClick={() => handleReimburse(exp.id)}
                                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    >
                                                        Mark Reimbursed
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

"use client";

import { deleteExpenseCategory } from "@/app/actions/config";
import { Trash2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function ExpenseCategoriesList({ categories }: { categories: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Delete this category?")) {
            await deleteExpenseCategory(id);
            router.refresh();
        }
    }

    if (categories.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No expense categories. Add categories to organize expenses.
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Limit</th>
                        <th className="text-left p-3 font-medium">Receipt</th>
                        <th className="text-left p-3 font-medium">Approval</th>
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat: any) => (
                        <tr key={cat.id} className="border-t hover:bg-muted/20">
                            <td className="p-3 font-medium">{cat.name}</td>
                            <td className="p-3 text-muted-foreground">
                                {cat.limit ? `$${cat.limit}` : "—"}
                            </td>
                            <td className="p-3">
                                {cat.requiresReceipt ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <X className="h-4 w-4 text-muted-foreground" />
                                )}
                            </td>
                            <td className="p-3">
                                {cat.requiresApproval ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <X className="h-4 w-4 text-muted-foreground" />
                                )}
                            </td>
                            <td className="p-3">
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-muted-foreground hover:text-red-600 p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

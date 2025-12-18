import { getExpenses, getExpenseSummary } from "@/app/actions/expenses";
import { getUsers } from "@/app/actions/people";
import { PageHeader } from "@/components/ui/page-header";
import { ExpenseForm } from "@/components/expenses/form";
import { ExpensesList } from "@/components/expenses/list";
import { Receipt } from "lucide-react";
import { ExpensesExportButton } from "@/components/expenses/expenses-export-button";

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    const users = await getUsers();
    const summary = await getExpenseSummary();

    const pending = expenses.filter(e => e.status === "pending");
    const processed = expenses.filter(e => e.status !== "pending");

    return (
        <div>
            <div className="flex items-start justify-between gap-4 mb-6">
                <PageHeader
                    icon="Receipt"
                    iconColor="text-amber-600"
                    iconBg="bg-amber-100"
                    title="Expenses"
                    description="Submit and approve expense claims."
                    tip="Upload receipts when submitting. Approved expenses can be marked as reimbursed."
                />
                <ExpensesExportButton />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="border rounded-lg p-4 bg-card text-center">
                    <p className="text-2xl font-bold text-amber-600">{summary.pendingCount}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="border rounded-lg p-4 bg-card text-center">
                    <p className="text-2xl font-bold text-green-600">{summary.approvedCount}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <div className="border rounded-lg p-4 bg-card text-center">
                    <p className="text-2xl font-bold">${summary.totalPending.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Pending Amount</p>
                </div>
                <div className="border rounded-lg p-4 bg-card text-center">
                    <p className="text-2xl font-bold">${summary.totalApproved.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Approved Amount</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    {pending.length > 0 && (
                        <div>
                            <h2 className="font-semibold mb-3 flex items-center gap-2">
                                Pending Approval
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pending.length}</span>
                            </h2>
                            <ExpensesList expenses={pending} showActions />
                        </div>
                    )}

                    <div>
                        <h2 className="font-semibold mb-3">History</h2>
                        <ExpensesList expenses={processed} />
                    </div>
                </div>

                <div className="lg:sticky lg:top-4 h-fit">
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-3">Submit Expense</h3>
                        <ExpenseForm users={users} />
                    </div>
                </div>
            </div>
        </div>
    );
}

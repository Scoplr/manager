import Link from "next/link";
import { ClipboardCheck, CheckSquare, Clock } from "lucide-react";
import { getApprovalCounts } from "@/app/actions/approvals";

export async function ExecutivePendingWidget() {
    const counts = await getApprovalCounts();
    const total = counts.total;

    if (total === 0) {
        return (
            <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-2 mb-3">
                    <ClipboardCheck className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Pending Approvals</h3>
                </div>
                <div className="text-center py-4">
                    <div className="text-3xl mb-1">🎉</div>
                    <p className="text-muted-foreground text-sm">All caught up!</p>
                </div>
            </div>
        );
    }

    return (
        <Link href="/approvals" className="block border rounded-lg p-6 bg-card hover:bg-accent/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Pending Approvals</h3>
                </div>
                <span className="text-3xl font-bold text-orange-600">{total}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 dark:bg-green-950/40 px-2 py-1.5 rounded">
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{counts.leaves}</p>
                    <p className="text-[10px] text-green-600 dark:text-green-400">Leaves</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 px-2 py-1.5 rounded">
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{counts.expenses}</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">Expenses</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/40 px-2 py-1.5 rounded">
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{counts.requests}</p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400">Requests</p>
                </div>
            </div>

            <p className="text-xs text-primary mt-3 group-hover:underline">
                Review all →
            </p>
        </Link>
    );
}

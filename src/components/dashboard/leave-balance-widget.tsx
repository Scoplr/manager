import { Palmtree } from "lucide-react";
import { getLeaveBalance } from "@/app/actions/leave";

export async function LeaveBalanceWidget() {
    // Balance is now fetched for the authenticated user automatically
    const balance = await getLeaveBalance();

    const casual = balance?.casual ?? 12;
    const sick = balance?.sick ?? 6;
    const privilege = balance?.privilege ?? 15;
    const total = casual + sick + privilege;
    const maxTotal = 33; // Default max

    return (
        <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
                <Palmtree className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Leave Balance</h3>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Days remaining</span>
                    <span className="font-bold">{total}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                        style={{ width: `${(total / maxTotal) * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-blue-50 px-2 py-2 rounded">
                    <p className="text-lg font-bold text-blue-700">{casual}</p>
                    <p className="text-blue-600">Casual</p>
                </div>
                <div className="bg-orange-50 px-2 py-2 rounded">
                    <p className="text-lg font-bold text-orange-700">{sick}</p>
                    <p className="text-orange-600">Sick</p>
                </div>
                <div className="bg-purple-50 px-2 py-2 rounded">
                    <p className="text-lg font-bold text-purple-700">{privilege}</p>
                    <p className="text-purple-600">Privilege</p>
                </div>
            </div>
        </div>
    );
}

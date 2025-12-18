import Link from "next/link";
import { Clock, Palmtree, Receipt, FileText } from "lucide-react";
import { getPendingLeaves } from "@/app/actions/leave";

export async function MyPendingRequestsWidget() {
    // Get pending leaves - in production would filter by current user
    const pendingLeaves = await getPendingLeaves();
    const myPending = pendingLeaves.slice(0, 3); // Would normally filter by userId

    const totalPending = myPending.length; // + pendingExpenses + pendingRequests

    if (totalPending === 0) {
        return (
            <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">My Pending Requests</h3>
                </div>
                <div className="text-center py-4">
                    <div className="text-3xl mb-1">📭</div>
                    <p className="text-muted-foreground text-sm">No pending requests</p>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">My Pending Requests</h3>
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {totalPending} awaiting
                </span>
            </div>

            <div className="space-y-2">
                {myPending.map(leave => (
                    <div key={leave.id} className="flex items-center gap-3 p-2 -mx-2 rounded bg-orange-50">
                        <Palmtree className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{leave.type} Leave</p>
                            <p className="text-xs text-muted-foreground">Submitted for review</p>
                        </div>
                        <span className="text-xs text-orange-600">Pending</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

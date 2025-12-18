import Link from "next/link";
import { AlertCircle, Clock, Calendar, FileText } from "lucide-react";
import { getPendingLeaves } from "@/app/actions/leave";
import { getUsers } from "@/app/actions/people";

export async function ActionRequiredWidget() {
    const pendingLeaves = await getPendingLeaves();
    const users = await getUsers();

    // Find probation reviews (users joined < 90 days ago - simplified check)
    const now = new Date();
    const probationReviews = users.filter(u => {
        if (!u.joinedAt) return false;
        const joinDate = new Date(u.joinedAt);
        const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceJoin >= 80 && daysSinceJoin <= 100; // Near 90-day mark
    });

    const totalActions = pendingLeaves.length + probationReviews.length;

    if (totalActions === 0) {
        return (
            <div className="border rounded-lg p-6 bg-card">
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Action Required</h3>
                </div>
                <div className="text-center py-4">
                    <div className="text-3xl mb-1">✅</div>
                    <p className="text-muted-foreground text-sm">No urgent actions</p>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Action Required</h3>
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                    {totalActions} items
                </span>
            </div>

            <div className="space-y-2">
                {pendingLeaves.length > 0 && (
                    <Link href="/approvals" className="flex items-center gap-3 p-2 -mx-2 rounded bg-orange-50 hover:bg-orange-100 transition-colors">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Pending Leaves</p>
                            <p className="text-xs text-muted-foreground">{pendingLeaves.length} awaiting approval</p>
                        </div>
                    </Link>
                )}

                {probationReviews.length > 0 && (
                    <Link href="/team" className="flex items-center gap-3 p-2 -mx-2 rounded bg-blue-50 hover:bg-blue-100 transition-colors">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Probation Reviews</p>
                            <p className="text-xs text-muted-foreground">{probationReviews.length} coming up</p>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}

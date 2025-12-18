import { getActivityFeed } from "@/app/actions/activity";
import { Activity } from "lucide-react";
import { requireAnyRole } from "@/lib/role-guards";
import { format } from "date-fns";

export default async function WorkspaceActivityPage() {
    await requireAnyRole(["admin"], "/workspace");

    const activities = await getActivityFeed(50);

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{activities.length} recent activities</p>

            <div className="space-y-2">
                {activities.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                        No activity logged yet.
                    </div>
                ) : (
                    activities.map((activity: any) => (
                        <div
                            key={activity.id}
                            className="p-3 bg-card border rounded-lg flex items-center gap-3"
                        >
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">
                                    <span className="font-medium">{activity.userName || "System"}</span>
                                    {" "}{activity.action}{" "}
                                    <span className="text-muted-foreground">{activity.entityType}</span>
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(activity.createdAt), "MMM d, HH:mm")}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

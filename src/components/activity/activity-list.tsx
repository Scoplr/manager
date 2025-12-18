"use client";

import { formatDistanceToNow } from "date-fns";
import { FileText, CheckCircle, User, Calendar, Package, DollarSign, MessageSquare, AlertTriangle, Bell } from "lucide-react";

const entityIcons: Record<string, any> = {
    task: CheckCircle,
    document: FileText,
    user: User,
    leave: Calendar,
    asset: Package,
    expense: DollarSign,
    feedback: MessageSquare,
    risk: AlertTriangle,
};

const actionColors: Record<string, string> = {
    created: "text-green-600",
    updated: "text-blue-600",
    deleted: "text-red-600",
    approved: "text-emerald-600",
    rejected: "text-red-600",
    completed: "text-purple-600",
    joined: "text-cyan-600",
};

export function ActivityList({ activities }: { activities: any[] }) {
    if (activities.length === 0) {
        return (
            <div className="border rounded-lg p-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No activity yet.</p>
                <p className="text-sm text-muted-foreground">Actions will appear here as people use the platform.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg divide-y">
            {activities.map((activity) => {
                const Icon = entityIcons[activity.entityType] || Bell;
                const actionColor = actionColors[activity.action] || "text-muted-foreground";

                return (
                    <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    {activity.actorName && (
                                        <span className="font-medium">{activity.actorName}</span>
                                    )}
                                    {" "}
                                    <span className={actionColor}>{activity.action}</span>
                                    {" "}
                                    <span className="text-muted-foreground">{activity.description}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

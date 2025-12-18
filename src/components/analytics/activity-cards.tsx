import { CheckCircle, Calendar, MessageSquare, UserPlus } from "lucide-react";

export function ActivityCards({ activity }: { activity: any }) {
    const cards = [
        {
            label: "Tasks This Week",
            value: activity.tasksCompletedWeek,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            label: "Tasks This Month",
            value: activity.tasksCompletedMonth,
            icon: CheckCircle,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            label: "Active Leaves",
            value: activity.activeLeaves,
            icon: Calendar,
            color: "text-orange-600",
            bg: "bg-orange-100"
        },
        {
            label: "Feedback Given",
            value: activity.feedbackMonth,
            icon: MessageSquare,
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            label: "Onboarding",
            value: activity.activeOnboarding,
            icon: UserPlus,
            color: "text-indigo-600",
            bg: "bg-indigo-100"
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <div key={i} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full ${card.bg} flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{card.value}</p>
                                <p className="text-xs text-muted-foreground">{card.label}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

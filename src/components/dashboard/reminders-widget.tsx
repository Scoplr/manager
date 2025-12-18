import { getReminders } from "@/app/actions/reminders";
import { Bell, AlertTriangle, Clock, DollarSign, Package, User, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const typeIcons: Record<string, any> = {
    leave_pending: Clock,
    task_overdue: AlertTriangle,
    expense_pending: DollarSign,
    asset_renewal: Package,
    probation_ending: User,
    contract_ending: FileText,
};

const typeLinks: Record<string, string> = {
    leave_pending: "/leaves",
    task_overdue: "/tasks",
    expense_pending: "/expenses",
    asset_renewal: "/assets",
    probation_ending: "/team",
    contract_ending: "/team",
};

const priorityStyles: Record<string, string> = {
    urgent: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40",
    high: "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40",
    normal: "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/40",
    low: "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40",
};

export async function RemindersWidget() {
    const reminders = await getReminders();

    if (reminders.length === 0) {
        return (
            <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Reminders</h3>
                </div>
                <p className="text-sm text-muted-foreground text-center py-4">
                    ✨ All caught up! No pending items.
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Reminders</h3>
                </div>
                <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">
                    {reminders.length}
                </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {reminders.slice(0, 8).map((reminder) => {
                    const Icon = typeIcons[reminder.type] || Bell;
                    const link = typeLinks[reminder.type] || "/";

                    return (
                        <Link
                            key={reminder.id}
                            href={link}
                            className={`block p-2 rounded border ${priorityStyles[reminder.priority]} hover:opacity-80 transition-opacity`}
                        >
                            <div className="flex items-start gap-2">
                                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">{reminder.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{reminder.description}</p>
                                    {reminder.dueDate && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatDistanceToNow(reminder.dueDate, { addSuffix: true })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

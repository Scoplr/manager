"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, Check, Info, Palmtree, Receipt, CheckSquare, Megaphone, Settings2, Filter, RefreshCw } from "lucide-react";
import { markNotificationAsRead, markAllAsRead } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: "leave" | "expense" | "task" | "announcement" | "system";
    title: string;
    message: string | null;
    read: boolean;
    createdAt: Date;
}

interface NotificationsListClientProps {
    notifications: Notification[];
}

const typeIcons = {
    leave: Palmtree,
    expense: Receipt,
    task: CheckSquare,
    announcement: Megaphone,
    system: Settings2,
};

const typeColors = {
    leave: "text-green-500 bg-green-100 dark:bg-green-900/50 dark:text-green-400",
    expense: "text-amber-500 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-400",
    task: "text-blue-500 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400",
    announcement: "text-purple-500 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-400",
    system: "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
};

const typeLabels = {
    leave: "Leave",
    expense: "Expense",
    task: "Task",
    announcement: "Announcement",
    system: "System",
};

export function NotificationsListClient({ notifications: initialNotifications }: NotificationsListClientProps) {
    const router = useRouter();
    const [notifications, setNotifications] = useState(initialNotifications);
    const [filterType, setFilterType] = useState<string>("");
    const [filterRead, setFilterRead] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filterType && n.type !== filterType) return false;
        if (filterRead === "unread" && n.read) return false;
        if (filterRead === "read" && !n.read) return false;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    async function handleMarkAsRead(id: string) {
        await markNotificationAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        router.refresh();
    }

    async function handleMarkAllAsRead() {
        setLoading(true);
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
        setLoading(false);
        router.refresh();
    }



    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                <Filter className="w-4 h-4 text-muted-foreground" />

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-sm bg-background border rounded px-3 py-1.5"
                >
                    <option value="">All Types</option>
                    <option value="leave">Leave</option>
                    <option value="expense">Expense</option>
                    <option value="task">Task</option>
                    <option value="announcement">Announcement</option>
                    <option value="system">System</option>
                </select>

                <select
                    value={filterRead}
                    onChange={(e) => setFilterRead(e.target.value)}
                    className="text-sm bg-background border rounded px-3 py-1.5"
                >
                    <option value="">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                </select>

                <div className="flex-1" />

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={loading}
                        className="text-sm text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Mark all read ({unreadCount})
                    </button>
                )}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="border rounded-xl p-12 text-center bg-card">
                    <div className="h-16 w-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-muted-foreground text-sm">
                        {filterType || filterRead ? "No notifications match your filters." : "You're all caught up!"}
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden bg-card divide-y">
                    {filteredNotifications.map((notification) => {
                        const Icon = typeIcons[notification.type] || Info;
                        const colorClass = typeColors[notification.type] || typeColors.system;

                        return (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                            >
                                <div className="flex gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {typeLabels[notification.type]} • {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                        {notification.message && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Summary */}
            <p className="text-xs text-muted-foreground text-center">
                Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
        </div>
    );
}

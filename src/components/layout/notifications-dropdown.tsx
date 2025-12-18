"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Palmtree, Receipt, CheckSquare, Megaphone, Settings2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { markNotificationAsRead, markAllAsRead } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    type: "leave" | "expense" | "task" | "announcement" | "system";
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

interface NotificationsDropdownProps {
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

export function NotificationsDropdown({ notifications }: NotificationsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localNotifications, setLocalNotifications] = useState(notifications);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const unreadCount = localNotifications.filter(n => !n.read).length;

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        setLocalNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        router.refresh();
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
        router.refresh();
    };



    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md hover:bg-muted relative transition-colors"
            >
                <Bell className="w-4 h-4 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {localNotifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No notifications</p>
                            </div>
                        ) : (
                            localNotifications.slice(0, 10).map((notification) => {
                                const Icon = typeIcons[notification.type] || Settings2;
                                const colorClass = typeColors[notification.type] || typeColors.system;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                                                        {notification.title}
                                                    </p>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {!notification.read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="p-1 hover:bg-muted rounded"
                                                                title="Mark as read"
                                                            >
                                                                <Check className="w-3 h-3 text-green-600" />
                                                            </button>
                                                        )}

                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {localNotifications.length > 0 && (
                        <div className="p-2 border-t bg-muted/30">
                            <a
                                href="/notifications"
                                className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                View all notifications
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

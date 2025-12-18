"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllAsRead } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    async function fetchNotifications() {
        const data = await getNotifications();
        setItems(data);
        setUnreadCount(data.filter(i => !i.read).length);
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // 1 min poll
        return () => clearInterval(interval);
    }, []);

    async function handleMarkRead(id: string) {
        await markNotificationAsRead(id);
        fetchNotifications();
    }

    async function handleMarkAll() {
        await markAllAsRead();
        fetchNotifications();
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-600 rounded-full border border-white" />
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                        <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAll} className="text-xs text-blue-600 hover:underline">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No notifications
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "p-3 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3",
                                            !item.read && "bg-blue-50/50"
                                        )}
                                        onClick={() => handleMarkRead(item.id)}
                                    >
                                        <div className="mt-1">
                                            {item.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                            {item.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                                            {item.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                                            {item.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("text-sm font-medium", !item.read && "text-blue-900")}>{item.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{item.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!item.read && (
                                            <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

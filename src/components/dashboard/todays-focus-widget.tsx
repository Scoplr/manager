"use client";

import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

interface Task {
    id: string;
    title: string;
    dueDate: Date | null;
    priority: string;
    status: string;
}

interface TodaysFocusWidgetProps {
    tasks: Task[];
    userName: string;
}

export function TodaysFocusWidget({ tasks, userName }: TodaysFocusWidgetProps) {
    const firstName = userName?.split(" ")[0] || "there";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const dueTodayTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const today = new Date();
        const due = new Date(t.dueDate);
        return due.toDateString() === today.toDateString();
    });

    const overdueTasks = tasks.filter(t => {
        if (!t.dueDate || t.status === "done") return false;
        return new Date(t.dueDate) < new Date();
    });

    return (
        <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {greeting}, {firstName}! 👋
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Here's what's on your plate today
                    </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                    <CalendarDays className="inline-block w-4 h-4 mr-1" />
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric"
                    })}
                </div>
            </div>

            {overdueTasks.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        ⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""} need attention
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Due Today ({dueTodayTasks.length})
                </h3>
                {dueTodayTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                        ✨ No tasks due today. You're all caught up!
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {dueTodayTasks.slice(0, 5).map(task => (
                            <li key={task.id}>
                                <Link
                                    href={`/tasks/${task.id}`}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors group"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                    <span className="flex-1 text-sm font-medium truncate">
                                        {task.title}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                            task.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                        }`}>
                                        {task.priority}
                                    </span>
                                </Link>
                            </li>
                        ))}
                        {dueTodayTasks.length > 5 && (
                            <li>
                                <Link href="/tasks" className="text-sm text-primary hover:underline">
                                    + {dueTodayTasks.length - 5} more tasks →
                                </Link>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

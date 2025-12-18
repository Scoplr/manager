"use client";

import { useState, useTransition } from "react";
import { updateTaskStatus, deleteTask } from "@/app/actions/tasks";
import { CheckCircle2, Circle, Clock, Trash2, AlertTriangle, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, isPast, isToday, addDays, isBefore } from "date-fns";

import { Badge } from "@/components/ui/badge";

interface TaskItemProps {
    task: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        priority: "low" | "medium" | "high" | "urgent";
        dueDate?: Date | null;
        assigneeName?: string | null;
    };
}

const statusOptions = [
    { value: "todo", label: "To Do", icon: Circle, color: "text-gray-500" },
    { value: "in-progress", label: "In Progress", icon: Clock, color: "text-blue-500" },
    { value: "done", label: "Done", icon: CheckCircle2, color: "text-green-500" },
];

export function TaskItem({ task }: TaskItemProps) {
    const [isPending, startTransition] = useTransition();
    const [showDropdown, setShowDropdown] = useState(false);

    const isCompleted = task.status === "done";
    const currentStatus = statusOptions.find(s => s.value === task.status) || statusOptions[0];
    const StatusIcon = currentStatus.icon;

    // Due date warnings
    const getDueDateStatus = () => {
        if (!task.dueDate || isCompleted) return null;
        const dueDate = new Date(task.dueDate);
        if (isPast(dueDate) && !isToday(dueDate)) return "overdue";
        if (isToday(dueDate)) return "today";
        if (isBefore(dueDate, addDays(new Date(), 3))) return "soon";
        return null;
    };

    const dueDateStatus = getDueDateStatus();

    const handleStatusChange = (newStatus: string) => {
        setShowDropdown(false);
        startTransition(() => {
            updateTaskStatus(task.id, newStatus);
        });
    };

    return (
        <div className={`flex items-start justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:bg-accent/50 ${isPending ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-3 flex-1">
                {/* Status Dropdown */}
                <div className="relative mt-0.5">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`${currentStatus.color} hover:opacity-80 transition-opacity`}
                        disabled={isPending}
                    >
                        <StatusIcon className="h-5 w-5" />
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDropdown(false)}
                            />
                            <div className="absolute left-0 top-7 z-20 bg-popover border rounded-lg shadow-lg py-1 min-w-[140px]">
                                {statusOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleStatusChange(option.value)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${task.status === option.value ? 'bg-muted' : ''}`}
                                        >
                                            <Icon className={`h-4 w-4 ${option.color}`} />
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/tasks/${task.id}`} className="hover:underline">
                            <span className={`font-medium ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                {task.title}
                            </span>
                        </Link>
                        <Badge variant={task.priority}>{task.priority}</Badge>

                        {/* Due Date Badge */}
                        {task.dueDate && !isCompleted && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${dueDateStatus === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    dueDateStatus === 'today' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                        dueDateStatus === 'soon' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {dueDateStatus === 'overdue' && <AlertTriangle className="h-3 w-3" />}
                                {dueDateStatus === 'overdue' ? 'Overdue' :
                                    dueDateStatus === 'today' ? 'Due today' :
                                        formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                            </span>
                        )}

                        {/* Assignee inline */}
                        {task.assigneeName && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {task.assigneeName}
                            </span>
                        )}
                    </div>

                    {task.description && (
                        <p className={`text-sm line-clamp-1 ${isCompleted ? "text-muted-foreground/50 line-through" : "text-muted-foreground"}`}>
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            <button
                onClick={() => deleteTask(task.id)}
                className="text-muted-foreground/30 hover:text-destructive transition-colors ml-2"
                aria-label="Delete task"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

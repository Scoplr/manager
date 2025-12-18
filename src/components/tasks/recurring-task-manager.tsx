"use client";

import { useState } from "react";
import { createRecurringTask, stopRecurringTask, RecurringTask } from "@/app/actions/recurring-tasks";
import { Loader2, Plus, Repeat, CalendarX } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string | null;
}

export function RecurringTaskManager({
    tasks,
    users
}: {
    tasks: RecurringTask[];
    users: User[];
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [priority, setPriority] = useState("medium");
    const [pattern, setPattern] = useState("weekly");
    const [interval, setInterval] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleCreate() {
        if (!title) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("recurrencePattern", pattern);
            formData.append("recurrenceInterval", interval.toString());
            formData.append("priority", priority);
            if (assigneeId) formData.append("assigneeId", assigneeId);
            // Default start date to now implies first task created immediately or per logic

            const result = await createRecurringTask(formData);
            if (result.success) {
                setIsCreating(false);
                setTitle("");
                setAssigneeId("");
                router.refresh();
            } else if (result.error) {
                alert(result.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStop(id: string) {
        if (!confirm("Stop this recurring task? No further instances will be created.")) return;
        await stopRecurringTask(id);
        router.refresh();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recurring Task Templates</h2>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" /> New Recurring Task
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <h3 className="font-medium">Define Recurrence</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Task Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Weekly Status Report"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Assignee (Optional)</label>
                            <select
                                value={assigneeId}
                                onChange={e => setAssigneeId(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Unassigned</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Repeat Every</label>
                            <input
                                type="number"
                                min="1"
                                value={interval}
                                onChange={e => setInterval(parseInt(e.target.value) || 1)}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Period</label>
                            <select
                                value={pattern}
                                onChange={e => setPattern(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="daily">Days</option>
                                <option value="weekly">Weeks</option>
                                <option value="monthly">Months</option>
                                <option value="yearly">Years</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-3 py-2 text-sm hover:underline"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!title || loading}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                            Create Schedule
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
                        No recurring tasks scheduled.
                    </div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className={`p-4 border rounded-lg bg-card shadow-sm ${!task.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Repeat className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{task.title}</h3>
                                            {!task.isActive && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-500">Stopped</span>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Repeats every {task.recurrenceInterval} {task.recurrencePattern}(s)
                                        </p>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Next due: {task.nextDueDate ? new Date(task.nextDueDate).toLocaleDateString() : 'N/A'}
                                            {task.assigneeName && ` • Assigned to ${task.assigneeName}`}
                                        </div>
                                    </div>
                                </div>
                                {task.isActive && (
                                    <button
                                        onClick={() => handleStop(task.id)}
                                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded"
                                        title="Stop Recurrence"
                                    >
                                        <CalendarX className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

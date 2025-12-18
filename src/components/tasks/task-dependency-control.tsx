"use client";

import { addTaskDependency, removeTaskDependency } from "@/app/actions/tasks";
import { useState, useTransition } from "react";
import { X, ShieldAlert, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Task {
    id: string;
    title: string;
    status: string;
}

interface Dependency {
    blockedId: string;
    blockerId: string;
    blockerTitle: string | null;
    blockerStatus: string | null;
}

interface Props {
    taskId: string;
    dependencies: Dependency[];
    availableTasks: Task[];
}

export function TaskDependencyControl({ taskId, dependencies, availableTasks }: Props) {
    const [isPending, startTransition] = useTransition();
    const [selectedBlocker, setSelectedBlocker] = useState("");
    const router = useRouter();

    const handleAdd = () => {
        if (!selectedBlocker) return;
        startTransition(async () => {
            await addTaskDependency(taskId, selectedBlocker);
            setSelectedBlocker("");
            router.refresh();
        });
    };

    const handleRemove = (blockerId: string) => {
        startTransition(async () => {
            await removeTaskDependency(taskId, blockerId);
            router.refresh();
        });
    };

    const potentialBlockers = availableTasks.filter(
        t => t.id !== taskId && !dependencies.some(d => d.blockerId === t.id)
    );

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-card">
            <h3 className="font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                Blockers / Dependencies
            </h3>

            <div className="space-y-2">
                {dependencies.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No blockers preventing this task.</p>
                )}
                {dependencies.map(dep => (
                    <div key={dep.blockerId} className="flex items-center justify-between text-sm p-2 bg-background/50 border rounded">
                        <span className={dep.blockerStatus === 'done' ? 'line-through text-muted-foreground' : ''}>
                            {dep.blockerTitle}
                        </span>
                        <button
                            onClick={() => handleRemove(dep.blockerId)}
                            disabled={isPending}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 pt-2">
                <select
                    className="flex-1 text-sm border rounded px-2 bg-background"
                    value={selectedBlocker}
                    onChange={(e) => setSelectedBlocker(e.target.value)}
                    disabled={isPending}
                >
                    <option value="">Select a task...</option>
                    {potentialBlockers.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
                <button
                    onClick={handleAdd}
                    disabled={!selectedBlocker || isPending}
                    className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Add
                </button>
            </div>
        </div>
    );
}

import { getTask, getTaskDependencies, getTasks } from "@/app/actions/tasks";
import { getComments } from "@/app/actions/comments";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Flag } from "lucide-react";
import { TaskDependencyControl } from "@/components/tasks/task-dependency-control";
import { CommentsSection } from "@/components/tasks/comments-section";
import { formatDistanceToNow } from "date-fns";

export default async function TaskDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [task, dependencies, allTasks, comments] = await Promise.all([
        getTask(id),
        getTaskDependencies(id),
        getTasks(),
        getComments(id),
    ]);

    if (!task) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <Link href="/tasks">Back to Tasks</Link>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${task.status === 'done' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                task.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}>
                                {task.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${task.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                task.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}>
                                {task.priority} Priority
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight bg-background">{task.title}</h1>
                    </div>

                    <div className="prose dark:prose-invert max-w-none border-t pt-4">
                        <p className="whitespace-pre-wrap">{task.description || "No description provided."}</p>
                    </div>

                    <div className="text-sm text-muted-foreground flex items-center gap-4 border-t pt-4">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                        </div>
                        {task.dueDate && (
                            <div className="flex items-center gap-1 text-orange-600">
                                <Flag className="w-4 h-4" />
                                Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <CommentsSection taskId={task.id} initialComments={comments} />
                </div>

                <div className="space-y-6">
                    <TaskDependencyControl
                        taskId={task.id}
                        dependencies={dependencies}
                        availableTasks={allTasks}
                    />
                </div>
            </div>
        </div>
    );
}

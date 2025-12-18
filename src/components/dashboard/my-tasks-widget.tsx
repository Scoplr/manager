import Link from "next/link";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { getTasks } from "@/app/actions/tasks";

export async function MyTasksWidget() {
    const allTasks = await getTasks();

    // Filter to just incomplete tasks (would normally use userId from session)
    const myTasks = allTasks.filter(t => t.status !== "done").slice(0, 5);
    const overdueTasks = myTasks.filter(t =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
    );

    return (
        <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">My Tasks</h3>
                </div>
                <Link href="/tasks" className="text-xs text-primary hover:underline">View all</Link>
            </div>

            {myTasks.length === 0 ? (
                <div className="text-center py-4">
                    <div className="text-3xl mb-1">✅</div>
                    <p className="text-muted-foreground text-sm">No tasks assigned</p>
                </div>
            ) : (
                <>
                    {overdueTasks.length > 0 && (
                        <div className="mb-3 px-2 py-1.5 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
                        </div>
                    )}
                    <div className="space-y-2">
                        {myTasks.slice(0, 4).map(task => (
                            <Link
                                key={task.id}
                                href={`/tasks/${task.id}`}
                                className="block p-2 -mx-2 rounded hover:bg-muted transition-colors"
                            >
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                    <span className={`px-1.5 py-0.5 rounded ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100'
                                        }`}>
                                        {task.priority}
                                    </span>
                                    <span>{task.status}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

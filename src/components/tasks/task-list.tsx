import { getTasks } from "@/app/actions/tasks";
import { TaskItem } from "./task-item";

interface TaskListProps {
    searchParams?: {
        status?: string;
        priority?: string;
        dueStart?: string;
        dueEnd?: string;
        view?: string;
    }
}

export async function TaskList({ searchParams }: TaskListProps) {
    const filters = {
        status: searchParams?.status ? searchParams.status.split(',') : undefined,
        priority: searchParams?.priority ? searchParams.priority.split(',') : undefined,
        dateRange: {
            start: searchParams?.dueStart ? new Date(searchParams.dueStart) : undefined,
            end: searchParams?.dueEnd ? new Date(searchParams.dueEnd) : undefined,
        },
        showTeam: searchParams?.view === "team",
    };

    const tasks = await getTasks(filters);

    return (
        <div className="space-y-3">
            {tasks.length === 0 ? (
                <div className="border rounded-xl p-12 text-center bg-card">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                        Create your first task to get started tracking work.
                    </p>
                </div>
            ) : (
                tasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={{
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            status: task.status,
                            priority: task.priority,
                            dueDate: task.dueDate,
                            assigneeName: task.assigneeName,
                        }}
                    />
                ))
            )}
        </div>
    );
}

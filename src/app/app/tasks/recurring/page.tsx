import { getRecurringTasks } from "@/app/actions/recurring-tasks";
import { getUsers } from "@/app/actions/people";
import { RecurringTaskManager } from "@/components/tasks/recurring-task-manager";
import { PageHeader } from "@/components/ui/page-header";
import { Repeat } from "lucide-react";

export default async function RecurringTasksPage() {
    const [tasks, users] = await Promise.all([
        getRecurringTasks(),
        getUsers()
    ]);

    return (
        <div className="space-y-6 max-w-5xl">
            <PageHeader
                title="Recurring Tasks"
                description="Manage automated task schedules"
                icon="Calendar"
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
            />

            <RecurringTaskManager tasks={tasks} users={users} />
        </div>
    );
}

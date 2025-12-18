import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { TaskList } from "@/components/tasks/task-list";
import { Suspense } from "react";
import { getTags } from "@/app/actions/tags";
import { TaskFilters } from "@/components/tasks/task-filters";
import { PageHeader } from "@/components/ui/page-header";
import { CheckSquare, Repeat, Plus } from "lucide-react";
import { TasksExportButton } from "@/components/tasks/tasks-export-button";
import Link from "next/link";

type Props = {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function TasksPage(props: Props) {
    const searchParams = await props.searchParams;
    const tags = await getTags();

    return (
        <div>
            <div className="flex items-start justify-between gap-4 mb-6">
                <PageHeader
                    icon="CheckSquare"
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100"
                    title="Tasks"
                    description="Track work, set priorities, and assign to team members."
                    tip="Use tags to organize tasks by project. Filter by status or assignee to find what you need."
                />
                <div className="flex gap-2">
                    <a
                        href="#quick-add"
                        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </a>
                    <TasksExportButton />
                </div>
            </div>

            <TaskFilters tags={tags} />

            <div className="grid gap-6 lg:grid-cols-[1fr_320px] mt-6">
                <Suspense fallback={<div className="text-muted-foreground p-4">Loading tasks...</div>}>
                    <TaskList searchParams={searchParams} />
                </Suspense>
                <div className="lg:sticky lg:top-4 h-fit" id="quick-add">
                    <div className="border rounded-lg p-4 bg-card scroll-mt-6">
                        <h3 className="font-semibold mb-3">Quick Add</h3>
                        <CreateTaskForm availableTags={tags} />
                    </div>
                </div>
            </div>
        </div>
    );
}

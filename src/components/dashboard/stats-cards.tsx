import { CheckCircle2, Circle, FileText, ListTodo } from "lucide-react";

interface DashboardStats {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalDocs: number;
}

import Link from "next/link";

export function StatsCards({ stats }: { stats: DashboardStats }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/tasks" className="block transition-transform hover:scale-[1.02]">
                <div className="rounded-lg border-2 border-border bg-card text-card-foreground p-6 flex flex-row items-center justify-between space-y-0 pb-2 h-full cursor-pointer hover:border-primary/50">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground font-serif italic">Total Tasks</p>
                        <div className="text-3xl font-bold font-serif">{stats.totalTasks}</div>
                    </div>
                    <ListTodo className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
            </Link>

            <Link href="/tasks?status=in-progress" className="block transition-transform hover:scale-[1.02]">
                <div className="rounded-lg border-2 border-border bg-card text-card-foreground p-6 flex flex-row items-center justify-between space-y-0 pb-2 h-full cursor-pointer hover:border-orange-500/50">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground font-serif italic">Pending</p>
                        <div className="text-3xl font-bold font-serif">{stats.pendingTasks}</div>
                    </div>
                    <Circle className="h-8 w-8 text-orange-500 opacity-50" />
                </div>
            </Link>

            <Link href="/tasks?status=done" className="block transition-transform hover:scale-[1.02]">
                <div className="rounded-lg border-2 border-border bg-card text-card-foreground p-6 flex flex-row items-center justify-between space-y-0 pb-2 h-full cursor-pointer hover:border-green-500/50">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground font-serif italic">Completed</p>
                        <div className="text-3xl font-bold font-serif">{stats.completedTasks}</div>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                </div>
            </Link>

            <Link href="/knowledge" className="block transition-transform hover:scale-[1.02]">
                <div className="rounded-lg border-2 border-border bg-card text-card-foreground p-6 flex flex-row items-center justify-between space-y-0 pb-2 h-full cursor-pointer hover:border-blue-500/50">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground font-serif italic">Documents</p>
                        <div className="text-3xl font-bold font-serif">{stats.totalDocs}</div>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
            </Link>
        </div>
    );
}

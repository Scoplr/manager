import { PageHeader } from "@/components/ui/page-header";
import { getProjects } from "@/app/actions/projects";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Projects"
                    description="Manage your team's projects and track progress"
                    icon="Briefcase"
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100"
                />
                <Link
                    href="/projects/new"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Link>
            </div>

            {projects.length === 0 ? (
                <EmptyState
                    icon="Briefcase"
                    title="No projects found"
                    description="Get started by creating your first project."
                    action={{ label: "Create Project", href: "/projects/new" }}
                />
            ) : (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Owner</th>
                                    <th className="px-4 py-3 font-medium">Due Date</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: project.color || '#3b82f6' }}
                                                />
                                                <Link href={`/projects/${project.id}`} className="hover:underline">
                                                    {project.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${project.status === 'active'
                                                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-green-600/20'
                                                : project.status === 'completed'
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-blue-600/20'
                                                    : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                }`}>
                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{project.ownerName || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/projects/${project.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800 mr-4"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

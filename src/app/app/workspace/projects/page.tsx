import { getProjects } from "@/app/actions/projects";
import { Briefcase } from "lucide-react";
import Link from "next/link";

export default async function WorkspaceProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{projects.length} projects</p>
                <Link
                    href="/projects/new"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    New Project
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {projects.length === 0 ? (
                    <div className="col-span-full p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                        No projects yet.
                    </div>
                ) : (
                    projects.map((project: any) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-medium">{project.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {project.description || "No description"}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

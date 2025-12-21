import { ProjectForm } from "@/components/projects/project-form";
import { getUsers } from "@/app/actions/people";
import { getProject } from "@/app/actions/projects";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Briefcase } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditProjectPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const [users, project] = await Promise.all([
        getUsers(),
        getProject(id)
    ]);

    if (!project) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs items={[
                { label: "Projects", href: "/projects" },
                { label: project.name },
                { label: "Edit" }
            ]} />
            <PageHeader
                title="Edit Project"
                description={`Update details for ${project.name}`}
                icon="Briefcase"
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
            />
            <ProjectForm users={users} project={project} />
        </div>
    );
}

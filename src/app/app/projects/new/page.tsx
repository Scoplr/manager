import { ProjectForm } from "@/components/projects/project-form";
import { getUsers } from "@/app/actions/people";
import { PageHeader } from "@/components/ui/page-header";
import { Briefcase } from "lucide-react";

export default async function NewProjectPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Project"
                description="Start a new initiative"
                icon="Briefcase"
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
            />
            <ProjectForm users={users} />
        </div>
    );
}

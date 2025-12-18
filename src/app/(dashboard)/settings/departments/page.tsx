import { getDepartments } from "@/app/actions/config";
import { getUsers } from "@/app/actions/people";
import { PageHeader } from "@/components/ui/page-header";
import { DepartmentsList } from "@/components/settings/departments-list";
import { DepartmentForm } from "@/components/settings/department-form";
import { Users } from "lucide-react";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
    const departments = await getDepartments();
    const users = await getUsers();

    // Serialize for client components
    const serializedUsers = JSON.parse(JSON.stringify(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
    }))));

    const serializedDepts = JSON.parse(JSON.stringify(departments));

    return (
        <div>
            <PageHeader
                icon="Users"
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
                title="Departments"
                description="Manage team structure and capacity rules."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                <DepartmentsList departments={serializedDepts} />
                <div className="lg:sticky lg:top-4 h-fit">
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-3">Add Department</h3>
                        <DepartmentForm users={serializedUsers} />
                    </div>
                </div>
            </div>
        </div>
    );
}

import { OffboardingForm } from "@/components/offboarding/offboarding-form";
import { getUsers } from "@/app/actions/people";
import { getOffboardingTemplates } from "@/app/actions/offboarding";
import { PageHeader } from "@/components/ui/page-header";
import { UserMinus } from "lucide-react";

export default async function StartOffboardingPage() {
    const [users, templates] = await Promise.all([
        getUsers(),
        getOffboardingTemplates()
    ]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Start Offboarding"
                description="Initiate exit process for an employee"
                icon="UserMinus"
                iconColor="text-red-600"
                iconBg="bg-red-100"
            />
            <OffboardingForm users={users} templates={templates} />
        </div>
    );
}

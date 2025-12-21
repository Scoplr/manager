import { getOnboardingTemplates, getOnboardingProgress } from "@/app/actions/onboarding";
import { getUsers } from "@/app/actions/people";
import { CreateTemplateForm } from "@/components/onboarding/create-template-form";
import { TemplatesList } from "@/components/onboarding/templates-list";
import { ProgressList } from "@/components/onboarding/progress-list";
import { StartOnboardingButton } from "@/components/onboarding/start-button";
import { requireAnyRole } from "@/lib/role-guards";

export default async function PeopleOnboardingPage() {
    await requireAnyRole(["hr", "admin"], "/people");

    const templates = await getOnboardingTemplates();
    const progress = await getOnboardingProgress();
    const users = await getUsers();

    const usersInOnboarding = progress.map(p => p.userId);
    const availableUsers = users.filter(u => !usersInOnboarding.includes(u.id));

    return (
        <div className="space-y-6">
            {/* Active Onboardings */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Active Onboardings</h2>
                    {templates.length > 0 && availableUsers.length > 0 && (
                        <StartOnboardingButton templates={templates} users={availableUsers} />
                    )}
                </div>
                <ProgressList progress={progress} />
            </div>

            {/* Templates */}
            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                <div>
                    <h2 className="text-lg font-semibold mb-4">Templates</h2>
                    <TemplatesList templates={templates} />
                </div>
                <div className="border rounded-lg p-5 bg-card h-fit">
                    <h3 className="font-semibold mb-3">Create Template</h3>
                    <CreateTemplateForm />
                </div>
            </div>
        </div>
    );
}

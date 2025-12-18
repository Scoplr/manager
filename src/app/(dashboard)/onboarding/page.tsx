import { getOnboardingTemplates, getOnboardingProgress } from "@/app/actions/onboarding";
import { getUsers } from "@/app/actions/people";
import { CreateTemplateForm } from "@/components/onboarding/create-template-form";
import { TemplatesList } from "@/components/onboarding/templates-list";
import { ProgressList } from "@/components/onboarding/progress-list";
import { StartOnboardingButton } from "@/components/onboarding/start-button";
import { UserPlus } from "lucide-react";
import { requireAnyRole } from "@/lib/role-guards";

export default async function OnboardingPage() {
    // Only HR and Admin can access onboarding
    await requireAnyRole(["hr", "admin"], "/");

    const templates = await getOnboardingTemplates();
    const progress = await getOnboardingProgress();
    const users = await getUsers();

    // Users not in onboarding
    const usersInOnboarding = progress.map(p => p.userId);
    const availableUsers = users.filter(u => !usersInOnboarding.includes(u.id));

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserPlus className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
                    <p className="text-muted-foreground">Guide new hires through their first days.</p>
                </div>
            </div>

            {/* Active Onboardings */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Active Onboardings</h2>
                    {templates.length > 0 && availableUsers.length > 0 && (
                        <StartOnboardingButton templates={templates} users={availableUsers} />
                    )}
                </div>
                <ProgressList progress={progress} />
            </div>

            {/* Templates */}
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Onboarding Templates</h2>
                    <TemplatesList templates={templates} />
                </div>
                <div className="border rounded-lg p-6 bg-card h-fit">
                    <h2 className="font-semibold mb-4">Create Template</h2>
                    <CreateTemplateForm />
                </div>
            </div>
        </div>
    );
}

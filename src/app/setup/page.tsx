import { ModuleSetupWizard } from "@/components/setup/module-setup-wizard";
import { getOrganizationSettings } from "@/app/actions/organization";
import { redirect } from "next/navigation";

export default async function SetupPage() {
    // Check if setup is already completed
    const settings = await getOrganizationSettings();

    if (settings?.setupCompleted) {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Welcome to wrkspace
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Let's set up your workspace in under a minute
                    </p>
                </div>
                <ModuleSetupWizard />
            </div>
        </div>
    );
}

import { TemplateForm } from "@/components/offboarding/template-form";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardList } from "lucide-react";

export default function NewOffboardingTemplatePage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Offboarding Template"
                description="Design an exit process workflow"
                icon="ClipboardList"
                iconColor="text-red-600"
                iconBg="bg-red-100"
            />
            <TemplateForm />
        </div>
    );
}

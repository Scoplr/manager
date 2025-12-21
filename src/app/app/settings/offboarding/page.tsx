import { getOffboardingTemplates } from "@/app/actions/offboarding";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default async function OffboardingSettingsPage() {
    const templates = await getOffboardingTemplates();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Offboarding Templates"
                    description="Manage exit process workflows"
                    icon="ClipboardList"
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                />
                <Link
                    href="/settings/offboarding/new"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                </Link>
            </div>

            {templates.length === 0 ? (
                <EmptyState
                    icon="FileText"
                    title="No templates"
                    description="Create your first offboarding template to standardize employee exits."
                    action={{ label: "Create Template", href: "/settings/offboarding/new" }}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map(template => (
                        <div key={template.id} className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                            <div className="text-xs text-muted-foreground flex items-center justify-between">
                                <span>{(template.steps?.length || 0)} Steps</span>
                                <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

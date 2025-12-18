"use client";

import { deleteOnboardingTemplate } from "@/app/actions/onboarding";
import { Trash2, FileText, CheckSquare, List } from "lucide-react";
import { useRouter } from "next/navigation";

const typeIcons = {
    task: CheckSquare,
    document: FileText,
    checklist: List,
};

export function TemplatesList({ templates }: { templates: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Delete this template?")) {
            await deleteOnboardingTemplate(id);
            router.refresh();
        }
    }

    if (templates.length === 0) {
        return (
            <div className="border rounded-lg p-6 bg-card">
                <p className="text-muted-foreground mb-4">No templates yet. Here are some best practice examples to get started:</p>
                <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-muted/30">
                        <h4 className="font-medium mb-2">📋 Standard Employee Onboarding</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>✓ Complete new hire paperwork</li>
                            <li>✓ Set up work email and accounts</li>
                            <li>✓ Meet with manager (30 min)</li>
                            <li>✓ Review company handbook</li>
                            <li>✓ Complete IT security training</li>
                        </ul>
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30">
                        <h4 className="font-medium mb-2">💻 Developer Onboarding</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>✓ Clone repositories and set up dev environment</li>
                            <li>✓ Review codebase architecture docs</li>
                            <li>✓ Pair programming session with buddy</li>
                            <li>✓ Complete first starter task</li>
                        </ul>
                    </div>
                    <div className="border rounded-lg p-4 bg-muted/30">
                        <h4 className="font-medium mb-2">🤝 Manager Onboarding</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>✓ Meet each team member (1:1s)</li>
                            <li>✓ Review team OKRs and roadmap</li>
                            <li>✓ Set up recurring team meetings</li>
                            <li>✓ Shadow key processes</li>
                        </ul>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Use the form on the right to create your own template →</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template: any) => {
                const steps = template.steps as any[] || [];
                return (
                    <div key={template.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            <button
                                onClick={() => handleDelete(template.id)}
                                className="text-muted-foreground hover:text-red-600 p-1"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        {template.description && (
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        )}
                        <div className="space-y-1">
                            {steps.slice(0, 4).map((step: any, i: number) => {
                                const Icon = typeIcons[step.type as keyof typeof typeIcons] || CheckSquare;
                                return (
                                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Icon className="h-3 w-3" />
                                        <span>{step.title}</span>
                                    </div>
                                );
                            })}
                            {steps.length > 4 && (
                                <p className="text-xs text-muted-foreground">+{steps.length - 4} more steps</p>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            {steps.length} step{steps.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

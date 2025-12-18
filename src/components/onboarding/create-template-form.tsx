"use client";

import { useState } from "react";
import { createOnboardingTemplate } from "@/app/actions/onboarding";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Step = {
    title: string;
    description: string;
    type: "task" | "document" | "checklist";
    required: boolean;
};

export function CreateTemplateForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [steps, setSteps] = useState<Step[]>([]);
    const router = useRouter();

    function addStep() {
        setSteps([...steps, { title: "", description: "", type: "task", required: true }]);
    }

    function removeStep(index: number) {
        setSteps(steps.filter((_, i) => i !== index));
    }

    function updateStep(index: number, field: keyof Step, value: any) {
        const updated = [...steps];
        updated[index] = { ...updated[index], [field]: value };
        setSteps(updated);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set("steps", JSON.stringify(steps));

        await createOnboardingTemplate(formData);
        e.currentTarget.reset();
        setSteps([]);
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                name="name"
                placeholder="Template name..."
                className="w-full border rounded-md p-2 bg-background text-sm"
                required
            />
            <textarea
                name="description"
                placeholder="Description (optional)..."
                rows={2}
                className="w-full border rounded-md p-2 bg-background text-sm resize-none"
            />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Steps</label>
                    <button
                        type="button"
                        onClick={addStep}
                        className="text-xs text-blue-600 flex items-center gap-1"
                    >
                        <Plus className="h-3 w-3" /> Add Step
                    </button>
                </div>

                {steps.map((step, i) => (
                    <div key={i} className="border rounded p-2 space-y-2 bg-muted/20">
                        <div className="flex gap-2">
                            <input
                                placeholder={`Step ${i + 1} title`}
                                value={step.title}
                                onChange={(e) => updateStep(i, "title", e.target.value)}
                                className="flex-1 border rounded px-2 py-1 text-sm bg-background"
                                required
                            />
                            <button type="button" onClick={() => removeStep(i)} className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={step.type}
                                onChange={(e) => updateStep(i, "type", e.target.value)}
                                className="border rounded px-2 py-1 text-xs bg-background"
                            >
                                <option value="task">Task</option>
                                <option value="document">Document</option>
                                <option value="checklist">Checklist</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs">
                                <input
                                    type="checkbox"
                                    checked={step.required}
                                    onChange={(e) => updateStep(i, "required", e.target.checked)}
                                />
                                Required
                            </label>
                        </div>
                    </div>
                ))}
                {steps.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">No steps yet</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading || steps.length === 0}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Template
            </button>
        </form>
    );
}

"use client";

import { useFormStatus } from "react-dom";
import { createOffboardingTemplate } from "@/app/actions/offboarding";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type StepType = "task" | "checklist" | "document";
type Assignee = "hr" | "manager" | "it" | "employee";

interface Step {
    title: string;
    description: string;
    type: StepType;
    assignedTo: Assignee;
    required: boolean;
}

export function TemplateForm() {
    const [error, setError] = useState<string | null>(null);
    const [steps, setSteps] = useState<Step[]>([
        { title: "Exit Interview", description: "Conduct final interview", type: "task", assignedTo: "hr", required: true }
    ]);
    const router = useRouter();

    function addStep() {
        setSteps([...steps, { title: "", description: "", type: "task", assignedTo: "hr", required: true }]);
    }

    function removeStep(index: number) {
        setSteps(steps.filter((_, i) => i !== index));
    }

    function updateStep(index: number, field: keyof Step, value: any) {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    }

    async function handleSubmit(formData: FormData) {
        setError(null);
        // Append steps JSON
        formData.set("steps", JSON.stringify(steps));

        const result = await createOffboardingTemplate(formData);

        if (result.error) {
            setError(result.error);
        } else {
            router.push("/settings/offboarding");
            router.refresh();
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-3xl bg-card p-6 rounded-lg border shadow-sm">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Template Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="e.g. Standard Resignation"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                    name="description"
                    id="description"
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="For voluntary resignations..."
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Process Steps</h3>
                    <button
                        type="button"
                        onClick={addStep}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <Plus className="h-4 w-4" /> Add Step
                    </button>
                </div>

                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-3 items-start p-3 border rounded-md bg-muted/20">
                            <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={step.title}
                                        onChange={(e) => updateStep(index, "title", e.target.value)}
                                        placeholder="Step Title"
                                        required
                                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                                    />
                                    <select
                                        value={step.assignedTo}
                                        onChange={(e) => updateStep(index, "assignedTo", e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                                    >
                                        <option value="hr">HR</option>
                                        <option value="manager">Manager</option>
                                        <option value="it">IT</option>
                                        <option value="employee">Employee</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        value={step.type}
                                        onChange={(e) => updateStep(index, "type", e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                                    >
                                        <option value="task">Task</option>
                                        <option value="checklist">Checklist</option>
                                        <option value="document">Document</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={step.description}
                                        onChange={(e) => updateStep(index, "description", e.target.value)}
                                        placeholder="Description (optional)"
                                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeStep(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                    href="/settings/offboarding"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    Cancel
                </Link>
                <SubmitButton />
            </div>
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        >
            {pending ? "Saving..." : "Create Template"}
        </button>
    );
}

"use client";

import { useFormStatus } from "react-dom";
import { startOffboarding, OffboardingTemplate } from "@/app/actions/offboarding";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string | null;
}

export function OffboardingForm({
    users,
    templates
}: {
    users: User[];
    templates: OffboardingTemplate[];
}) {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setError(null);
        const result = await startOffboarding(formData);

        if (result.error) {
            setError(result.error);
        } else {
            router.push("/offboarding");
            router.refresh();
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-card p-6 rounded-lg border shadow-sm">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="userId" className="text-sm font-medium">Select Employee</label>
                <select
                    name="userId"
                    id="userId"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">Select an employee...</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="templateId" className="text-sm font-medium">Offboarding Template</label>
                <select
                    name="templateId"
                    id="templateId"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">Select a process template...</option>
                    {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.name}
                        </option>
                    ))}
                </select>
                {templates.length === 0 && (
                    <p className="text-xs text-amber-600">
                        No templates found. <Link href="/settings/offboarding" className="underline">Create a template first.</Link>
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="lastWorkingDay" className="text-sm font-medium">Last Working Day</label>
                <input
                    type="date"
                    name="lastWorkingDay"
                    id="lastWorkingDay"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                    href="/offboarding"
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
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        >
            {pending ? "Starting..." : "Start Offboarding"}
        </button>
    );
}

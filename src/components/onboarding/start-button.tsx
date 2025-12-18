"use client";

import { useState } from "react";
import { startOnboarding } from "@/app/actions/onboarding";
import { UserPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function StartOnboardingButton({ templates, users }: { templates: any[], users: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const userId = formData.get("userId")?.toString();
        const templateId = formData.get("templateId")?.toString();

        if (userId && templateId) {
            await startOnboarding(userId, templateId);
            setIsOpen(false);
            router.refresh();
        }
        setIsLoading(false);
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm flex items-center gap-2"
            >
                <UserPlus className="h-4 w-4" />
                Start Onboarding
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background w-full max-w-sm rounded-lg shadow-lg border p-6">
                        <h2 className="text-lg font-bold mb-4">Start Onboarding</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">New Hire</label>
                                <select name="userId" className="w-full border rounded-md p-2 bg-background mt-1" required>
                                    <option value="">Select employee...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Template</label>
                                <select name="templateId" className="w-full border rounded-md p-2 bg-background mt-1" required>
                                    <option value="">Select template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md flex items-center gap-2"
                                >
                                    {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Start
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

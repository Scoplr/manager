"use client";

import { useState } from "react";
import { createRequest } from "@/app/actions/requests";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function RequestForm({ users }: { users: any[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // For demo, use first user as requester
    const defaultRequesterId = users[0]?.id || "";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createRequest(formData);
        e.currentTarget.reset();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <input type="hidden" name="requesterId" value={defaultRequesterId} />

            <div>
                <label htmlFor="request-category" className="block text-xs text-muted-foreground mb-1">Category</label>
                <select id="request-category" name="category" className="w-full border rounded-md p-2 bg-background text-sm" required>
                    <option value="">Select category...</option>
                    <option value="equipment">🖥️ Equipment (laptop, mouse, etc.)</option>
                    <option value="access">🔑 Access (tool, system, etc.)</option>
                    <option value="document">📄 Document (letter, certificate, etc.)</option>
                    <option value="reimbursement">💰 Reimbursement</option>
                    <option value="other">❓ Other</option>
                </select>
            </div>

            <div>
                <label htmlFor="request-title" className="block text-xs text-muted-foreground mb-1">Title</label>
                <input
                    id="request-title"
                    name="title"
                    placeholder="Request title..."
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="request-description" className="block text-xs text-muted-foreground mb-1">Description</label>
                <textarea
                    id="request-description"
                    name="description"
                    placeholder="Describe your request..."
                    rows={3}
                    className="w-full border rounded-md p-2 bg-background text-sm resize-none"
                />
            </div>

            <div>
                <label htmlFor="request-priority" className="block text-xs text-muted-foreground mb-1">Priority</label>
                <select id="request-priority" name="priority" defaultValue="normal" className="w-full border rounded-md p-2 bg-background text-sm">
                    <option value="low">Low priority</option>
                    <option value="normal">Normal priority</option>
                    <option value="high">High priority</option>
                    <option value="urgent">🚨 Urgent</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Request
            </button>
        </form>
    );
}


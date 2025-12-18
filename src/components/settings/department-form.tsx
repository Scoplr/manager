"use client";

import { useState } from "react";
import { createDepartment } from "@/app/actions/config";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DepartmentForm({ users }: { users: any[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createDepartment(formData);
        e.currentTarget.reset();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="dept-name" className="block text-xs text-muted-foreground mb-1">Department Name</label>
                <input
                    id="dept-name"
                    name="name"
                    placeholder="Department name..."
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="dept-desc" className="block text-xs text-muted-foreground mb-1">Description</label>
                <textarea
                    id="dept-desc"
                    name="description"
                    placeholder="Description (optional)..."
                    rows={2}
                    className="w-full border rounded-md p-2 bg-background text-sm resize-none"
                />
            </div>
            <div>
                <label htmlFor="dept-head" className="block text-xs text-muted-foreground mb-1">Department Head</label>
                <select id="dept-head" name="headId" className="w-full border rounded-md p-2 bg-background text-sm">
                    <option value="">Select department head...</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="dept-max-leave" className="block text-xs text-muted-foreground mb-1">Max Leave Per Day</label>
                <input
                    id="dept-max-leave"
                    name="maxLeavePerDay"
                    type="number"
                    placeholder="Max people on leave per day"
                    className="w-full border rounded-md p-2 bg-background text-sm"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Department
            </button>
        </form>
    );
}

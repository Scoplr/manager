"use client";

import { useFormStatus } from "react-dom";
import { createProject, updateProject, Project } from "@/app/actions/projects";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Define a minimal User type if not imported
interface User {
    id: string;
    name: string | null;
}

export function ProjectForm({
    users,
    project
}: {
    users: User[];
    project?: Project;
}) {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setError(null);
        let result;

        if (project) {
            result = await updateProject(project.id, formData);
        } else {
            result = await createProject(formData);
        }

        if (result.error) {
            setError(result.error);
        } else {
            // Success - redirect is handled by server action revalidatePath, but we might need client side push
            // Wait, server action returns { success: true } or { error }.
            // The action also calls revalidatePath.
            // But we typically need to redirect explicitly if the action doesn't do it.
            // createProject/updateProject in my code do NOT redirect. They just revalidate.
            // So I should redirect here.
            router.push("/projects");
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
                <label htmlFor="name" className="text-sm font-medium">Project Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={project?.name}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="e.g. Q4 Marketing Campaign"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                    name="description"
                    id="description"
                    rows={4}
                    defaultValue={project?.description || ""}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe the project goals..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select
                        name="status"
                        id="status"
                        defaultValue={project?.status || "active"}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                        <option value="on_hold">On Hold</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="color" className="text-sm font-medium">Color</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            name="color"
                            id="color"
                            defaultValue={project?.color || "#3b82f6"}
                            className="h-10 w-20 p-1 rounded-md border cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="ownerId" className="text-sm font-medium">Project Owner</label>
                <select
                    name="ownerId"
                    id="ownerId"
                    defaultValue={project?.ownerId || ""}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">Select an owner...</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        defaultValue={project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ""}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">Due Date</label>
                    <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        defaultValue={project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ""}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                    href="/projects"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    Cancel
                </Link>
                <SubmitButton isEditing={!!project} />
            </div>
        </form>
    );
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
        >
            {pending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Project")}
        </button>
    );
}

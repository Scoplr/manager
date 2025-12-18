"use client";

import { createAnnouncement } from "@/app/actions/announcements";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export function QuickAnnouncementForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await createAnnouncement(formData);
            if (result && "error" in result) {
                toast.error(result.error);
            } else {
                toast.success("Posted!");
                formRef.current?.reset();
            }
        });
    }

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg">New Update</h3>
            <div>
                <label htmlFor="title" className="sr-only">
                    Title
                </label>
                <input
                    suppressHydrationWarning
                    type="text"
                    name="title"
                    id="title"
                    required
                    disabled={isPending}
                    className="block w-full rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border disabled:opacity-50"
                    placeholder="Title of your update"
                />
            </div>
            <div>
                <label htmlFor="content" className="sr-only">
                    Content
                </label>
                <textarea
                    suppressHydrationWarning
                    name="content"
                    id="content"
                    rows={3}
                    required
                    disabled={isPending}
                    className="block w-full rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border disabled:opacity-50"
                    placeholder="Share something with the team..."
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                    {isPending ? "Posting..." : "Post Update"}
                </button>
            </div>
        </form>
    );
}

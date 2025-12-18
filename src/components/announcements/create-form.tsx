"use client";

import { useState } from "react";
import { createAnnouncement } from "@/app/actions/announcements";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateAnnouncementForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createAnnouncement(formData);
        e.currentTarget.reset();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input
                    name="title"
                    placeholder="Announcement title..."
                    className="w-full border rounded-md p-2 bg-background"
                    required
                />
            </div>
            <div>
                <textarea
                    name="content"
                    placeholder="Write your announcement (markdown supported)..."
                    rows={4}
                    className="w-full border rounded-md p-2 bg-background resize-none"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <select name="priority" className="border rounded-md p-2 bg-background text-sm">
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="pinned" value="true" />
                    Pin to top
                </label>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Post Announcement
            </button>
        </form>
    );
}

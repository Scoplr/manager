"use client";

import { useState } from "react";
import { createAnnouncement } from "@/app/actions/announcements";
import { Loader2, ArrowLeft, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function NewAnnouncementPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createAnnouncement(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Announcement created!");
            router.push("/announcements");
        }

        setIsLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/announcements" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Announcements
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Megaphone className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">New Announcement</h1>
                    <p className="text-sm text-muted-foreground">Share updates with your team</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-lg p-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
                    <input
                        id="title"
                        name="title"
                        required
                        className="w-full border rounded-lg p-2.5 bg-background"
                        placeholder="Announcement title..."
                    />
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium mb-1">Content *</label>
                    <textarea
                        id="content"
                        name="content"
                        rows={6}
                        required
                        className="w-full border rounded-lg p-2.5 bg-background resize-none"
                        placeholder="Write your announcement..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="pinned"
                        name="pinned"
                        className="rounded border-gray-300"
                    />
                    <label htmlFor="pinned" className="text-sm">Pin this announcement</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link
                        href="/announcements"
                        className="px-4 py-2 border rounded-lg hover:bg-muted"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Post Announcement
                    </button>
                </div>
            </form>
        </div>
    );
}

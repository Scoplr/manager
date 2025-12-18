"use client";

import { useState } from "react";
import { createMeeting } from "@/app/actions/meetings";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function MeetingForm({ users }: { users: any[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
    const router = useRouter();
    const currentUserId = users[0]?.id;

    function toggleAttendee(userId: string) {
        setSelectedAttendees(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.set("createdBy", currentUserId);
        formData.set("attendees", JSON.stringify(selectedAttendees));

        await createMeeting(formData);
        e.currentTarget.reset();
        setSelectedAttendees([]);
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="meeting-title" className="block text-xs text-muted-foreground mb-1">Meeting Title</label>
                <input
                    id="meeting-title"
                    name="title"
                    placeholder="Meeting title..."
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor="meeting-date" className="block text-xs text-muted-foreground mb-1">Date & Time</label>
                <input
                    id="meeting-date"
                    name="date"
                    type="datetime-local"
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>

            <div>
                <label className="text-xs text-muted-foreground mb-1 block">Attendees</label>
                <div className="flex flex-wrap gap-1">
                    {users.map(u => (
                        <button
                            key={u.id}
                            type="button"
                            onClick={() => toggleAttendee(u.id)}
                            className={`text-xs px-2 py-1 rounded-full border transition ${selectedAttendees.includes(u.id)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted"
                                }`}
                        >
                            {u.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="meeting-notes" className="block text-xs text-muted-foreground mb-1">Meeting Notes</label>
                <textarea
                    id="meeting-notes"
                    name="notes"
                    placeholder="Meeting notes...&#10;&#10;Use [ ] for action items:&#10;[ ] Schedule follow-up&#10;[ ] Send report"
                    rows={6}
                    className="w-full border rounded-md p-2 bg-background text-sm resize-none font-mono"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Meeting Notes
            </button>
        </form>
    );
}

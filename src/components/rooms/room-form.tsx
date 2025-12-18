"use client";

import { useFormStatus } from "react-dom";
import { createRoom } from "@/app/actions/rooms";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RoomForm() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setError(null);
        const result = await createRoom(formData);

        if (result.error) {
            setError(result.error);
        } else {
            router.push("/rooms");
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
                <label htmlFor="name" className="text-sm font-medium">Room Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="e.g. Conference Room A"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="capacity" className="text-sm font-medium">Capacity</label>
                    <input
                        type="number"
                        name="capacity"
                        id="capacity"
                        min="1"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="e.g. 10"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <input
                        type="text"
                        name="location"
                        id="location"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="e.g. 2nd Floor, Wing B"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="amenities" className="text-sm font-medium">Amenities (comma separated)</label>
                <input
                    type="text"
                    name="amenities"
                    id="amenities"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="e.g. Whiteboard, Projector, Video Conference"
                />
                <p className="text-xs text-muted-foreground">List available equipment separated by commas.</p>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                    href="/rooms"
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
            {pending ? "Creating..." : "Create Room"}
        </button>
    );
}

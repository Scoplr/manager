"use client";

import { useState, Suspense } from "react";
import { bookRoom } from "@/app/actions/rooms";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

function BookRoomForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedRoomId = searchParams.get("roomId");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await bookRoom(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Room booked successfully!");
            router.push("/rooms");
        }

        setIsLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-lg p-6">
            <div>
                <label htmlFor="roomId" className="block text-sm font-medium mb-1">Room *</label>
                <input
                    id="roomId"
                    name="roomId"
                    required
                    defaultValue={preselectedRoomId || ""}
                    className="w-full border rounded-lg p-2.5 bg-background"
                    placeholder="Room ID"
                />
                <p className="text-xs text-muted-foreground mt-1">Select a room from the rooms list</p>
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Meeting Title *</label>
                <input
                    id="title"
                    name="title"
                    required
                    className="w-full border rounded-lg p-2.5 bg-background"
                    placeholder="Weekly standup, Client meeting..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium mb-1">Date *</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        required
                        className="w-full border rounded-lg p-2.5 bg-background"
                    />
                </div>
                <div>
                    <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time *</label>
                    <input
                        id="startTime"
                        name="startTime"
                        type="time"
                        required
                        className="w-full border rounded-lg p-2.5 bg-background"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="duration" className="block text-sm font-medium mb-1">Duration</label>
                <select id="duration" name="duration" defaultValue="60" className="w-full border rounded-lg p-2.5 bg-background">
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Link
                    href="/rooms"
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
                    Book Room
                </button>
            </div>
        </form>
    );
}

export default function BookRoomPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/rooms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Rooms
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Calendar className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Book a Room</h1>
                    <p className="text-sm text-muted-foreground">Reserve a meeting room for your team</p>
                </div>
            </div>

            <Suspense fallback={<div className="p-6 bg-card border rounded-lg animate-pulse">Loading...</div>}>
                <BookRoomForm />
            </Suspense>
        </div>
    );
}


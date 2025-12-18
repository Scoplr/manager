"use client";

import { deleteAnnouncement, togglePinAnnouncement } from "@/app/actions/announcements";
import { Pin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const priorityStyles = {
    normal: "border-l-blue-400 bg-blue-50/50",
    important: "border-l-yellow-400 bg-yellow-50/50",
    urgent: "border-l-red-400 bg-red-50/50",
};

export function AnnouncementsList({ announcements }: { announcements: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Delete this announcement?")) {
            await deleteAnnouncement(id);
            router.refresh();
        }
    }

    async function handleTogglePin(id: string, currentPinned: boolean) {
        await togglePinAnnouncement(id, !currentPinned);
        router.refresh();
    }

    if (announcements.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No announcements yet. Create one to get started.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {announcements.map(item => (
                <div
                    key={item.id}
                    className={`border rounded-lg p-4 border-l-4 ${priorityStyles[item.priority as keyof typeof priorityStyles] || priorityStyles.normal}`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{item.title}</h3>
                                {item.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                By {item.authorName} · {format(new Date(item.createdAt), "MMM d, yyyy")}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleTogglePin(item.id, item.pinned)}
                                className={`p-1.5 rounded hover:bg-muted ${item.pinned ? "text-blue-600" : "text-muted-foreground"}`}
                                title={item.pinned ? "Unpin" : "Pin to top"}
                            >
                                <Pin className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-600"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

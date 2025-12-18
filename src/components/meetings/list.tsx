"use client";

import { deleteMeeting, updateActionItem } from "@/app/actions/meetings";
import { Trash2, CheckCircle2, Circle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type ActionItem = { text: string; taskId?: string; completed: boolean };

export function MeetingsList({ meetings, users }: { meetings: any[]; users: any[] }) {
    const router = useRouter();
    const userMap = Object.fromEntries(users.map(u => [u.id, u.name]));

    async function handleDelete(id: string) {
        if (confirm("Delete this meeting?")) {
            await deleteMeeting(id);
            router.refresh();
        }
    }

    async function handleToggleAction(meetingId: string, index: number, currentState: boolean) {
        await updateActionItem(meetingId, index, !currentState);
        router.refresh();
    }

    if (meetings.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No meetings yet. Create one to capture notes and action items.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {meetings.map((meeting: any) => {
                const attendees = (meeting.attendees as string[]) || [];
                const actionItems = (meeting.actionItems as ActionItem[]) || [];
                const completedCount = actionItems.filter(a => a.completed).length;

                return (
                    <div key={meeting.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-semibold">{meeting.title}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(meeting.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(meeting.id)}
                                className="text-muted-foreground hover:text-red-600 p-1"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        {attendees.length > 0 && (
                            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {attendees.map(id => userMap[id] || "Unknown").join(", ")}
                            </div>
                        )}

                        <div className="text-sm whitespace-pre-wrap mb-3 text-muted-foreground line-clamp-3">
                            {meeting.notes.substring(0, 200)}{meeting.notes.length > 200 ? "..." : ""}
                        </div>

                        {actionItems.length > 0 && (
                            <div className="border-t pt-3 mt-3">
                                <p className="text-xs font-medium mb-2">
                                    Action Items ({completedCount}/{actionItems.length})
                                </p>
                                <div className="space-y-1">
                                    {actionItems.map((item: ActionItem, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => handleToggleAction(meeting.id, i, item.completed)}
                                            className={`w-full flex items-center gap-2 text-sm text-left p-1.5 rounded transition ${item.completed
                                                    ? "text-muted-foreground line-through"
                                                    : "hover:bg-muted"
                                                }`}
                                        >
                                            {item.completed ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                            )}
                                            {item.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

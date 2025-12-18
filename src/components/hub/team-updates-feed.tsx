import { getAnnouncements } from "@/app/actions/announcements";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Megaphone, ArrowRight, Pin } from "lucide-react";

export async function TeamUpdatesFeed() {
    const announcements = await getAnnouncements();

    // Show latest 5 announcements
    const recentAnnouncements = announcements.slice(0, 5);

    if (recentAnnouncements.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No updates yet. Be the first to post!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
                <div
                    key={announcement.id}
                    className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                >
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                            {announcement.pinned ? (
                                <Pin className="h-4 w-4 text-primary" />
                            ) : (
                                <Megaphone className="h-4 w-4 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">
                                {announcement.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {announcement.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>{announcement.authorName || "Team"}</span>
                                <span>•</span>
                                <span>
                                    {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <Link
                href="/announcements"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline py-2"
            >
                View all announcements
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

import { getAnnouncements } from "@/app/actions/announcements";
import { Megaphone, Pin } from "lucide-react";
import Link from "next/link";

const priorityStyles = {
    normal: "border-l-blue-400",
    important: "border-l-yellow-400",
    urgent: "border-l-red-400",
};

export async function AnnouncementsWidget() {
    const announcements = await getAnnouncements({ activeOnly: true });
    const pinned = announcements.filter(a => a.pinned).slice(0, 3);
    const recent = announcements.filter(a => !a.pinned).slice(0, 2);
    const items = [...pinned, ...recent].slice(0, 3);

    return (
        <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Announcements
                </h3>
                <Link href="/announcements" className="text-xs text-blue-600 hover:underline">
                    View All
                </Link>
            </div>

            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No announcements</p>
            ) : (
                <div className="space-y-2">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className={`text-sm p-2 bg-muted/30 rounded border-l-4 ${priorityStyles[item.priority as keyof typeof priorityStyles] || priorityStyles.normal}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-medium line-clamp-1">{item.title}</p>
                                {item.pinned && <Pin className="h-3 w-3 text-muted-foreground shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

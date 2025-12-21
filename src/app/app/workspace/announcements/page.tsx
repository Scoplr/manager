import { getAnnouncements } from "@/app/actions/announcements";
import { Megaphone } from "lucide-react";
import Link from "next/link";
import { requireAnyRole } from "@/lib/role-guards";
import { format } from "date-fns";

export default async function WorkspaceAnnouncementsPage() {
    await requireAnyRole(["admin"], "/workspace");

    const announcements = await getAnnouncements();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{announcements.length} announcements</p>
                <Link
                    href="/announcements/new"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    New Announcement
                </Link>
            </div>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                        No announcements yet.
                    </div>
                ) : (
                    announcements.map((ann: any) => (
                        <div
                            key={ann.id}
                            className="p-4 bg-card border rounded-lg"
                        >
                            <div className="flex items-start gap-3">
                                <Megaphone className={`h-5 w-5 mt-0.5 ${ann.pinned ? "text-amber-500" : "text-muted-foreground"}`} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium">{ann.title}</h3>
                                        {ann.pinned && (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pinned</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{ann.content}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {format(new Date(ann.createdAt), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

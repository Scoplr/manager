import { getAnnouncements } from "@/app/actions/announcements";
import { CreateAnnouncementForm } from "@/components/announcements/create-form";
import { AnnouncementsList } from "@/components/announcements/list";
import { Megaphone } from "lucide-react";
import { serializeForClient } from "@/lib/serialize";

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements();

    // Serialize for client component
    const serialized = serializeForClient(announcements);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Megaphone className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">Team-wide updates and notices.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                <AnnouncementsList announcements={serialized} />

                <div className="space-y-6">
                    <div className="border rounded-lg p-6 bg-card">
                        <h2 className="font-semibold mb-4">Post Announcement</h2>
                        <CreateAnnouncementForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

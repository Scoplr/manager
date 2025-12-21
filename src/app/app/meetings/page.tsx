import { getMeetings } from "@/app/actions/meetings";
import { getUsers } from "@/app/actions/people";
import { PageHeader } from "@/components/ui/page-header";
import { MeetingForm } from "@/components/meetings/form";
import { MeetingsList } from "@/components/meetings/list";
import { Calendar } from "lucide-react";

export default async function MeetingsPage() {
    const meetings = await getMeetings();
    const users = await getUsers();

    return (
        <div>
            <PageHeader
                icon="Calendar"
                iconColor="text-indigo-600"
                iconBg="bg-indigo-100"
                title="Meeting Notes"
                description="Capture decisions and action items from meetings."
                tip="Use checkboxes [ ] in notes to auto-create action items. Track completion right from the list."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <MeetingsList meetings={meetings} users={users} />

                <div className="lg:sticky lg:top-4 h-fit">
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-3">New Meeting</h3>
                        <MeetingForm users={users} />
                    </div>
                </div>
            </div>
        </div>
    );
}

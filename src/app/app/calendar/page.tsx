import { getCalendarEvents } from "@/app/actions/calendar";
import { PageHeader } from "@/components/ui/page-header";
import { CalendarDays } from "lucide-react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";

export default async function CalendarPage() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);

    const events = await getCalendarEvents(startDate, endDate);

    return (
        <div>
            <PageHeader
                icon="CalendarDays"
                iconColor="text-teal-600"
                iconBg="bg-teal-100"
                title="Company Calendar"
                description="See leaves, holidays, birthdays, and anniversaries in one place."
                tip="Click on a date to see details. Navigate months with the arrows."
            />

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                    <span className="text-sm">Casual Leave</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <span className="text-sm">Sick Leave</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                    <span className="text-sm">Privilege Leave</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
                    <span className="text-sm">Birthday</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#a855f7]" />
                    <span className="text-sm">Anniversary</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                    <span className="text-sm">Event</span>
                </div>
            </div>

            <CalendarGrid events={events} />
        </div>
    );
}

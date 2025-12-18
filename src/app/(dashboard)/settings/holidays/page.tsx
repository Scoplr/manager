import { getHolidays, createHoliday } from "@/app/actions/config";
import { PageHeader } from "@/components/ui/page-header";
import { HolidaysList } from "@/components/settings/holidays-list";
import { HolidayForm } from "@/components/settings/holiday-form";
import { HolidayImport } from "@/components/settings/holiday-import";
import { Calendar, Globe, Plus } from "lucide-react";

export default async function HolidaysPage() {
    const holidays = await getHolidays();

    return (
        <div>
            <PageHeader
                icon="Calendar"
                iconColor="text-green-600"
                iconBg="bg-green-100"
                title="Public Holidays"
                description="Configure company holiday calendar."
                tip="Import holidays for your region or add them manually."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                <HolidaysList holidays={holidays} />
                <div className="space-y-4 lg:sticky lg:top-4 h-fit">
                    {/* Import from Region */}
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Import by Region
                        </h3>
                        <HolidayImport />
                    </div>

                    {/* Manual Add */}
                    <details className="border rounded-lg bg-card">
                        <summary className="p-5 cursor-pointer font-semibold flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Manually
                        </summary>
                        <div className="px-5 pb-5">
                            <HolidayForm />
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
}


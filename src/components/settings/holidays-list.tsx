"use client";

import { deleteHoliday } from "@/app/actions/config";
import { Trash2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function HolidaysList({ holidays }: { holidays: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Delete this holiday?")) {
            await deleteHoliday(id);
            router.refresh();
        }
    }

    if (holidays.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No holidays defined. Add your company holidays!
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="text-left p-3 font-medium">Holiday</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Recurring</th>
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {holidays.map((h: any) => (
                        <tr key={h.id} className="border-t hover:bg-muted/20">
                            <td className="p-3 font-medium">{h.name}</td>
                            <td className="p-3 text-muted-foreground">
                                {format(new Date(h.date), "MMMM d, yyyy")}
                            </td>
                            <td className="p-3">
                                {h.isRecurring && (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                        <RefreshCw className="h-3 w-3" /> Yearly
                                    </span>
                                )}
                            </td>
                            <td className="p-3">
                                <button
                                    onClick={() => handleDelete(h.id)}
                                    className="text-muted-foreground hover:text-red-600 p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

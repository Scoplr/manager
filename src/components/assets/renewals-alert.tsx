import { AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export function RenewalsAlert({ renewals }: { renewals: any[] }) {
    return (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Upcoming Renewals</h3>
            </div>
            <div className="space-y-2">
                {renewals.map((item: any) => {
                    const daysUntil = differenceInDays(new Date(item.renewalDate), new Date());
                    return (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                            <div>
                                <span className="font-medium text-yellow-900">{item.name}</span>
                                {item.assignedToName && (
                                    <span className="text-yellow-700 ml-2">({item.assignedToName})</span>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="text-yellow-800">
                                    {format(new Date(item.renewalDate), "MMM d")}
                                </span>
                                <span className="text-yellow-600 ml-2">
                                    ({daysUntil === 0 ? "Today" : `${daysUntil} days`})
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

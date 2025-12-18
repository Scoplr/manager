"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const statuses = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
];

export function LeaveFilters({ currentStatus }: { currentStatus?: string }) {
    return (
        <div className="flex gap-2 flex-wrap">
            {statuses.map(status => (
                <Link
                    key={status.value}
                    href={status.value ? `/leaves?status=${status.value}` : "/leaves"}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${(currentStatus || "") === status.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted"
                        }`}
                >
                    {status.label}
                </Link>
            ))}
        </div>
    );
}

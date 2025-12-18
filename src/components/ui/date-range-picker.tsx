"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

interface DateRangePickerProps {
    paramPrefix?: string; // e.g. "due", "updated" -> "dueStart", "dueEnd"
}

export function DateRangePicker({ paramPrefix = "date" }: DateRangePickerProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.push(pathname + "?" + createQueryString(`${paramPrefix}Start`, e.target.value));
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.push(pathname + "?" + createQueryString(`${paramPrefix}End`, e.target.value));
    };

    return (
        <div className="flex items-center gap-2 text-sm bg-background/50 border rounded px-2 py-1">
            <span className="text-muted-foreground text-xs">Date:</span>
            <input
                type="date"
                className="bg-transparent focus:outline-none w-28 text-xs"
                value={searchParams.get(`${paramPrefix}Start`) || ""}
                onChange={handleStartChange}
            />
            <span className="text-muted-foreground">-</span>
            <input
                type="date"
                className="bg-transparent focus:outline-none w-28 text-xs"
                value={searchParams.get(`${paramPrefix}End`) || ""}
                onChange={handleEndChange}
            />
        </div>
    );
}

"use client";

import { useState } from "react";
import { createHoliday } from "@/app/actions/config";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function HolidayForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createHoliday(formData);
        e.currentTarget.reset();
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="holiday-name" className="block text-xs text-muted-foreground mb-1">Holiday Name</label>
                <input
                    id="holiday-name"
                    name="name"
                    placeholder="Holiday name..."
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="holiday-date" className="block text-xs text-muted-foreground mb-1">Date</label>
                <input
                    id="holiday-date"
                    name="date"
                    type="date"
                    className="w-full border rounded-md p-2 bg-background text-sm"
                    required
                />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" id="holiday-recurring" name="isRecurring" value="true" className="rounded" />
                <span>Repeats every year</span>
            </label>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm"
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Holiday
            </button>
        </form>
    );
}

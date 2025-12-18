"use client";

import { FilterBar } from "@/components/ui/filter-bar";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

export function DocumentFilters({ tags }: { tags: Tag[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(pathname + "?" + params.toString());
    };

    const handleSearch = useDebouncedCallback((term: string) => {
        updateFilter("query", term);
    }, 300);

    return (
        <FilterBar>
            <div className="relative">
                <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
                <input
                    placeholder="Search docs..."
                    className="pl-7 h-7 text-xs bg-background border rounded w-40 focus:outline-none focus:ring-1 focus:ring-primary"
                    defaultValue={searchParams.get("query")?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            <select
                className="text-xs bg-background border rounded px-2 py-1"
                value={searchParams.get("tags") || ""}
                onChange={(e) => updateFilter("tags", e.target.value)}
            >
                <option value="">All Tags</option>
                {tags.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>

            <DateRangePicker paramPrefix="updated" />
        </FilterBar>
    );
}

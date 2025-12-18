"use client";

import { FilterBar } from "@/components/ui/filter-bar";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface Tag {
    id: string;
    name: string;
    color: string | null;
}

export function TaskFilters({ tags }: { tags: Tag[] }) {
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

    const isTeamView = searchParams.get("view") === "team";

    return (
        <FilterBar>
            {/* Team Toggle */}
            <div className="flex rounded-lg border overflow-hidden">
                <button
                    onClick={() => updateFilter("view", "")}
                    className={`text-xs px-3 py-1 transition-colors ${!isTeamView ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        }`}
                >
                    My Tasks
                </button>
                <button
                    onClick={() => updateFilter("view", "team")}
                    className={`text-xs px-3 py-1 transition-colors ${isTeamView ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        }`}
                >
                    Team
                </button>
            </div>

            <select
                className="text-xs bg-background border rounded px-2 py-1"
                value={searchParams.get("status") || ""}
                onChange={(e) => updateFilter("status", e.target.value)}
            >
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
            </select>

            <select
                className="text-xs bg-background border rounded px-2 py-1"
                value={searchParams.get("priority") || ""}
                onChange={(e) => updateFilter("priority", e.target.value)}
            >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>

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

            <DateRangePicker paramPrefix="due" />
        </FilterBar>
    );
}


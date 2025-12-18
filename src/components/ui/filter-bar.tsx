"use client";

import { X } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FilterBarProps {
    children: React.ReactNode;
    onClear?: () => void;
}

export function FilterBar({ children, onClear }: FilterBarProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const hasFilters = searchParams.toString().length > 0;

    const clearAll = useCallback(() => {
        router.push(pathname);
        onClear?.();
    }, [pathname, router, onClear]);

    return (
        <div className="bg-card/50 border rounded-lg p-3 flex flex-wrap items-center gap-3 shadow-sm mb-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters:</span>
            {children}

            {hasFilters && (
                <button
                    onClick={clearAll}
                    className="ml-auto text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 px-2 py-1 rounded hover:bg-background/80 transition-colors"
                >
                    <X className="w-3 h-3" /> Clear All
                </button>
            )}
        </div>
    );
}

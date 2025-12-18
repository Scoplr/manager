"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TabItem {
    href: string;
    label: string;
    icon?: React.ReactNode;
}

interface HubTabsProps {
    tabs: TabItem[];
    basePath: string;
}

export function HubTabs({ tabs, basePath }: HubTabsProps) {
    const pathname = usePathname();

    return (
        <div className="border-b mb-6">
            <nav className="flex gap-1 overflow-x-auto pb-px" aria-label="Hub navigation">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href ||
                        (tab.href !== basePath && pathname.startsWith(tab.href));

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors",
                                "hover:bg-muted/50",
                                isActive
                                    ? "text-primary border-b-2 border-primary bg-muted/30"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {tab.icon}
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

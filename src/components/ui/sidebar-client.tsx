"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, CheckSquare, Settings, BookOpen, Users, Palmtree,
    Banknote, Wand2, Megaphone, Package, UserPlus, MessageSquare,
    BarChart3, Calendar, Receipt, AlertTriangle, Heart, Activity,
    Ticket, CalendarDays, ClipboardCheck, ChevronDown, ChevronRight,
    LucideIcon, LogOut, TrendingUp, Users2, Briefcase, Target, DoorOpen, PieChart, UserMinus, Inbox
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ViewSwitcher } from "@/components/admin/view-switcher";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle";

// Icon mapping for serialized nav
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard, CheckSquare, Settings, BookOpen, Users, Palmtree,
    Banknote, Wand2, Megaphone, Package, UserPlus, MessageSquare,
    BarChart3, Calendar, Receipt, AlertTriangle, Heart, Activity,
    Ticket, CalendarDays, ClipboardCheck, TrendingUp, Users2,
    Briefcase, Target, DoorOpen, PieChart, UserMinus, Inbox,
};

interface SerializedNavItem {
    href: string;
    label: string;
    iconName: string;
    badge?: boolean;
}

interface SerializedNavGroup {
    label: string;
    items: SerializedNavItem[];
    collapsible?: boolean;
}

interface SidebarClientProps {
    navGroups: SerializedNavGroup[];
    approvalCount: number;
    notifications: any[];
    userRole: string;
    isAdmin?: boolean;
    isAcmeAdmin?: boolean;
}

export function SidebarClient({ navGroups, approvalCount, notifications, userRole, isAdmin = false, isAcmeAdmin = false }: SidebarClientProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    // Load collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved) {
            setCollapsed(JSON.parse(saved));
        }
    }, []);

    // Save collapsed state
    const toggleCollapse = (label: string) => {
        const newState = { ...collapsed, [label]: !collapsed[label] };
        setCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    };

    return (
        <aside className="w-64 border-r bg-card min-h-screen flex-col fixed left-0 top-0 bottom-0 z-40 hidden md:flex">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <Link href="/" className="font-bold text-lg tracking-tight">wrkspace</Link>
                <ThemeToggleCompact />
            </div>

            {/* Role indicator - only show if not admin with view switcher */}
            {userRole !== 'admin' && (
                <div className="px-4 py-2 border-b bg-muted/30">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {userRole === 'hr' && '👔 HR View'}
                        {userRole === 'manager' && '👥 Manager View'}
                        {userRole === 'employee' && '👤 My View'}
                    </span>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
                {navGroups.map((group) => {
                    const isCollapsed = collapsed[group.label] ?? false;

                    return (
                        <div key={group.label} className="mb-3">
                            {/* Group header - clickable if collapsible */}
                            {group.collapsible ? (
                                <button
                                    onClick={() => toggleCollapse(group.label)}
                                    className="w-full flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1 hover:text-foreground transition-colors"
                                >
                                    <span>{group.label}</span>
                                    {isCollapsed ? (
                                        <ChevronRight className="w-3 h-3" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3" />
                                    )}
                                </button>
                            ) : (
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                                    {group.label}
                                </p>
                            )}

                            {/* Items - hidden if collapsed */}
                            {!isCollapsed && (
                                <div className="space-y-0.5 mt-1">
                                    {group.items.map((link) => {
                                        const Icon = iconMap[link.iconName] || LayoutDashboard;
                                        const isActive = pathname === link.href ||
                                            (link.href !== '/' && pathname.startsWith(link.href));

                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-4 h-4" />
                                                    <span>{link.label}</span>
                                                </div>
                                                {link.badge && approvalCount > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                        {approvalCount}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer with View Switcher + Settings */}
            <div className="p-3 border-t space-y-2">
                {/* View Switcher - only for Acme admins */}
                {isAcmeAdmin && (
                    <ViewSwitcher />
                )}

                <Link
                    href="/settings"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname.startsWith('/settings')
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors w-full"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>

            {/* Scope Clarity Footer */}
            <div className="p-3 border-t text-[10px] text-muted-foreground/60 space-y-0.5">
                <p>Built for teams under 100</p>
                <p>Your data is always exportable</p>
            </div>
        </aside>
    );
}


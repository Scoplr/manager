"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu, X, LayoutDashboard, CheckSquare, Settings, BookOpen, Users,
    Palmtree, Banknote, Wand2, Megaphone, Package, UserPlus, MessageSquare,
    BarChart3, Calendar, Receipt, AlertTriangle, Heart, Activity, Ticket,
    CalendarDays, ClipboardCheck, ChevronDown, ChevronRight
} from "lucide-react";

type Role = 'employee' | 'manager' | 'hr' | 'admin';

interface NavItem {
    href: string;
    label: string;
    Icon: any;
    badge?: boolean;
}

interface NavGroup {
    label: string;
    items: NavItem[];
    roles?: Role[];
    collapsible?: boolean;
}

// Full navigation - filtered by role
const allNavGroups: NavGroup[] = [
    {
        label: "My Work",
        items: [
            { href: "/", label: "Dashboard", Icon: LayoutDashboard },
            { href: "/tasks", label: "My Tasks", Icon: CheckSquare },
            { href: "/calendar", label: "Calendar", Icon: CalendarDays },
            { href: "/leaves", label: "My Leaves", Icon: Palmtree },
            { href: "/expenses", label: "My Expenses", Icon: Receipt },
        ]
    },
    {
        label: "Team",
        roles: ['manager', 'hr', 'admin'],
        items: [
            { href: "/team", label: "Directory", Icon: Users },
            { href: "/approvals", label: "Approvals", Icon: ClipboardCheck, badge: true },
            { href: "/one-on-ones", label: "1:1 Notes", Icon: MessageSquare },
            { href: "/feedback", label: "Performance", Icon: Heart },
            { href: "/pulse", label: "Pulse Surveys", Icon: BarChart3 },
        ]
    },
    {
        label: "Operations",
        roles: ['hr', 'admin'],
        items: [
            { href: "/payroll", label: "Payroll", Icon: Banknote },
            { href: "/assets", label: "Assets", Icon: Package },
            { href: "/requests", label: "Requests", Icon: Ticket },
            { href: "/onboarding", label: "Onboarding", Icon: UserPlus },
        ]
    },
    {
        label: "Admin",
        roles: ['admin'],
        items: [
            { href: "/activity", label: "Activity Log", Icon: Activity },
            { href: "/risks", label: "Risk Register", Icon: AlertTriangle },
            { href: "/announcements", label: "Announcements", Icon: Megaphone },
            { href: "/smart-docs", label: "Templates", Icon: Wand2 },
            { href: "/meetings", label: "Meetings", Icon: Calendar },
        ]
    },
    {
        label: "Resources",
        items: [
            { href: "/knowledge", label: "Knowledge Base", Icon: BookOpen },
        ]
    },
];

function filterNavByRole(groups: NavGroup[], userRole: Role): NavGroup[] {
    const roleHierarchy: Role[] = ['employee', 'manager', 'hr', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);

    return groups.filter(group => {
        if (!group.roles) return true;
        return group.roles.some(role => roleHierarchy.indexOf(role) <= userRoleIndex);
    });
}

interface MobileNavProps {
    approvalCount?: number;
    userRole?: string;
}

export function MobileNav({ approvalCount = 0, userRole = 'employee' }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const pathname = usePathname();

    const navGroups = filterNavByRole(allNavGroups, userRole as Role);

    const toggleCollapse = (label: string) => {
        setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <>
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b flex items-center justify-between px-4 z-50 md:hidden">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 -ml-2 hover:bg-muted rounded-md"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <Link href="/" className="font-bold text-lg">Manager</Link>
                <div className="w-9" />
            </header>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out Menu */}
            <div className={`fixed top-0 left-0 bottom-0 w-72 bg-card z-50 transform transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-4 border-b flex items-center justify-between">
                    <span className="font-bold text-lg">Manager</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 hover:bg-muted rounded-md"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Role indicator */}
                <div className="px-4 py-2 border-b bg-muted/30">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {userRole === 'admin' && '👑 Admin View'}
                        {userRole === 'hr' && '👔 HR View'}
                        {userRole === 'manager' && '👥 Manager View'}
                        {userRole === 'employee' && '👤 My View'}
                    </span>
                </div>

                <nav className="flex-1 p-3 overflow-y-auto max-h-[calc(100vh-160px)]">
                    {navGroups.map((group) => {
                        const isCollapsed = collapsed[group.label] ?? false;

                        return (
                            <div key={group.label} className="mb-3">
                                {group.collapsible ? (
                                    <button
                                        onClick={() => toggleCollapse(group.label)}
                                        className="w-full flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1"
                                    >
                                        <span>{group.label}</span>
                                        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                ) : (
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                                        {group.label}
                                    </p>
                                )}

                                {!isCollapsed && (
                                    <div className="space-y-0.5 mt-1">
                                        {group.items.map((link) => {
                                            const Icon = link.Icon;
                                            const isActive = pathname === link.href;

                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                            ? "bg-primary/10 text-primary font-medium"
                                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

                <div className="p-3 border-t">
                    <Link
                        href="/settings"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname === "/settings"
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>
                </div>
            </div>
        </>
    );
}

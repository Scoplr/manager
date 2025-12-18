"use client";

import { ReactNode } from "react";
import {
    LucideIcon, Briefcase, Target, Palmtree, Receipt, UserMinus,
    DoorOpen, Package, AlertTriangle, BarChart3, PieChart,
    UserPlus, ClipboardList, ShieldAlert, Users, MessageSquare,
    Settings, Inbox, Activity, Calendar, CalendarDays, Megaphone,
    BookOpen, CheckSquare, FileText, Ticket, Heart, Plug, ClipboardCheck
} from "lucide-react";

// Icon map for string-based icon references (server-component safe)
const iconMap: Record<string, LucideIcon> = {
    Briefcase, Target, Palmtree, Receipt, UserMinus,
    DoorOpen, Package, AlertTriangle, BarChart3, PieChart,
    UserPlus, ClipboardList, ShieldAlert, Users, MessageSquare,
    Settings, Inbox, Activity, Calendar, CalendarDays, Megaphone,
    BookOpen, CheckSquare, FileText, Ticket, Heart, Plug, ClipboardCheck
};

interface PageHeaderProps {
    icon: string;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    tip?: string;
    action?: ReactNode;
}

export function PageHeader({ icon, iconColor, iconBg, title, description, tip, action }: PageHeaderProps) {
    const Icon = iconMap[icon] || Briefcase;

    return (
        <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                </div>
                {action && <div>{action}</div>}
            </div>
            {tip && (
                <div className="mt-4 px-4 py-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-medium">💡 Tip:</span> {tip}
                </div>
            )}
        </div>
    );
}

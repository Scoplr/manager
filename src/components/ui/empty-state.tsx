"use client";

import { ReactNode } from "react";
import {
    LucideIcon, FileText, Users, Inbox, Calendar, CheckSquare,
    UserMinus, DoorOpen, Package, AlertTriangle, BarChart3,
    Briefcase, Target, Palmtree, Receipt, MessageSquare,
    UserPlus, Megaphone, BookOpen
} from "lucide-react";
import Link from "next/link";

// Icon map for string-based icon references (server-component safe)
const iconMap: Record<string, LucideIcon> = {
    FileText, Users, Inbox, Calendar, CheckSquare,
    UserMinus, DoorOpen, Package, AlertTriangle, BarChart3,
    Briefcase, Target, Palmtree, Receipt, MessageSquare,
    UserPlus, Megaphone, BookOpen
};

interface EmptyStateProps {
    icon?: string | ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
    variant?: "default" | "success" | "info";
}

export function EmptyState({
    icon = "FileText",
    title,
    description,
    action,
    variant = "default"
}: EmptyStateProps) {
    const variants = {
        default: "bg-muted/30",
        success: "bg-green-50 dark:bg-green-950/20",
        info: "bg-blue-50 dark:bg-blue-950/20",
    };

    // Resolve icon from string or use as ReactNode
    let IconComponent: LucideIcon | null = null;
    let iconNode: ReactNode = null;

    if (typeof icon === "string") {
        IconComponent = iconMap[icon] || FileText;
    } else {
        iconNode = icon;
    }

    return (
        <div className={`rounded-xl border-2 border-dashed border-muted p-12 text-center ${variants[variant]}`}>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {IconComponent ? (
                    <IconComponent className="w-8 h-8 text-muted-foreground" />
                ) : (
                    iconNode
                )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
            {action && (
                <Link
                    href={action.href}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}

// Pre-configured empty states for common scenarios
export function NoTasksEmpty() {
    return (
        <EmptyState
            icon="CheckSquare"
            title="No tasks yet"
            description="Create your first task to start tracking your work"
            action={{ label: "Create Task", href: "/tasks?new=true" }}
        />
    );
}

export function NoTeamMembersEmpty() {
    return (
        <EmptyState
            icon="Users"
            title="No team members"
            description="Invite your colleagues to start collaborating"
            action={{ label: "Invite Team", href: "/people" }}
        />
    );
}

export function NoApprovalsEmpty() {
    return (
        <EmptyState
            icon="Inbox"
            title="All caught up!"
            description="You have no pending approvals at the moment"
            variant="success"
        />
    );
}

export function NoEventsEmpty() {
    return (
        <EmptyState
            icon="Calendar"
            title="No upcoming events"
            description="Your calendar is clear for the selected period"
            variant="info"
        />
    );
}

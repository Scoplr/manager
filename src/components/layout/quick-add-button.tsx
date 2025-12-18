"use client";

import { useState } from "react";
import { Plus, X, CheckSquare, FileText, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";

const quickActions = [
    { href: "/tasks?new=true", label: "New Task", icon: CheckSquare, color: "bg-blue-500" },
    { href: "/knowledge?new=true", label: "New Document", icon: FileText, color: "bg-green-500" },
    { href: "/announcements?new=true", label: "Announcement", icon: MessageSquare, color: "bg-amber-500" },
    { href: "/feedback?new=true", label: "Give Feedback", icon: UserPlus, color: "bg-purple-500" },
];

export function QuickAddButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
            {/* Actions panel */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 bg-card border rounded-lg shadow-lg p-2 space-y-1 min-w-48">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                            >
                                <div className={`h-6 w-6 rounded ${action.color} flex items-center justify-center`}>
                                    <Icon className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-sm">{action.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all ${isOpen
                        ? "bg-muted text-muted-foreground rotate-45"
                        : "bg-primary text-primary-foreground"
                    }`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </button>
        </div>
    );
}

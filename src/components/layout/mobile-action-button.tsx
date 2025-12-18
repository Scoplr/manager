"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Palmtree, CheckSquare, Receipt, X } from "lucide-react";

export function MobileActionButton() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const actions = [
        {
            icon: Palmtree,
            label: "Request Leave",
            color: "bg-green-500",
            action: () => router.push("/leaves?action=new")
        },
        {
            icon: CheckSquare,
            label: "Create Task",
            color: "bg-blue-500",
            action: () => router.push("/tasks?action=new")
        },
        {
            icon: Receipt,
            label: "File Expense",
            color: "bg-purple-500",
            action: () => router.push("/expenses?action=new")
        },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
            {/* Action options */}
            {open && (
                <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end">
                    {actions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                action.action();
                                setOpen(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-lg ${action.color} animate-in slide-in-from-bottom-2`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <action.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Main FAB button */}
            <button
                onClick={() => setOpen(!open)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${open
                        ? "bg-muted rotate-45"
                        : "bg-primary text-primary-foreground"
                    }`}
            >
                {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
        </div>
    );
}

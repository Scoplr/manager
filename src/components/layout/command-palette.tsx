"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Search, LayoutDashboard, CheckSquare, Users, Palmtree,
    FileText, Settings, Plus, Clock, ArrowRight, BookOpen,
    ClipboardCheck, Calendar, Receipt
} from "lucide-react";

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon: React.ElementType;
    action: () => void;
    keywords?: string[];
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const commands: CommandItem[] = [
        // Navigation
        { id: "go-dashboard", label: "Go to Dashboard", icon: LayoutDashboard, action: () => router.push("/"), keywords: ["home", "main"] },
        { id: "go-tasks", label: "Go to Tasks", icon: CheckSquare, action: () => router.push("/tasks"), keywords: ["todo", "work"] },
        { id: "go-team", label: "Go to Team", icon: Users, action: () => router.push("/team"), keywords: ["people", "employees", "directory"] },
        { id: "go-leaves", label: "Go to Leaves", icon: Palmtree, action: () => router.push("/leaves"), keywords: ["vacation", "time off", "pto"] },
        { id: "go-approvals", label: "Go to Approvals", icon: ClipboardCheck, action: () => router.push("/approvals"), keywords: ["pending", "review"] },
        { id: "go-calendar", label: "Go to Calendar", icon: Calendar, action: () => router.push("/calendar"), keywords: ["events", "schedule"] },
        { id: "go-expenses", label: "Go to Expenses", icon: Receipt, action: () => router.push("/expenses"), keywords: ["money", "reimbursement"] },
        { id: "go-knowledge", label: "Go to Knowledge Base", icon: BookOpen, action: () => router.push("/knowledge"), keywords: ["docs", "wiki"] },
        { id: "go-settings", label: "Go to Settings", icon: Settings, action: () => router.push("/settings") },

        // Quick Actions
        { id: "add-task", label: "Add New Task", description: "Create a new task", icon: Plus, action: () => router.push("/tasks?action=new"), keywords: ["create", "new"] },
        { id: "request-leave", label: "Request Leave", description: "Submit a leave request", icon: Palmtree, action: () => router.push("/leaves?action=new"), keywords: ["vacation", "pto"] },
        { id: "recent", label: "Recent Activity", icon: Clock, action: () => router.push("/activity"), keywords: ["history", "log"] },
    ];

    const filteredCommands = query
        ? commands.filter(cmd => {
            const searchStr = `${cmd.label} ${cmd.description || ""} ${(cmd.keywords || []).join(" ")}`.toLowerCase();
            return searchStr.includes(query.toLowerCase());
        })
        : commands;

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Open with Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
                setQuery("");
                setSelectedIndex(0);
            }

            // Close with Escape
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Arrow key navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
            e.preventDefault();
            executeCommand(filteredCommands[selectedIndex]);
        }
    }, [filteredCommands, selectedIndex]);

    const executeCommand = (cmd: CommandItem) => {
        cmd.action();
        setIsOpen(false);
        setQuery("");
    };

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Command Palette */}
            <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
                <div className="mx-4 bg-card border rounded-xl shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b">
                        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a command or search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
                        />
                        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-muted rounded">ESC</kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-80 overflow-y-auto p-2">
                        {filteredCommands.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No results found for "{query}"
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredCommands.map((cmd, index) => {
                                    const Icon = cmd.icon;
                                    return (
                                        <button
                                            key={cmd.id}
                                            onClick={() => executeCommand(cmd)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${index === selectedIndex
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-muted"
                                                }`}
                                        >
                                            <Icon className="h-4 w-4 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{cmd.label}</p>
                                                {cmd.description && (
                                                    <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
                                                )}
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                        <span>↑↓ Navigate</span>
                        <span>↵ Select</span>
                        <span>ESC Close</span>
                    </div>
                </div>
            </div>
        </>
    );
}

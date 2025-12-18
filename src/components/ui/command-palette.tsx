"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/app/actions/search";
import {
    Search,
    Palmtree,
    CheckSquare,
    Receipt,
    FileText,
    Users,
    Calendar,
    Settings,
    X,
    ArrowRight,
    Command,
    Loader2,
    Target,
    Megaphone,
    FolderKanban,
} from "lucide-react";

// Search result type from backend
interface SearchResult {
    type: "task" | "document" | "user" | "announcement" | "project" | "goal";
    id: string;
    title: string;
    description?: string;
    url: string;
    icon?: string;
}

const searchTypeIcons: Record<string, React.ReactNode> = {
    task: <CheckSquare className="w-4 h-4 text-blue-500" />,
    document: <FileText className="w-4 h-4 text-purple-500" />,
    user: <Users className="w-4 h-4 text-green-500" />,
    announcement: <Megaphone className="w-4 h-4 text-orange-500" />,
    project: <FolderKanban className="w-4 h-4 text-indigo-500" />,
    goal: <Target className="w-4 h-4 text-red-500" />,
};

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon: React.ReactNode;
    action: () => void;
    keywords?: string[];
    category: "action" | "navigation" | "search";
}

export function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    // Define commands
    const commands: CommandItem[] = [
        // Quick Actions
        {
            id: "request-leave",
            label: "Request Leave",
            description: "Submit a time-off request",
            icon: <Palmtree className="w-4 h-4 text-green-600" />,
            action: () => router.push("/leaves?action=new"),
            keywords: ["leave", "time off", "vacation", "pto", "holiday"],
            category: "action",
        },
        {
            id: "create-task",
            label: "Create Task",
            description: "Add a new task to your list",
            icon: <CheckSquare className="w-4 h-4 text-blue-600" />,
            action: () => router.push("/tasks?action=new"),
            keywords: ["task", "todo", "add", "new"],
            category: "action",
        },
        {
            id: "file-expense",
            label: "File Expense",
            description: "Submit an expense claim",
            icon: <Receipt className="w-4 h-4 text-purple-600" />,
            action: () => router.push("/expenses?action=new"),
            keywords: ["expense", "claim", "reimbursement", "money"],
            category: "action",
        },
        {
            id: "create-doc",
            label: "Create Document",
            description: "Start a new document",
            icon: <FileText className="w-4 h-4 text-orange-600" />,
            action: () => router.push("/knowledge?action=new"),
            keywords: ["document", "doc", "write", "wiki"],
            category: "action",
        },
        // Navigation
        {
            id: "go-dashboard",
            label: "Go to Dashboard",
            icon: <ArrowRight className="w-4 h-4" />,
            action: () => router.push("/"),
            keywords: ["home", "dashboard", "main"],
            category: "navigation",
        },
        {
            id: "go-tasks",
            label: "Go to Tasks",
            icon: <CheckSquare className="w-4 h-4" />,
            action: () => router.push("/tasks"),
            keywords: ["tasks", "todos"],
            category: "navigation",
        },
        {
            id: "go-team",
            label: "Go to Team",
            icon: <Users className="w-4 h-4" />,
            action: () => router.push("/team"),
            keywords: ["team", "people", "directory"],
            category: "navigation",
        },
        {
            id: "go-calendar",
            label: "Go to Calendar",
            icon: <Calendar className="w-4 h-4" />,
            action: () => router.push("/calendar"),
            keywords: ["calendar", "schedule", "events"],
            category: "navigation",
        },
        {
            id: "go-docs",
            label: "Go to Docs",
            icon: <FileText className="w-4 h-4" />,
            action: () => router.push("/knowledge"),
            keywords: ["docs", "documents", "wiki", "knowledge"],
            category: "navigation",
        },
        {
            id: "go-settings",
            label: "Go to Settings",
            icon: <Settings className="w-4 h-4" />,
            action: () => router.push("/settings"),
            keywords: ["settings", "preferences", "config"],
            category: "navigation",
        },
    ];

    // Filter commands based on query
    const filteredCommands = query
        ? commands.filter(cmd => {
            const searchStr = query.toLowerCase();
            return (
                cmd.label.toLowerCase().includes(searchStr) ||
                cmd.description?.toLowerCase().includes(searchStr) ||
                cmd.keywords?.some(k => k.includes(searchStr))
            );
        })
        : commands;

    // Group by category
    const actionCommands = filteredCommands.filter(c => c.category === "action");
    const navCommands = filteredCommands.filter(c => c.category === "navigation");

    // Live search from database when query is 2+ chars
    useEffect(() => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            startTransition(async () => {
                try {
                    const response = await globalSearch(query);
                    setSearchResults(response.results || []);
                } catch (error) {
                    console.error("Search error:", error);
                    setSearchResults([]);
                }
            });
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Keyboard shortcut to open
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const selected = filteredCommands[selectedIndex];
            if (selected) {
                selected.action();
                setOpen(false);
            }
        }
    }, [filteredCommands, selectedIndex]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Command Dialog */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
                <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a command or search..."
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                        />
                        {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1 hover:bg-muted rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-80 overflow-y-auto p-2">
                        {filteredCommands.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No results found
                            </div>
                        ) : (
                            <>
                                {actionCommands.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Quick Actions
                                        </div>
                                        {actionCommands.map((cmd, i) => {
                                            const globalIndex = filteredCommands.indexOf(cmd);
                                            return (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => {
                                                        cmd.action();
                                                        setOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${selectedIndex === globalIndex
                                                        ? "bg-primary/10 text-primary"
                                                        : "hover:bg-muted"
                                                        }`}
                                                >
                                                    <div className="p-1.5 rounded-lg bg-muted">
                                                        {cmd.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{cmd.label}</div>
                                                        {cmd.description && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {cmd.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {navCommands.length > 0 && (
                                    <div>
                                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Navigation
                                        </div>
                                        {navCommands.map((cmd) => {
                                            const globalIndex = filteredCommands.indexOf(cmd);
                                            return (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => {
                                                        cmd.action();
                                                        setOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${selectedIndex === globalIndex
                                                        ? "bg-primary/10 text-primary"
                                                        : "hover:bg-muted"
                                                        }`}
                                                >
                                                    <div className="p-1.5 rounded-lg bg-muted">
                                                        {cmd.icon}
                                                    </div>
                                                    <div className="font-medium">{cmd.label}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Live Search Results from Database */}
                                {searchResults.length > 0 && (
                                    <div className="mt-2 pt-2 border-t">
                                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Search Results
                                        </div>
                                        {searchResults.slice(0, 8).map((result, index) => (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => {
                                                    router.push(result.url);
                                                    setOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-muted"
                                            >
                                                <div className="p-1.5 rounded-lg bg-muted">
                                                    {searchTypeIcons[result.type] || <FileText className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{result.title}</div>
                                                    {result.description && (
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {result.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded capitalize">
                                                    {result.type}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
                                navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
                                select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
                                close
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Command className="w-3 h-3" />
                            <span>K</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { X, Command } from "lucide-react";

const shortcuts = [
    { keys: ["⌘", "K"], description: "Open command palette" },
    { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
    { keys: ["G", "H"], description: "Go to Dashboard (Home)" },
    { keys: ["G", "T"], description: "Go to Tasks" },
    { keys: ["G", "L"], description: "Go to Leaves" },
    { keys: ["G", "C"], description: "Go to Calendar" },
    { keys: ["Esc"], description: "Close modals" },
];

export function KeyboardShortcutsModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // ⌘/ or Ctrl+/ or ?
            if ((e.key === "/" && (e.metaKey || e.ctrlKey)) || (e.key === "?" && !e.metaKey)) {
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md">
                <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Command className="w-4 h-4" />
                            <h2 className="font-semibold">Keyboard Shortcuts</h2>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1 hover:bg-muted rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                        {shortcuts.map((shortcut, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                            >
                                <span className="text-sm text-muted-foreground">
                                    {shortcut.description}
                                </span>
                                <div className="flex items-center gap-1">
                                    {shortcut.keys.map((key, j) => (
                                        <kbd
                                            key={j}
                                            className="px-2 py-1 text-xs font-medium bg-muted border rounded"
                                        >
                                            {key}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground text-center">
                        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">?</kbd> to toggle this panel
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const options = [
        { value: "light" as const, icon: Sun, label: "Light" },
        { value: "dark" as const, icon: Moon, label: "Dark" },
        { value: "system" as const, icon: Monitor, label: "System" },
    ];

    return (
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {options.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;

                return (
                    <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors
                            ${isActive
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }
                        `}
                        title={option.label}
                        aria-label={`Set theme to ${option.label}`}
                        aria-pressed={isActive}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

// Compact toggle for sidebar/header
export function ThemeToggleCompact() {
    const { resolvedTheme, setTheme, theme } = useTheme();

    const toggleTheme = () => {
        if (theme === "system") {
            setTheme(resolvedTheme === "light" ? "dark" : "light");
        } else {
            setTheme(theme === "light" ? "dark" : "light");
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        >
            {resolvedTheme === "light" ? (
                <Moon className="h-4 w-4" />
            ) : (
                <Sun className="h-4 w-4" />
            )}
        </button>
    );
}

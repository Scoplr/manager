"use client";

import { useState, useEffect } from "react";
import { Eye, ChevronDown, Crown, Users, Briefcase, User } from "lucide-react";

type ViewMode = 'admin' | 'manager' | 'hr' | 'employee';

const viewModes: { value: ViewMode; label: string; icon: any; description: string }[] = [
    { value: 'admin', label: 'Admin View', icon: Crown, description: 'Full system access' },
    { value: 'manager', label: 'Manager View', icon: Briefcase, description: 'Team management' },
    { value: 'hr', label: 'HR View', icon: Users, description: 'HR operations' },
    { value: 'employee', label: 'Employee View', icon: User, description: 'Personal dashboard' },
];

interface ViewSwitcherProps {
    onViewChange?: (view: ViewMode) => void;
}

// Helper to set cookie
function setCookie(name: string, value: string, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Helper to get cookie
function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

export function ViewSwitcher({ onViewChange }: ViewSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentView, setCurrentView] = useState<ViewMode>('admin');

    // Load saved view from cookie
    useEffect(() => {
        const saved = getCookie('admin-view-mode') as ViewMode;
        if (saved && viewModes.some(v => v.value === saved)) {
            setCurrentView(saved);
            onViewChange?.(saved);
        }
    }, [onViewChange]);

    const handleViewChange = (view: ViewMode) => {
        setCurrentView(view);
        setCookie('admin-view-mode', view);
        localStorage.setItem('admin-view-mode', view); // Also save to localStorage for quick access
        setIsOpen(false);
        onViewChange?.(view);
        // Refresh the page to apply view changes
        window.location.reload();
    };

    const current = viewModes.find(v => v.value === currentView)!;
    const CurrentIcon = current.icon;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted transition-colors w-full"
            >
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 text-left">
                    <p className="text-xs text-muted-foreground">Viewing as</p>
                    <div className="flex items-center gap-1.5">
                        <CurrentIcon className="h-3.5 w-3.5" />
                        <span className="text-sm font-medium">{current.label}</span>
                    </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
                        <div className="p-2 border-b bg-muted/30">
                            <p className="text-xs text-muted-foreground font-medium">Switch View Mode</p>
                        </div>
                        {viewModes.map((mode) => {
                            const Icon = mode.icon;
                            const isActive = currentView === mode.value;

                            return (
                                <button
                                    key={mode.value}
                                    onClick={() => handleViewChange(mode.value)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors ${isActive ? 'bg-primary/10' : ''
                                        }`}
                                >
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                        }`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                                            {mode.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{mode.description}</p>
                                    </div>
                                    {isActive && (
                                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// Hook to get current view mode
export function useViewMode(): ViewMode {
    const [view, setView] = useState<ViewMode>('admin');

    useEffect(() => {
        const saved = getCookie('admin-view-mode') as ViewMode || 'admin';
        if (saved) setView(saved);
    }, []);

    return view;
}

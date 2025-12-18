"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";

interface ModuleToggleProps {
    moduleKey: string;
    name: string;
    description: string;
    defaultEnabled?: boolean;
}

export function ModuleToggle({ moduleKey, name, description, defaultEnabled = true }: ModuleToggleProps) {
    const [enabled, setEnabled] = useState(defaultEnabled);
    const [saving, setSaving] = useState(false);

    const handleToggle = async () => {
        setSaving(true);
        const newValue = !enabled;
        setEnabled(newValue);
        
        // In a real app, save to database/localStorage
        // For now, just use localStorage as a demo
        if (typeof window !== "undefined") {
            const modules = JSON.parse(localStorage.getItem("enabledModules") || "{}");
            modules[moduleKey] = newValue;
            localStorage.setItem("enabledModules", JSON.stringify(modules));
        }
        
        setTimeout(() => setSaving(false), 300);
    };

    return (
        <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
            <div className="flex-1">
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <button
                onClick={handleToggle}
                disabled={saving}
                className={`p-1 transition-colors ${enabled ? "text-green-600" : "text-muted-foreground"}`}
            >
                {enabled ? (
                    <ToggleRight className="w-8 h-8" />
                ) : (
                    <ToggleLeft className="w-8 h-8" />
                )}
            </button>
        </div>
    );
}

"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook to warn users about unsaved changes before leaving a page.
 * 
 * Usage:
 * const { setHasChanges, confirmNavigation } = useUnsavedChanges();
 * 
 * // Call when form changes
 * setHasChanges(true);
 * 
 * // Call when form is saved successfully
 * setHasChanges(false);
 */
export function useUnsavedChanges() {
    const [hasChanges, setHasChanges] = useState(false);
    const router = useRouter();

    // Handle browser back/refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasChanges]);

    // Function to confirm navigation programmatically
    const confirmNavigation = useCallback((path: string) => {
        if (hasChanges) {
            const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
            if (confirmed) {
                setHasChanges(false);
                router.push(path);
            }
            return confirmed;
        }
        router.push(path);
        return true;
    }, [hasChanges, router]);

    return {
        hasChanges,
        setHasChanges,
        confirmNavigation,
    };
}

/**
 * Component to show unsaved changes indicator
 */
export function UnsavedChangesIndicator({ hasChanges }: { hasChanges: boolean }) {
    if (!hasChanges) return null;

    return (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm text-sm">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            Unsaved changes
        </div>
    );
}

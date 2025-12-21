"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Page Error</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                    {error.message || "Something went wrong loading this page."}
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground mb-4">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Go back
                    </button>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="inline-flex items-center gap-1.5 border border-input px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                    >
                        <Home className="h-3.5 w-3.5" />
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, ReactNode } from "react";
import { ShieldAlert, Eye, EyeOff } from "lucide-react";

interface PayrollGateProps {
    children: ReactNode;
}

/**
 * Gate component that requires confirmation before showing sensitive payroll data.
 * Shows a warning and requires "Show Data" click before revealing content.
 */
export function PayrollGate({ children }: PayrollGateProps) {
    const [isRevealed, setIsRevealed] = useState(false);

    if (isRevealed) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsRevealed(false)}
                    className="absolute top-0 right-0 flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors z-10"
                >
                    <EyeOff className="h-3 w-3" />
                    Hide Data
                </button>
                {children}
            </div>
        );
    }

    return (
        <div className="p-8 border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <ShieldAlert className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Sensitive Data</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        You are about to view salary and payroll information.
                        This data is confidential and should only be accessed when necessary.
                    </p>
                </div>
                <button
                    onClick={() => setIsRevealed(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                    <Eye className="h-4 w-4" />
                    Show Payroll Data
                </button>
                <p className="text-xs text-muted-foreground">
                    Your access will be logged for security purposes.
                </p>
            </div>
        </div>
    );
}

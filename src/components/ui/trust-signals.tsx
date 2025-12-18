"use client";

import { Download, Shield, Database } from "lucide-react";
import Link from "next/link";

/**
 * Trust banner that shows data ownership messaging.
 * Shows on settings page to build confidence in data portability.
 */
export function DataOwnershipBanner() {
    return (
        <div className="rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 mb-6">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-green-200 dark:bg-green-900/50 rounded-lg">
                    <Shield className="h-4 w-4 text-green-700 dark:text-green-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-medium text-green-800 dark:text-green-100 text-sm">
                        Your data, your control
                    </h3>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Export everything anytime. Cancel anytime. Nothing is locked in.
                    </p>
                </div>
                <Link
                    href="/settings#data"
                    className="text-xs text-green-700 dark:text-green-300 hover:underline flex items-center gap-1 font-medium"
                >
                    <Download className="h-3 w-3" />
                    Export All
                </Link>
            </div>
        </div>
    );
}

/**
 * Inline trust badge for export buttons.
 * Use next to export buttons to reinforce data ownership.
 */
export function ExportTrustBadge() {
    return (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
            <Database className="h-3 w-3" />
            Your data
        </span>
    );
}

"use client";

import { AlertCircle, Info, Users } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { getLeaveBalance, checkLeaveConflicts } from "@/app/actions/leave";

interface ConsequencePreviewProps {
    leaveType: string;
    startDate: Date | null;
    endDate: Date | null;
    isHalfDay?: boolean;
}

interface PreviewData {
    currentBalance: number;
    daysRequested: number;
    newBalance: number;
    conflict: {
        hasConflict: boolean;
        level: "none" | "warning" | "critical";
        message: string;
        overlappingUsers: { name: string }[];
    } | null;
}

export function LeaveConsequencePreview({
    leaveType,
    startDate,
    endDate,
    isHalfDay = false,
}: ConsequencePreviewProps) {
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!leaveType || !startDate || !endDate) {
            setPreview(null);
            return;
        }

        const fetchPreview = async () => {
            try {
                const [balance, conflicts] = await Promise.all([
                    getLeaveBalance(),
                    checkLeaveConflicts(startDate, endDate),
                ]);

                if (!balance) return;

                // Calculate days requested
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                let daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                if (isHalfDay) daysRequested = 0.5;

                // Get current balance for this type
                const currentBalance = balance[leaveType as keyof typeof balance] || 0;
                const newBalance = currentBalance - daysRequested;

                setPreview({
                    currentBalance,
                    daysRequested,
                    newBalance,
                    conflict: conflicts ? {
                        hasConflict: conflicts.hasConflict,
                        level: conflicts.conflictLevel,
                        message: conflicts.message,
                        overlappingUsers: conflicts.overlappingUsers || [],
                    } : null,
                });
            } catch (error) {
                console.error("Failed to fetch preview:", error);
            }
        };

        startTransition(() => {
            fetchPreview();
        });
    }, [leaveType, startDate, endDate, isHalfDay]);

    if (!preview) return null;

    return (
        <div className="space-y-2 mt-4 p-3 rounded-lg bg-muted/50 border">
            <h4 className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                What this means
            </h4>

            {/* Balance Impact */}
            <div className="text-sm">
                <span className="text-muted-foreground">Your {leaveType} leave balance: </span>
                <span className="font-medium">{preview.currentBalance} days</span>
                <span className="text-muted-foreground"> → </span>
                <span className={preview.newBalance < 0 ? "text-red-600 font-bold" : "font-medium"}>
                    {preview.newBalance} days
                </span>
                {preview.newBalance < 0 && (
                    <span className="ml-2 text-xs text-red-600">(Insufficient balance!)</span>
                )}
            </div>

            {/* Conflict Warning */}
            {preview.conflict?.hasConflict && (
                <div className={`flex items-start gap-2 p-2 rounded ${preview.conflict.level === "critical"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}>
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="font-medium">{preview.conflict.message}</p>
                        {preview.conflict.overlappingUsers.length > 0 && (
                            <p className="text-xs mt-1 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {preview.conflict.overlappingUsers.map(u => u.name).join(", ")}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* No conflicts */}
            {!preview.conflict?.hasConflict && preview.newBalance >= 0 && (
                <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ No conflicts detected
                </div>
            )}
        </div>
    );
}

"use client";

import { format } from "date-fns";
import { Check, X, Calendar, Loader2, Trash2, MessageSquare } from "lucide-react";
import { approveLeave, rejectLeave, cancelLeave } from "@/app/actions/leave";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Leave {
    id: string;
    type: string;
    startDate: Date;
    endDate: Date;
    reason: string | null;
    status: string;
    userName: string | null;
    userId: string;
    comment?: string | null;
}

const statusColors: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
};

const typeLabels: Record<string, string> = {
    casual: "Casual Leave",
    sick: "Sick Leave",
    privilege: "Privilege Leave",
};

export function LeavesList({ leaves }: { leaves: Leave[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [commentFor, setCommentFor] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
    const [comment, setComment] = useState("");

    async function handleApprove(leaveId: string, withComment?: string) {
        setLoading(leaveId);
        const result = await approveLeave(leaveId, withComment);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Leave approved!");
        }
        setLoading(null);
        setCommentFor(null);
        setComment("");
        router.refresh();
    }

    async function handleReject(leaveId: string, withComment?: string) {
        setLoading(leaveId);
        const result = await rejectLeave(leaveId, withComment);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Leave rejected");
        }
        setLoading(null);
        setCommentFor(null);
        setComment("");
        router.refresh();
    }

    async function handleCancel(leaveId: string) {
        setLoading(leaveId);
        const result = await cancelLeave(leaveId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Leave request cancelled");
        }
        setLoading(null);
        router.refresh();
    }

    if (leaves.length === 0) {
        return (
            <div className="border rounded-xl p-12 text-center bg-card">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No leave requests yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    Need time off? Submit a request above and your manager will be notified instantly.
                </p>
                <a
                    href="#request-form"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    Request Leave
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {leaves.map((leave) => {
                const days = Math.ceil(
                    (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)
                ) + 1;
                const isLoading = loading === leave.id;

                return (
                    <div key={leave.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-semibold">{leave.userName}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[leave.status]}`}>
                                        {leave.status}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {typeLabels[leave.type] || leave.type} • {days} day{days > 1 ? 's' : ''}
                                </p>
                                <p className="text-sm mt-1">
                                    📅 {format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d, yyyy")}
                                </p>
                                {leave.reason && (
                                    <p className="text-sm text-muted-foreground mt-2">{leave.reason}</p>
                                )}
                            </div>

                            {leave.status === "pending" && (
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    {commentFor?.id === leave.id ? (
                                        <div className="space-y-2 p-2 border rounded-lg bg-muted/50">
                                            <textarea
                                                placeholder="Add a comment (optional)..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                rows={2}
                                                className="w-full text-sm p-2 border rounded bg-background resize-none"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (commentFor.action === "approve") {
                                                            handleApprove(leave.id, comment || undefined);
                                                        } else {
                                                            handleReject(leave.id, comment || undefined);
                                                        }
                                                    }}
                                                    disabled={isLoading}
                                                    className={`flex-1 text-xs py-1.5 rounded font-medium ${commentFor.action === "approve"
                                                            ? "bg-green-600 text-white"
                                                            : "bg-red-600 text-white"
                                                        } disabled:opacity-50`}
                                                >
                                                    {isLoading ? "..." : commentFor.action === "approve" ? "Approve" : "Reject"}
                                                </button>
                                                <button
                                                    onClick={() => { setCommentFor(null); setComment(""); }}
                                                    className="text-xs text-muted-foreground hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCommentFor({ id: leave.id, action: "approve" })}
                                                disabled={isLoading}
                                                className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                                                title="Approve"
                                            >
                                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => setCommentFor({ id: leave.id, action: "reject" })}
                                                disabled={isLoading}
                                                className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCancel(leave.id)}
                                                disabled={isLoading}
                                                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                title="Cancel (self)"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, X, Calendar, DollarSign, Ticket, Loader2 } from "lucide-react";
import { approveItem, rejectItem } from "@/app/actions/approvals";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

const typeIcons: Record<string, any> = {
    leave: Calendar,
    expense: DollarSign,
    request: Ticket,
};

const typeColors: Record<string, string> = {
    leave: "bg-green-100 text-green-700 border-green-200",
    expense: "bg-blue-100 text-blue-700 border-blue-200",
    request: "bg-purple-100 text-purple-700 border-purple-200",
};

interface ApprovalItem {
    id: string;
    type: "leave" | "expense" | "request";
    title: string;
    description: string;
    requesterName: string;
    requesterId: string;
    createdAt: Date;
    priority?: string;
    amount?: string;
    startDate?: Date;
    endDate?: Date;
}

export function ApprovalsList({ items }: { items: ApprovalItem[] }) {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<string | null>(null);
    const { confirm, Dialog: ConfirmDialogComponent } = useConfirmDialog();

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const selectAll = () => {
        if (selected.size === items.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(items.map(i => i.id)));
        }
    };

    async function handleApprove(item: ApprovalItem) {
        setLoading(item.id);
        const result = await approveItem(item.type, item.id);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(`${item.title} approved`);
        }
        setLoading(null);
        router.refresh();
    }

    async function handleReject(item: ApprovalItem) {
        const confirmed = await confirm({
            title: `Reject ${item.title}?`,
            description: `This will reject ${item.requesterName}'s request. They will be notified of the rejection.`,
            confirmText: "Reject",
            confirmVariant: "destructive",
        });
        if (!confirmed) return;

        setLoading(item.id);
        const result = await rejectItem(item.type, item.id);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(`${item.title} rejected`);
        }
        setLoading(null);
        router.refresh();
    }

    if (items.length === 0) {
        return (
            <div className="border rounded-lg p-12 text-center">
                <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-1">All caught up!</h3>
                <p className="text-muted-foreground">No pending approvals at the moment.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Bulk Actions */}
            <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={selected.size === items.length && items.length > 0}
                        onChange={selectAll}
                        className="rounded"
                    />
                    Select all ({items.length})
                </label>
                {selected.size > 0 && (
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Approve Selected ({selected.size})
                        </button>
                        <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            Reject Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
                {items.map((item) => {
                    const Icon = typeIcons[item.type];
                    const isLoading = loading === item.id;

                    return (
                        <div
                            key={`${item.type}-${item.id}`}
                            className={`border rounded-lg p-4 bg-card transition-all ${selected.has(item.id) ? 'ring-2 ring-primary' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    checked={selected.has(item.id)}
                                    onChange={() => toggleSelect(item.id)}
                                    className="mt-1 rounded"
                                />

                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[item.type]}`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[item.type]}`}>
                                            {item.type}
                                        </span>
                                        {item.priority && item.priority !== "normal" && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                                {item.priority}
                                            </span>
                                        )}
                                        {/* Pending days SLA badge */}
                                        {(() => {
                                            const days = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                                            if (days >= 5) {
                                                return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium animate-pulse">⚠️ {days} days pending</span>;
                                            } else if (days >= 3) {
                                                return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">⏰ {days} days pending</span>;
                                            } else if (days >= 1) {
                                                return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{days} day{days > 1 ? 's' : ''} ago</span>;
                                            }
                                            return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Today</span>;
                                        })()}
                                    </div>

                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {item.requesterName} • {format(new Date(item.createdAt), "MMM d, yyyy")}
                                    </p>

                                    {item.description && (
                                        <p className="text-sm mt-2">{item.description}</p>
                                    )}

                                    {item.startDate && item.endDate && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            📅 {format(new Date(item.startDate), "MMM d")} - {format(new Date(item.endDate), "MMM d, yyyy")}
                                        </p>
                                    )}

                                    {item.amount && (
                                        <p className="text-sm font-medium mt-1">💰 {item.amount}</p>
                                    )}
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleApprove(item)}
                                        disabled={isLoading}
                                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                                        title="Approve"
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleReject(item)}
                                        disabled={isLoading}
                                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                                        title="Reject"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <ConfirmDialogComponent />
        </div>
    );
}

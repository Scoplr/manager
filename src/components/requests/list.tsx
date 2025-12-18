"use client";

import { format } from "date-fns";
import { Trash2, Package, KeyRound, FileText, DollarSign, HelpCircle } from "lucide-react";
import { deleteRequest, updateRequestStatus } from "@/app/actions/requests";
import { useRouter } from "next/navigation";

const categoryIcons: Record<string, any> = {
    equipment: Package,
    access: KeyRound,
    document: FileText,
    reimbursement: DollarSign,
    other: HelpCircle,
};

const categoryLabels: Record<string, string> = {
    equipment: "Equipment",
    access: "Access",
    document: "Document",
    reimbursement: "Reimbursement",
    other: "Other",
};

const statusStyles: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-700",
    "in-progress": "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
};

const priorityStyles: Record<string, string> = {
    low: "text-gray-500",
    normal: "text-blue-500",
    high: "text-orange-500",
    urgent: "text-red-600 font-medium",
};

export function RequestsList({ requests, users }: { requests: any[]; users: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Delete this request?")) {
            await deleteRequest(id);
            router.refresh();
        }
    }

    async function handleStatusChange(id: string, status: "open" | "in-progress" | "resolved" | "closed") {
        await updateRequestStatus(id, status);
        router.refresh();
    }

    if (requests.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No requests yet. Submit your first internal request!
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {requests.map((req) => {
                const Icon = categoryIcons[req.category] || HelpCircle;

                return (
                    <div key={req.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-medium">{req.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[req.status]}`}>
                                            {req.status}
                                        </span>
                                        <span className={`text-xs ${priorityStyles[req.priority]}`}>
                                            {req.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {req.requesterName} • {categoryLabels[req.category]} • {format(new Date(req.createdAt), "MMM d")}
                                    </p>
                                    {req.description && (
                                        <p className="text-sm text-muted-foreground mt-2">{req.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={req.status}
                                    onChange={(e) => handleStatusChange(req.id, e.target.value as any)}
                                    className="text-xs border rounded p-1 bg-background"
                                >
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <button
                                    onClick={() => handleDelete(req.id)}
                                    className="text-muted-foreground hover:text-red-600 p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

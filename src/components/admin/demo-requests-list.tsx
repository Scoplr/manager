"use client";

import { useState } from "react";
import { approveDemoRequest, rejectDemoRequest } from "@/app/actions/demo-requests";
import { Check, X, Loader2, Mail, Building2, Briefcase, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DemoRequest {
    id: string;
    email: string;
    name: string;
    designation: string | null;
    organizationName: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
}

interface DemoRequestsListProps {
    requests: DemoRequest[];
    adminId: string;
}

export function DemoRequestsList({ requests: initialRequests, adminId }: DemoRequestsListProps) {
    const router = useRouter();
    const [requests, setRequests] = useState(initialRequests);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleApprove(id: string) {
        setLoading(id);
        try {
            const result = await approveDemoRequest(id, adminId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Request approved! User will receive login credentials.");
                setRequests(requests.filter(r => r.id !== id));
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to approve request");
        } finally {
            setLoading(null);
        }
    }

    async function handleReject(id: string) {
        if (!confirm("Are you sure you want to reject this request?")) return;

        setLoading(id);
        try {
            const result = await rejectDemoRequest(id, adminId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Request rejected");
                setRequests(requests.filter(r => r.id !== id));
            }
        } catch (error) {
            toast.error("Failed to reject request");
        } finally {
            setLoading(null);
        }
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No pending requests</p>
            </div>
        );
    }

    return (
        <div className="divide-y">
            {requests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-muted/30 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{request.name}</p>
                            {request.designation && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {request.designation}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3" />
                                {request.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {request.organizationName}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleApprove(request.id)}
                            disabled={loading === request.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading === request.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Approve
                        </button>
                        <button
                            onClick={() => handleReject(request.id)}
                            disabled={loading === request.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border rounded-lg hover:bg-muted disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

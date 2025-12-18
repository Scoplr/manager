import { getRequests } from "@/app/actions/requests";
import { Ticket } from "lucide-react";
import { requireAnyRole } from "@/lib/role-guards";

export default async function OperationsRequestsPage() {
    await requireAnyRole(["hr", "admin"], "/operations");

    const requests = await getRequests();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{requests.length} requests</p>
            </div>

            <div className="space-y-3">
                {requests.length === 0 ? (
                    <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                        No pending requests.
                    </div>
                ) : (
                    requests.map((req: any) => (
                        <div
                            key={req.id}
                            className="p-4 bg-card border rounded-lg flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <Ticket className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{req.type}</p>
                                    <p className="text-sm text-muted-foreground">{req.description?.slice(0, 50)}...</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${req.status === "approved" ? "bg-green-100 text-green-700" :
                                    req.status === "rejected" ? "bg-red-100 text-red-700" :
                                        "bg-yellow-100 text-yellow-700"
                                }`}>
                                {req.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import { getRequests, getRequestStats } from "@/app/actions/requests";
import { getUsers } from "@/app/actions/people";
import { PageHeader } from "@/components/ui/page-header";
import { Ticket } from "lucide-react";
import { RequestsList } from "@/components/requests/list";
import { RequestForm } from "@/components/requests/form";

export default async function RequestsPage() {
    const requests = await getRequests();
    const stats = await getRequestStats();
    const users = await getUsers();

    return (
        <div>
            <PageHeader
                icon="Ticket"
                iconColor="text-pink-600"
                iconBg="bg-pink-100"
                title="Service Desk"
                description="Submit and track company help requests and tickets."
                tip="Need equipment, access, or a document? Submit a request here instead of messaging."
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="border rounded-lg p-4 text-center bg-card">
                    <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-card">
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-card">
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-card">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                <RequestsList requests={requests} users={users} />
                <div className="lg:sticky lg:top-4 h-fit">
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-3">New Request</h3>
                        <RequestForm users={users} />
                    </div>
                </div>
            </div>
        </div>
    );
}

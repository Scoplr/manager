import { getRecentActivity } from "@/app/actions/activity";
import { PageHeader } from "@/components/ui/page-header";
import { Activity } from "lucide-react";
import { ActivityList } from "@/components/activity/activity-list";
import { requireAnyRole } from "@/lib/role-guards";

export default async function ActivityPage() {
    // Only Admin can access activity logs
    await requireAnyRole(["admin"], "/");

    const activities = await getRecentActivity(100);

    return (
        <div>
            <PageHeader
                icon="Activity"
                iconColor="text-cyan-600"
                iconBg="bg-cyan-100"
                title="Activity Feed"
                description="See what's happening across your organization."
                tip="All actions like approvals, task completions, and document updates appear here."
            />

            <ActivityList activities={activities} />
        </div>
    );
}

import { getNotifications, markAllAsRead } from "@/app/actions/notifications";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationsListClient } from "@/components/notifications/notifications-list-client";

type NotificationType = "leave" | "expense" | "task" | "announcement" | "system";

export default async function NotificationsPage() {
    const notifications = await getNotifications();

    // Cast to correct type (DB returns string, component expects union)
    const typedNotifications = notifications.map(n => ({
        ...n,
        type: n.type as NotificationType,
    }));

    return (
        <div>
            <PageHeader
                icon="Bell"
                iconColor="text-violet-600"
                iconBg="bg-violet-100"
                title="Notifications"
                description="View and manage all your notifications."
            />

            <NotificationsListClient notifications={typedNotifications} />
        </div>
    );
}

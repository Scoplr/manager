import { getUsers } from "@/app/actions/people";
import { PageHeader } from "@/components/ui/page-header";
import { InviteUserForm } from "@/components/people/invite-user-form";
import { Users, Mail, Shield, UserPlus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { requireAnyRole } from "@/lib/role-guards";

export default async function ManageUsersPage() {
    await requireAnyRole(["admin", "hr"], "/people");

    const users = await getUsers();
    const activeUsers = users.filter(u => u.status === "active");
    const invitedUsers = users.filter(u => u.status === "invited");

    return (
        <div className="space-y-8">
            <PageHeader
                icon="Users"
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
                title="Manage Users"
                description="Invite team members and manage their access."
            />

            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                {/* User List */}
                <div className="space-y-6">
                    {/* Pending Invites */}
                    {invitedUsers.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                Pending Invites ({invitedUsers.length})
                            </h2>
                            <div className="space-y-2">
                                {invitedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                                <UserPlus className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{user.name || "No name"}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                Awaiting
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Users */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">
                            Active Users ({activeUsers.length})
                        </h2>
                        <div className="space-y-2">
                            {activeUsers.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/team/${user.id}`}
                                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-3"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{user.name || "Unnamed"}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Shield className="h-3 w-3" />
                                        {user.role}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Invite Form */}
                <div className="lg:sticky lg:top-4 h-fit">
                    <div className="border rounded-lg p-5 bg-card">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Invite Team Member
                        </h3>
                        <InviteUserForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

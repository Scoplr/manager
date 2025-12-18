import { getUsers } from "@/app/actions/people";
import { Users, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default async function PeopleTeamPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {users.length} team members
                </p>
                <Link
                    href="/people/manage"
                    className="text-sm text-primary hover:underline"
                >
                    Manage Users →
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => (
                    <Link
                        key={user.id}
                        href={`/team/${user.id}`}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user.name || "Unnamed"}</p>
                                <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Shield className="h-3 w-3" />
                                {user.role}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No team members yet</p>
                </div>
            )}
        </div>
    );
}

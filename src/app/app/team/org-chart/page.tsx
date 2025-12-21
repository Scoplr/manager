import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";
import Link from "next/link";

interface OrgNode {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
}

export default async function OrgChartPage() {
    const { authorized } = await requireAuth();
    if (!authorized) {
        return <div>Not authorized</div>;
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) {
        return <div>Error loading organization</div>;
    }

    const orgUsers = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId));

    // Group by role for visual hierarchy
    const roleOrder = ["admin", "manager", "member"] as const;
    const groupedUsers: Record<string, OrgNode[]> = {
        admin: [],
        manager: [],
        member: [],
    };

    orgUsers.forEach(u => {
        const role = u.role || "member";
        groupedUsers[role]?.push({
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            role,
        });
    });

    const roleLabels: Record<string, string> = {
        admin: "Leadership",
        manager: "Managers",
        member: "Team Members",
    };

    const roleColors: Record<string, string> = {
        admin: "border-purple-500 bg-purple-50 dark:bg-purple-950/30",
        manager: "border-green-500 bg-green-50 dark:bg-green-950/30",
        member: "border-gray-300 bg-gray-50 dark:bg-gray-900",
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organization Chart</h1>
                <p className="text-muted-foreground mt-1">
                    Team structure by role
                </p>
            </div>

            <div className="space-y-8">
                {roleOrder.map(role => {
                    const members = groupedUsers[role];
                    if (members.length === 0) return null;

                    return (
                        <div key={role}>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${role === "admin" ? "bg-purple-500" :
                                        role === "manager" ? "bg-green-500" : "bg-gray-400"
                                    }`} />
                                {roleLabels[role]} ({members.length})
                            </h2>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                {members.map(member => (
                                    <Link
                                        key={member.id}
                                        href={`/team/${member.id}`}
                                        className={`rounded-lg border-2 p-4 text-center shadow-sm hover:shadow-md transition-shadow ${roleColors[role]}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center font-semibold text-lg">
                                            {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                        </div>
                                        <p className="font-semibold truncate">{member.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-sm text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
                💡 Tip: To enable a full hierarchy view, add manager assignments in Team settings.
            </div>
        </div>
    );
}

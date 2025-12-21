import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";
import Link from "next/link";

export default async function PeopleOrgChartPage() {
    const { authorized } = await requireAuth();
    if (!authorized) return <div>Not authorized</div>;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return <div>Error loading organization</div>;

    const orgUsers = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
        .from(users)
        .where(eq(users.organizationId, orgContext.orgId));

    const roleOrder = ["admin", "manager", "member"] as const;
    const groupedUsers: Record<string, typeof orgUsers> = {
        admin: [],
        manager: [],
        member: [],
    };

    orgUsers.forEach(u => {
        const role = u.role || "member";
        groupedUsers[role]?.push(u);
    });

    const roleLabels: Record<string, string> = {
        admin: "Leadership",
        manager: "Managers",
        member: "Team Members",
    };

    const roleColors: Record<string, string> = {
        admin: "border-purple-500 bg-purple-50 dark:bg-purple-950/50",
        manager: "border-green-500 bg-green-50 dark:bg-green-950/50",
        member: "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/40",
    };

    return (
        <div className="space-y-6">
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
                                        {(member.name || member.email).split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </div>
                                    <p className="font-semibold truncate">{member.name || member.email}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            })}

            <div className="text-sm text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
                💡 Tip: To enable a full hierarchy view, add manager assignments in Team settings.
            </div>
        </div>
    );
}

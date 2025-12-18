import { getTeamAvailability } from "@/app/actions/availability";
import { Building2, Home, Coffee, Palmtree, ChevronRight } from "lucide-react";
import Link from "next/link";

const statusIcons = {
    "in-office": { icon: Building2, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/40" },
    "remote": { icon: Home, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40" },
    "away": { icon: Coffee, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/40" },
    "vacation": { icon: Palmtree, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/40" },
};

export async function WhosInWidget() {
    const team = await getTeamAvailability();

    const byStatus = {
        "in-office": team.filter(t => t.effectiveStatus === "in-office"),
        "remote": team.filter(t => t.effectiveStatus === "remote"),
        "away": team.filter(t => t.effectiveStatus === "away"),
        "vacation": team.filter(t => t.effectiveStatus === "vacation"),
    };

    return (
        <Link href="/people" className="block border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors group">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Who's In Today</h3>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="space-y-3">
                {(Object.entries(byStatus) as [keyof typeof statusIcons, typeof team][]).map(([status, users]) => {
                    if (users.length === 0) return null;
                    const { icon: Icon, color, bg } = statusIcons[status];

                    return (
                        <div key={status} className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-full ${bg} flex items-center justify-center`}>
                                <Icon className={`h-3 w-3 ${color}`} />
                            </div>
                            <span className="capitalize text-sm font-medium">{status.replace("-", " ")}</span>
                            <span className="text-xs text-muted-foreground">({users.length})</span>
                            <div className="flex -space-x-1 ml-auto">
                                {users.slice(0, 3).map((user, i) => (
                                    <div
                                        key={user.id}
                                        className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-bold"
                                        title={user.name || ""}
                                    >
                                        {user.name?.charAt(0) || "?"}
                                    </div>
                                ))}
                                {users.length > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                                        +{users.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Link>
    );
}

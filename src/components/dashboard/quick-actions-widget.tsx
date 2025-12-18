import Link from "next/link";
import { Plus, Palmtree, Calculator, CheckSquare } from "lucide-react";

export function QuickActionsWidget() {
    const actions = [
        { label: "Add Employee", href: "/team?action=add", icon: Plus, color: "bg-blue-100 text-blue-700" },
        { label: "Approve Leaves", href: "/approvals", icon: Palmtree, color: "bg-green-100 text-green-700" },
        { label: "Run Payroll", href: "/payroll", icon: Calculator, color: "bg-purple-100 text-purple-700" },
        { label: "Review Tasks", href: "/tasks", icon: CheckSquare, color: "bg-orange-100 text-orange-700" },
    ];

    return (
        <div className="border rounded-lg p-6 bg-card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-2">
                {actions.map(action => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg ${action.color} hover:opacity-80 transition-opacity`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium text-center">{action.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

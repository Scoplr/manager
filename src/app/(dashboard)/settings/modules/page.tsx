import { PageHeader } from "@/components/ui/page-header";
import { Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { requireAnyRole } from "@/lib/role-guards";
import { ModuleToggle } from "@/components/settings/module-toggle";

const modules = [
    {
        key: "tasks",
        name: "Task Management",
        description: "Create and track tasks, assign to team members, set priorities and due dates.",
        default: true,
    },
    {
        key: "leaves",
        name: "Leave Management",
        description: "Request and approve time off, track leave balances, set policies.",
        default: true,
    },
    {
        key: "expenses",
        name: "Expense Management",
        description: "Submit and approve expense reports, track spending by category.",
        default: true,
    },
    {
        key: "payroll",
        name: "Payroll",
        description: "Generate payslips, manage salary details, run payroll cycles.",
        default: true,
    },
    {
        key: "onboarding",
        name: "Onboarding",
        description: "Create onboarding checklists, track new hire progress.",
        default: true,
    },
    {
        key: "offboarding",
        name: "Offboarding",
        description: "Manage exit processes, equipment returns, and handovers.",
        default: false,
    },
    {
        key: "pulse",
        name: "Team Pulse Surveys",
        description: "Collect anonymous weekly check-ins to gauge team health.",
        default: false,
    },
    {
        key: "goals",
        name: "Goals & OKRs",
        description: "Set and track objectives and key results across the organization.",
        default: false,
    },
    {
        key: "risks",
        name: "Risk Register",
        description: "Track and mitigate project and operational risks.",
        default: false,
    },
    {
        key: "feedback",
        name: "Feedback & Recognition",
        description: "Give and receive feedback, celebrate team wins.",
        default: true,
    },
    {
        key: "rooms",
        name: "Room Booking",
        description: "Book meeting rooms and manage facility resources.",
        default: false,
    },
    {
        key: "knowledge",
        name: "Knowledge Base",
        description: "Create and organize internal documentation and guides.",
        default: true,
    },
];

export default async function ModulesSettingsPage() {
    // Only Admin can access module configuration
    await requireAnyRole(["admin"], "/settings");

    return (
        <div className="space-y-6">
            <PageHeader
                title="Modules & Features"
                description="Enable or disable features for your organization"
                icon="Settings"
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
            />

            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="p-4 bg-muted/30 border-b">
                    <p className="text-sm text-muted-foreground">
                        Toggle features on or off. Disabled features won't appear in the sidebar.
                    </p>
                </div>

                <div className="divide-y">
                    {modules.map(mod => (
                        <ModuleToggle
                            key={mod.key}
                            moduleKey={mod.key}
                            name={mod.name}
                            description={mod.description}
                            defaultEnabled={mod.default}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

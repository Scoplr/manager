import { HubTabs } from "@/components/ui/hub-tabs";
import { Briefcase, Users2, Package, DoorOpen } from "lucide-react";

const operationsTabs = [
    { href: "/operations", label: "Overview", icon: <Briefcase className="h-4 w-4" /> },
    { href: "/operations/payroll", label: "Records", icon: <Users2 className="h-4 w-4" /> },
    { href: "/operations/assets", label: "Assets", icon: <Package className="h-4 w-4" /> },
    { href: "/operations/rooms", label: "Bookings", icon: <DoorOpen className="h-4 w-4" /> },
];

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    People Ops
                </h1>
                <p className="text-muted-foreground mt-1">Assets, onboarding, facilities, and employee records</p>
            </div>
            <HubTabs tabs={operationsTabs} basePath="/operations" />
            {children}
        </div>
    );
}


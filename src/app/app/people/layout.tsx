import { HubTabs } from "@/components/ui/hub-tabs";
import { Users, UserPlus, UserMinus, Network } from "lucide-react";

const peopleTabs = [
    { href: "/people", label: "Team", icon: <Users className="h-4 w-4" /> },
    { href: "/people/org-chart", label: "Org Chart", icon: <Network className="h-4 w-4" /> },
    { href: "/people/onboarding", label: "Onboarding", icon: <UserPlus className="h-4 w-4" /> },
    { href: "/people/offboarding", label: "Offboarding", icon: <UserMinus className="h-4 w-4" /> },
];

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Users className="h-5 w-5" />
                    </div>
                    People
                </h1>
                <p className="text-muted-foreground mt-1">Team management, feedback, and employee lifecycle</p>
            </div>
            <HubTabs tabs={peopleTabs} basePath="/people" />
            {children}
        </div>
    );
}

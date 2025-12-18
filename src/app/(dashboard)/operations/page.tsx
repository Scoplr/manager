import { Users2, Package, Ticket, UserPlus } from "lucide-react";
import Link from "next/link";

export default function OperationsOverviewPage() {
    const quickLinks = [
        { href: "/operations/payroll", label: "Employee Records", icon: Users2, color: "bg-green-100 text-green-600", desc: "Salary details, employment info" },
        { href: "/operations/assets", label: "Equipment", icon: Package, color: "bg-blue-100 text-blue-600", desc: "Track company assets" },
        { href: "/operations/requests", label: "Requests", icon: Ticket, color: "bg-purple-100 text-purple-600", desc: "Handle employee requests" },
        { href: "/operations/onboarding", label: "Onboarding", icon: UserPlus, color: "bg-teal-100 text-teal-600", desc: "New hire checklists" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                {quickLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="p-6 border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-4"
                    >
                        <div className={`h-12 w-12 rounded-lg ${link.color} flex items-center justify-center`}>
                            <link.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-medium">{link.label}</p>
                            <p className="text-sm text-muted-foreground">{link.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

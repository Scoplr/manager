import { Briefcase, Target, BookOpen, Megaphone } from "lucide-react";
import Link from "next/link";

export default function WorkspaceOverviewPage() {
    const quickLinks = [
        { href: "/workspace/projects", label: "Projects", icon: Briefcase, color: "bg-indigo-100 text-indigo-600", desc: "Manage team projects" },
        { href: "/workspace/goals", label: "Goals & OKRs", icon: Target, color: "bg-teal-100 text-teal-600", desc: "Track objectives" },
        { href: "/workspace/docs", label: "Knowledge Base", icon: BookOpen, color: "bg-amber-100 text-amber-600", desc: "Company documentation" },
        { href: "/workspace/announcements", label: "Announcements", icon: Megaphone, color: "bg-rose-100 text-rose-600", desc: "Company updates" },
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

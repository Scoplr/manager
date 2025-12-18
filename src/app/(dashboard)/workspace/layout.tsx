import { HubTabs } from "@/components/ui/hub-tabs";
import { FolderKanban, Briefcase, BookOpen, Wand2, Megaphone, Activity } from "lucide-react";

const workspaceTabs = [
    { href: "/workspace", label: "Overview", icon: <FolderKanban className="h-4 w-4" /> },
    { href: "/workspace/projects", label: "Projects", icon: <Briefcase className="h-4 w-4" /> },
    { href: "/workspace/docs", label: "Docs", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/workspace/templates", label: "Templates", icon: <Wand2 className="h-4 w-4" /> },
    { href: "/workspace/announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
    { href: "/workspace/activity", label: "Activity", icon: <Activity className="h-4 w-4" /> },
];

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                    Workspace
                </h1>
                <p className="text-muted-foreground mt-1">Projects, documentation, and company updates</p>
            </div>
            <HubTabs tabs={workspaceTabs} basePath="/workspace" />
            {children}
        </div>
    );
}

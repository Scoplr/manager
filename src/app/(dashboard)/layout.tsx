import { Sidebar } from "@/components/ui/sidebar";
import { QuickAddButton } from "@/components/layout/quick-add-button";
import { NotificationsDropdown } from "@/components/ui/notifications-dropdown";
import { CommandPalette } from "@/components/ui/command-palette";
import { KeyboardShortcutsModal } from "@/components/ui/keyboard-shortcuts";
import { MobileActionButton } from "@/components/layout/mobile-action-button";

// Force dynamic rendering for all dashboard routes since they require authentication
// which uses headers() - not compatible with static rendering
export const dynamic = 'force-dynamic';


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground relative">
            <Sidebar />
            <main className="flex-1 md:ml-64 overflow-y-auto bg-transparent relative">
                <div className="absolute top-4 right-6 z-40 md:top-6 md:right-8">
                    <NotificationsDropdown />
                </div>
                <div className="p-6 md:p-8 mx-auto max-w-6xl min-h-screen pt-16 md:pt-6">
                    {children}
                </div>
            </main>
            <QuickAddButton />
            <MobileActionButton />
            <CommandPalette />
            <KeyboardShortcutsModal />
        </div>
    );
}

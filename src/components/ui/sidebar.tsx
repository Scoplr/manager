import Link from "next/link";
import { cookies } from "next/headers";
import { LayoutDashboard, CheckSquare, Settings, BookOpen, Users, Palmtree, Plus, Inbox, CalendarDays, Receipt, Briefcase, Send, Eye, Clock, Sparkles } from "lucide-react";
import { getNotifications } from "@/app/actions/notifications";
import { getApprovalCounts } from "@/app/actions/approvals";
import { getOrganizationSettings, getOrganization } from "@/app/actions/organization";
import { MobileNav } from "@/components/layout/mobile-nav";
import { auth } from "@/lib/auth";
import { SidebarClient } from "./sidebar-client";

// Define role access levels
type Role = 'employee' | 'manager' | 'hr' | 'admin';

interface NavItem {
    href: string;
    label: string;
    Icon: any;
    badge?: boolean;
    roles?: Role[]; // If undefined, visible to all
    moduleKey?: string; // Key to check against enabled modules
    description?: string; // Tooltip hint
}

interface NavGroup {
    label: string;
    items: NavItem[];
    roles?: Role[]; // If undefined, visible to all
    collapsible?: boolean;
}

// ACTION-BASED navigation structure
// Organized by: What do you want to do right now?
const navGroups: NavGroup[] = [
    {
        label: "Focus",
        collapsible: false,
        items: [
            { href: "/", label: "Today", Icon: LayoutDashboard, description: "What needs your attention" },
            { href: "/approvals", label: "Inbox", Icon: Inbox, badge: true, roles: ['manager', 'hr', 'admin'], description: "Approvals waiting for you" },
            { href: "/tasks", label: "My Tasks", Icon: CheckSquare },
        ]
    },
    {
        label: "Request",
        collapsible: false,
        items: [
            { href: "/leaves", label: "Time Off", Icon: Palmtree, description: "Request or view leave" },
            { href: "/expenses", label: "Expense", Icon: Receipt, description: "Submit a claim" },
        ]
    },
    {
        label: "Browse",
        collapsible: false,
        items: [
            { href: "/calendar", label: "Calendar", Icon: CalendarDays, description: "Who's in, what's happening" },
            { href: "/people", label: "People", Icon: Users },
            { href: "/operations", label: "People Ops", Icon: Briefcase, roles: ['hr', 'admin'], description: "Assets, onboarding, records" },
        ]
    },
];

// Helper to get user role from session
async function getUserRole(): Promise<Role> {
    const session = await auth();
    const role = (session?.user as any)?.role || 'employee';

    if (role === 'admin' || role === 'ceo') return 'admin';
    if (role === 'hr') return 'hr';
    if (role === 'manager') return 'manager';
    return 'employee';
}

// Get simulated view mode from cookie (for admin users)
async function getViewMode(): Promise<Role | null> {
    const cookieStore = await cookies();
    const viewMode = cookieStore.get('admin-view-mode')?.value as Role | undefined;
    return viewMode || null;
}

// Filter navigation based on user role
function filterNavByRole(groups: NavGroup[], userRole: Role): NavGroup[] {
    const roleHierarchy: Role[] = ['employee', 'manager', 'hr', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);

    return groups
        .filter(group => {
            if (!group.roles) return true;
            return group.roles.some(role => roleHierarchy.indexOf(role) <= userRoleIndex);
        })
        .map(group => ({
            ...group,
            items: group.items.filter(item => {
                if (!item.roles) return true;
                return item.roles.some(role => roleHierarchy.indexOf(role) <= userRoleIndex);
            })
        }))
        .filter(group => group.items.length > 0);
}

// Filter navigation based on enabled modules
function filterNavByModules(
    groups: NavGroup[],
    enabledModules: string[],
    hiddenModules: string[]
): NavGroup[] {
    // Core modules that are always visible
    const coreModules = ['dashboard', 'tasks', 'team', 'leaves', 'settings'];

    return groups.map(group => ({
        ...group,
        items: group.items.filter(item => {
            // No module key = always visible
            if (!item.moduleKey) return true;
            // Core modules are always visible
            if (coreModules.includes(item.moduleKey)) return true;
            // Check if hidden
            if (hiddenModules.includes(item.moduleKey)) return false;
            // Check if enabled (or if no config, show all)
            if (enabledModules.length === 0) return true;
            return enabledModules.includes(item.moduleKey);
        })
    })).filter(group => group.items.length > 0);
}

export async function Sidebar() {
    const [notifications, approvalCounts, userRole, viewMode, orgSettings, organization] = await Promise.all([
        getNotifications(),
        getApprovalCounts(),
        getUserRole(),
        getViewMode(),
        getOrganizationSettings(),
        getOrganization(),
    ]);

    // Get module configuration
    const moduleConfig = orgSettings?.moduleConfig;
    const enabledModules = moduleConfig?.enabledModules || [];
    const hiddenModules = moduleConfig?.hiddenModules || [];

    // Check if user is in Acme organization (for view switcher access)
    const orgName = organization?.name || '';
    const isAcmeOrg = orgName.toLowerCase().includes('acme');

    // For admin users, use the view mode from cookie (if set) to filter navigation
    const isRealAdmin = userRole === 'admin';
    const isAcmeAdmin = isRealAdmin && isAcmeOrg; // Only Acme admins can use view switcher
    const effectiveRole = isRealAdmin && viewMode ? viewMode : userRole;

    // Filter nav groups based on effective role
    let filteredGroups = filterNavByRole(navGroups, effectiveRole);

    // Then filter by enabled modules
    filteredGroups = filterNavByModules(filteredGroups, enabledModules, hiddenModules);

    // Serialize for client component (convert Icons to string names)
    const serializedGroups = filteredGroups.map(group => ({
        ...group,
        items: group.items.map(item => ({
            href: item.href,
            label: item.label,
            iconName: item.Icon.displayName || item.Icon.name || 'Circle',
            badge: item.badge,
        }))
    }));

    return (
        <>
            {/* Mobile Header */}
            <MobileNav approvalCount={approvalCounts.total} userRole={effectiveRole} />

            {/* Desktop Sidebar - client component for interactivity */}
            <SidebarClient
                navGroups={serializedGroups}
                approvalCount={approvalCounts.total}
                notifications={notifications}
                userRole={isRealAdmin ? 'admin' : effectiveRole}
                isAcmeAdmin={isAcmeAdmin}
            />
        </>
    );
}


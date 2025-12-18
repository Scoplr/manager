/**
 * Module Configuration for wrkspace
 * Defines core/optional modules and profile presets
 */

export type ModuleId = keyof typeof MODULES;

export interface ModuleDefinition {
    name: string;
    description: string;
    href: string;
    category: "core" | "productivity" | "operations" | "hr" | "people" | "compliance";
    core?: boolean;      // Cannot be hidden
    advanced?: boolean;  // Hidden by default for lean teams
}

export const MODULES = {
    // CORE (always enabled, cannot be hidden)
    dashboard: {
        name: "Dashboard",
        description: "Your home base",
        href: "/",
        category: "core",
        core: true,
    },
    tasks: {
        name: "My Tasks",
        description: "Personal task management",
        href: "/tasks",
        category: "core",
        core: true,
    },
    team: {
        name: "Team Directory",
        description: "See who's in your organization",
        href: "/team",
        category: "core",
        core: true,
    },
    leaves: {
        name: "Time Off",
        description: "Request and manage leave",
        href: "/leaves",
        category: "core",
        core: true,
    },
    settings: {
        name: "Settings",
        description: "Configure your workspace",
        href: "/settings",
        category: "core",
        core: true,
    },

    // PRODUCTIVITY
    inbox: {
        name: "Inbox",
        description: "Pending approvals and requests",
        href: "/approvals",
        category: "productivity",
    },
    calendar: {
        name: "Calendar",
        description: "Team calendar and events",
        href: "/calendar",
        category: "productivity",
    },
    projects: {
        name: "Projects",
        description: "Organize work into projects",
        href: "/projects",
        category: "productivity",
    },
    goals: {
        name: "Goals & OKRs",
        description: "Set and track objectives",
        href: "/goals",
        category: "productivity",
    },
    knowledge: {
        name: "Docs",
        description: "Team knowledge base",
        href: "/knowledge",
        category: "productivity",
    },

    // OPERATIONS
    expenses: {
        name: "Expenses",
        description: "Submit and track expense claims",
        href: "/expenses",
        category: "operations",
    },
    assets: {
        name: "Equipment",
        description: "Track company assets",
        href: "/assets",
        category: "operations",
        advanced: true,
    },
    rooms: {
        name: "Room Booking",
        description: "Reserve meeting rooms",
        href: "/rooms",
        category: "operations",
        advanced: true,
    },
    requests: {
        name: "Service Desk",
        description: "Internal support requests",
        href: "/requests",
        category: "operations",
        advanced: true,
    },

    // HR
    payroll: {
        name: "Salaries",
        description: "View salary information",
        href: "/payroll",
        category: "hr",
        advanced: true,
    },
    onboarding: {
        name: "Onboarding",
        description: "New hire onboarding",
        href: "/onboarding",
        category: "hr",
    },
    offboarding: {
        name: "Offboarding",
        description: "Employee offboarding",
        href: "/offboarding",
        category: "hr",
        advanced: true,
    },

    // PEOPLE
    feedback: {
        name: "Feedback",
        description: "Give and receive feedback",
        href: "/feedback",
        category: "people",
    },
    oneOnOnes: {
        name: "1:1 Notes",
        description: "Private meeting notes",
        href: "/one-on-ones",
        category: "people",
    },
    pulse: {
        name: "Team Mood",
        description: "Anonymous pulse surveys",
        href: "/pulse",
        category: "people",
        advanced: true,
    },

    // COMPLIANCE
    risks: {
        name: "Risk Register",
        description: "Track organizational risks",
        href: "/risks",
        category: "compliance",
        advanced: true,
    },
    reports: {
        name: "Compliance",
        description: "Compliance reports",
        href: "/reports",
        category: "compliance",
        advanced: true,
    },
} as const satisfies Record<string, ModuleDefinition>;

// Profile presets
export interface ProfilePreset {
    name: string;
    description: string;
    enabled: ModuleId[];
    hidden: ModuleId[];
}

export const PROFILES: Record<string, ProfilePreset> = {
    lean: {
        name: "Lean Startup",
        description: "Just the essentials for small teams",
        enabled: ["dashboard", "tasks", "team", "leaves", "settings", "knowledge", "calendar"],
        hidden: ["payroll", "assets", "rooms", "risks", "reports", "pulse", "offboarding", "requests"],
    },
    growing: {
        name: "Growing Team",
        description: "Core features plus people management",
        enabled: [
            "dashboard", "tasks", "team", "leaves", "settings",
            "knowledge", "calendar", "expenses", "projects", "goals",
            "onboarding", "feedback", "inbox"
        ],
        hidden: ["risks", "reports", "pulse", "rooms", "assets", "requests"],
    },
    established: {
        name: "Established Organization",
        description: "Full platform with all features",
        enabled: Object.keys(MODULES) as ModuleId[],
        hidden: [],
    },
};

// Helper functions
export function getCoreModules(): ModuleId[] {
    return Object.entries(MODULES)
        .filter(([_, def]) => 'core' in def && def.core)
        .map(([id]) => id as ModuleId);
}

export function getAdvancedModules(): ModuleId[] {
    return Object.entries(MODULES)
        .filter(([_, def]) => 'advanced' in def && def.advanced)
        .map(([id]) => id as ModuleId);
}

export function getModulesByCategory(category: ModuleDefinition["category"]): ModuleId[] {
    return Object.entries(MODULES)
        .filter(([_, def]) => def.category === category)
        .map(([id]) => id as ModuleId);
}

export function isModuleEnabled(
    moduleId: ModuleId,
    enabledModules: string[],
    hiddenModules: string[]
): boolean {
    const module = MODULES[moduleId];
    if ('core' in module && module.core) return true;
    if (hiddenModules.includes(moduleId)) return false;
    return enabledModules.includes(moduleId);
}

export function getProfileForSettings(
    teamSize: "tiny" | "small" | "medium",
    _workStyle: "remote" | "hybrid" | "office",
    _priorities: string[]
): keyof typeof PROFILES {
    // Simple logic for now - can be enhanced
    if (teamSize === "tiny") return "lean";
    if (teamSize === "small") return "growing";
    return "established";
}

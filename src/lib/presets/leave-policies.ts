/**
 * Leave Policy Presets
 * 
 * Pre-configured leave policies for common organizational types.
 * Users can select a preset and optionally customize after.
 */

export interface LeavePolicy {
    name: string;
    casualLeave: number;
    sickLeave: number;
    privilegeLeave: number;
    carryOverEnabled: boolean;
    maxCarryOver: number;
    halfDayEnabled: boolean;
    accrualEnabled: boolean;
    accrualFrequency?: "monthly" | "quarterly" | "yearly";
}

export interface LeavePolicyPreset {
    id: string;
    name: string;
    description: string;
    recommended?: boolean;
    policy: LeavePolicy;
}

export const leavePolicyPresets: LeavePolicyPreset[] = [
    {
        id: "standard-startup",
        name: "Standard Startup",
        description: "15 casual, 10 sick, 15 privilege days. Simple carry-over. Perfect for most startups.",
        recommended: true,
        policy: {
            name: "Standard Startup Policy",
            casualLeave: 15,
            sickLeave: 10,
            privilegeLeave: 15,
            carryOverEnabled: true,
            maxCarryOver: 5,
            halfDayEnabled: true,
            accrualEnabled: false,
        },
    },
    {
        id: "unlimited-pto",
        name: "Unlimited PTO",
        description: "No hard limits, but tracked for awareness. Trust-based approach.",
        policy: {
            name: "Unlimited PTO (Tracked)",
            casualLeave: 999,
            sickLeave: 999,
            privilegeLeave: 999,
            carryOverEnabled: false,
            maxCarryOver: 0,
            halfDayEnabled: true,
            accrualEnabled: false,
        },
    },
    {
        id: "accrual-based",
        name: "Accrual-Based",
        description: "Leave earned monthly. Better for compliance-conscious companies.",
        policy: {
            name: "Accrual-Based Policy",
            casualLeave: 12,
            sickLeave: 12,
            privilegeLeave: 12,
            carryOverEnabled: true,
            maxCarryOver: 10,
            halfDayEnabled: true,
            accrualEnabled: true,
            accrualFrequency: "monthly",
        },
    },
    {
        id: "conservative",
        name: "Conservative",
        description: "Lower limits, strict tracking. For budget-conscious organizations.",
        policy: {
            name: "Conservative Policy",
            casualLeave: 10,
            sickLeave: 8,
            privilegeLeave: 10,
            carryOverEnabled: false,
            maxCarryOver: 0,
            halfDayEnabled: true,
            accrualEnabled: false,
        },
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "Full accrual system with complex carry-over. For larger organizations.",
        policy: {
            name: "Enterprise Policy",
            casualLeave: 18,
            sickLeave: 15,
            privilegeLeave: 20,
            carryOverEnabled: true,
            maxCarryOver: 15,
            halfDayEnabled: true,
            accrualEnabled: true,
            accrualFrequency: "monthly",
        },
    },
];

export function getPresetById(id: string): LeavePolicyPreset | undefined {
    return leavePolicyPresets.find(p => p.id === id);
}

export function getRecommendedPreset(): LeavePolicyPreset {
    return leavePolicyPresets.find(p => p.recommended) || leavePolicyPresets[0];
}

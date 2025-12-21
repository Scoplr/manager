"use client";

import { ExportDataButton } from "@/components/settings/export-button";
import { ImportForm } from "@/components/settings/import-form";
import { ExportDataSection } from "@/components/settings/export-data-section";
import Link from "next/link";
import { Building2, ChevronRight, Database, Users, Palmtree, Shield, Calendar, Receipt, Webhook, ClipboardList, CreditCard, Layers, ChevronDown, Sparkles, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataOwnershipBanner } from "@/components/ui/trust-signals";
import { useState } from "react";

// Essential settings - most commonly changed
const essentialSettings = [
    {
        href: "/settings/holidays",
        icon: Calendar,
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        title: "Holidays",
        description: "Public holidays for your region",
        recommended: true,
    },
    {
        href: "/settings/leave-policies",
        icon: Palmtree,
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-600 dark:text-orange-400",
        title: "Leave Policies",
        description: "Time-off allowances (presets available)",
        recommended: true,
    },
];

// Advanced settings - grouped by category
const advancedSettingsGroups = [
    {
        title: "Team & Structure",
        cards: [
            {
                href: "/settings/departments",
                icon: Users,
                iconBg: "bg-blue-100 dark:bg-blue-900/30",
                iconColor: "text-blue-600 dark:text-blue-400",
                title: "Departments",
                description: "Teams, heads, capacity rules",
            },
            {
                href: "/people/offboarding",
                icon: ClipboardList,
                iconBg: "bg-red-100 dark:bg-red-900/30",
                iconColor: "text-red-600 dark:text-red-400",
                title: "Offboarding",
                description: "Exit templates and checklists",
            },
        ]
    },
    {
        title: "Finance & Workflows",
        cards: [
            {
                href: "/settings/expense-categories",
                icon: Receipt,
                iconBg: "bg-amber-100 dark:bg-amber-900/30",
                iconColor: "text-amber-600 dark:text-amber-400",
                title: "Expense Categories",
                description: "Categories and limits",
            },
            {
                href: "/settings/approvals",
                icon: Shield,
                iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
                iconColor: "text-indigo-600 dark:text-indigo-400",
                title: "Approval Rules",
                description: "Who approves what (presets available)",
            },
        ]
    },
    {
        title: "System",
        cards: [
            {
                href: "/settings/billing",
                icon: CreditCard,
                iconBg: "bg-purple-100 dark:bg-purple-900/30",
                iconColor: "text-purple-600 dark:text-purple-400",
                title: "Billing & Plan",
                description: "Subscription and invoices",
            },
            {
                href: "/settings/modules",
                icon: Layers,
                iconBg: "bg-gray-100 dark:bg-gray-900/30",
                iconColor: "text-gray-600 dark:text-gray-400",
                title: "Modules",
                description: "Enable/disable features",
            },
            {
                href: "/settings/integrations",
                icon: Webhook,
                iconBg: "bg-pink-100 dark:bg-pink-900/30",
                iconColor: "text-pink-600 dark:text-pink-400",
                title: "Integrations & API",
                description: "Webhooks, API keys",
            },
        ]
    },
];

interface SettingCardType {
    href: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    recommended?: boolean;
}

function SettingCard({ card }: { card: SettingCardType }) {
    const Icon = card.icon;
    return (
        <Link
            href={card.href}
            className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow group relative"
        >
            {'recommended' in card && card.recommended && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Start here
                </span>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{card.title}</h3>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}

export default function SettingsPage() {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div>
            <PageHeader
                icon="Settings"
                iconColor="text-gray-600"
                iconBg="bg-gray-100"
                title="Settings"
                description="Configure your organization. Start with the essentials, expand as needed."
            />

            <DataOwnershipBanner />

            {/* Quick Setup - Essential Settings */}
            <div className="mb-8">
                <div className="mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Quick Setup
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">Most teams only need these</span>
                    </h2>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {essentialSettings.map((card) => (
                        <SettingCard key={card.href} card={card} />
                    ))}
                </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="mb-6">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                    {showAdvanced ? "Hide" : "Show"} advanced settings
                    <span className="text-xs">({advancedSettingsGroups.reduce((acc, g) => acc + g.cards.length, 0)} more options)</span>
                </button>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
                <div className="space-y-8 mb-8 animate-in slide-in-from-top-2">
                    {advancedSettingsGroups.map((group) => (
                        <div key={group.title}>
                            <div className="mb-3">
                                <h2 className="text-lg font-semibold">{group.title}</h2>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {group.cards.map((card) => (
                                    <SettingCard key={card.href} card={card} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Data Management - always visible but less prominent */}
            <div className="rounded-lg border bg-card p-6 mt-8">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-semibold">Data Management</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Export Workspace</h3>
                        <p className="text-sm text-muted-foreground mb-3">Download all data as JSON.</p>
                        <ExportDataButton />
                    </div>
                    <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Import Workspace</h3>
                        <p className="text-sm text-muted-foreground mb-3">Restore from backup.</p>
                        <ImportForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Users, Globe, CheckCircle2, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { PROFILES, MODULES, type ModuleId } from "@/lib/module-config";
import { saveModuleConfig } from "@/app/actions/organization";

interface WizardStep {
    title: string;
    description: string;
}

const STEPS: WizardStep[] = [
    { title: "Team Size", description: "How big is your team?" },
    { title: "Work Style", description: "How does your team work?" },
    { title: "Priorities", description: "What matters most to you?" },
    { title: "Your Setup", description: "Here's what we recommend" },
];

const PRIORITIES = [
    { id: "leaves", label: "Leave & time-off management", icon: "🌴" },
    { id: "tasks", label: "Task tracking & projects", icon: "✅" },
    { id: "docs", label: "Team documentation", icon: "📚" },
    { id: "expenses", label: "Expense management", icon: "💰" },
    { id: "facilities", label: "Facilities (rooms, assets)", icon: "🏢" },
    { id: "payroll", label: "Payroll visibility", icon: "💵" },
];

export function ModuleSetupWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wizard state
    const [teamSize, setTeamSize] = useState<"tiny" | "small" | "medium" | null>(null);
    const [workStyle, setWorkStyle] = useState<"remote" | "hybrid" | "office" | null>(null);
    const [priorities, setPriorities] = useState<string[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<"lean" | "growing" | "established">("growing");

    // Calculate recommended profile based on answers
    const getRecommendedProfile = () => {
        if (teamSize === "tiny") return "lean";
        if (teamSize === "small") return "growing";
        return "established";
    };

    const togglePriority = (id: string) => {
        setPriorities(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : prev.length < 3 ? [...prev, id] : prev
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return teamSize !== null;
            case 1: return workStyle !== null;
            case 2: return priorities.length >= 1;
            case 3: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step === 2) {
            // Set recommended profile when moving to step 3
            setSelectedProfile(getRecommendedProfile());
        }
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        }
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            const profile = PROFILES[selectedProfile];
            await saveModuleConfig({
                profile: selectedProfile,
                teamSize: teamSize!,
                workStyle: workStyle!,
                priorities,
                enabledModules: profile.enabled,
                hiddenModules: profile.hidden,
            });
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Failed to save config:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${i < step ? "bg-green-500 text-white" :
                                i === step ? "bg-primary text-primary-foreground" :
                                    "bg-muted text-muted-foreground"
                                }`}>
                                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${i < step ? "bg-green-500" : "bg-muted"
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Card */}
            <div className="bg-card border rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">{STEPS[step].title}</h1>
                    <p className="text-muted-foreground mt-1">{STEPS[step].description}</p>
                </div>

                {/* Step 0: Team Size */}
                {step === 0 && (
                    <div className="grid gap-4">
                        {[
                            { value: "tiny", label: "Just starting", desc: "1-15 people", icon: Users },
                            { value: "small", label: "Growing team", desc: "15-50 people", icon: Building2 },
                            { value: "medium", label: "Established", desc: "50-100 people", icon: Globe },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTeamSize(option.value as typeof teamSize)}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${teamSize === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/50"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${teamSize === option.value ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}>
                                    <option.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold">{option.label}</p>
                                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 1: Work Style */}
                {step === 1 && (
                    <div className="grid gap-4">
                        {[
                            { value: "remote", label: "Fully Remote", desc: "Team works from anywhere", emoji: "🌍" },
                            { value: "hybrid", label: "Hybrid", desc: "Mix of remote and in-office", emoji: "🏠" },
                            { value: "office", label: "Office-based", desc: "Team works together in person", emoji: "🏢" },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setWorkStyle(option.value as typeof workStyle)}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${workStyle === option.value
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/50"
                                    }`}
                            >
                                <div className="text-3xl">{option.emoji}</div>
                                <div>
                                    <p className="font-semibold">{option.label}</p>
                                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 2: Priorities */}
                {step === 2 && (
                    <div>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                            Pick up to 3 priorities
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {PRIORITIES.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => togglePriority(p.id)}
                                    disabled={!priorities.includes(p.id) && priorities.length >= 3}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${priorities.includes(p.id)
                                        ? "border-primary bg-primary/5"
                                        : "border-muted hover:border-primary/50 disabled:opacity-50"
                                        }`}
                                >
                                    <span className="text-xl">{p.icon}</span>
                                    <span className="text-sm font-medium">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Recommendation */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                            <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                            <h3 className="text-lg font-semibold">
                                {PROFILES[selectedProfile].name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {PROFILES[selectedProfile].description}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Enabled ({PROFILES[selectedProfile].enabled.length} modules)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {PROFILES[selectedProfile].enabled.slice(0, 8).map(id => (
                                        <span key={id} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                                            {MODULES[id as ModuleId]?.name || id}
                                        </span>
                                    ))}
                                    {PROFILES[selectedProfile].enabled.length > 8 && (
                                        <span className="px-2 py-1 text-muted-foreground text-xs">
                                            +{PROFILES[selectedProfile].enabled.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {PROFILES[selectedProfile].hidden.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                        Available in Discover ({PROFILES[selectedProfile].hidden.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {PROFILES[selectedProfile].hidden.map(id => (
                                            <span key={id} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                                                {MODULES[id as ModuleId]?.name || id}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile selector */}
                        <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Or choose a different profile:</p>
                            <div className="flex gap-2">
                                {(["lean", "growing", "established"] as const).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedProfile(key)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedProfile === key
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted hover:bg-muted/80"
                                            }`}
                                    >
                                        {PROFILES[key].name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <button
                        onClick={() => setStep(step - 1)}
                        disabled={step === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-0 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Let's Go!
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Skip link */}
            <p className="text-center mt-6 text-sm text-muted-foreground">
                <button
                    onClick={async () => {
                        // Default to established profile
                        await saveModuleConfig({
                            profile: "established",
                            teamSize: "medium",
                            workStyle: "hybrid",
                            priorities: [],
                            enabledModules: PROFILES.established.enabled,
                            hiddenModules: [],
                        });
                        router.push("/");
                        router.refresh();
                    }}
                    className="underline hover:text-foreground"
                >
                    Skip setup and enable all features
                </button>
            </p>
        </div>
    );
}

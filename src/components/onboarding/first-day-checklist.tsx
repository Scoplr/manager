"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Palmtree, CheckSquare, Users, Calendar, Sparkles } from "lucide-react";

interface FirstDayStep {
    id: string;
    title: string;
    description: string;
    action: string;
    href: string;
    icon: any;
    done: boolean;
}

const initialSteps: FirstDayStep[] = [
    {
        id: "profile",
        title: "Complete your profile",
        description: "Add your phone number and set your working hours",
        action: "Update profile",
        href: "/team",
        icon: Users,
        done: false,
    },
    {
        id: "calendar",
        title: "Check the calendar",
        description: "See who's out today and upcoming company events",
        action: "View calendar",
        href: "/calendar",
        icon: Calendar,
        done: false,
    },
    {
        id: "leave",
        title: "Check your leave balance",
        description: "See how much time off you have available",
        action: "View time off",
        href: "/leaves",
        icon: Palmtree,
        done: false,
    },
    {
        id: "tasks",
        title: "View your tasks",
        description: "See what's been assigned to you",
        action: "Go to tasks",
        href: "/tasks",
        icon: CheckSquare,
        done: false,
    },
];

export function FirstDayChecklist() {
    const [steps, setSteps] = useState(initialSteps);
    const [dismissed, setDismissed] = useState(false);
    const router = useRouter();

    const completedCount = steps.filter(s => s.done).length;
    const allDone = completedCount === steps.length;

    const handleStepClick = (stepId: string, href: string) => {
        setSteps(prev => prev.map(s =>
            s.id === stepId ? { ...s, done: true } : s
        ));
        router.push(href);
    };

    const handleDismiss = () => {
        setDismissed(true);
        // Could persist this to localStorage or user preferences
        localStorage.setItem('first-day-dismissed', 'true');
    };

    if (dismissed) return null;

    return (
        <div className="rounded-xl border bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        Welcome to wrkspace!
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Complete these quick steps to get started
                    </p>
                </div>
                {!allDone && (
                    <button
                        onClick={handleDismiss}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        Dismiss
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{completedCount}/{steps.length}</span>
                </div>
                <div className="w-full h-2 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(completedCount / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <button
                            key={step.id}
                            onClick={() => handleStepClick(step.id, step.href)}
                            disabled={step.done}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${step.done
                                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                                    : "bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/30"
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done
                                    ? "bg-green-100 dark:bg-green-900/50"
                                    : "bg-indigo-100 dark:bg-indigo-900/50"
                                }`}>
                                {step.done ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Icon className="w-4 h-4 text-indigo-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${step.done ? "line-through" : ""}`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {step.description}
                                </p>
                            </div>
                            {!step.done && (
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>
                    );
                })}
            </div>

            {allDone && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                    <p className="text-green-700 dark:text-green-400 font-medium">
                        🎉 You're all set! Welcome aboard.
                    </p>
                    <button
                        onClick={handleDismiss}
                        className="text-sm text-green-600 hover:underline mt-1"
                    >
                        Dismiss this checklist
                    </button>
                </div>
            )}
        </div>
    );
}

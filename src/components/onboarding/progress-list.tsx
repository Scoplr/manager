"use client";

import { completeOnboardingStep } from "@/app/actions/onboarding";
import { CheckCircle2, Circle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function ProgressList({ progress }: { progress: any[] }) {
    const router = useRouter();

    async function handleCompleteStep(progressId: string, stepIndex: number) {
        await completeOnboardingStep(progressId, stepIndex);
        router.refresh();
    }

    if (progress.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No active onboardings. Start one for a new hire!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {progress.map((item: any) => {
                const steps = item.steps as any[] || [];
                const completed = item.completedSteps as number[] || [];
                const percentage = steps.length > 0 ? Math.round((completed.length / steps.length) * 100) : 0;

                return (
                    <div key={item.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{item.userName}</h3>
                                    <p className="text-xs text-muted-foreground">{item.templateName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-sm font-medium ${item.status === "completed" ? "text-green-600" : "text-blue-600"}`}>
                                    {percentage}% Complete
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    Started {format(new Date(item.startedAt), "MMM d")}
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 bg-muted rounded-full mb-3 overflow-hidden">
                            <div
                                className={`h-full transition-all ${item.status === "completed" ? "bg-green-500" : "bg-blue-500"}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {/* Steps */}
                        <div className="space-y-2">
                            {steps.map((step: any, i: number) => {
                                const isDone = completed.includes(i);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => !isDone && handleCompleteStep(item.id, i)}
                                        disabled={isDone}
                                        className={`w-full flex items-center gap-2 text-sm text-left p-2 rounded transition ${isDone
                                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                                : "bg-muted/30 hover:bg-muted/50 cursor-pointer"
                                            }`}
                                    >
                                        {isDone ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                        )}
                                        <span className={isDone ? "line-through" : ""}>{step.title}</span>
                                        {step.required && !isDone && (
                                            <span className="text-xs text-red-500 ml-auto">Required</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

"use client";

import { generatePayslips, finalizeRun } from "@/app/actions/payroll";
import { useState } from "react";
import { Loader2, Wand2, Lock } from "lucide-react";

export function PayrollControls({ runId, status, hasItems }: { runId: string, status: string, hasItems: boolean }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleGenerate() {
        setIsLoading(true);
        await generatePayslips(runId);
        setIsLoading(false);
    }

    async function handleFinalize() {
        if (!confirm("Are you sure? This will lock the payroll run.")) return;
        setIsLoading(true);
        await finalizeRun(runId);
        setIsLoading(false);
    }

    if (status === "completed") return <div className="text-green-600 font-bold flex items-center gap-2"><Lock className="h-4 w-4" /> Locked</div>;

    return (
        <div className="flex gap-2">
            {!hasItems && (
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Generate Payslips
                </button>
            )}

            {hasItems && (
                <button
                    onClick={handleFinalize}
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2 text-sm font-medium"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Finalize & Lock
                </button>
            )}
        </div>
    );
}

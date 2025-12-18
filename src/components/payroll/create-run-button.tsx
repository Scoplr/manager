"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createPayrollRun } from "@/app/actions/payroll";

export function CreateRunButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const month = formData.get("month")?.toString() || "";
        const year = formData.get("year")?.toString() || "";

        await createPayrollRun(month, year);
        setIsLoading(false);
        setIsOpen(false);
    }

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonth = months[new Date().getMonth()];
    const currentYear = new Date().getFullYear().toString();

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
                <Plus className="h-4 w-4" />
                Start Prep
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background w-full max-w-sm rounded-lg shadow-lg border p-6 animate-in zoom-in-95">
                        <h2 className="text-xl font-bold mb-4">Prepare Payroll</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Month</label>
                                <select name="month" defaultValue={currentMonth} className="w-full border rounded-md p-2 bg-background">
                                    {months.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Year</label>
                                <input name="year" defaultValue={currentYear} type="number" className="w-full border rounded-md p-2 bg-background" />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                                >
                                    {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                                    Start Prep
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

"use client";

import { useState, useEffect } from "react";
import { requestLeave } from "@/app/actions/leave";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LeaveConsequencePreview } from "./consequence-preview";
import { useUnsavedChanges, UnsavedChangesIndicator } from "@/hooks/use-unsaved-changes";

export function LeaveForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const router = useRouter();
    const { hasChanges, setHasChanges } = useUnsavedChanges();

    // Track form state for live preview
    const [leaveType, setLeaveType] = useState("casual");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Track if form has been modified
    useEffect(() => {
        if (startDate || endDate) {
            setHasChanges(true);
        }
    }, [startDate, endDate, setHasChanges]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setValidationError(null);

        // Client-side validation
        if (!startDate || !endDate) {
            setValidationError("Please select both start and end dates.");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
            setValidationError("Cannot request leave for past dates.");
            return;
        }

        if (endDate < startDate) {
            setValidationError("End date must be on or after start date.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set("userId", formData.get("userId")?.toString() || "demo-user");

        const result = await requestLeave(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Leave request submitted!");
            e.currentTarget.reset();
            setStartDate(null);
            setEndDate(null);
            setHasChanges(false); // Clear unsaved changes on success
            router.refresh();
        }

        setIsLoading(false);
    }

    return (
        <>
            <UnsavedChangesIndicator hasChanges={hasChanges} />
            {validationError && (
                <div className="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">
                    {validationError}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="userId" value="demo-user" />

                <div>
                    <label htmlFor="leave-type" className="block text-sm font-medium mb-1">Leave Type</label>
                    <select
                        id="leave-type"
                        name="type"
                        required
                        className="w-full border rounded-lg p-2.5 bg-background"
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                    >
                        <option value="casual">Casual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="privilege">Privilege Leave</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="leave-start-date" className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            id="leave-start-date"
                            type="date"
                            name="startDate"
                            required
                            className="w-full border rounded-lg p-2.5 bg-background"
                            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                        />
                    </div>
                    <div>
                        <label htmlFor="leave-end-date" className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            id="leave-end-date"
                            type="date"
                            name="endDate"
                            required
                            className="w-full border rounded-lg p-2.5 bg-background"
                            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="leave-reason" className="block text-sm font-medium mb-1">Reason (optional)</label>
                    <textarea
                        id="leave-reason"
                        name="reason"
                        rows={2}
                        className="w-full border rounded-lg p-2.5 bg-background resize-none"
                        placeholder="Optional reason for leave..."
                    />
                </div>

                <div>
                    <label htmlFor="leave-attachment" className="block text-sm font-medium mb-1">Attachment (optional)</label>
                    <input
                        id="leave-attachment"
                        type="file"
                        name="attachment"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="w-full border rounded-lg p-2 bg-background text-sm file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-muted file:text-sm file:font-medium"
                    />
                    <p className="text-xs text-muted-foreground mt-1">PDF, images, or documents (optional)</p>
                </div>

                {/* Live consequence preview */}
                <LeaveConsequencePreview
                    leaveType={leaveType}
                    startDate={startDate}
                    endDate={endDate}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit Request
                </button>
            </form>
        </>
    );
}

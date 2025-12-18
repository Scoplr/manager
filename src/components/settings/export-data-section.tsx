"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Calendar, Package, Loader2 } from "lucide-react";
import {
    exportEmployees,
    exportLeaves,
    exportTasks,
    exportExpenses,
    exportPayroll,
    exportAll
} from "@/app/actions/export";
import { toast } from "sonner";

type ExportFormat = "csv" | "json" | "ical";

interface ExportOption {
    id: string;
    label: string;
    description: string;
    formats: ExportFormat[];
    action: (format: ExportFormat) => Promise<{ data?: string; filename?: string; error?: string }>;
    icon: typeof FileSpreadsheet;
}

const exportOptions: ExportOption[] = [
    {
        id: "employees",
        label: "Employees",
        description: "Team directory with roles and contact info",
        formats: ["csv", "json"],
        action: (f) => exportEmployees(f as "csv" | "json"),
        icon: FileSpreadsheet,
    },
    {
        id: "leaves",
        label: "Leave Requests",
        description: "All leave history with status",
        formats: ["csv", "json", "ical"],
        action: (f) => exportLeaves(f as "csv" | "json" | "ical"),
        icon: Calendar,
    },
    {
        id: "tasks",
        label: "Tasks",
        description: "Tasks with assignees and status",
        formats: ["csv", "json"],
        action: (f) => exportTasks(f as "csv" | "json"),
        icon: FileSpreadsheet,
    },
    {
        id: "expenses",
        label: "Expenses",
        description: "Expense claims and approvals",
        formats: ["csv", "json"],
        action: (f) => exportExpenses(f as "csv" | "json"),
        icon: FileSpreadsheet,
    },
    {
        id: "payroll",
        label: "Payroll",
        description: "Payroll runs and salary data",
        formats: ["csv", "json"],
        action: (f) => exportPayroll(f as "csv" | "json"),
        icon: FileSpreadsheet,
    },
];

const formatIcons = {
    csv: FileSpreadsheet,
    json: FileJson,
    ical: Calendar,
};

const formatLabels = {
    csv: "CSV",
    json: "JSON",
    ical: "iCal",
};

export function ExportDataSection() {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleExport(option: ExportOption, format: ExportFormat) {
        setLoading(`${option.id}-${format}`);
        try {
            const result = await option.action(format);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data && result.filename) {
                // Trigger download
                const blob = new Blob([result.data], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success(`Downloaded ${result.filename}`);
            }
        } catch (error) {
            toast.error("Export failed");
        } finally {
            setLoading(null);
        }
    }

    async function handleExportAll() {
        setLoading("all");
        try {
            const result = await exportAll();

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data && result.filename) {
                const blob = new Blob([result.data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success("Full export downloaded!");
            }
        } catch (error) {
            toast.error("Export failed");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Export Data</h2>
                    <p className="text-sm text-muted-foreground">
                        Download your organization data in various formats
                    </p>
                </div>
                <button
                    onClick={handleExportAll}
                    disabled={loading === "all"}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading === "all" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Package className="w-4 h-4" />
                    )}
                    Download Everything
                </button>
            </div>

            {/* Export Options Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {exportOptions.map((option) => (
                    <div
                        key={option.id}
                        className="border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-medium">{option.label}</h3>
                                <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                            <option.icon className="w-5 h-5 text-muted-foreground" />
                        </div>

                        <div className="flex gap-2">
                            {option.formats.map((format) => {
                                const FormatIcon = formatIcons[format];
                                const isLoading = loading === `${option.id}-${format}`;

                                return (
                                    <button
                                        key={format}
                                        onClick={() => handleExport(option, format)}
                                        disabled={!!loading}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <FormatIcon className="w-3 h-3" />
                                        )}
                                        {formatLabels[format]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <p className="text-xs text-muted-foreground text-center">
                Your data is always yours. Export anytime, import anywhere.
            </p>
        </div>
    );
}

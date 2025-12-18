"use client";

import { ExportButton } from "@/components/ui/export-button";
import { exportTasksToCSV } from "@/app/actions/export";

export function TasksExportButton() {
    return (
        <ExportButton
            onExport={exportTasksToCSV}
            label="Export CSV"
        />
    );
}

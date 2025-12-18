"use client";

import { ExportButton } from "@/components/ui/export-button";
import { exportLeavesToCSV } from "@/app/actions/export";

export function LeavesExportButton() {
    return (
        <ExportButton
            onExport={exportLeavesToCSV}
            label="Export CSV"
        />
    );
}

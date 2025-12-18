"use client";

import { ExportButton } from "@/components/ui/export-button";
import { exportExpensesToCSV } from "@/app/actions/export";

export function ExpensesExportButton() {
    return (
        <ExportButton
            onExport={exportExpensesToCSV}
            label="Export CSV"
        />
    );
}

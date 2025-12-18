"use client";

import { ExportButton } from "@/components/ui/export-button";
import { exportTeamToCSV } from "@/app/actions/export";

export function TeamExportButton() {
    return <ExportButton onExport={exportTeamToCSV} label="Export Team" />;
}

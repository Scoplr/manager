"use client";

import { useState } from "react";
import { exportOrganizationData } from "@/app/actions/export";
import { Download, Loader2 } from "lucide-react";

export function ExportDataButton() {
    const [loading, setLoading] = useState(false);

    async function handleExport() {
        if (!confirm("Download a JSON copy of all organization data? This may take a moment.")) return;
        setLoading(true);
        try {
            const result = await exportOrganizationData();
            if (result.success && result.data) {
                const blob = new Blob([result.data], { type: "application/json" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `workspace-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert("Export failed. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Export failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition w-full justify-center sm:w-auto"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Data (JSON)
        </button>
    );
}

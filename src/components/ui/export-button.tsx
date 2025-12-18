"use client";

import { useState } from "react";
import { Download } from "lucide-react";

interface ExportButtonProps {
    onExport: () => Promise<{ csv: string; filename: string }>;
    label?: string;
}

export function ExportButton({ onExport, label = "Export CSV" }: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const { csv, filename } = await onExport();

            // Create download
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
            <Download className="w-4 h-4" />
            {isLoading ? "Exporting..." : label}
        </button>
    );
}

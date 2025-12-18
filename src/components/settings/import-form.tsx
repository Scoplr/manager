"use client";

import { importWorkspace } from "@/app/actions/settings";
import { useState } from "react";
import { Upload } from "lucide-react";

export function ImportForm() {
    const [status, setStatus] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setStatus("Reading file...");

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            setStatus("Importing...");

            const result = await importWorkspace(content);

            if (result.error) {
                setStatus(`Error: ${result.error}`);
            } else {
                setStatus(`Success! Imported data.`);
            }
            setIsUploading(false);
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <label
                    htmlFor="import-file"
                    className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data (JSON)
                </label>
                <input
                    id="import-file"
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                {status && <span className="text-sm text-muted-foreground">{status}</span>}
            </div>
        </div>
    );
}

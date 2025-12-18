"use client";

import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { uploadDocument } from "@/app/actions/upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DocumentUploadForm() {
    const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error("Please select a file");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", title || file.name);

            const result = await uploadDocument(formData);

            if (result.success) {
                toast.success("Document uploaded successfully");
                setTitle("");
                setFile(null);
                router.refresh();
            } else {
                toast.error(result.error || "Upload failed");
            }
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                    Document Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                    Upload File
                </label>
                <label className={`
                    flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
                    ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
                `}>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                    />
                    {file ? (
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-center">
                                <span className="text-primary font-medium">Click to upload</span>
                                <br />
                                <span className="text-muted-foreground text-xs">
                                    PDF, DOC, Images, up to 10MB
                                </span>
                            </p>
                        </>
                    )}
                </label>
            </div>

            <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4" />
                        Upload Document
                    </>
                )}
            </button>
        </form>
    );
}

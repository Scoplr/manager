"use client";

import { Clock, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { restoreDocumentVersion } from "@/app/actions/documents";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Version {
    id: string;
    documentId: string;
    createdAt: Date;
    title: string;
}

interface VersionHistoryProps {
    versions: Version[];
}

export function VersionHistory({ versions }: VersionHistoryProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleRestore = (documentId: string, versionId: string) => {
        if (!confirm("Are you sure you want to restore this version? Current changes will be saved as a new version history item.")) return;

        startTransition(async () => {
            await restoreDocumentVersion(documentId, versionId);
            router.refresh();
        });
    };

    return (
        <div className="border-t pt-4 mt-6">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> History
            </h3>
            {versions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No previous versions.</p>
            ) : (
                <ul className="space-y-3">
                    {versions.map((ver) => (
                        <li key={ver.id} className="text-xs flex flex-col gap-1 border-b pb-2 last:border-0">
                            <span className="font-medium text-foreground">{ver.title}</span>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>{formatDistanceToNow(new Date(ver.createdAt), { addSuffix: true })}</span>
                                <button
                                    onClick={() => handleRestore(ver.documentId, ver.id)}
                                    disabled={isPending}
                                    className="hover:text-primary flex items-center gap-1 disabled:opacity-50"
                                >
                                    <RotateCcw className="w-3 h-3" /> Restore
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

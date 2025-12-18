import { getDocuments } from "@/app/actions/documents";
import Link from "next/link";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export async function DocumentList({ filters }: {
    filters?: {
        query?: string;
        tagIds?: string[];
        dateRange?: { start?: Date; end?: Date };
    }
}) {
    const documents = await getDocuments(filters);

    if (documents.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 opacity-50 mb-4" />
                <h3 className="text-lg font-semibold">No Documents Found</h3>
                <p>{filters?.query ? `No results for "${filters.query}"` : "Create your first wiki page or guide."}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
                <Link
                    key={doc.id}
                    href={`/knowledge/${doc.id}`}
                    className="group block space-y-2 rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent/50 hover:border-accent-foreground/50"
                >
                    <div className="flex items-center gap-2 text-primary">
                        <FileText className="h-5 w-5" />
                        <h3 className="font-semibold group-hover:underline truncate">{doc.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Updated {formatDistanceToNow(doc.createdAt, { addSuffix: true })} by {doc.authorName || 'Unknown'}
                    </p>
                </Link>
            ))}
        </div>
    );
}

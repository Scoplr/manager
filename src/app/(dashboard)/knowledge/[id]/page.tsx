import { getDocument, getDocumentTags, getDocumentVersions } from "@/app/actions/documents";
import { getTags } from "@/app/actions/tags";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DocumentTagsControl } from "@/components/tags/document-tags-control";
import { VersionHistory } from "@/components/knowledge/version-history";

export default async function DocumentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Parallel data fetching
    const [doc, docTags, allTags, versions] = await Promise.all([
        getDocument(id),
        getDocumentTags(id),
        getTags(),
        getDocumentVersions(id)
    ]);

    if (!doc) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <Link href="/knowledge">Back to Knowledge Base</Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-10">
                <div className="space-y-6">
                    <div className="space-y-4 border-b pb-6">
                        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{doc.title}</h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{doc.authorName || 'Unknown Author'}</span>
                            </div>
                            <span>•</span>
                            <time>Updated {formatDistanceToNow(doc.updatedAt, { addSuffix: true })}</time>
                        </div>
                    </div>

                    <article className="prose prose-zinc dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
                    </article>
                </div>

                <aside className="space-y-6">
                    <div className="p-4 rounded-lg border bg-card">
                        <h2 className="font-semibold mb-2">Metadata</h2>
                        <DocumentTagsControl
                            documentId={doc.id}
                            currentTags={docTags}
                            availableTags={allTags}
                        />
                        <VersionHistory versions={versions} />
                    </div>
                </aside>
            </div>
        </div>
    );
}

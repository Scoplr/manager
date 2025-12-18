import { getDocuments } from "@/app/actions/documents";
import { BookOpen, FileText } from "lucide-react";
import Link from "next/link";

export default async function WorkspaceDocsPage() {
    const documents = await getDocuments();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{documents.length} documents</p>
                <Link
                    href="/knowledge/new"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    New Document
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documents.length === 0 ? (
                    <div className="col-span-full p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                        No documents yet.
                    </div>
                ) : (
                    documents.map((doc: any) => (
                        <Link
                            key={doc.id}
                            href={`/knowledge/${doc.id}`}
                            className="p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-medium truncate">{doc.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {doc.description || "No description"}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

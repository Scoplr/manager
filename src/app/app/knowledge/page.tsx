import { CreateDocumentForm } from "@/components/knowledge/create-document-form";
import { DocumentList } from "@/components/knowledge/document-list";
import { DocumentFilters } from "@/components/knowledge/document-filters";
import { DocumentUploadForm } from "@/components/knowledge/document-upload-form";
import { Suspense } from "react";
import { getTags } from "@/app/actions/tags";
import { PageHeader } from "@/components/ui/page-header";
import { BookOpen } from "lucide-react";

export default async function KnowledgePage(props: {
    searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const tags = await getTags();

    const filters = {
        query,
        tagIds: searchParams?.tags ? searchParams.tags.split(',') : undefined,
        dateRange: {
            start: searchParams?.updatedStart ? new Date(searchParams.updatedStart) : undefined,
            end: searchParams?.updatedEnd ? new Date(searchParams.updatedEnd) : undefined,
        }
    };

    return (
        <div>
            <PageHeader
                icon="BookOpen"
                iconColor="text-emerald-600"
                iconBg="bg-emerald-100"
                title="Knowledge Base"
                description="Store and share team documentation, guides, and notes."
                tip="Use tags to organize documents by topic. Search by title or content to find what you need."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                <div>
                    <DocumentFilters tags={tags} />
                    <div className="mt-4">
                        <Suspense fallback={<div className="text-muted-foreground p-4">Loading documents...</div>}>
                            <DocumentList filters={filters} />
                        </Suspense>
                    </div>
                </div>

                <div className="lg:sticky lg:top-4 h-fit space-y-4">
                    {/* Upload File */}
                    <div className="rounded-lg border bg-card p-5">
                        <h3 className="font-semibold mb-3">📤 Upload File</h3>
                        <DocumentUploadForm />
                    </div>

                    {/* Create Text Document */}
                    <div className="rounded-lg border bg-card p-5">
                        <h3 className="font-semibold mb-3">📝 Create Document</h3>
                        <CreateDocumentForm />
                    </div>
                </div>
            </div>
        </div>
    );
}


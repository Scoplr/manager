"use server";

import { db } from "@/db";
import { documents, users, documentVersions, documentTags, tags } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, sql, and, gte, lte, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireAuth, requireOrgContext } from "@/lib/authorize";

/**
 * Create a document - requires authentication
 * MULTI-TENANT: Associates document with user's organization
 */
export async function createDocument(formData: FormData) {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.user) {
        return { error: "Not authenticated" };
    }

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();

    if (!title || !content) {
        return { error: "Title and content required" };
    }

    const [newDoc] = await db.insert(documents).values({
        organizationId: orgContext.orgId,
        title,
        content,
        authorId: authResult.user.id,
    }).returning();

    revalidatePath("/knowledge");
    redirect(`/knowledge/${newDoc.id}`);
}

/**
 * Get documents with optional filters
 * MULTI-TENANT: Filters by organization
 */
export async function getDocuments(filters?: {
    query?: string;
    tagIds?: string[];
    dateRange?: { start?: Date; end?: Date };
}) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    let conditions: any[] = [eq(documents.organizationId, orgContext.orgId)];

    // Search query condition
    if (filters?.query) {
        conditions.push(sql`(${documents.title} ILIKE ${`%${filters.query}%`} OR ${documents.content} ILIKE ${`%${filters.query}%`})`);
    }

    // Date range conditions
    if (filters?.dateRange?.start) {
        conditions.push(gte(documents.updatedAt, filters.dateRange.start));
    }
    if (filters?.dateRange?.end) {
        conditions.push(lte(documents.updatedAt, filters.dateRange.end));
    }

    // Tag filtering
    if (filters?.tagIds && filters.tagIds.length > 0) {
        const subQuery = db.select({ documentId: documentTags.documentId })
            .from(documentTags)
            .where(inArray(documentTags.tagId, filters.tagIds));

        conditions.push(inArray(documents.id, subQuery));
    }

    return await db.select({
        id: documents.id,
        title: documents.title,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        authorName: users.name,
    })
        .from(documents)
        .leftJoin(users, eq(documents.authorId, users.id))
        .where(and(...conditions))
        .orderBy(desc(documents.updatedAt));
}

/**
 * Get a single document
 * MULTI-TENANT: Verifies document belongs to user's organization
 */
export async function getDocument(id: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return null;

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return null;

    const docs = await db.select({
        id: documents.id,
        title: documents.title,
        content: documents.content,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
        authorName: users.name,
    })
        .from(documents)
        .leftJoin(users, eq(documents.authorId, users.id))
        .where(and(
            eq(documents.id, id),
            eq(documents.organizationId, orgContext.orgId)
        ))
        .limit(1);

    return docs[0] || null;
}

/**
 * Update a document
 * MULTI-TENANT: Verifies document belongs to user's organization
 */
export async function updateDocument(id: string, formData: FormData) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();

    if (!title || !content) return { error: "Title and content required" };

    // Verify document belongs to this org
    const currentDoc = await db.select()
        .from(documents)
        .where(and(
            eq(documents.id, id),
            eq(documents.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (currentDoc.length === 0) {
        return { error: "Document not found" };
    }

    // Create Snapshot of current version
    await db.insert(documentVersions).values({
        documentId: id,
        title: currentDoc[0].title,
        content: currentDoc[0].content,
        createdAt: currentDoc[0].updatedAt,
    });

    // Update Document
    await db.update(documents).set({
        title,
        content,
        updatedAt: new Date(),
    }).where(and(
        eq(documents.id, id),
        eq(documents.organizationId, orgContext.orgId)
    ));

    revalidatePath(`/knowledge/${id}`);
    revalidatePath("/knowledge");
    return { success: true };
}

/**
 * Get document versions
 * MULTI-TENANT: Verifies document belongs to user's organization first
 */
export async function getDocumentVersions(id: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    // Verify document belongs to org
    const doc = await db.select({ id: documents.id })
        .from(documents)
        .where(and(
            eq(documents.id, id),
            eq(documents.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!doc[0]) return [];

    return await db.select()
        .from(documentVersions)
        .where(eq(documentVersions.documentId, id))
        .orderBy(desc(documentVersions.createdAt));
}

/**
 * Add tag to document
 * MULTI-TENANT: Verifies document belongs to user's organization
 */
export async function addDocumentTag(documentId: string, tagId: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Verify document belongs to org
    const doc = await db.select({ id: documents.id })
        .from(documents)
        .where(and(
            eq(documents.id, documentId),
            eq(documents.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!doc[0]) return { error: "Document not found" };

    try {
        await db.insert(documentTags).values({ documentId, tagId });
        revalidatePath(`/knowledge/${documentId}`);
        revalidatePath("/knowledge");
        return { success: true };
    } catch {
        return { error: "Failed to add tag" };
    }
}

/**
 * Remove tag from document
 * MULTI-TENANT: Verifies document belongs to user's organization
 */
export async function removeDocumentTag(documentId: string, tagId: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Verify document belongs to org
    const doc = await db.select({ id: documents.id })
        .from(documents)
        .where(and(
            eq(documents.id, documentId),
            eq(documents.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!doc[0]) return { error: "Document not found" };

    await db.delete(documentTags)
        .where(and(
            eq(documentTags.documentId, documentId),
            eq(documentTags.tagId, tagId)
        ));

    revalidatePath(`/knowledge/${documentId}`);
    revalidatePath("/knowledge");
    return { success: true };
}

/**
 * Get document tags
 * MULTI-TENANT: Verifies document belongs to user's organization
 */
export async function getDocumentTags(id: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    // Verify document belongs to org
    const doc = await db.select({ id: documents.id })
        .from(documents)
        .where(and(
            eq(documents.id, id),
            eq(documents.organizationId, orgContext.orgId)
        ))
        .limit(1);

    if (!doc[0]) return [];

    return await db.select({
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color
    })
        .from(documentTags)
        .innerJoin(tags, eq(documentTags.tagId, tags.id))
        .where(eq(documentTags.documentId, id));
}

/**
 * Restore a document to a previous version
 * MULTI-TENANT: Verifies document belongs to user's organization
 */
export async function restoreDocumentVersion(documentId: string, versionId: string) {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authenticated" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    // Verify document belongs to org
    const [currentDoc] = await db.select()
        .from(documents)
        .where(and(
            eq(documents.id, documentId),
            eq(documents.organizationId, orgContext.orgId)
        ));

    if (!currentDoc) {
        return { error: "Document not found" };
    }

    // Get the version to restore
    const [versionToRestore] = await db.select()
        .from(documentVersions)
        .where(eq(documentVersions.id, versionId));

    if (!versionToRestore) {
        return { error: "Version not found" };
    }

    // Create a snapshot of the CURRENT state before overwriting
    await db.insert(documentVersions).values({
        documentId,
        title: currentDoc.title,
        content: currentDoc.content,
        createdAt: currentDoc.updatedAt,
    });

    // Update the document with the restored content
    await db.update(documents).set({
        title: versionToRestore.title,
        content: versionToRestore.content,
        updatedAt: new Date(),
    }).where(and(
        eq(documents.id, documentId),
        eq(documents.organizationId, orgContext.orgId)
    ));

    revalidatePath(`/knowledge/${documentId}`);
    revalidatePath("/knowledge");
    return { success: true };
}


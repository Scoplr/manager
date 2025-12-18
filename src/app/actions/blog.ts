"use server";

import { db } from "@/db";
import { blogPosts, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

// ============ PUBLIC ACTIONS ============

export async function getPublishedPosts() {
    const posts = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        tags: blogPosts.tags,
        publishedAt: blogPosts.publishedAt,
        authorName: users.name,
    })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.publishedAt));

    return posts;
}

export async function getPostBySlug(slug: string) {
    const [post] = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImage: blogPosts.featuredImage,
        tags: blogPosts.tags,
        publishedAt: blogPosts.publishedAt,
        authorName: users.name,
    })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .where(and(
            eq(blogPosts.slug, slug),
            eq(blogPosts.status, "published")
        ));

    return post || null;
}

// ============ ADMIN ACTIONS ============

export async function getAllPosts() {
    const posts = await db.select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        status: blogPosts.status,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        authorName: users.name,
    })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .orderBy(desc(blogPosts.createdAt));

    return posts;
}

export async function createPost(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    tags?: string[];
    authorId: string;
    status?: "draft" | "published";
}) {
    const [post] = await db.insert(blogPosts).values({
        ...data,
        tags: data.tags || [],
        status: data.status || "draft",
        publishedAt: data.status === "published" ? new Date() : null,
    }).returning();

    return post;
}

export async function updatePost(id: string, data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    tags?: string[];
    status?: "draft" | "published";
}) {
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };

    // Set publishedAt when publishing for the first time
    if (data.status === "published") {
        const [existing] = await db.select({ publishedAt: blogPosts.publishedAt })
            .from(blogPosts)
            .where(eq(blogPosts.id, id));

        if (!existing?.publishedAt) {
            updateData.publishedAt = new Date();
        }
    }

    const [post] = await db.update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, id))
        .returning();

    return post;
}

export async function deletePost(id: string) {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return { success: true };
}

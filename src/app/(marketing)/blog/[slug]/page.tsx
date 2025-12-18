import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPublishedPosts } from "@/app/actions/blog";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Calendar, User, Tag, Sparkles } from "lucide-react";
import { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return { title: "Post Not Found" };
    }

    return {
        title: `${post.title} — wrkspace Blog`,
        description: post.excerpt || `Read ${post.title} on the wrkspace blog.`,
        openGraph: {
            title: post.title,
            description: post.excerpt || `Read ${post.title} on the wrkspace blog.`,
            type: "article",
            publishedTime: post.publishedAt?.toISOString(),
            authors: post.authorName ? [post.authorName] : undefined,
            images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt || undefined,
            images: post.featuredImage ? [post.featuredImage] : undefined,
        },
    };
}

// Return empty array to prevent DB queries during build
// Blog posts will be rendered dynamically (ISR) instead of statically
export async function generateStaticParams() {
    return [];
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // JSON-LD for Article
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage,
        datePublished: post.publishedAt?.toISOString(),
        author: {
            "@type": "Person",
            name: post.authorName || "wrkspace Team",
        },
        publisher: {
            "@type": "Organization",
            name: "wrkspace",
            logo: {
                "@type": "ImageObject",
                url: "https://wrkspace.app/logo.png",
            },
        },
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/home" className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 dark:text-white">wrkspace</span>
                    </Link>
                    <Link
                        href="/login"
                        className="px-5 py-2.5 text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Article */}
            <article className="max-w-3xl mx-auto px-6 py-16">
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Back to blog
                </Link>

                {/* Featured Image */}
                {post.featuredImage && (
                    <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800">
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        {post.publishedAt && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                            </span>
                        )}
                        {post.authorName && (
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.authorName}
                            </span>
                        )}
                    </div>

                    {post.tags && (post.tags as string[]).length > 0 && (
                        <div className="flex items-center gap-2 mt-4">
                            <Tag className="h-4 w-4 text-slate-400" />
                            <div className="flex flex-wrap gap-2">
                                {(post.tags as string[]).map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 text-sm rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                {/* Content */}
                <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
                    {/* For now, render as plain text. Add markdown rendering later */}
                    <div className="whitespace-pre-wrap">{post.content}</div>
                </div>

                {/* CTA */}
                <div className="mt-16 p-8 rounded-2xl bg-indigo-600 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Ready to simplify team management?</h3>
                    <p className="text-indigo-100 mb-6">Try wrkspace free for 14 days. No credit card required.</p>
                    <Link
                        href="/register"
                        className="inline-block px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </article>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 border-t border-slate-800">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-sm text-slate-500">
                        © 2024 wrkspace. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

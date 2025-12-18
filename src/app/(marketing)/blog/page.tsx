import Link from "next/link";
import { getPublishedPosts } from "@/app/actions/blog";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Calendar, Tag, Sparkles } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog — wrkspace | HR Tips & Team Management Insights",
    description: "Tips, guides, and insights on team management, leave policies, onboarding, and building a great workplace culture.",
    openGraph: {
        title: "wrkspace Blog | HR Tips & Team Management Insights",
        description: "Tips, guides, and insights on team management, leave policies, onboarding, and building a great workplace culture.",
    },
};

export default async function BlogPage() {
    const posts = await getPublishedPosts();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
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

            {/* Hero */}
            <section className="max-w-4xl mx-auto px-6 py-16">
                <Link href="/home" className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                    Blog
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                    Tips and insights on managing teams, leave policies, and building a great workplace.
                </p>
            </section>

            {/* Posts */}
            <section className="max-w-4xl mx-auto px-6 pb-24">
                {posts.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                        <p className="text-lg">No posts yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all overflow-hidden"
                            >
                                {post.featuredImage && (
                                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <img
                                            src={post.featuredImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                                        {post.publishedAt && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                                            </span>
                                        )}
                                        {post.authorName && (
                                            <span>by {post.authorName}</span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                                        {post.title}
                                    </h2>
                                    {post.excerpt && (
                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex items-center gap-2 mt-4">
                                            <Tag className="h-4 w-4 text-slate-400" />
                                            <div className="flex gap-2">
                                                {(post.tags as string[]).slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

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

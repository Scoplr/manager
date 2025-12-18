"use client";

import { useState } from "react";
import { createPost, updatePost, deletePost } from "@/app/actions/blog";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    status: "draft" | "published";
    publishedAt: Date | null;
    createdAt: Date;
    authorName: string | null;
}

interface BlogEditorClientProps {
    posts: Post[];
    currentUserId: string;
}

export function BlogEditorClient({ posts: initialPosts, currentUserId }: BlogEditorClientProps) {
    const router = useRouter();
    const [posts, setPosts] = useState(initialPosts);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("draft");

    function resetForm() {
        setTitle("");
        setSlug("");
        setExcerpt("");
        setContent("");
        setTags("");
        setStatus("draft");
        setEditingPost(null);
        setIsEditing(false);
    }

    function openNewPost() {
        resetForm();
        setIsEditing(true);
    }

    function openEditPost(post: Post) {
        setEditingPost(post);
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt || "");
        setStatus(post.status);
        // Note: We'd need to fetch full content here
        setContent(""); // Will need separate fetch for content
        setTags("");
        setIsEditing(true);
    }

    async function handleSave() {
        if (!title || !slug || !content) {
            toast.error("Title, slug, and content are required");
            return;
        }

        setLoading(true);
        try {
            const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);

            if (editingPost) {
                await updatePost(editingPost.id, {
                    title,
                    slug,
                    excerpt,
                    content,
                    tags: tagArray,
                    status,
                });
                toast.success("Post updated");
            } else {
                await createPost({
                    title,
                    slug,
                    excerpt,
                    content,
                    tags: tagArray,
                    status,
                    authorId: currentUserId,
                });
                toast.success("Post created");
            }

            resetForm();
            router.refresh();
        } catch (error) {
            toast.error("Failed to save post");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            await deletePost(id);
            setPosts(posts.filter(p => p.id !== id));
            toast.success("Post deleted");
        } catch (error) {
            toast.error("Failed to delete post");
        }
    }

    function generateSlug(text: string) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={openNewPost}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    New Post
                </button>
            </div>

            {/* Editor Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold">
                                {editingPost ? "Edit Post" : "New Post"}
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        if (!editingPost) {
                                            setSlug(generateSlug(e.target.value));
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    placeholder="Post title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg bg-background font-mono text-sm"
                                    placeholder="url-friendly-slug"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Excerpt</label>
                                <input
                                    type="text"
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    placeholder="Short description for SEO and cards"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={12}
                                    className="w-full px-3 py-2 border rounded-lg bg-background font-mono text-sm"
                                    placeholder="Write your post in Markdown..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                    placeholder="hr, leave management, tips"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t flex justify-end gap-3">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingPost ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts List */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No posts yet. Create your first post!
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{post.title}</p>
                                            <p className="text-xs text-muted-foreground font-mono">/{post.slug}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${post.status === "published"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            }`}>
                                            {post.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {post.status === "published" && (
                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => openEditPost(post)}
                                                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

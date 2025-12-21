import { getAllPosts } from "@/app/actions/blog";
import { BlogEditorClient } from "./blog-editor-client";
import { requireAuth } from "@/lib/authorize";
import { redirect } from "next/navigation";

export default async function AdminBlogPage() {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user || user.role !== "admin") {
        redirect("/");
    }

    const posts = await getAllPosts();

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Blog Management</h1>
                <p className="text-muted-foreground">Create and manage blog posts</p>
            </div>
            <BlogEditorClient
                posts={posts}
                currentUserId={user.id}
            />
        </div>
    );
}

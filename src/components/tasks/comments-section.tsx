"use client";

import { useState, useTransition } from "react";
import { addComment, deleteComment, TaskComment } from "@/app/actions/comments";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface CommentsSectionProps {
    taskId: string;
    initialComments: TaskComment[];
}

export function CommentsSection({ taskId, initialComments }: CommentsSectionProps) {
    const [comments, setComments] = useState<TaskComment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        startTransition(async () => {
            const result = await addComment(taskId, newComment);
            if (result.error) {
                toast.error(result.error);
            } else if (result.comment) {
                // Add new comment to top of list (server will revalidate anyway)
                setComments(prev => [{
                    id: result.comment.id,
                    content: result.comment.content,
                    createdAt: result.comment.createdAt,
                    updatedAt: result.comment.updatedAt,
                    authorId: result.comment.authorId,
                    authorName: "You", // Will be corrected on refresh
                }, ...prev]);
                setNewComment("");
                toast.success("Comment added");
            }
        });
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Delete this comment?")) return;

        startTransition(async () => {
            const result = await deleteComment(commentId);
            if (result.error) {
                toast.error(result.error);
            } else {
                setComments(prev => prev.filter(c => c.id !== commentId));
                toast.success("Comment deleted");
            }
        });
    };

    return (
        <div className="border rounded-lg bg-card">
            <div className="p-4 border-b flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Comments</h3>
                <span className="text-sm text-muted-foreground">({comments.length})</span>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="p-4 border-b">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={isPending}
                    />
                    <button
                        type="submit"
                        disabled={isPending || !newComment.trim()}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="divide-y max-h-80 overflow-y-auto">
                {comments.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                        No comments yet. Be the first to add one!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="p-4 group hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{comment.authorName || "Unknown"}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete comment"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

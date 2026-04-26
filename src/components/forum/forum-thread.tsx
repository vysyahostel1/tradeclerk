"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, fetchWithAuth } from "@/lib/store";

export function ForumThread({ threadId }: { threadId: string }) {
  const { user, isAuthenticated } = useStore();
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/forum/posts/${threadId}`);
        const data = await res.json();
        setPost(data.post);
      } catch {
        toast.error("Error", "Failed to load post.");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [threadId]);

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in required", "Please sign in to comment.");
      return;
    }
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetchWithAuth(`/api/forum/posts/${threadId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: comment.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev: any) => ({
          ...prev,
          comments: [...prev.comments, data.comment],
          commentCount: prev.commentCount + 1,
        }));
        setComment("");
        toast.success("Comment posted!");
      }
    } catch {
      toast.error("Error", "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-24" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Post not found</h2>
        <Button onClick={() => { window.location.hash = "forum"; }}>Back to Forum</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => { window.location.hash = "forum"; }}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Forum
        </button>

        {/* Post */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {post.category && (
              <Badge variant="secondary" className="mb-3">{post.category.name}</Badge>
            )}
            <h1 className="mb-3 text-xl font-bold sm:text-2xl">{post.title}</h1>

            <div className="mb-4 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs">
                  {post.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{post.user?.name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(post.createdAt)} · {post.viewCount} views
                </p>
              </div>
            </div>

            <Separator className="mb-4" />

            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {post.content}
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ChevronUp className="h-4 w-4" /> {post.upvotes}
                </Button>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" /> {post.commentCount} comments
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <h2 className="mb-4 text-lg font-semibold">
          Comments ({post.comments?.length || 0})
        </h2>

        {/* Comment form */}
        {isAuthenticated && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="mb-2 resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleSubmitComment}
                      disabled={submitting || !comment.trim()}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      {submitting ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comment list */}
        <div className="space-y-4">
          {post.comments?.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            post.comments.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[9px]">
                        {c.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{c.user?.name || "Anonymous"}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <ChevronUp className="h-3 w-3" /> {c.upvotes}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{c.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

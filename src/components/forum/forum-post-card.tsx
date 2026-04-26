"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, Clock, ChevronUp } from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  tags: string | null;
  upvotes: number;
  viewCount: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null; karma: number } | null;
  category: { id: string; name: string } | null;
}

export function ForumPostCard({ post }: { post: ForumPost }) {
  const tags = post.tags ? JSON.parse(post.tags) : [];

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

  return (
    <div
      className="card-hover cursor-pointer rounded-xl border border-border bg-card p-5"
      onClick={() => {
        window.location.hash = `forum-thread?id=${post.id}`;
      }}
    >
      {post.isPinned && (
        <Badge className="mb-3 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
          📌 Pinned
        </Badge>
      )}

      <div className="mb-2 flex items-center gap-2">
        {post.category && (
          <Badge variant="secondary" className="text-[10px]">
            {post.category.name}
          </Badge>
        )}
        {tags.slice(0, 2).map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug hover:text-emerald-600 dark:hover:text-emerald-400">
        {post.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-xs text-muted-foreground">{post.content}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[9px]">
              {post.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">{post.user?.name || "Anonymous"}</span>
          <span className="text-xs text-muted-foreground">· {timeAgo(post.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ChevronUp className="h-3 w-3" /> {post.upvotes}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> {post.commentCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {post.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}

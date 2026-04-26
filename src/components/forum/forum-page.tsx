"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ForumPostCard } from "./forum-post-card";
import { CreatePost } from "./create-post";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Inbox } from "lucide-react";

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

export function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page: "1", limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/forum/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [sort, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshKey]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          Community <span className="text-emerald-600 dark:text-emerald-400">Forum</span>
        </h1>
        <p className="mb-8 text-muted-foreground">
          Discuss market trends, share analysis, and connect with fellow investors
        </p>

        <CreatePost onCreated={() => setRefreshKey((k) => k + 1)} />

        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="top">Most Upvoted</SelectItem>
              <SelectItem value="most-comments">Most Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No discussions yet</h3>
            <p className="text-muted-foreground">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <ForumPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

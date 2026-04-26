"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useStore, fetchWithAuth } from "@/lib/store";
import { Loader2, Send, X } from "lucide-react";
import { useEffect } from "react";

export function CreatePost({ onCreated }: { onCreated?: () => void }) {
  const { isAuthenticated } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/reports/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Error", "Title and content are required.");
      return;
    }
    setLoading(true);
    try {
      const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetchWithAuth("/api/forum/posts", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categoryId: categoryId || null,
          tags: parsedTags.length > 0 ? parsedTags : null,
        }),
      });
      if (res.ok) {
        toast.success("Post created!", "Your discussion has been published.");
        setTitle("");
        setContent("");
        setCategoryId("");
        setTags("");
        onCreated?.();
      } else {
        const data = await res.json();
        toast.error("Error", data.error || "Failed to create post.");
      }
    } catch {
      toast.error("Error", "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Please <button onClick={() => { window.location.hash = "login"; }} className="text-emerald-600 hover:underline dark:text-emerald-400">sign in</button> to create a post.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Create New Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <Textarea
              id="post-content"
              placeholder="Share your thoughts, analysis, or questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-tags">Tags (comma separated)</Label>
              <Input
                id="post-tags"
                placeholder="e.g. stocks, analysis, question"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTitle("");
                setContent("");
                setCategoryId("");
                setTags("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || !title.trim() || !content.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Post Discussion
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

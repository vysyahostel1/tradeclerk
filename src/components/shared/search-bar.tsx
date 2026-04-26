"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  MessageSquare,
  Users,
  Inbox,
  ArrowRight,
} from "lucide-react";

export function SearchPage({ query }: { query: string }) {
  const [results, setResults] = useState<{
    reports: any[];
    posts: any[];
    analysts: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => setResults(d.results))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-2xl font-bold">
          Search results for &ldquo;{query}&rdquo;
        </h1>
        <p className="mb-8 text-muted-foreground">
          Found across reports, discussions, and analysts
        </p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !results ? (
          <div className="py-12 text-center text-muted-foreground">
            <Search className="mx-auto mb-3 h-10 w-10" />
            <p>Search failed. Please try again.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Reports */}
            {results.reports.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Reports ({results.reports.length})
                </h2>
                <div className="space-y-3">
                  {results.reports.map((r: any) => (
                    <div
                      key={r.id}
                      className="card-hover cursor-pointer rounded-lg border border-border bg-card p-4"
                      onClick={() => {
                        window.location.hash = `report-detail?id=${r.id}`;
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{r.category?.name}</Badge>
                        {r.isPremium && <Badge className="text-xs bg-amber-500 text-white">Premium</Badge>}
                      </div>
                      <p className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400">
                        {r.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {r.summary || "Research analysis"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forum Posts */}
            {results.posts.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  Discussions ({results.posts.length})
                </h2>
                <div className="space-y-3">
                  {results.posts.map((p: any) => (
                    <div
                      key={p.id}
                      className="card-hover cursor-pointer rounded-lg border border-border bg-card p-4"
                      onClick={() => {
                        window.location.hash = `forum-thread?id=${p.id}`;
                      }}
                    >
                      <p className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400">
                        {p.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {p.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysts */}
            {results.analysts.length > 0 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Analysts ({results.analysts.length})
                </h2>
                <div className="space-y-3">
                  {results.analysts.map((a: any) => (
                    <div
                      key={a.id}
                      className="card-hover cursor-pointer rounded-lg border border-border bg-card p-4"
                      onClick={() => {
                        window.location.hash = `analyst-detail?id=${a.id}`;
                      }}
                    >
                      <p className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400">
                        {a.name}{" "}
                        <span className="font-normal text-muted-foreground">
                          {a.title} {a.company && `at ${a.company}`}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.reports.length === 0 &&
              results.posts.length === 0 &&
              results.analysts.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <Inbox className="mx-auto mb-3 h-10 w-10" />
                  <p>No results found for &ldquo;{query}&rdquo;</p>
                  <p className="mt-1 text-sm">Try different keywords or browse categories</p>
                </div>
              )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

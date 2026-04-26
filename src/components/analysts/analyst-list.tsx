"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnalystCard } from "./analyst-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Inbox } from "lucide-react";

interface Analyst {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  title: string | null;
  company: string | null;
  expertise: string | null;
  publishedCount: number;
  followerCount: number;
  avgRating: number;
  totalRevenue: number;
  isVerified: boolean;
}

export function AnalystList() {
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("followers");

  useEffect(() => {
    fetch("/api/analysts")
      .then((r) => r.json())
      .then((d) => setAnalysts(d.analysts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  let filtered = [...analysts];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.title?.toLowerCase().includes(q) ||
        a.company?.toLowerCase().includes(q) ||
        a.expertise?.toLowerCase().includes(q)
    );
  }
  if (sort === "followers") filtered.sort((a, b) => b.followerCount - a.followerCount);
  else if (sort === "rating") filtered.sort((a, b) => b.avgRating - a.avgRating);
  else if (sort === "reports") filtered.sort((a, b) => b.publishedCount - a.publishedCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          Top <span className="text-emerald-600 dark:text-emerald-400">Analysts</span>
        </h1>
        <p className="mb-8 text-muted-foreground">
          Follow expert analysts and access their research
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search analysts..."
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
              <SelectItem value="followers">Most Followers</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="reports">Most Reports</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No analysts found</h3>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((analyst) => (
              <AnalystCard key={analyst.id} analyst={analyst} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

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

export function AnalystCard({ analyst }: { analyst: Analyst }) {
  const { isAuthenticated } = useStore();

  return (
    <div className="card-hover rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-sm font-semibold">
            {analyst.name?.charAt(0) || "A"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{analyst.name || "Anonymous"}</h3>
            {analyst.isVerified && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <svg className="h-3 w-3 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {analyst.title || "Analyst"}
            {analyst.company && ` · ${analyst.company}`}
          </p>
        </div>
      </div>

      {analyst.expertise && (
        <div className="mb-4 flex flex-wrap gap-1">
          {analyst.expertise.split(",").slice(0, 3).map((exp) => (
            <Badge key={exp} variant="secondary" className="text-[10px]">
              {exp.trim()}
            </Badge>
          ))}
        </div>
      )}

      {analyst.bio && (
        <p className="mb-4 line-clamp-2 text-xs text-muted-foreground">{analyst.bio}</p>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-sm font-bold">{analyst.publishedCount}</p>
          <p className="text-[10px] text-muted-foreground">Reports</p>
        </div>
        <div>
          <p className="text-sm font-bold">{analyst.followerCount}</p>
          <p className="text-[10px] text-muted-foreground">Followers</p>
        </div>
        <div>
          <p className="text-sm font-bold">{analyst.avgRating.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">Rating</p>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        size="sm"
        onClick={() => {
          window.location.hash = `analyst-detail?id=${analyst.id}`;
        }}
      >
        View Profile
      </Button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, fetchWithAuth } from "@/lib/store";

export function AnalystProfile({ analystId }: { analystId: string }) {
  const { isAuthenticated } = useStore();
  const [analyst, setAnalyst] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalyst() {
      try {
        const res = await fetch(`/api/analysts/${analystId}`);
        const data = await res.json();
        setAnalyst(data.analyst);
      } catch {
        toast.error("Error", "Failed to load analyst profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalyst();
  }, [analystId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-24" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!analyst) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Users className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Analyst not found</h2>
        <Button onClick={() => { window.location.hash = "analysts"; }}>Back to Analysts</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => { window.location.hash = "analysts"; }}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Analysts
        </button>

        {/* Profile header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xl font-semibold">
                  {analyst.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{analyst.name || "Anonymous"}</h1>
                  {analyst.isVerified && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {analyst.title || "Financial Analyst"}
                  {analyst.company && ` at ${analyst.company}`}
                </p>
                {analyst.bio && (
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{analyst.bio}</p>
                )}
                {analyst.expertise && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {analyst.expertise.split(",").map((exp: string) => (
                      <Badge key={exp} variant="secondary" className="text-xs">
                        {exp.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-4 gap-4 sm:grid-cols-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">{analyst.publishedCount}</p>
                    <p className="text-xs text-muted-foreground">Reports</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{analyst.followerCount}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{analyst.avgRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{analyst.subscriberCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Published Reports ({analyst.reports?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!analyst.reports || analyst.reports.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">No published reports yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyst.reports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => { window.location.hash = `report-detail?id=${report.id}`; }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{report.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">{report.category.name}</Badge>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {report.viewCount}</span>
                        <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {report.downloadCount}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View →</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

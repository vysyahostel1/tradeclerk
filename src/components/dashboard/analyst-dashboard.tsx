"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore, fetchWithAuth } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, FileText, Star, Users } from "lucide-react";

interface AnalystData {
  id: string;
  publishedCount: number;
  followerCount: number;
  avgRating: number;
  totalRevenue: number;
  monthlyRevenue: number;
  reports: {
    id: string;
    title: string;
    category: { name: string };
    viewCount: number;
    downloadCount: number;
    createdAt: string;
  }[];
}

export function AnalystDashboard() {
  const { user, isAuthenticated } = useStore();
  const [analyst, setAnalyst] = useState<AnalystData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ANALYST") return;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/api/analysts");
        const data = await res.json();
        const myProfile = data.analysts.find((a: { userId: string }) => a.userId === user?.id);
        if (myProfile) {
          const detailRes = await fetch(`/api/analysts/${myProfile.id}`);
          const detailData = await detailRes.json();
          setAnalyst(detailData.analyst);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated, user?.role, user?.id]);

  if (!isAuthenticated || user?.role !== "ANALYST") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Analyst Dashboard</h2>
        <p className="mb-4 text-muted-foreground">You need analyst privileges to access this page.</p>
        <Button onClick={() => { window.location.hash = "home"; }}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Analyst Dashboard</h1>
        <p className="mb-8 text-muted-foreground">Manage your research and subscribers</p>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : analyst ? (
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reports">My Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
                    <FileText className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{analyst.publishedCount}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Followers</CardTitle>
                    <Users className="h-4 w-4 text-teal-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{analyst.followerCount}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
                    <Star className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{analyst.avgRating.toFixed(1)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${analyst.totalRevenue.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Reports ({analyst.reports.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyst.reports.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <FileText className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm">No published reports yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Downloads</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyst.reports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <button
                                className="font-medium hover:text-emerald-600 dark:hover:text-emerald-400"
                                onClick={() => { window.location.hash = `report-detail?id=${r.id}`; }}
                              >
                                {r.title}
                              </button>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{r.category.name}</Badge>
                            </TableCell>
                            <TableCell>{r.viewCount}</TableCell>
                            <TableCell>{r.downloadCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="py-8 text-center">
            <CardContent>
              <p className="text-muted-foreground">Analyst profile not found. Please contact support.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore, fetchWithAuth } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bookmark,
  Clock,
  Download,
  FileText,
  Inbox,
  Loader2,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface DownloadItem {
  id: string;
  createdAt: string;
  report: {
    id: string;
    title: string;
    category: { name: string };
  };
}

interface BookmarkItem {
  id: string;
  createdAt: string;
  report: {
    id: string;
    title: string;
    summary: string | null;
    isPremium: boolean;
    category: { name: string; slug: string };
    analyst: { name: string | null; company: string | null } | null;
    viewCount: number;
    downloadCount: number;
    createdAt: string;
    reportTags: { tag: { name: string } }[];
  };
}

interface RequestItem {
  id: string;
  reportType: string;
  companyName: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

export function UserDashboard() {
  const { user, isAuthenticated } = useStore();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [editName, setEditName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchData() {
      setLoading(true);
      try {
        const [dlRes, bmRes, reqRes] = await Promise.all([
          fetchWithAuth("/api/downloads"),
          fetchWithAuth("/api/bookmarks"),
          fetchWithAuth("/api/requests"),
        ]);
        const dlData = await dlRes.json();
        const bmData = await bmRes.json();
        const reqData = await reqRes.json();
        setDownloads(dlData.downloads || []);
        setBookmarks(bmData.bookmarks || []);
        setRequests(reqData.requests || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    // Mock - profile update would need an API endpoint
    setTimeout(() => {
      toast.success("Profile updated", "Your profile has been saved.");
      setSavingProfile(false);
    }, 1000);
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    FULFILLED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Please sign in</h2>
        <p className="mb-4 text-muted-foreground">You need to be logged in to view your dashboard.</p>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { window.location.hash = "login"; }}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mb-8 text-muted-foreground">
          Welcome back, {user?.name || user?.email}
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Downloads</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{downloads.length}</p>
                  <p className="text-xs text-muted-foreground">Total downloads</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bookmarks</CardTitle>
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{bookmarks.length}</p>
                  <p className="text-xs text-muted-foreground">Saved reports</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Requests</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {requests.filter((r) => r.status === "PENDING").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending requests</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent downloads */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Recent Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : downloads.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Inbox className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">No downloads yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {downloads.slice(0, 5).map((dl) => (
                        <TableRow key={dl.id}>
                          <TableCell className="font-medium max-w-[300px] truncate">
                            <button
                              className="hover:text-emerald-600 dark:hover:text-emerald-400"
                              onClick={() => { window.location.hash = `report-detail?id=${dl.report.id}`; }}
                            >
                              {dl.report.title}
                            </button>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {dl.report.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(dl.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Recent bookmarks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Bookmarks</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Bookmark className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">No bookmarked reports</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bookmarks.slice(0, 3).map((bm) => (
                      <div
                        key={bm.id}
                        className="cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                        onClick={() => { window.location.hash = `report-detail?id=${bm.report.id}`; }}
                      >
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {bm.report.category.name}
                        </Badge>
                        <p className="text-sm font-medium line-clamp-2">{bm.report.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Bookmarked {new Date(bm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads tab */}
          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Download History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : downloads.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Download className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">No downloads yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {downloads.map((dl) => (
                        <TableRow key={dl.id}>
                          <TableCell>
                            <button
                              className="font-medium hover:text-emerald-600 dark:hover:text-emerald-400"
                              onClick={() => { window.location.hash = `report-detail?id=${dl.report.id}`; }}
                            >
                              {dl.report.title}
                            </button>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{dl.report.category.name}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(dl.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookmarks tab */}
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {bookmarks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Bookmark className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">No bookmarked reports</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => { window.location.hash = "reports"; }}
                    >
                      Browse Reports
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="cursor-pointer rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                        onClick={() => { window.location.hash = `report-detail?id=${bm.report.id}`; }}
                      >
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {bm.report.category.name}
                        </Badge>
                        <p className="text-sm font-medium line-clamp-2">{bm.report.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(bm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">My Report Requests</CardTitle>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    const type = prompt("Report type (e.g., Company Research):");
                    const company = prompt("Company name (optional):");
                    if (type) {
                      fetchWithAuth("/api/requests", {
                        method: "POST",
                        body: JSON.stringify({ reportType: type, companyName: company || null, notes: null }),
                      }).then(() => toast.success("Request submitted!")).catch(() => toast.error("Failed to submit."));
                    }
                  }}
                >
                  New Request
                </Button>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">No report requests yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.reportType}</TableCell>
                          <TableCell>{req.companyName || "—"}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${statusColor[req.status] || ""}`}>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="editName">Full Name</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role || "USER"} disabled />
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

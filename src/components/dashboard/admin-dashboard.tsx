"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore, fetchWithAuth } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalReports: number;
  totalDownloads: number;
  totalPosts: number;
  activeSubscriptions: number;
  pendingRequests: number;
  premiumReports: number;
  totalViews: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  karma: number;
  createdAt: string;
  _count: { downloads: number; bookmarks: number };
}

interface AdminRequest {
  id: string;
  reportType: string;
  companyName: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

interface AdminReport {
  id: string;
  title: string;
  isPublished: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  reportCount: number;
}

export function AdminDashboard() {
  const { user, isAuthenticated } = useStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allReports, setAllReports] = useState<AdminReport[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [allRequests, setAllRequests] = useState<AdminRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // New report form
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPremium, setNewPremium] = useState(false);
  const [newPublished, setNewPublished] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") return;
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, reportsRes, usersRes, requestsRes, catsRes] = await Promise.all([
          fetchWithAuth("/api/admin/stats"),
          fetchWithAuth("/api/reports?limit=100"),
          fetchWithAuth("/api/admin/users?limit=100"),
          fetchWithAuth("/api/requests"),
          fetch("/api/reports/categories"),
        ]);
        const statsData = await statsRes.json();
        const reportsData = await reportsRes.json();
        const usersData = await usersRes.json();
        const requestsData = await requestsRes.json();
        const catsData = await catsRes.json();

        setStats(statsData.stats);
        setAllReports(reportsData.reports || []);
        setAllUsers(usersData.users || []);
        setAllRequests(requestsData.requests || []);
        setCategories(catsData.categories || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated, user?.role]);

  const handleCreateReport = async () => {
    if (!newTitle || !newCategory) {
      toast.error("Error", "Title and category are required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetchWithAuth("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          summary: newSummary,
          categoryId: categories.find((c) => c.slug === newCategory)?.id,
          isPremium: newPremium,
          isPublished: newPublished,
          tags: [],
        }),
      });
      if (res.ok) {
        toast.success("Report created!", "New report has been added.");
        setNewTitle("");
        setNewSummary("");
        setNewCategory("");
        setNewPremium(false);
        setNewPublished(false);
        // Refresh reports
        const reportsRes = await fetchWithAuth("/api/reports?limit=100");
        const reportsData = await reportsRes.json();
        setAllReports(reportsData.reports || []);
      }
    } catch {
      toast.error("Error", "Failed to create report.");
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (reportId: string, isPublished: boolean) => {
    try {
      await fetchWithAuth(`/api/reports/${reportId}`, {
        method: "PUT",
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      toast.success("Updated", isPublished ? "Report unpublished." : "Report published.");
      setAllReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, isPublished: !isPublished } : r))
      );
    } catch {
      toast.error("Error", "Failed to update report.");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await fetchWithAuth(`/api/reports/${reportId}`, { method: "DELETE" });
      toast.success("Deleted", "Report has been deleted.");
      setAllReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      toast.error("Error", "Failed to delete report.");
    }
  };

  const handleUpdateRequest = async (requestId: string, status: string) => {
    try {
      await fetchWithAuth(`/api/requests/${requestId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast.success("Updated", `Request ${status.toLowerCase()}.`);
      setAllRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    } catch {
      toast.error("Error", "Failed to update request.");
    }
  };

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BarChart3 className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Access Denied</h2>
        <p className="mb-4 text-muted-foreground">You need admin privileges to access this page.</p>
        <Button onClick={() => { window.location.hash = "home"; }}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your platform</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-emerald-600" },
                { label: "Reports", value: stats?.totalReports || 0, icon: FileText, color: "text-teal-600" },
                { label: "Downloads", value: stats?.totalDownloads || 0, icon: Download, color: "text-green-600" },
                { label: "Total Views", value: stats?.totalViews || 0, icon: Eye, color: "text-cyan-600" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Forum Posts", value: stats?.totalPosts || 0 },
                      { label: "Active Subscriptions", value: stats?.activeSubscriptions || 0 },
                      { label: "Premium Reports", value: stats?.premiumReports || 0 },
                      { label: "Pending Requests", value: stats?.pendingRequests || 0 },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-medium">{s.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {categories.map((cat) => (
                    <div key={cat.id} className="mb-3">
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{cat.name}</span>
                        <span className="text-muted-foreground">{cat.reportCount}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${categories.length > 0 ? (cat.reportCount / Math.max(...categories.map((c) => c.reportCount), 1)) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports tab */}
          <TabsContent value="reports">
            {/* Create report form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5" /> Create New Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Report title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Summary</Label>
                    <Textarea value={newSummary} onChange={(e) => setNewSummary(e.target.value)} placeholder="Brief summary" rows={3} />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox id="premium" checked={newPremium} onCheckedChange={(v) => setNewPremium(v === true)} />
                      <Label htmlFor="premium">Premium</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="published" checked={newPublished} onCheckedChange={(v) => setNewPublished(v === true)} />
                      <Label htmlFor="published">Published</Label>
                    </div>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateReport} disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reports table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Reports ({allReports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {allReports.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">No reports yet</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Downloads</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allReports.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium max-w-[250px] truncate">{r.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{r.category.name}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {r.isPublished && (
                                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs">Published</Badge>
                                )}
                                {r.isPremium && (
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 text-xs">Premium</Badge>
                                )}
                                {r.isFeatured && (
                                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-xs">Featured</Badge>
                                )}
                                {!r.isPublished && (
                                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs">Draft</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{r.viewCount}</TableCell>
                            <TableCell>{r.downloadCount}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTogglePublish(r.id, r.isPublished)}
                                >
                                  {r.isPublished ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleDeleteReport(r.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Users ({allUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Downloads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name || "—"}</TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${u.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{u._count.downloads}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Requests ({allRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {allRequests.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Clock className="mx-auto mb-2 h-8 w-8" />
                    <p className="text-sm">No pending requests</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Requested By</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allRequests.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.reportType}</TableCell>
                            <TableCell>{req.companyName || "—"}</TableCell>
                            <TableCell className="text-sm">{req.user?.email || "—"}</TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${
                                req.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" :
                                req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" :
                                req.status === "FULFILLED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" :
                                "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                              }`}>
                                {req.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {req.status === "PENDING" && (
                                <div className="flex justify-end gap-1">
                                  <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => handleUpdateRequest(req.id, "APPROVED")}>
                                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleUpdateRequest(req.id, "REJECTED")}>
                                    <XCircle className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories ({categories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="text-sm font-medium">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.reportCount} reports</p>
                      </div>
                      <Badge variant="secondary">{cat.slug}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

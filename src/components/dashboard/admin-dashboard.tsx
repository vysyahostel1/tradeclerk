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
  FileEdit,
  Save,
  ChevronDown,
  ChevronRight,
  UserCog,
  KeyRound,
  ShieldCheck,
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

interface PageSection {
  id: string;
  heading: string;
  content: string;
  type: string;
}

interface PageContent {
  title: string;
  heroSubtitle: string;
  sections: PageSection[];
}

type PagesData = Record<string, PageContent>;

const PAGE_SLUG_LABELS: Record<string, string> = {
  about: "About Us",
  blog: "Blog",
  careers: "Careers",
  contact: "Contact Us",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cookies: "Cookie Policy",
};

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

  // Account settings state
  const [accountName, setAccountName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Pages state
  const [pagesData, setPagesData] = useState<PagesData>({});
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingHeading, setEditingHeading] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [newSectionHeading, setNewSectionHeading] = useState("");
  const [newSectionContent, setNewSectionContent] = useState("");

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

        // Fetch pages data
        const pagesRes = await fetchWithAuth("/api/admin/pages");
        if (pagesRes.ok) {
          const pagesJson = await pagesRes.json();
          setPagesData(pagesJson.pages || {});
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // Set current account name
    if (user?.name) setAccountName(user.name);
  }, [isAuthenticated, user?.role, user?.name]);

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

  // Pages management functions
  const handleSelectPage = (slug: string) => {
    setSelectedPageSlug(slug);
    setExpandedSections(new Set());
    setEditingSectionId(null);
    setNewSectionHeading("");
    setNewSectionContent("");
  };

  const handleUpdatePageMeta = async (slug: string, field: 'title' | 'heroSubtitle', value: string) => {
    const page = pagesData[slug];
    if (!page) return;
    const updated = { ...page, [field]: value };
    setPagesData(prev => ({ ...prev, [slug]: updated }));
    try {
      await fetchWithAuth("/api/admin/pages", {
        method: "PUT",
        body: JSON.stringify({ slug, page: updated }),
      });
      toast.success("Updated", `${field} has been saved.`);
    } catch {
      toast.error("Error", "Failed to update.");
    }
  };

  const handleAddSection = async (slug: string) => {
    if (!newSectionHeading.trim() || !newSectionContent.trim()) {
      toast.error("Error", "Heading and content are required.");
      return;
    }
    setPageLoading(true);
    try {
      const res = await fetchWithAuth("/api/admin/pages", {
        method: "POST",
        body: JSON.stringify({
          slug,
          action: "add-section",
          section: {
            id: `section-${Date.now()}`,
            heading: newSectionHeading.trim(),
            content: newSectionContent.trim(),
            type: "text",
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPagesData(prev => ({ ...prev, [slug]: data.page }));
        setNewSectionHeading("");
        setNewSectionContent("");
        toast.success("Added", "New section has been added.");
      }
    } catch {
      toast.error("Error", "Failed to add section.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleUpdateSection = async (slug: string) => {
    if (!editingSectionId || !editingHeading.trim() || !editingContent.trim()) {
      toast.error("Error", "Heading and content are required.");
      return;
    }
    setPageLoading(true);
    try {
      const res = await fetchWithAuth("/api/admin/pages", {
        method: "POST",
        body: JSON.stringify({
          slug,
          action: "update-section",
          section: {
            id: editingSectionId,
            heading: editingHeading.trim(),
            content: editingContent.trim(),
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPagesData(prev => ({ ...prev, [slug]: data.page }));
        setEditingSectionId(null);
        toast.success("Updated", "Section has been updated.");
      }
    } catch {
      toast.error("Error", "Failed to update section.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleRemoveSection = async (slug: string, sectionId: string) => {
    if (!confirm("Are you sure you want to remove this section?")) return;
    setPageLoading(true);
    try {
      const res = await fetchWithAuth("/api/admin/pages", {
        method: "POST",
        body: JSON.stringify({
          slug,
          action: "remove-section",
          section: { id: sectionId },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPagesData(prev => ({ ...prev, [slug]: data.page }));
        setExpandedSections(prev => {
          const next = new Set(prev);
          next.delete(sectionId);
          return next;
        });
        if (editingSectionId === sectionId) {
          setEditingSectionId(null);
        }
        toast.success("Removed", "Section has been removed.");
      }
    } catch {
      toast.error("Error", "Failed to remove section.");
    } finally {
      setPageLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const startEditing = (section: PageSection) => {
    setEditingSectionId(section.id);
    setEditingHeading(section.heading);
    setEditingContent(section.content);
  };

  const cancelEditing = () => {
    setEditingSectionId(null);
    setEditingHeading("");
    setEditingContent("");
  };

  // Account settings handlers
  const handleUpdateName = async () => {
    if (!accountName.trim() || accountName.trim().length < 2) {
      toast.error("Error", "Name must be at least 2 characters.");
      return;
    }
    setAccountSaving(true);
    try {
      const res = await fetchWithAuth("/api/admin/account", {
        method: "PUT",
        body: JSON.stringify({ name: accountName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Name Updated", "Your display name has been changed.");
        // Update store with new name
        useStore.getState().setUser({ ...useStore.getState().user!, name: accountName.trim() });
      } else {
        toast.error("Error", data.error || "Failed to update name.");
      }
    } catch {
      toast.error("Error", "Failed to update name.");
    } finally {
      setAccountSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error("Error", "Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("Error", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Error", "New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetchWithAuth("/api/admin/account", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password Updated", "Your password has been changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Error", data.error || "Failed to update password.");
      }
    } catch {
      toast.error("Error", "Failed to update password.");
    } finally {
      setPasswordSaving(false);
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

  const selectedPage = selectedPageSlug ? pagesData[selectedPageSlug] : null;

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
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
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
                                <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(r.id, r.isPublished)}>
                                  {r.isPublished ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteReport(r.id)}>
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

          {/* Pages tab — CMS Editor */}
          <TabsContent value="pages">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Page list sidebar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileEdit className="h-5 w-5" /> Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.keys(PAGE_SLUG_LABELS).map((slug) => (
                      <button
                        key={slug}
                        onClick={() => handleSelectPage(slug)}
                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          selectedPageSlug === slug
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        {PAGE_SLUG_LABELS[slug]}
                        {pagesData[slug] && (
                          <span className="ml-2 text-xs opacity-60">({pagesData[slug].sections.length})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Page editor */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedPage ? `Edit: ${selectedPage.title}` : "Select a page to edit"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedPageSlug || !selectedPage ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <FileText className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm">Select a page from the left panel to manage its content.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Page title and subtitle */}
                      <div className="space-y-4 rounded-lg border border-border p-4">
                        <div className="space-y-2">
                          <Label>Page Title</Label>
                          <Input
                            value={selectedPage.title}
                            onChange={(e) => handleUpdatePageMeta(selectedPageSlug, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Hero Subtitle</Label>
                          <Textarea
                            value={selectedPage.heroSubtitle}
                            onChange={(e) => handleUpdatePageMeta(selectedPageSlug, "heroSubtitle", e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Sections list */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Sections ({selectedPage.sections.length})
                          </h3>
                        </div>

                        {selectedPage.sections.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
                            <p className="text-sm">No sections yet. Add one below.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedPage.sections.map((section) => {
                              const isExpanded = expandedSections.has(section.id);
                              const isEditing = editingSectionId === section.id;

                              return (
                                <div
                                  key={section.id}
                                  className="rounded-lg border border-border transition-colors"
                                >
                                  {/* Section header */}
                                  <button
                                    onClick={() => toggleSection(section.id)}
                                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/50 transition-colors rounded-lg"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                      )}
                                      <span className="text-sm font-medium truncate">
                                        {section.heading}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Badge variant="secondary" className="text-xs">
                                        {section.type}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditing(section);
                                          if (!isExpanded) toggleSection(section.id);
                                        }}
                                      >
                                        <FileEdit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveSection(selectedPageSlug, section.id);
                                        }}
                                        disabled={pageLoading}
                                      >
                                        {pageLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                      </Button>
                                    </div>
                                  </button>

                                  {/* Section body — view or edit */}
                                  {isExpanded && (
                                    <div className="border-t border-border px-4 py-3">
                                      {isEditing ? (
                                        <div className="space-y-3">
                                          <div className="space-y-2">
                                            <Label className="text-xs">Heading</Label>
                                            <Input
                                              value={editingHeading}
                                              onChange={(e) => setEditingHeading(e.target.value)}
                                              placeholder="Section heading"
                                              className="h-8 text-sm"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-xs">Content</Label>
                                            <Textarea
                                              value={editingContent}
                                              onChange={(e) => setEditingContent(e.target.value)}
                                              placeholder="Section content..."
                                              rows={6}
                                              className="text-sm"
                                            />
                                          </div>
                                          <div className="flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" onClick={cancelEditing}>
                                              Cancel
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="bg-emerald-600 hover:bg-emerald-700"
                                              onClick={() => handleUpdateSection(selectedPageSlug)}
                                              disabled={pageLoading}
                                            >
                                              {pageLoading ? (
                                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                              ) : (
                                                <Save className="mr-1 h-3.5 w-3.5" />
                                              )}
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                          {section.content}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add new section */}
                        <div className="rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 p-4">
                          <h4 className="mb-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add New Section
                          </h4>
                          <div className="space-y-3">
                            <Input
                              value={newSectionHeading}
                              onChange={(e) => setNewSectionHeading(e.target.value)}
                              placeholder="Section heading"
                              className="h-8 text-sm"
                            />
                            <Textarea
                              value={newSectionContent}
                              onChange={(e) => setNewSectionContent(e.target.value)}
                              placeholder="Section content..."
                              rows={4}
                              className="text-sm"
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleAddSection(selectedPageSlug)}
                                disabled={pageLoading || !newSectionHeading.trim() || !newSectionContent.trim()}
                              >
                                {pageLoading ? (
                                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="mr-1 h-4 w-4" />
                                )}
                                Add Section
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Settings tab */}
          <TabsContent value="account">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Change Display Name */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-emerald-600" /> Change Display Name
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Update the name displayed on your admin account.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Name</Label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            {(user?.name || user?.email || "A")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {user?.name || "Not set"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newName">New Name</Label>
                      <Input
                        id="newName"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Enter new display name"
                      />
                    </div>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 w-full"
                      onClick={handleUpdateName}
                      disabled={accountSaving || !accountName.trim()}
                    >
                      {accountSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserCog className="mr-2 h-4 w-4" />
                      )}
                      Update Name
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-amber-600" /> Change Password
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Update your admin password. You must enter your current password to confirm.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPwd">Current Password</Label>
                      <Input
                        id="currentPwd"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPwd">New Password</Label>
                      <Input
                        id="newPwd"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 8 characters)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPwd">Confirm New Password</Label>
                      <Input
                        id="confirmPwd"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-destructive">Passwords do not match</p>
                      )}
                      {newPassword && newPassword.length > 0 && newPassword.length < 8 && (
                        <p className="text-xs text-destructive">Password must be at least 8 characters</p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      style={{ borderColor: newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 ? undefined : undefined }}
                      onClick={handleUpdatePassword}
                      disabled={
                        passwordSaving ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword.length < 8 ||
                        newPassword !== confirmPassword
                      }
                    >
                      {passwordSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="mr-2 h-4 w-4" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Info Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" /> Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                        Email
                      </p>
                      <p className="text-sm font-medium">{user?.email || "Not set"}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                        Role
                      </p>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                        {user?.role || "USER"}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                        Status
                      </p>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore, apiFetch } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ReportCard } from './report-card'
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Download,
  Eye,
  FileText,
  Lock,
  Share2,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

interface ReportDetailData {
  id: string
  title: string
  summary: string | null
  content: string | null
  isPremium: boolean
  isFeatured: boolean
  viewCount: number
  downloadCount: number
  pageCount: number
  fileSize: string | null
  publishedAt: string | null
  createdAt: string
  category: { id: string; name: string; slug: string }
  analyst: {
    id: string
    name: string | null
    image: string | null
    company: string | null
    bio: string | null
  } | null
  reportTags: { tag: { id: string; name: string; slug: string } }[]
}

interface RelatedReport {
  id: string
  title: string
  summary: string | null
  slug: string
  isPremium: boolean
  isFeatured: boolean
  viewCount: number
  downloadCount: number
  createdAt: string
  category: { id: string; name: string; slug: string }
  analyst: {
    id: string
    name: string | null
    image: string | null
    company: string | null
  } | null
  reportTags: { tag: { id: string; name: string; slug: string } }[]
}

export function ReportDetail({ reportId }: { reportId: string }) {
  const { isAuthenticated, navigate } = useStore()
  const [report, setReport] = useState<ReportDetailData | null>(null)
  const [related, setRelated] = useState<RelatedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${reportId}`)
        const data = await res.json()
        setReport(data.report)

        if (data.report?.category?.slug) {
          const relRes = await fetch(
            `/api/reports?limit=3&category=${data.report.category.slug}`
          )
          const relData = await relRes.json()
          setRelated(
            (relData.reports || [])
              .filter((r: RelatedReport) => r.id !== reportId)
              .slice(0, 3)
          )
        }
      } catch {
        toast.error('Error', 'Failed to load report.')
      } finally {
        setLoading(false)
      }
    }
    if (reportId) fetchReport()
  }, [reportId])

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Sign in required', 'Please sign in to bookmark reports.')
      return
    }
    try {
      if (bookmarked) {
        await apiFetch(`/api/bookmarks/${reportId}`, { method: 'DELETE' })
        toast.success('Removed', 'Bookmark removed.')
      } else {
        await apiFetch('/api/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ reportId }),
        })
        toast.success('Bookmarked!', 'Report saved to your bookmarks.')
      }
      setBookmarked(!bookmarked)
    } catch {
      toast.error('Error', 'Failed to update bookmark.')
    }
  }

  const handleDownload = async () => {
    if (report?.isPremium && !isAuthenticated) {
      toast.info('Premium', 'Sign in and subscribe to download premium reports.')
      return
    }
    setDownloading(true)
    try {
      await apiFetch('/api/downloads', {
        method: 'POST',
        body: JSON.stringify({ reportId }),
      })
      toast.success('Download started!', 'Your report is being downloaded.')
    } catch {
      toast.error('Error', 'Failed to start download.')
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#report-detail/${reportId}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied!', 'Report link has been copied to clipboard.')
  }

  const handleFollowAnalyst = () => {
    if (!isAuthenticated) {
      toast.info('Sign in required', 'Please sign in to follow analysts.')
      return
    }
    setFollowing(!following)
    toast.success(following ? 'Unfollowed' : 'Following', 'Analyst subscription updated.')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-24" />
        <Skeleton className="mb-4 h-10 w-3/4" />
        <Skeleton className="mb-8 h-48 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Report not found</h2>
        <p className="mb-4 text-muted-foreground">
          The report you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => navigate('reports')}>Browse Reports</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button
          onClick={() => navigate('reports')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>
      </motion.div>

      {/* Cover */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 sm:p-12"
      >
        <div className="relative">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge className="bg-white/20 text-white backdrop-blur-sm">
              {report.category.name}
            </Badge>
            {report.isPremium && (
              <Badge className="bg-amber-500 text-white">
                <Lock className="mr-1 h-3 w-3" /> Premium
              </Badge>
            )}
            {report.isFeatured && (
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                Featured
              </Badge>
            )}
          </div>
          <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            {report.title}
          </h1>
          <p className="text-emerald-100">
            {report.summary || 'Comprehensive research analysis and market insights'}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-emerald-200">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {report.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" /> {report.downloadCount} downloads
            </span>
            {report.pageCount > 0 && (
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> {report.pageCount} pages
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />{' '}
              {new Date(report.publishedAt || report.createdAt).toLocaleDateString(
                'en-US',
                { month: 'long', day: 'numeric', year: 'numeric' }
              )}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-8 lg:grid-cols-[1fr_300px]"
      >
        {/* Main content */}
        <div>
          {/* Action buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            <Button variant="outline" onClick={handleBookmark}>
              <Bookmark
                className={`mr-2 h-4 w-4 ${
                  bookmarked
                    ? 'fill-emerald-600 text-emerald-600'
                    : ''
                }`}
              />
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Tags */}
          {report.reportTags.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {report.reportTags.map((rt) => (
                <Badge key={rt.tag.id} variant="secondary" className="text-xs">
                  {rt.tag.name}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="mb-6" />

          {/* Summary */}
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Summary</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {report.summary || 'No summary available.'}
            </p>
          </div>

          {/* Content */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Full Report</h2>
            {report.content ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {report.content}
              </p>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">Full Report Content</h3>
                <p className="text-sm text-muted-foreground">
                  Download the PDF to access the complete research report with charts, data
                  tables, and detailed analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Analyst card */}
          {report.analyst && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="mb-3 text-sm font-semibold">About the Analyst</h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    {report.analyst.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {report.analyst.name || 'Anonymous'}
                  </p>
                  {report.analyst.company && (
                    <p className="text-xs text-muted-foreground">
                      {report.analyst.company}
                    </p>
                  )}
                </div>
              </div>
              {report.analyst.bio && (
                <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">
                  {report.analyst.bio}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={handleFollowAnalyst}
              >
                {following ? 'Following' : 'Follow Analyst'}
              </Button>
            </div>
          )}

          {/* Report details */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-3 text-sm font-semibold">Report Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{report.category.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{report.isPremium ? 'Premium' : 'Free'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pages</span>
                <span className="font-medium">{report.pageCount || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Size</span>
                <span className="font-medium">{report.fileSize || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Published</span>
                <span className="font-medium">
                  {report.publishedAt
                    ? new Date(report.publishedAt).toLocaleDateString()
                    : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Related reports */}
      {related.length > 0 && (
        <div className="mt-16">
          <Separator className="mb-8" />
          <h3 className="mb-6 text-xl font-bold">Related Reports</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

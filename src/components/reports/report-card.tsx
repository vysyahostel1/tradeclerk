'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore, apiFetch } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bookmark, Download, Eye, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Report {
  id: string
  title: string
  summary: string | null
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

interface ReportCardProps {
  report: Report
  onBookmark?: (id: string) => void
  isBookmarked?: boolean
}

const gradients = [
  'from-emerald-600 to-teal-600',
  'from-teal-600 to-cyan-600',
  'from-green-600 to-emerald-600',
  'from-emerald-700 to-green-600',
  'from-teal-700 to-emerald-700',
  'from-green-700 to-teal-700',
  'from-cyan-700 to-teal-700',
  'from-emerald-800 to-teal-800',
]

export function ReportCard({ report, onBookmark, isBookmarked: externalBookmarked }: ReportCardProps) {
  const { isAuthenticated, navigate } = useStore()
  const [bookmarked, setBookmarked] = useState(externalBookmarked ?? false)
  const [downloading, setDownloading] = useState(false)

  const gradient = gradients[report.title.length % gradients.length]
  const isBookmarked = externalBookmarked !== undefined ? externalBookmarked : bookmarked

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.info('Sign in required', 'Please sign in to bookmark reports.')
      return
    }
    try {
      if (isBookmarked) {
        await apiFetch(`/api/bookmarks/${report.id}`, { method: 'DELETE' })
        toast.success('Removed', 'Bookmark removed.')
      } else {
        await apiFetch('/api/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ reportId: report.id }),
        })
        toast.success('Bookmarked!', 'Report saved to your bookmarks.')
      }
      setBookmarked(!isBookmarked)
      onBookmark?.(report.id)
    } catch {
      toast.error('Error', 'Failed to update bookmark.')
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (report.isPremium && !isAuthenticated) {
      toast.info('Premium', 'Sign in and subscribe to download premium reports.')
      return
    }
    setDownloading(true)
    try {
      await apiFetch('/api/downloads', {
        method: 'POST',
        body: JSON.stringify({ reportId: report.id }),
      })
      toast.success('Download started!', 'Your report is being downloaded.')
    } catch {
      toast.error('Error', 'Failed to start download.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
      onClick={() => navigate('report-detail', { id: report.id })}
    >
      {/* Cover area */}
      <div
        className={cn(
          'relative h-40 bg-gradient-to-br flex items-center justify-center',
          gradient
        )}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative text-center">
          <p className="text-3xl font-bold text-white/80">
            {report.category.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 3)}
          </p>
          <p className="mt-1 text-xs text-white/60">{report.category.name}</p>
        </div>

        {/* Category badge top-left */}
        <Badge className="absolute bottom-3 left-3 bg-black/30 text-[10px] text-white backdrop-blur-sm">
          {report.category.name}
        </Badge>

        {/* Premium badge top-right */}
        {report.isPremium && (
          <Badge className="absolute right-3 top-3 bg-amber-500 text-white">
            <Lock className="mr-1 h-3 w-3" /> Premium
          </Badge>
        )}

        {/* Tags at bottom right */}
        {report.reportTags.length > 0 && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {report.reportTags.slice(0, 2).map((rt) => (
              <Badge
                key={rt.tag.id}
                className="bg-black/30 text-[10px] text-white backdrop-blur-sm"
              >
                {rt.tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          {report.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
          {report.summary || 'Comprehensive research analysis and market insights'}
        </p>

        {/* Analyst info */}
        {report.analyst && (
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              {report.analyst.name?.charAt(0) || 'A'}
            </div>
            <span className="text-xs text-muted-foreground">
              {report.analyst.name || 'Anonymous'}
              {report.analyst.company && ` · ${report.analyst.company}`}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {report.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" /> {report.downloadCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleBookmark}
            >
              <Bookmark
                className={cn(
                  'h-3.5 w-3.5',
                  isBookmarked &&
                    'fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400'
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

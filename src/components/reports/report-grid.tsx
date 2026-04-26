'use client'

import { ReportCard } from './report-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useStore } from '@/lib/store'

interface Report {
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

interface ReportGridProps {
  reports: Report[]
  loading?: boolean
  emptyMessage?: string
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function ReportGrid({
  reports,
  loading,
  emptyMessage = 'No reports found',
  page = 1,
  totalPages = 1,
  onPageChange,
}: ReportGridProps) {
  const { navigate } = useStore()

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <Skeleton className="h-40 w-full" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between pt-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!reports.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page + i - 2
            if (p < 1 || p > totalPages) return null
            return (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                className={page === p ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                onClick={() => onPageChange?.(p)}
              >
                {p}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

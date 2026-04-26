'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, Clock, Download, Eye, Star } from 'lucide-react'

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
  analyst: { id: string; name: string | null; image: string | null; company: string | null } | null
}

const gradients = [
  'from-emerald-600 to-teal-600',
  'from-teal-600 to-cyan-600',
  'from-green-600 to-emerald-600',
  'from-emerald-700 to-green-600',
  'from-teal-700 to-emerald-700',
  'from-green-700 to-teal-700',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function FeaturedReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const { navigate } = useStore()

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/reports/featured')
        const data = await res.json()
        setReports(data.reports || [])
      } catch {
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <Badge variant="secondary" className="mb-4">
              Featured Research
            </Badge>
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Top Analyst{' '}
              <span className="text-emerald-600 dark:text-emerald-400">Picks</span>
            </h2>
            <p className="text-muted-foreground">
              Curated reports handpicked by our editorial team
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden sm:flex"
            onClick={() => navigate('reports')}
          >
            View All Reports
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {loading ? (
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {reports.slice(0, 6).map((report, i) => (
              <motion.div
                key={report.id}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                onClick={() => navigate('report-detail', { id: report.id })}
              >
                {/* Cover area */}
                <div
                  className={`relative h-40 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative text-center">
                    <p className="text-4xl font-bold text-white/90">
                      {report.category.name.charAt(0)}
                    </p>
                  </div>
                  {report.isPremium && (
                    <Badge className="absolute right-3 top-3 bg-amber-500 text-white">
                      <Star className="mr-1 h-3 w-3" /> Premium
                    </Badge>
                  )}
                  {report.isFeatured && (
                    <Badge className="absolute left-3 top-3 bg-white/20 text-white backdrop-blur-sm">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="p-5">
                  <Badge variant="secondary" className="mb-3 text-xs">
                    {report.category.name}
                  </Badge>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {report.title}
                  </h3>

                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    {report.analyst?.name && (
                      <span>{report.analyst.name}</span>
                    )}
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(report.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {report.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {report.downloadCount}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button
            variant="outline"
            onClick={() => navigate('reports')}
          >
            View All Reports
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Building,
  Building2,
  Globe,
  LineChart,
  PieChart,
  Rocket,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  reportCount?: number
}

interface DefaultCategory {
  name: string
  icon: LucideIcon
  color: string
  count: number
}

const defaultCategories: DefaultCategory[] = [
  { name: 'Industry Reports', icon: Building2, color: 'emerald', count: 2840 },
  { name: 'Stock Reports', icon: TrendingUp, color: 'teal', count: 3150 },
  { name: 'IPO Reports', icon: Rocket, color: 'cyan', count: 890 },
  { name: 'Sector Reports', icon: PieChart, color: 'green', count: 1760 },
  { name: 'Company Research', icon: Building, color: 'lime', count: 3540 },
  { name: 'Macro Economic', icon: Globe, color: 'emerald', count: 1240 },
  { name: 'Quarterly Earnings', icon: BarChart3, color: 'teal', count: 2100 },
  { name: 'Market Outlook', icon: LineChart, color: 'green', count: 980 },
]

const colorMap: Record<string, string> = {
  emerald:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50',
  green: 'bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/50',
  lime: 'bg-lime-50 text-lime-600 dark:bg-lime-950/50 dark:text-lime-400 group-hover:bg-lime-100 dark:group-hover:bg-lime-900/50',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)
  const { navigate } = useStore()

  useEffect(() => {
    fetch('/api/reports/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.categories?.length > 0) {
          setCategories(d.categories)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const displayCategories = categories.length > 0
    ? categories.slice(0, 8).map((cat, i) => ({
        name: cat.name,
        count: cat.reportCount || 0,
        color: (Object.keys(colorMap) as string[])[i % Object.keys(colorMap).length],
        icon: defaultCategories[i % defaultCategories.length].icon,
      }))
    : defaultCategories

  const handleCategoryClick = (name: string) => {
    navigate('reports', { category: name })
  }

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <Badge variant="secondary" className="mb-4">
            Research Categories
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Explore by{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Category</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Browse our extensive library of financial research organized by category
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
        >
          {displayCategories.map((cat) => (
            <motion.button
              key={cat.name}
              variants={cardVariants}
              onClick={() => handleCategoryClick(cat.name)}
              whileHover={{ y: -4 }}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${colorMap[cat.color]}`}
              >
                <cat.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold">{cat.name}</p>
                <Badge variant="secondary" className="mt-1.5 text-[10px]">
                  {cat.count > 0 ? `${(cat.count / 1000).toFixed(1)}K` : '—'} reports
                </Badge>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

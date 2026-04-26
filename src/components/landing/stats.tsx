'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface StatItem {
  value: number
  suffix: string
  label: string
  prefix?: string
}

const stats: StatItem[] = [
  { value: 10000, suffix: '+', prefix: '', label: 'Reports Published' },
  { value: 500, suffix: '+', prefix: '', label: 'Expert Analysts' },
  { value: 50000, suffix: '+', prefix: '', label: 'Active Users' },
  { value: 2, suffix: 'M+', prefix: '', label: 'Total Downloads' },
]

function AnimatedCounter({
  end,
  suffix,
  prefix = '',
  duration = 2,
}: {
  end: number
  suffix: string
  prefix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return

    // For large numbers, format nicely
    if (end >= 10000) {
      // Animate in thousands
      const targetK = end / 1000
      const step = targetK / (duration * 60)
      let current = 0
      const timer = setInterval(() => {
        current += step
        if (current >= targetK) {
          current = targetK
          clearInterval(timer)
        }
        setCount(Math.floor(current))
      }, 1000 / 60)
      return () => clearInterval(timer)
    }

    if (end >= 1000) {
      const targetK = end / 1000
      const step = targetK / (duration * 60)
      let current = 0
      const timer = setInterval(() => {
        current += step
        if (current >= targetK) {
          current = targetK
          clearInterval(timer)
        }
        setCount(Math.floor(current))
      }, 1000 / 60)
      return () => clearInterval(timer)
    }

    const step = end / (duration * 60)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= end) {
        current = end
        clearInterval(timer)
      }
      setCount(Math.floor(current))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  const formatted =
    end >= 1000
      ? `${prefix}${(count / 1000).toFixed(end >= 10000 ? 0 : 1)}K${count >= end / 1000 ? suffix.replace('+', '') : ''}`
      : `${prefix}${count.toLocaleString()}${count >= end ? suffix : ''}`

  // Simplified: just show formatted number
  if (end >= 10000) {
    const displayVal = count
    return (
      <span ref={ref}>
        {prefix}{displayVal.toLocaleString()}{suffix}
      </span>
    )
  }

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{count >= end ? suffix : ''}
    </span>
  )
}

export function Stats() {
  return (
    <section className="border-y border-border bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-4xl">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

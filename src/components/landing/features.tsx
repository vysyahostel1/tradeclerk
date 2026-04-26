'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Zap,
  Search,
  Shield,
  Users,
  MessageSquare,
} from 'lucide-react'

const features = [
  {
    title: 'Expert Analysis',
    description: 'Research from 500+ verified analysts with proven track records and deep domain expertise.',
    icon: FileText,
  },
  {
    title: 'Real-Time Updates',
    description: 'Stay ahead with instant alerts on new reports and market changes as they happen.',
    icon: Zap,
  },
  {
    title: 'Smart Discovery',
    description: 'AI-powered search finds exactly the research you need from our extensive library.',
    icon: Search,
  },
  {
    title: 'Secure Platform',
    description: 'Bank-grade security for all your data and downloads with end-to-end encryption.',
    icon: Shield,
  },
  {
    title: 'Analyst Marketplace',
    description: 'Subscribe to top analysts and get exclusive research delivered to your inbox.',
    icon: Users,
  },
  {
    title: 'Community Insights',
    description: 'Join 50,000+ investors sharing ideas, research, and market strategies.',
    icon: MessageSquare,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <Badge variant="secondary" className="mb-4">
            Why TradeClerk?
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need for{' '}
            <span className="text-emerald-600 dark:text-emerald-400">
              Smarter Investing
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From expert research to real-time alerts, TradeClerk provides the complete toolkit
            for serious investors and financial professionals.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="card-hover group rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

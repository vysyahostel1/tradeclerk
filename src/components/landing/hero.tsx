'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  BarChart3,
  Download,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

const statsBar = [
  { icon: FileText, value: '10,000+', label: 'Reports' },
  { icon: Users, value: '500+', label: 'Analysts' },
  { icon: Download, value: '50,000+', label: 'Users' },
  { icon: Zap, value: '99.9%', label: 'Uptime' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function Hero() {
  const { navigate } = useStore()

  return (
    <section className="relative overflow-hidden hero-gradient">
      {/* Animated background decorations */}
      <div className="pointer-events-none absolute inset-0">
        {/* Floating blobs */}
        <motion.div
          className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] h-80 w-80 rounded-full bg-teal-500/8 blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid chart pattern */}
        <div className="absolute inset-0 chart-grid opacity-[0.04]" />

        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-emerald-400/30"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-6 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400">
                <Zap className="mr-1 h-3 w-3" />
                Trusted by 50,000+ investors worldwide
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Institutional-Grade{' '}
              <span className="gradient-text">Financial Research</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-8 max-w-lg text-lg leading-relaxed text-slate-300"
            >
              Access 10,000+ research reports from 500+ analysts. Make smarter investment
              decisions with TradeClerk&apos;s comprehensive market intelligence platform.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-emerald-600 px-8 text-base hover:bg-emerald-700"
                onClick={() => navigate('reports')}
              >
                Explore Reports
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 px-8 text-base text-white hover:bg-slate-800"
                onClick={() => navigate('register')}
              >
                Get Started Free
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span>Real-time data</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span>AI-powered insights</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Floating dashboard cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main card */}
              <motion.div
                className="glass rounded-2xl p-6"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                      <BarChart3 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Q4 Earnings Preview</p>
                      <p className="text-xs text-slate-400">Banking Sector Analysis</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Featured</Badge>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'HDFC', val: 85 },
                    { name: 'ICICI', val: 62 },
                    { name: 'SBI', val: 94 },
                    { name: 'AXIS', val: 78 },
                  ].map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-16 text-xs text-slate-400">{item.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.val}%` }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-medium text-emerald-400">
                        +{item.val}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Floating YTD card */}
              <motion.div
                className="glass absolute -right-4 -top-6 rounded-xl p-3"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium text-white">+24.5% YTD</span>
                </div>
              </motion.div>

              {/* Floating reports card */}
              <motion.div
                className="glass absolute -bottom-4 -left-4 rounded-xl p-3"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium text-white">10,000+ Reports</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {statsBar.map((stat) => (
            <div
              key={stat.label}
              className="glass flex items-center gap-3 rounded-xl px-4 py-3"
            >
              <stat.icon className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

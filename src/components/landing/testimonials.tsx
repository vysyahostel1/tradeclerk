'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

interface Testimonial {
  name: string
  title: string
  company: string
  rating: number
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Chen',
    title: 'Portfolio Manager',
    company: 'Goldman Sachs',
    rating: 5,
    quote:
      'TradeClerk has transformed how our team accesses research. The quality and breadth of reports is unmatched.',
  },
  {
    name: 'Michael Roberts',
    title: 'CFA, Head of Research',
    company: 'Morgan Stanley',
    rating: 5,
    quote:
      'The analyst marketplace feature connects us with the best minds in the industry. Highly recommended for serious investors.',
  },
  {
    name: 'Priya Sharma',
    title: 'Senior Analyst',
    company: 'JP Morgan',
    rating: 5,
    quote:
      'From IPO analysis to sector reports, TradeClerk is our go-to platform for all research needs. The community features are a bonus.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function Testimonials() {
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
            Testimonials
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by Financial{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Professionals</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Hear from investment professionals who trust TradeClerk for their research needs
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="card-hover relative rounded-xl border border-border bg-card p-6"
            >
              {/* Quote mark */}
              <div className="absolute right-4 top-4 text-5xl font-serif leading-none text-emerald-100 dark:text-emerald-900/30">
                &ldquo;
              </div>

              {/* Star rating */}
              <div className="mb-4 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < t.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>

              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    {t.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

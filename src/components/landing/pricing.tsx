'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Plan {
  name: string
  price: { monthly: number; yearly: number }
  desc: string
  features: string[]
  cta: string
  popular: boolean
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    desc: 'Get started with basic access',
    features: [
      '5 reports per month',
      'Basic search & filters',
      'Community forum access',
      'Email alerts',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro Research',
    price: { monthly: 29, yearly: 24 },
    desc: 'For serious investors & traders',
    features: [
      'Unlimited report access',
      'Advanced search & analytics',
      'Analyst following',
      'Priority support',
      'PDF downloads',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Analyst Premium',
    price: { monthly: 99, yearly: 79 },
    desc: 'For professional analysts',
    features: [
      'Everything in Pro',
      'Exclusive analyst research',
      'Model portfolios',
      'Real-time alerts',
      'API access',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const { navigate } = useStore()

  return (
    <section className="py-20" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Choose Your{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Plan</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Choose the plan that fits your investment needs. Upgrade or downgrade at any time.
          </p>

          {/* Monthly / Yearly toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                !yearly
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                yearly
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Yearly
              <Badge className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                Save 20%
              </Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={cn(
                'relative overflow-hidden rounded-2xl border bg-card p-6',
                plan.popular
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20 md:scale-105 md:py-8'
                  : 'border-border'
              )}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4">
                  <Badge className="bg-emerald-600 text-white">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Recommended
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${yearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                {yearly && plan.price.monthly > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Billed ${plan.price.yearly * 12}/year (save $
                    {(plan.price.monthly - plan.price.yearly) * 12})
                  </p>
                )}
              </div>

              <Button
                className={cn(
                  'w-full',
                  plan.popular
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : ''
                )}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => navigate('register')}
              >
                {plan.cta}
              </Button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

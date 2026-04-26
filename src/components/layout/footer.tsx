'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { TrendingUp, Github, Twitter, Linkedin, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', hash: 'home' },
      { label: 'Pricing', hash: 'pricing' },
      { label: 'Reports', hash: 'reports' },
      { label: 'API', hash: 'home' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', hash: 'home' },
      { label: 'Blog', hash: 'home' },
      { label: 'Careers', hash: 'home' },
      { label: 'Contact', hash: 'home' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', hash: 'home' },
      { label: 'Help Center', hash: 'home' },
      { label: 'Status', hash: 'home' },
      { label: 'Terms', hash: 'home' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', hash: 'home' },
      { label: 'Terms of Service', hash: 'home' },
      { label: 'Cookie Policy', hash: 'home' },
    ],
  },
]

const socialIcons = [
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Github, label: 'GitHub' },
  { Icon: Mail, label: 'Email' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const { navigate } = useStore()

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      toast.success('Subscribed!', "You'll receive our weekly market insights.")
      setEmail('')
    } catch {
      toast.error('Error', 'Failed to subscribe. Please try again.')
    }
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand + Newsletter */}
          <div className="space-y-4 lg:col-span-2">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Trade<span className="text-emerald-600 dark:text-emerald-400">Clerk</span>
              </span>
            </button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Institutional-Grade Financial Research
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Access reports from top analysts and make smarter investment decisions with our
              comprehensive market intelligence platform.
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {socialIcons.map(({ Icon, label }) => (
                <button
                  key={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="mb-2 text-sm font-medium">Subscribe to newsletter</p>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 flex-1"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Footer columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.hash)}
                      className="text-sm text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 TradeClerk. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
              <button
                key={link}
                className="text-xs text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

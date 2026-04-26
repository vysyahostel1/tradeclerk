'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowRight, Bell, Mail, Shield } from 'lucide-react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        toast.success('Subscribed!', "You'll receive our weekly market insights.")
        setEmail('')
      } else {
        toast.error('Error', 'Failed to subscribe. Please try again.')
      }
    } catch {
      toast.error('Error', 'Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 p-8 sm:p-12 lg:p-16"
        >
          {/* Background dot pattern */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Badge className="mb-4 border-white/20 bg-white/10 text-white">
                <Bell className="mr-1 h-3 w-3" />
                Weekly Newsletter
              </Badge>
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Stay Ahead of the Market
              </h2>
              <p className="mb-6 text-emerald-100">
                Get weekly research highlights and market insights delivered to your inbox.
              </p>
              <div className="flex items-center gap-6 text-sm text-emerald-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>50K+ subscribers</span>
                </div>
              </div>
            </div>

            <div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:border-white focus-visible:ring-white"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white px-8 text-emerald-700 hover:bg-emerald-50"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="mt-3 text-xs text-emerald-200">
                Join 50,000+ investors. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

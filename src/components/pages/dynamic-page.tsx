'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PageSection {
  id: string;
  heading: string;
  content: string;
  type: string;
}

interface PageData {
  title: string;
  heroSubtitle: string;
  sections: PageSection[];
}

interface DynamicPageProps {
  slug: string;
}

export function DynamicPage({ slug }: DynamicPageProps) {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const { navigate } = useStore();

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/pages?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPage(data.page);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Page Not Found</h2>
        <p className="mb-4 text-muted-foreground">This page is currently unavailable.</p>
        <Button onClick={() => navigate('home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Home
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {page.title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {page.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {page.sections.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>This page has no content yet. Check back later.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {page.sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
                      {section.heading}
                    </h2>
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Separator className="my-12" />

        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('home')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </section>
    </motion.div>
  );
}

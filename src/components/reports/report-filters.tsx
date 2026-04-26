'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  reportCount: number
}

interface Filters {
  category: string
  search: string
  sort: string
  premium: string
}

interface ReportFiltersProps {
  categories?: Category[]
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

export function ReportFilters({
  categories: externalCategories,
  filters,
  onFilterChange,
}: ReportFiltersProps) {
  const [categories, setCategories] = useState<Category[]>(externalCategories || [])
  const [searchValue, setSearchValue] = useState(filters.search)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (externalCategories) return
    fetch('/api/reports/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
  }, [externalCategories])

  useEffect(() => {
    setSearchValue(filters.search)
  }, [filters.search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ ...filters, search: searchValue })
  }

  const clearFilters = () => {
    setSearchValue('')
    onFilterChange({ category: '', search: '', sort: 'newest', premium: '' })
  }

  const hasActiveFilters = filters.category || filters.search || filters.premium

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search reports by title, topic..."
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </form>

      {/* Category pills (horizontal scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onFilterChange({ ...filters, category: '' })}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
            !filters.category
              ? 'bg-emerald-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onFilterChange({ ...filters, category: cat.slug })}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              filters.category === cat.slug
                ? 'bg-emerald-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort & Filter row */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-3',
          showFilters ? 'flex' : 'hidden lg:flex'
        )}
      >
        <Select
          value={filters.sort}
          onValueChange={(v) => onFilterChange({ ...filters, sort: v })}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="most-downloaded">Most Downloaded</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="az">A - Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Premium toggle pills */}
        <div className="flex gap-1">
          <button
            onClick={() => onFilterChange({ ...filters, premium: '' })}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              !filters.premium
                ? 'bg-emerald-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, premium: 'false' })}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              filters.premium === 'false'
                ? 'bg-emerald-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            Free
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, premium: 'true' })}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              filters.premium === 'true'
                ? 'bg-emerald-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            Premium
          </button>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            <X className="mr-1 h-3 w-3" /> Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}

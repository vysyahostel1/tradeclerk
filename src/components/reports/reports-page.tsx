"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ReportGrid } from "@/components/reports/report-grid";
import { ReportFilters } from "@/components/reports/report-filters";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Inbox } from "lucide-react";

export function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sort: "newest",
    premium: "",
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.premium) params.set("premium", filters.premium);

      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();
      setReports(data.reports || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          Research <span className="text-emerald-600 dark:text-emerald-400">Reports</span>
        </h1>
        <p className="mb-8 text-muted-foreground">
          Browse our comprehensive library of financial research
        </p>

        <div className="mb-8">
          <ReportFilters
            activeFilters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1);
            }}
          />
        </div>

        <ReportGrid
          reports={reports}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </motion.div>
    </div>
  );
}

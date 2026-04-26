import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

// GET /api/admin/stats - Aggregate dashboard statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Run all independent queries in parallel
    const [
      totalUsers,
      totalReports,
      totalDownloads,
      totalRequests,
      recentUsers,
      totalViewsResult,
      categoriesWithCounts,
      reportsOverTime,
    ] = await Promise.all([
      // Total counts
      db.user.count(),

      db.report.count({ where: { isPublished: true } }),

      db.download.count(),

      db.reportRequest.count(),

      // Recent users (last 7 days)
      db.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),

      // Total views
      db.report.aggregate({ _sum: { viewCount: true } }),

      // Downloads per category
      db.category.findMany({
        include: {
          _count: {
            select: {
              reports: {
                where: { isPublished: true },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),

      // Reports over time (last 7 days)
      db.report.groupBy({
        by: ["createdAt"],
        where: {
          isPublished: true,
          createdAt: { gte: sevenDaysAgo },
        },
        _count: { id: true },
      }),
    ])

    // Aggregate reports by day for the chart
    const dailyReportCounts: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split("T")[0]
      dailyReportCounts[key] = 0
    }

    for (const entry of reportsOverTime) {
      const key = entry.createdAt.toISOString().split("T")[0]
      if (dailyReportCounts[key] !== undefined) {
        dailyReportCounts[key] += entry._count.id
      }
    }

    return NextResponse.json({
      stats: {
        totalUsers,
        totalReports,
        totalDownloads,
        totalRequests,
        totalViews: totalViewsResult._sum.viewCount || 0,
      },
      recentUsers,
      categoriesWithCounts,
      reportsOverTime: dailyReportCounts,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    )
  }
}

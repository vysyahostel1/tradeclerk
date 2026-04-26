import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/search - Global search across reports, forum posts, and analysts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    const query = q.trim()

    // Run all three searches in parallel
    const [reports, posts, analysts] = await Promise.all([
      // Search reports (title and summary)
      db.report.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query } },
            { summary: { contains: query } },
          ],
        },
        include: {
          category: true,
          analyst: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Search forum posts (title and content)
      db.forumPost.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          category: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Search analysts (name and expertise)
      db.user.findMany({
        where: {
          role: "ANALYST",
          isActive: true,
          OR: [
            { name: { contains: query } },
            { expertise: { contains: query } },
            { company: { contains: query } },
          ],
        },
        include: {
          analystProfile: true,
          _count: {
            select: {
              uploadReports: {
                where: { isPublished: true },
              },
            },
          },
        },
        take: 5,
      }),
    ])

    return NextResponse.json({
      reports,
      posts,
      analysts,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}

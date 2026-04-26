import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

// GET /api/bookmarks - Return user's bookmarks with report data
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

    const bookmarks = await db.bookmark.findMany({
      where: { userId: payload.userId },
      include: {
        report: {
          include: {
            category: true,
            analyst: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ bookmarks })
  } catch (error) {
    console.error("GET bookmarks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    )
  }
}

// POST /api/bookmarks - Create a new bookmark
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { reportId } = body

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      )
    }

    // Check if report exists
    const report = await db.report.findUnique({ where: { id: reportId } })
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Check if already bookmarked
    const existing = await db.bookmark.findUnique({
      where: {
        userId_reportId: {
          userId: payload.userId,
          reportId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Report already bookmarked" },
        { status: 409 }
      )
    }

    const bookmark = await db.bookmark.create({
      data: {
        userId: payload.userId,
        reportId,
      },
      include: {
        report: {
          include: {
            category: true,
            analyst: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ bookmark }, { status: 201 })
  } catch (error) {
    console.error("POST bookmark error:", error)
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    )
  }
}

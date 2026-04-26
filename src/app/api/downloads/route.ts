import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

// GET /api/downloads - Return user's download history
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

    const downloads = await db.download.findMany({
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

    return NextResponse.json({ downloads })
  } catch (error) {
    console.error("GET downloads error:", error)
    return NextResponse.json(
      { error: "Failed to fetch downloads" },
      { status: 500 }
    )
  }
}

// POST /api/downloads - Create a download record and increment report count
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

    // Create download record and increment count in a transaction
    const [download] = await db.$transaction([
      db.download.create({
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
      }),
      db.report.update({
        where: { id: reportId },
        data: { downloadCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ download }, { status: 201 })
  } catch (error) {
    console.error("POST download error:", error)
    return NextResponse.json(
      { error: "Failed to record download" },
      { status: 500 }
    )
  }
}

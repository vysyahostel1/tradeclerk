import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/analysts/[id] - Return single analyst with profile and reports
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const analyst = await db.user.findUnique({
      where: { id },
      include: {
        analystProfile: true,
        uploadReports: {
          where: { isPublished: true },
          include: {
            category: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            uploadReports: {
              where: { isPublished: true },
            },
            followers: true,
          },
        },
      },
    })

    if (!analyst || analyst.role !== "ANALYST") {
      return NextResponse.json(
        { error: "Analyst not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ analyst })
  } catch (error) {
    console.error("GET analyst by ID error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analyst" },
      { status: 500 }
    )
  }
}

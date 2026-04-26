import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/reports/trending - Return trending reports by download count
export async function GET() {
  try {
    const reports = await db.report.findMany({
      where: {
        isPublished: true,
      },
      include: {
        category: true,
      },
      orderBy: { downloadCount: "desc" },
      take: 8,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("GET trending reports error:", error)
    return NextResponse.json(
      { error: "Failed to fetch trending reports" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/reports/featured - Return featured published reports
export async function GET() {
  try {
    const reports = await db.report.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
      },
      include: {
        category: true,
        analyst: {
          select: { id: true, name: true, image: true, company: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("GET featured reports error:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured reports" },
      { status: 500 }
    )
  }
}

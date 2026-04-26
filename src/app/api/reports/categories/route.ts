import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/reports/categories - Return all categories with report counts
export async function GET() {
  try {
    const categories = await db.category.findMany({
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
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("GET categories error:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

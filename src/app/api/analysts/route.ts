import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/analysts - Return all analysts with profiles and report counts
export async function GET() {
  try {
    const analysts = await db.user.findMany({
      where: {
        role: "ANALYST",
        isActive: true,
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ analysts })
  } catch (error) {
    console.error("GET analysts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analysts" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

// GET /api/requests - Return user's requests (admin sees all)
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

    const where = payload.role === "ADMIN" ? {} : { userId: payload.userId }

    const requests = await db.reportRequest.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("GET requests error:", error)
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    )
  }
}

// POST /api/requests - Create a new report request
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
    const { reportType, companyName, notes } = body

    if (!reportType) {
      return NextResponse.json(
        { error: "Report type is required" },
        { status: 400 }
      )
    }

    const reportRequest = await db.reportRequest.create({
      data: {
        userId: payload.userId,
        reportType,
        companyName: companyName || null,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({ reportRequest }, { status: 201 })
  } catch (error) {
    console.error("POST request error:", error)
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    )
  }
}

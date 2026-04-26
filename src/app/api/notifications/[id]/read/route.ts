import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

// PUT /api/notifications/[id]/read - Mark a notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromHeader(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params

    const notification = await db.notification.findUnique({ where: { id } })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Ensure user owns the notification
    if (notification.userId !== payload.userId) {
      return NextResponse.json(
        { error: "You can only mark your own notifications" },
        { status: 403 }
      )
    }

    if (notification.isRead) {
      return NextResponse.json({ notification })
    }

    const updatedNotification = await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({ notification: updatedNotification })
  } catch (error) {
    console.error("PUT notification read error:", error)
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    )
  }
}

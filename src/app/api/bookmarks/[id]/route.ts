import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

// DELETE /api/bookmarks/[id] - Remove a bookmark
export async function DELETE(
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

    const bookmark = await db.bookmark.findUnique({
      where: { id },
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      )
    }

    // Ensure user owns the bookmark
    if (bookmark.userId !== payload.userId) {
      return NextResponse.json(
        { error: "You can only remove your own bookmarks" },
        { status: 403 }
      )
    }

    await db.bookmark.delete({ where: { id } })

    return NextResponse.json({ message: "Bookmark removed successfully" })
  } catch (error) {
    console.error("DELETE bookmark error:", error)
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    )
  }
}

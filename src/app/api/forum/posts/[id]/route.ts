import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/forum/posts/[id] - Get a single forum post with comments
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await db.forumPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            karma: true,
            expertise: true,
          },
        },
        category: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, image: true, karma: true },
            },
          },
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { comments: true },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await db.forumPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("GET forum post by ID error:", error)
    return NextResponse.json(
      { error: "Failed to fetch forum post" },
      { status: 500 }
    )
  }
}

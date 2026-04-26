import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"

// GET /api/forum/posts/[id]/comments - Get comments for a post (flat with parentId)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await db.forumPost.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    const comments = await db.forumComment.findMany({
      where: { postId: id },
      include: {
        user: {
          select: { id: true, name: true, image: true, karma: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("GET comments error:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST /api/forum/posts/[id]/comments - Create a new comment
export async function POST(
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

    const post = await db.forumPost.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: "This post is locked for comments" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, parentId } = body

    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      )
    }

    // Validate parentId if provided
    if (parentId) {
      const parentComment = await db.forumComment.findUnique({
        where: { id: parentId },
      })
      if (!parentComment || parentComment.postId !== id) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 400 }
        )
      }
    }

    const [comment] = await db.$transaction([
      db.forumComment.create({
        data: {
          postId: id,
          userId: payload.userId,
          content,
          parentId: parentId || null,
        },
        include: {
          user: {
            select: { id: true, name: true, image: true, karma: true },
          },
        },
      }),
      db.forumPost.update({
        where: { id },
        data: { commentCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("POST comment error:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}

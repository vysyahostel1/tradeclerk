import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { Prisma } from "@prisma/client/edge"

// GET /api/forum/posts - List forum posts with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || ""
    const sort = searchParams.get("sort") || "newest"
    const search = searchParams.get("search") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)))

    const where: Prisma.ForumPostWhereInput = {}

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    // Build orderBy
    let orderBy: Prisma.ForumPostOrderByWithRelationInput = { createdAt: "desc" }
    if (sort === "hot") orderBy = { viewCount: "desc" }
    else if (sort === "top") orderBy = { upvotes: "desc" }
    else if (sort === "commented") orderBy = { commentCount: "desc" }

    const [posts, total] = await Promise.all([
      db.forumPost.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, image: true, karma: true },
          },
          category: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: [
          // Pinned posts first
          { isPinned: "desc" },
          orderBy,
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.forumPost.count({ where }),
    ])

    return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("GET forum posts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch forum posts" },
      { status: 500 }
    )
  }
}

// POST /api/forum/posts - Create a new forum post
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
    const { title, content, categoryId, tags } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    if (title.length < 5) {
      return NextResponse.json(
        { error: "Title must be at least 5 characters" },
        { status: 400 }
      )
    }

    if (content.length < 10) {
      return NextResponse.json(
        { error: "Content must be at least 10 characters" },
        { status: 400 }
      )
    }

    const post = await db.forumPost.create({
      data: {
        userId: payload.userId,
        title,
        content,
        categoryId: categoryId || null,
        tags: tags && Array.isArray(tags) ? tags.join(",") : null,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, karma: true },
        },
        category: true,
        _count: {
          select: { comments: true },
        },
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("POST forum post error:", error)
    return NextResponse.json(
      { error: "Failed to create forum post" },
      { status: 500 }
    )
  }
}

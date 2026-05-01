import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { Prisma } from "@prisma/client/edge"

// GET /api/reports - List published reports with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || ""
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "newest"
    const premium = searchParams.get("premium") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)))

    // Check if user is admin to show unpublished reports
    const token = getTokenFromHeader(request)
    let payload: Awaited<ReturnType<typeof verifyToken>> | null = null
    if (token) {
      payload = await verifyToken(token)
    }
    const isAdmin = payload?.role === "ADMIN"

    // Build where clause
    const where: Prisma.ReportWhereInput = {}

    if (!isAdmin) {
      where.isPublished = true
    }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ]
    }

    if (premium === "true") {
      where.isPremium = true
    } else if (premium === "false") {
      where.isPremium = false
    }

    // Build orderBy
    let orderBy: Prisma.ReportOrderByWithRelationInput = { createdAt: "desc" }
    if (sort === "most-downloaded") orderBy = { downloadCount: "desc" }
    else if (sort === "trending") orderBy = { viewCount: "desc" }
    else if (sort === "oldest") orderBy = { createdAt: "asc" }
    else if (sort === "az") orderBy = { title: "asc" }
    else if (sort === "za") orderBy = { title: "desc" }

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        include: {
          category: true,
          analyst: {
            select: { id: true, name: true, image: true, company: true },
          },
          reportTags: {
            include: { tag: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.report.count({ where }),
    ])

    return NextResponse.json({
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("GET reports error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}

// POST /api/reports - Create a new report (admin/analyst only)
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

    if (payload.role !== "ADMIN" && payload.role !== "ANALYST") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      summary,
      content,
      categoryId,
      isPremium,
      isPublished,
      isFeatured,
      tags,
      pdfUrl,
      coverImage,
      pageCount,
      fileSize,
    } = body

    if (!title || !categoryId) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      )
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36)

    // Process tags: upsert each tag, then create report-tag relations
    let tagRelations: { tagId: string }[] | undefined
    if (tags && Array.isArray(tags) && tags.length > 0) {
      tagRelations = []
      for (const tagName of tags) {
        const tagSlug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
        const tag = await db.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        })
        tagRelations.push({ tagId: tag.id })
      }
    }

    const report = await db.report.create({
      data: {
        title,
        slug,
        summary: summary || null,
        content: content || null,
        categoryId,
        analystId: payload.userId,
        isPremium: isPremium || false,
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        pdfUrl: pdfUrl || null,
        coverImage: coverImage || null,
        pageCount: pageCount || 0,
        fileSize: fileSize || null,
        publishedAt: isPublished ? new Date() : null,
        reportTags: tagRelations ? { create: tagRelations } : undefined,
      },
      include: {
        category: true,
        analyst: { select: { id: true, name: true } },
        reportTags: { include: { tag: true } },
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error("POST report error:", error)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { Prisma } from "@prisma/client/edge"

// GET /api/reports/[id] - Get a single report by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const report = await db.report.findUnique({
      where: { id },
      include: {
        category: true,
        analyst: {
          select: {
            id: true,
            name: true,
            image: true,
            company: true,
            expertise: true,
          },
        },
        reportTags: {
          include: { tag: true },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Non-admin/non-analyst can only view published reports
    const token = getTokenFromHeader(_request)
    let payload: Awaited<ReturnType<typeof verifyToken>> | null = null
    if (token) {
      payload = await verifyToken(token)
    }

    if (
      !report.isPublished &&
      payload?.role !== "ADMIN" &&
      payload?.userId !== report.analystId
    ) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await db.report.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error("GET report by ID error:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    )
  }
}

// PUT /api/reports/[id] - Update a report (admin/analyst only)
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

    if (payload.role !== "ADMIN" && payload.role !== "ANALYST") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id } = await params

    const existingReport = await db.report.findUnique({ where: { id } })
    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Analysts can only update their own reports
    if (
      payload.role !== "ADMIN" &&
      existingReport.analystId !== payload.userId
    ) {
      return NextResponse.json(
        { error: "You can only update your own reports" },
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

    // Build update data
    const updateData: Prisma.ReportUpdateInput = {}

    if (title !== undefined) {
      updateData.title = title
      updateData.slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString(36)
    }
    if (summary !== undefined) updateData.summary = summary
    if (content !== undefined) updateData.content = content
    if (categoryId !== undefined) updateData.category = { connect: { id: categoryId } }
    if (isPremium !== undefined) updateData.isPremium = isPremium
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (pageCount !== undefined) updateData.pageCount = pageCount
    if (fileSize !== undefined) updateData.fileSize = fileSize

    if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      updateData.publishedAt = isPublished ? new Date() : null
    }

    // Handle tag updates
    if (tags !== undefined) {
      // Delete existing tag relations
      await db.reportTag.deleteMany({ where: { reportId: id } })

      // Create new tag relations
      if (Array.isArray(tags) && tags.length > 0) {
        const tagRelations: { tagId: string }[] = []
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
        updateData.reportTags = { create: tagRelations }
      }
    }

    const report = await db.report.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        analyst: { select: { id: true, name: true } },
        reportTags: { include: { tag: true } },
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error("PUT report error:", error)
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    )
  }
}

// DELETE /api/reports/[id] - Delete a report (admin only)
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

    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const { id } = await params

    const report = await db.report.findUnique({ where: { id } })
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    await db.report.delete({ where: { id } })

    return NextResponse.json({ message: "Report deleted successfully" })
  } catch (error) {
    console.error("DELETE report error:", error)
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    )
  }
}

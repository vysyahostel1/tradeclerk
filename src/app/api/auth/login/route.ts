import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check which DB mode we're in
    const tursoUrl = process.env.TURSO_URL
    const usingTurso = !!tursoUrl

    let user
    try {
      user = await db.user.findUnique({
        where: { email: normalizedEmail },
      })
    } catch (dbError: any) {
      console.error("Database query error:", dbError?.message)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: usingTurso
            ? "Could not connect to Turso. Please check TURSO_URL and TURSO_AUTH_TOKEN."
            : "Using local SQLite. No remote database configured.",
          debug: {
            mode: usingTurso ? "turso" : "local",
            tursoUrlSet: !!tursoUrl,
            tursoTokenSet: !!process.env.TURSO_AUTH_TOKEN,
            dbError: dbError?.message,
          },
        },
        { status: 503 }
      )
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account has been deactivated" },
        { status: 403 }
      )
    }

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed", details: String(error) },
      { status: 500 }
    )
  }
}

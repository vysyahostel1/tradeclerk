import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const envInfo = {
    TURSO_URL: process.env.TURSO_URL ? "***SET***" : "MISSING",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "***SET***" : "MISSING",
    JWT_SECRET: process.env.JWT_SECRET ? "***SET***" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL || "NOT SET",
    NODE_ENV: process.env.NODE_ENV || "NOT SET",
  }

  try {
    // Test database connection
    const userCount = await db.user.count()
    const tables = await db.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`

    return NextResponse.json({
      env: envInfo,
      db: {
        status: "CONNECTED",
        userCount,
        tables: tables.map((t: any) => t.name),
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      env: envInfo,
      db: {
        status: "ERROR",
        message: error.message,
        code: error.code,
        stack: error.stack?.split("\n").slice(0, 5),
      },
    }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const tursoUrl = process.env.TURSO_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  const jwtSecret = process.env.JWT_SECRET

  const envInfo = {
    TURSO_URL: tursoUrl ? `${tursoUrl.substring(0, 30)}...` : "MISSING - Check wrangler.jsonc",
    TURSO_AUTH_TOKEN: tursoToken ? `SET (${tursoToken.substring(0, 10)}...)` : "MISSING - Add in Cloudflare dashboard",
    JWT_SECRET: jwtSecret ? `SET (${jwtSecret.substring(0, 4)}...)` : "MISSING - Add in Cloudflare dashboard",
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV || "NOT SET",
    dbMode: tursoUrl ? "TURSO (remote)" : "LOCAL SQLite",
  }

  try {
    // Test database connection
    const userCount = await db.user.count()
    const tables = await db.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`

    // Try to find admin user
    let adminUser = null
    try {
      adminUser = await db.user.findUnique({
        where: { email: "admin@tradeclerk.com" },
        select: { id: true, email: true, role: true, password: true },
      })
    } catch {}

    return NextResponse.json({
      status: "OK",
      version: "v2-edge-client",
      env: envInfo,
      db: {
        status: "CONNECTED",
        userCount,
        tables: tables.map((t: any) => t.name),
      },
      admin: adminUser ? {
        exists: true,
        email: adminUser.email,
        role: adminUser.role,
        hasPassword: !!adminUser.password,
        passwordLength: adminUser.password?.length || 0,
      } : {
        exists: false,
        hint: "Run: node scripts/setup-turso.mjs",
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      status: "ERROR",
      env: envInfo,
      db: {
        status: "FAILED",
        message: error.message,
        code: error.code,
        hint: error.message?.includes("401")
          ? "TURSO_AUTH_TOKEN is expired or invalid. Generate a new token from Turso dashboard."
          : error.message?.includes("TURSO_URL")
            ? "TURSO_URL is not set. It should be in wrangler.jsonc."
            : "Check TURSO_URL and TURSO_AUTH_TOKEN in Cloudflare dashboard / wrangler.jsonc",
      },
    }, { status: 500 })
  }
}

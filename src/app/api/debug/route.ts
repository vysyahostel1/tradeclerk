import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    env: {
      TURSO_URL: process.env.TURSO_URL ? "***SET***" : "MISSING",
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "***SET***" : "MISSING",
      JWT_SECRET: process.env.JWT_SECRET ? "***SET***" : "MISSING",
      DATABASE_URL: process.env.DATABASE_URL || "NOT SET",
    },
    node: typeof process !== 'undefined' ? 'yes' : 'no',
    platform: typeof navigator !== 'undefined' ? 'browser' : 'server',
  })
}

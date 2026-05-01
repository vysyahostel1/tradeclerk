import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql/web'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // If TURSO_URL is set, use libsql adapter for remote database (Cloudflare Workers / Turso)
  const tursoUrl = process.env.TURSO_URL || (typeof globalThis !== 'undefined' && (globalThis as Record<string, string>).TURSO_URL) || ''
  const tursoToken = process.env.TURSO_AUTH_TOKEN || (typeof globalThis !== 'undefined' && (globalThis as Record<string, string>).TURSO_AUTH_TOKEN) || ''

  if (tursoUrl) {
    // Convert libsql:// to https:// for HTTP transport (required on Cloudflare Workers)
    const httpUrl = tursoUrl.startsWith('libsql://')
      ? tursoUrl.replace('libsql://', 'https://')
      : tursoUrl

    // Use web version of adapter (HTTP-only, works on Cloudflare Workers)
    // PrismaLibSQL is a factory — pass connection config, not a pre-created client
    const adapter = new PrismaLibSQL({
      url: httpUrl,
      authToken: tursoToken,
    })
    return new PrismaClient({ adapter, log: ['error'] })
  }

  // Default: file-based SQLite for local development
  return new PrismaClient({ log: ['error'] })
}

export const db =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
// Build: Fri May  1 11:10:21 UTC 2026

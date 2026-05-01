/**
 * Next.js Instrumentation (runs on edge/Workers)
 * Initializes the Prisma client with libsql adapter for Cloudflare D1.
 *
 * In local dev (file-based SQLite), this is a no-op — the standard
 * PrismaClient in db.ts handles it.
 *
 * On Cloudflare Workers, it patches the global Prisma client to use
 * the D1 HTTP endpoint via @libsql/client.
 */
export async function register() {
  const dbUrl = process.env.DATABASE_URL || ''

  // Only activate D1 adapter for HTTP/libsql URLs
  if (!dbUrl.startsWith('http') && !dbUrl.startsWith('libsql://')) {
    return
  }

  try {
    const { createClient } = await import('@libsql/client')
    const { PrismaLibSQL } = await import('@prisma/adapter-libsql')
    const { PrismaClient } = await import('@prisma/client')

    const libsql = createClient({
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })

    const adapter = new PrismaLibSQL(libsql)
    const d1Client = new PrismaClient({ adapter })

    // Replace the global singleton
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined
    }
    globalForPrisma.prisma = d1Client
  } catch (e) {
    console.error('Failed to initialize D1 database adapter:', e)
  }
}

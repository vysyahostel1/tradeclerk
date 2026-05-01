import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql/web'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_URL || ''
  const tursoToken = process.env.TURSO_AUTH_TOKEN || ''

  if (tursoUrl && tursoToken) {
    const httpUrl = tursoUrl.startsWith('libsql://')
      ? tursoUrl.replace('libsql://', 'https://')
      : tursoUrl

    const adapter = new PrismaLibSQL({
      url: httpUrl,
      authToken: tursoToken,
    })
    return new PrismaClient({ adapter, log: ['error'] })
  }

  return new PrismaClient({ log: ['error'] })
}

export const db =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

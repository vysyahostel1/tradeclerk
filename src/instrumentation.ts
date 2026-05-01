/**
 * Next.js Instrumentation
 * 
 * Database initialization is now handled directly in src/lib/db.ts
 * which detects libsql:// URLs and uses the @prisma/adapter-libsql adapter.
 */
export async function register() {
  // No-op: database client is initialized lazily in db.ts
}

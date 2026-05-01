/**
 * Next.js Instrumentation - runs before any server code on Cloudflare Workers
 * Forces Prisma to use library (WASM) engine instead of native binary
 */
export async function register() {
  // Force Prisma to use library/WASM engine, not native binary
  // This is critical for Cloudflare Workers which don't support native .node modules
  process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library'
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Mark @libsql/isomorphic-ws as external so OpenNext can handle it
  // for Cloudflare Workers (which has built-in WebSocket global)
  serverExternalPackages: ["@libsql/isomorphic-ws"],
  experimental: {
    outputFileTracingIncludes: {
      "*": ["./node_modules/@libsql/isomorphic-ws/**/*"],
    },
  },
};

export default nextConfig;

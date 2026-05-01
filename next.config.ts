import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: [
    "@libsql/isomorphic-ws",
    "@prisma/client",
    "@prisma/adapter-libsql",
  ],
};

export default nextConfig;

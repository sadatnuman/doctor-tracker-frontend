import type { NextConfig } from "next"

const apiUrl = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "")

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Tree-shake barrel imports from these packages.
    optimizePackageImports: ["lucide-react", "recharts", "date-fns", "radix-ui"],
  },
  // Same-origin API: /api/* is proxied to the Express server, so the auth cookie is first-party.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

export default nextConfig

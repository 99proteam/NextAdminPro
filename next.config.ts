import type { NextConfig } from "next";

/**
 * `GITHUB_PAGES=true npm run build` produces a fully static site in `out/`
 * for the GitHub Pages live demo. Regular builds keep the full Next.js server.
 */
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? (process.env.PAGES_BASE_PATH ?? "/NextAdminPro") : "";

const nextConfig: NextConfig = {
  // Static export has no server to stream from, so Cache Components is only enabled for server builds.
  cacheComponents: !isPages,
  partialPrefetching: !isPages,
  ...(isPages && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

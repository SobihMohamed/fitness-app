import bundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // Performance optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // Reduced from 60s for faster HMR in dev, doesn't affect prod
    pagesBufferLength: 2, // Reduced buffer for lower memory usage
  },
  // Image optimization - critical for performance
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    localPatterns: [
      {
        pathname: "/proxy-image",
        search: "url=**",
      },
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Externalize axios (and its transitive deps mime-types/mime-db) from the
  // server bundle so the 182 KB mime-db/db.json is never bundled.
  serverExternalPackages: ["axios"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "react-hook-form",
      "@hookform/resolvers",
      "zod",
      "recharts",
    ],
    // Turbopack: dramatically faster dev-mode compilation (replaces Webpack in dev)
    turbopack: {},
  },
  webpack(config, { isServer, nextRuntime }) {
    // Strip ua-parser-js from the Edge runtime (middleware).
    // Next.js compiles ua-parser-js into next/dist/compiled and bundles it
    // into the Edge middleware chunk even when userAgent() is never called.
    if (nextRuntime === "edge") {
      config.resolve.alias["next/dist/compiled/ua-parser-js"] = false;
    }
    return config;
  },
  // Trailing slash for better SEO and caching
  trailingSlash: true,
  // Dist directory for cleaner builds
  distDir: ".next",
  // Add cache headers for static assets
  async headers() {
    return [
      // Static images - immutable cache
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Next.js static files
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Font files - immutable cache
      {
        source: "/:all*(woff|woff2|eot|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API responses - short cache with stale-while-revalidate
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Keep env handling consistent with lib/env.ts: prefer TARGET over BASE, fallback to process.env.NEXT_PUBLIC_API_URL
    // Old: const target =
    // Old:   process.env.NEXT_PUBLIC_API_TARGET_URL ||
    // Old:   process.env.NEXT_PUBLIC_API_BASE_URL ||
    // Old:   "http://localhost:8000";
    const target =
      process.env.NEXT_PUBLIC_API_TARGET_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL;
    return [
      {
        source: "/api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);

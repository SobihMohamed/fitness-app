import bundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Performance optimizations
  compiler: {
    // Remove all console statements in production for better performance
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error'] } // Keep console.error for critical issues
      : false,
  },
  // Enable compression for faster page loads
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Remove X-Powered-By header for security and performance
  poweredByHeader: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  // Enable Next.js Image Optimization (do not disable globally)
  images: {
    localPatterns: [
      {
        pathname: '/proxy-image',
        // allow any value for `url` param, e.g. /proxy-image?url=http://localhost:8000/uploads/...
        search: 'url=**',
      },
      // Allow all assets under the public/ folder (e.g. /home-hero-fitness.jpg)
      {
        pathname: '/**',
      },
    ],
    // Allow remote images served directly from backend and CDNs
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    // Reduce bundle size by optimizing common package imports
    optimizePackageImports: [
      "date-fns",
      "clsx",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "recharts",
    ],
    // Enable aggressive caching
    optimisticClientCache: true,
    // Optimize CSS for better performance
    optimizeCss: true,
  },
  // Add cache headers for static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Keep env handling consistent with lib/env.ts: prefer TARGET over BASE, fallback to localhost
    const target =
      process.env.NEXT_PUBLIC_API_TARGET_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:8000'
    return [
      {
        source: '/api/:path*',
        destination: `${target}/:path*`,
      },
    ]
  },
}

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

export default withBundleAnalyzer(nextConfig)

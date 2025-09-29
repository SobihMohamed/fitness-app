import bundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
  },
  experimental: {
    // Reduce bundle size by optimizing common package imports
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "framer-motion",
      "clsx",
    ],
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

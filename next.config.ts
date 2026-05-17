import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Required for @cloudflare/next-on-pages
  experimental: {
    ppr: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

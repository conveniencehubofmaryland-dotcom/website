import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Required for @cloudflare/next-on-pages
  experimental: {
    ppr: false,
  },
}

export default nextConfig

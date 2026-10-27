import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },

  turbopack: {},

  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev',
  },
}

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwist(nextConfig)

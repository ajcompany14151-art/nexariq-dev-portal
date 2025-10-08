import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  // Optimize for production deployment on Vercel
  output: 'standalone',
  // Disable webpack's hot module replacement only in development
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack's hot module replacement
      config.watchOptions = {
        ignored: ['**/*'], // Ignore all file changes
      };
    }
    return config;
  },
};

export default nextConfig;

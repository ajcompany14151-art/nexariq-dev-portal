import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // For production deployment, enable type checking
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  reactStrictMode: true,
  eslint: {
    // Only ignore during development
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
  // Enable experimental features if needed
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // Optimize images
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Environment-specific webpack config
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Development-specific configurations only
      config.watchOptions = {
        ignored: ['**/*'], // This was for nodemon setup
      };
    }
    return config;
  },
};

export default nextConfig;

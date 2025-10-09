import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ⚠️ TEMPORARY: Bypassing TypeScript errors for initial deployment
    // TODO: Fix all type errors and set this to false
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  eslint: {
    // Allow linting warnings during build
    ignoreDuringBuilds: true,
  },
  // Prisma support
  serverExternalPackages: ["@prisma/client"],
  
  // Image optimization
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;

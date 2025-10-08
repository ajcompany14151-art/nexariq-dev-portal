import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Remove this in production - fix type errors instead
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  eslint: {
    // Only ignore during builds if absolutely necessary
    ignoreDuringBuilds: false,
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
  
  // Output configuration for Vercel
  output: 'standalone',
};

export default nextConfig;

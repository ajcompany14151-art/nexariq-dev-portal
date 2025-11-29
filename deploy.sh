#!/usr/bin/env bash

# Production Deployment Script for NexarIQ Developer Portal
echo "🚀 Starting NexarIQ Developer Portal Production Deployment..."

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️  Building application..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Developer Portal deployment complete!"
echo "🔗 URL: https://nexariq-07.vercel.app"
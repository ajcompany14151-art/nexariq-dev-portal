@echo off
REM Production Deployment Script for NexarIQ Developer Portal (Windows)
echo 🚀 Starting NexarIQ Developer Portal Production Deployment...

REM Set production environment
set NODE_ENV=production

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

REM Build the application
echo 🏗️  Building application...
call npm run build

REM Deploy to Vercel
echo 🌐 Deploying to Vercel...
call vercel --prod

echo ✅ Developer Portal deployment complete!
echo 🔗 URL: https://nexariq-07.vercel.app
pause
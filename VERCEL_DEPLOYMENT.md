# Vercel Deployment Guide for Nexariq Portal

## 🚨 CRITICAL ISSUES TO RESOLVE BEFORE DEPLOYMENT

### 1. Socket.IO Server Issue
Your current project uses a custom server (`server.ts`) with Socket.IO, which **WILL NOT WORK** on Vercel's serverless environment.

**Options:**
- **Option A**: Remove Socket.IO entirely and deploy as standard Next.js app
- **Option B**: Replace Socket.IO with Vercel-compatible real-time solution:
  - [Pusher](https://pusher.com/)
  - [Ably](https://ably.com/)
  - [Supabase Realtime](https://supabase.com/realtime)
  - Vercel Edge Functions with WebSockets

### 2. Database Migration (CRITICAL)
Currently using SQLite which won't persist on serverless.

**Required Action**: Migrate to cloud database:
```bash
# Option 1: PostgreSQL (Recommended)
DATABASE_URL="postgresql://username:password@hostname:port/database"

# Option 2: PlanetScale (MySQL-compatible)
DATABASE_URL="mysql://username:password@hostname:port/database"

# Option 3: Supabase (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@db.xyz.supabase.co:5432/postgres"
```

**Migration Steps:**
1. Set up cloud database
2. Update `prisma/schema.prisma` provider to `postgresql` or `mysql`
3. Run `prisma migrate deploy` to create tables
4. Seed initial data if needed

## ✅ ENVIRONMENT VARIABLES REQUIRED

Add these to Vercel Environment Variables:

### Required:
```
NEXTAUTH_SECRET=your-super-secret-jwt-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=your-cloud-database-url
```

### Optional (for OAuth):
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-app-id  
GITHUB_SECRET=your-github-app-secret
```

## 🔧 DEPLOYMENT STEPS

### 1. Fix the Socket.IO Issue First
Either remove Socket.IO or replace with compatible solution.

### 2. Update Prisma Schema
```prisma
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

### 3. Test Build Locally
```bash
npm run build
```

### 4. Deploy to Vercel

#### Method A: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

#### Method B: GitHub Integration
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Remove or replace Socket.IO server
- [ ] Migrate from SQLite to cloud database
- [ ] Set all required environment variables
- [ ] Test `npm run build` locally
- [ ] Update database schema provider
- [ ] Run database migrations
- [ ] Test authentication flows
- [ ] Verify API routes work without custom server

## 🚀 CURRENT STATUS

❌ **NOT READY FOR VERCEL** due to:
1. Custom Socket.IO server
2. SQLite database
3. Missing environment variables

**Estimated fix time**: 2-4 hours depending on chosen solutions.

## 📞 NEXT STEPS

1. **Choose Socket.IO replacement** (or remove if not needed)
2. **Set up cloud database**  
3. **Test without custom server**
4. **Deploy to Vercel**

Would you like me to help implement any of these fixes?
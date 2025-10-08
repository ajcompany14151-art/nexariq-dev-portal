# Database Setup Guide

## Option 1: Supabase (Recommended - FREE)

1. Go to [Supabase.com](https://supabase.com/)
2. Create a new project
3. Get your DATABASE_URL from Settings > Database > Connection string
4. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

## Option 2: Neon (PostgreSQL, FREE tier)

1. Go to [Neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string

## Option 3: Railway (Easy deployment)

1. Go to [Railway.app](https://railway.app/)
2. Create PostgreSQL database
3. Copy connection string

## After getting DATABASE_URL:

1. Add it to Vercel environment variables
2. Run: `npm run db:migrate`
3. Deploy to Vercel

## Required Environment Variables for Vercel:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```
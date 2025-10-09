// src/app/api/init-db/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    console.log("Initializing database schema...");
    
    // Create enum types first
    await db.$executeRaw`DO $$ BEGIN
      CREATE TYPE "UserRole" AS ENUM('ADMIN', 'DEVELOPER', 'VIEWER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;
    
    await db.$executeRaw`DO $$ BEGIN
      CREATE TYPE "Environment" AS ENUM('SANDBOX', 'PRODUCTION');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;
    
    await db.$executeRaw`DO $$ BEGIN
      CREATE TYPE "SubscriptionPlan" AS ENUM('FREE', 'PRO', 'ENTERPRISE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;
    
    // Create tables
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL,
          "name" TEXT,
          "email" TEXT NOT NULL,
          "emailVerified" TIMESTAMP(3),
          "image" TEXT,
          "role" "UserRole" NOT NULL DEFAULT DEVELOPER,
          "provider" TEXT,
          "providerId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "lastLoginAt" TIMESTAMP(3),

          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `;
    
    await db.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");`;
    
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "api_keys" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "scopes" TEXT NOT NULL DEFAULT '[]',
          "environment" "Environment" NOT NULL DEFAULT SANDBOX,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "lastUsed" TIMESTAMP(3),
          "expires" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 60,
          "rateLimitPerHour" INTEGER NOT NULL DEFAULT 1000,
          "rateLimitPerDay" INTEGER NOT NULL DEFAULT 10000,

          CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
      );
    `;
    
    await db.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_key" ON "api_keys"("key");`;
    
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "usage_logs" (
          "id" TEXT NOT NULL,
          "apiKeyId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "endpoint" TEXT NOT NULL,
          "method" TEXT NOT NULL,
          "statusCode" INTEGER NOT NULL,
          "tokensUsed" INTEGER NOT NULL DEFAULT 0,
          "ipAddress" TEXT NOT NULL,
          "userAgent" TEXT,
          "responseTime" INTEGER,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
      );
    `;
    
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "rate_limits" (
          "id" TEXT NOT NULL,
          "windowType" TEXT NOT NULL,
          "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "requestCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "apiKeyId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,

          CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
      );
    `;
    
    await db.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "rate_limits_apiKeyId_windowType_windowStart_key" ON "rate_limits"("apiKeyId", "windowType", "windowStart");`;
    
    // Add foreign key constraints
    await db.$executeRaw`DO $$ BEGIN
      ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;
    
    await db.$executeRaw`DO $$ BEGIN
      ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;
    
    await db.$executeRaw`DO $$ BEGIN
      ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;
    
    await db.$executeRaw`DO $$ BEGIN
      ALTER TABLE "rate_limits" ADD CONSTRAINT "rate_limits_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;
    
    await db.$executeRaw`DO $$ BEGIN
      ALTER TABLE "rate_limits" ADD CONSTRAINT "rate_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`;
    
    console.log("Database schema initialized successfully!");
    
    return NextResponse.json({ 
      success: true, 
      message: "Database schema initialized successfully" 
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

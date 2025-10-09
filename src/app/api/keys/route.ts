// src/app/api/keys/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { env } from "@/lib/env"
import { RateLimiter } from "@/lib/rate-limiter"

const rateLimiter = new RateLimiter();

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the user in the database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        apiKeys: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { usageLogs: true }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Add usage statistics to each API key
    const apiKeysWithStats = user.apiKeys.map(key => ({
      ...key,
      usageCount: key._count.usageLogs,
      isExpired: key.expires ? new Date(key.expires) < new Date() : false
    }))

    return NextResponse.json(apiKeysWithStats)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, environment, rateLimitPerMinute, rateLimitPerHour, rateLimitPerDay } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "API key name is required" }, { status: 400 })
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        apiKeys: {
          where: { isActive: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has reached the maximum number of API keys
    const MAX_FREE_KEYS = 5;
    if (user.apiKeys.length >= MAX_FREE_KEYS) {
      return NextResponse.json({ 
        error: `Maximum number of API keys (${MAX_FREE_KEYS}) reached. Please upgrade your plan.` 
      }, { status: 429 })
    }

    // Generate a unique API key
    const apiKey = `nxq_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    // Set expiration date (30 days from now)
    const expires = new Date()
    expires.setDate(expires.getDate() + 30)

    // Create the API key with rate limits
    const newApiKey = await db.apiKey.create({
      data: {
        name,
        key: apiKey,
        environment: environment || "production",
        expires,
        rateLimitPerMinute: rateLimitPerMinute || 60,
        rateLimitPerHour: rateLimitPerHour || 1000,
        rateLimitPerDay: rateLimitPerDay || 10000,
        userId: user.id
      }
    })

    // Initialize rate limits for the new key
    await rateLimiter.initializeRateLimits(newApiKey.id, newApiKey.userId, {
      perMinute: newApiKey.rateLimitPerMinute,
      perHour: newApiKey.rateLimitPerHour,
      perDay: newApiKey.rateLimitPerDay
    })

    return NextResponse.json(newApiKey)
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

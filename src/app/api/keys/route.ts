// src/app/api/keys/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find or create the user
    let user = await db.user.findUnique({
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
      // Create user if not found
      user = await db.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          email: session.user.email,
          name: session.user.name || "Unknown User",
          image: session.user.image || "",
          provider: "google",
          providerId: session.user.email,
          lastLoginAt: new Date()
        },
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
    }

    // Add usage statistics to each API key
    const apiKeysWithStats = user.apiKeys.map(key => ({
      ...key,
      usageCount: key._count.usageLogs,
      isExpired: key.expires ? new Date(key.expires) < new Date() : false
    }))

    return NextResponse.json(apiKeysWithStats)
  } catch (error) {
    console.error("Error in GET /api/keys:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, environment, rateLimitPerMinute, rateLimitPerHour, rateLimitPerDay } = body

    if (!name) {
      return NextResponse.json({ error: "API key name is required" }, { status: 400 })
    }

    // Find or create the user
    let user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          email: session.user.email,
          name: session.user.name || "Unknown User",
          image: session.user.image || "",
          provider: "google",
          providerId: session.user.email,
          lastLoginAt: new Date()
        }
      })
    }

    // Check if user has reached the maximum number of API keys
    const existingKeys = await db.apiKey.count({
      where: { 
        userId: user.id,
        isActive: true 
      }
    })

    const MAX_FREE_KEYS = 5;
    if (existingKeys >= MAX_FREE_KEYS) {
      return NextResponse.json({ 
        error: `Maximum number of API keys (${MAX_FREE_KEYS}) reached. Please upgrade your plan.` 
      }, { status: 429 })
    }

    // Generate a unique API key
    const generateApiKey = () => {
      const prefix = "nxq_"
      const randomPart = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15)
      return prefix + randomPart
    }

    let apiKey = generateApiKey()
    
    // Ensure the API key is unique
    let existingKey = await db.apiKey.findUnique({
      where: { key: apiKey }
    })
    
    while (existingKey) {
      apiKey = generateApiKey()
      existingKey = await db.apiKey.findUnique({
        where: { key: apiKey }
      })
    }

    // Set expiration date (30 days from now)
    const expires = new Date()
    expires.setDate(expires.getDate() + 30)

    // Create the API key with rate limits
    const newApiKey = await db.apiKey.create({
      data: {
        id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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

    return NextResponse.json(newApiKey)
  } catch (error) {
    console.error("Error in POST /api/keys:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

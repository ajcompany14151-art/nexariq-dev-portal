// src/app/api/keys/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    console.log("GET /api/keys - Starting request");
    
    const session = await getServerSession(authOptions)
    console.log("Session in /api/keys:", session ? 'Found' : 'Not found');
    
    if (!session?.user?.email) {
      console.log("No session or email found");
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
    console.log("API Key creation endpoint called");
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session);
    
    if (!session?.user?.email) {
      console.log("Unauthorized: No session or email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body);
    const { name, environment, rateLimitPerMinute, rateLimitPerHour, rateLimitPerDay } = body

    if (!name) {
      console.log("Missing API key name");
      return NextResponse.json({ error: "API key name is required" }, { status: 400 })
    }

    // Find or create the user
    let user = await db.user.findUnique({
      where: { email: session.user.email }
    })
    console.log("Found user:", user);

    if (!user) {
      console.log("Creating new user");
      try {
        user = await db.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || "Unknown User",
            image: session.user.image || "",
            provider: "google",
            providerId: session.user.email,
            lastLoginAt: new Date()
          }
        })
        console.log("Created user:", user);
      } catch (userCreateError) {
        console.error("Error creating user:", userCreateError);
        throw userCreateError;
      }
    }

    // Check if user has reached the maximum number of API keys
    const existingKeys = await db.apiKey.count({
      where: { 
        userId: user.id,
        isActive: true 
      }
    })
    console.log("Existing keys count:", existingKeys);

    const MAX_FREE_KEYS = 10; // Increased limit
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
    console.log("Generated API key:", apiKey.substring(0, 8) + "...");
    
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
    console.log("Creating API key in database");
    const newApiKey = await db.apiKey.create({
      data: {
        name,
        key: apiKey,
        scopes: JSON.stringify(["chat:read", "chat:write"]), // Add scopes field
        environment: (environment?.toUpperCase() === "PRODUCTION" ? "PRODUCTION" : "SANDBOX") as any,
        expires,
        rateLimitPerMinute: rateLimitPerMinute || 60,
        rateLimitPerHour: rateLimitPerHour || 1000,
        rateLimitPerDay: rateLimitPerDay || 10000,
        userId: user.id
      }
    })
    console.log("Created API key:", newApiKey.id);

    return NextResponse.json(newApiKey)
  } catch (error) {
    console.error("Error in POST /api/keys:", error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

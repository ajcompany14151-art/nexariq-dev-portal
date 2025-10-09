// src/app/api/keys/[id]/rate-limit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { RateLimiter } from "@/lib/rate-limiter"

const rateLimiter = new RateLimiter();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the API key
    const apiKey = await db.apiKey.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    // Get rate limit status
    const status = await rateLimiter.getRateLimitStatus(apiKey.id, user.id);

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error fetching rate limit status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

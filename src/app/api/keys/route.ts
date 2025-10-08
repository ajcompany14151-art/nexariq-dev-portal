import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch API keys for the authenticated user
    const apiKeys = await db.apiKey.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email || !email.endsWith('@gmail.com')) {
      return NextResponse.json({ error: "Valid Gmail address required" }, { status: 400 })
    }

    // Call the external backend to generate a key
    const response = await fetch(`${process.env.NEXARIQ_BACKEND_URL || 'https://lynxa-pro-backend.vercel.app'}/api/generate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error || "Failed to generate API key" }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      id: uuidv4(),
      name: `Generated Key - ${new Date().toLocaleDateString()}`,
      key: data.apiKey,
      environment: "production",
      isActive: true,
      lastUsed: null,
      createdAt: new Date().toISOString(),
      expires: data.expires
    })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
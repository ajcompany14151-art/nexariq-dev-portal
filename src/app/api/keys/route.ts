// src/app/api/keys/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { env } from "@/lib/env"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Call the external backend to get keys
    const response = await fetch(`${env.NEXARIQ_BACKEND_URL}/api/keys`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.user.email}`, // Use email as identifier
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch API keys");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email || !email.endsWith('@gmail.com')) {
      return NextResponse.json({ error: "Valid Gmail address required" }, { status: 400 })
    }

    // Call the external backend to generate a key
    const response = await fetch(`${env.NEXARIQ_BACKEND_URL}/api/generate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${session.user.email}`, // Use email as identifier
      },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error || "Failed to generate API key" }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      id: crypto.randomUUID(),
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

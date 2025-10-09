// src/app/api/keys/[id]/usage/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
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

    // Update the last used timestamp
    await db.apiKey.update({
      where: { id: params.id },
      data: {
        lastUsed: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating API key usage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

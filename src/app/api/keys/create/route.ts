import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const body = await req.json()
    const { name, environment = "SANDBOX", scopes = ["read", "write"] } = body
    
    if (!name) {
      return NextResponse.json(
        { message: "API key name is required" },
        { status: 400 }
      )
    }
    
    // Generate a secure API key
    const apiKey = `nxq_${crypto.randomBytes(24).toString('hex')}`
    
    // Create the API key in the database
    const newKey = await db.apiKey.create({
      data: {
        name,
        key: apiKey,
        environment,
        scopes: JSON.stringify(scopes),
        userId: session.user.id,
        isActive: true
      }
    })
    
    return NextResponse.json(newKey, { status: 201 })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json(
      { message: "Failed to create API key" },
      { status: 500 }
    )
  }
}
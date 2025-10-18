// src/app/api/auth/dev-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ONLY FOR DEVELOPMENT - Remove in production
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  try {
    const { email, name } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find or create test user
    let user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: name || "Test User",
          provider: "dev",
          providerId: email,
          lastLoginAt: new Date()
        }
      });
    } else {
      // Update last login
      user = await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Dev login error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
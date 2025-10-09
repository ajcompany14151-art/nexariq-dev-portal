// src/app/api/auth/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, name, image, provider, providerId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Create or update user
    const user = await db.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
        image: image || undefined,
        lastLoginAt: new Date(),
      },
      create: {
        email,
        name: name || "Unknown User",
        image: image || "",
        provider,
        providerId,
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

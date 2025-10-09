// src/app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test database connection
    const { db } = await import("@/lib/db");
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ 
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// src/app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Test database connection
export async function GET() {
  try {
    // Test basic database connection
    const result = await db.$queryRaw`SELECT 1 as test`;
    
    // Try to create a test user to verify the schema works
    const testUser = await db.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        provider: "test",
        providerId: "test",
        lastLoginAt: new Date()
      }
    });
    
    // Clean up test user
    await db.user.delete({
      where: { id: testUser.id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection and schema working correctly",
      result
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      details: error
    }, { status: 500 });
  }
}
// src/app/api/dev-auth/route.ts
// Development-only authentication bypass for testing
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  // Only allow in development or if no OAuth is configured
  if (process.env.NODE_ENV === 'production' && 
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { email, name } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Find or create user for development testing
    let user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: name || 'Test User',
          provider: 'dev',
          providerId: email
        }
      })
    }

    return NextResponse.json({
      user,
      message: 'Development user created/found'
    })

  } catch (error) {
    console.error('Dev auth error:', error)
    return NextResponse.json(
      { error: 'Failed to create dev user' }, 
      { status: 500 }
    )
  }
}
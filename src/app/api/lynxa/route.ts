import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { headers } from "next/headers"

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GenerationOptions {
  model: string
  temperature: number
  max_tokens: number
  top_p: number
}

// Token estimation utility
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}


export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get API key from Authorization header
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Missing or invalid API key" },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)
    
    // Find the API key in database
    const keyRecord = await db.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })

    if (!keyRecord || !keyRecord.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      )
    }

    // Check IP whitelist if configured
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') || 
                     'unknown'
    const ipWhitelists = await db.ipWhitelist.findMany({
      where: {
        userId: keyRecord.userId,
        isActive: true
      }
    })

    if (ipWhitelists.length > 0) {
      const isWhitelisted = ipWhitelists.some(whitelist => 
        whitelist.ipAddress === clientIP
      )
      
      if (!isWhitelisted) {
        return NextResponse.json(
          { error: "IP address not whitelisted" },
          { status: 403 }
        )
      }
    }

    // Parse request body
    const body = await request.json()
    const { model, messages, temperature = 0.7, max_tokens = 1024, top_p = 0.9 } = body
    
    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }
    
    // Call the real Lynxa Pro backend (corporate-grade setup like Groq)
    const lynxaResponse = await fetch('https://lynxa-pro-backend.vercel.app/api/lynxa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'User-Agent': 'Nexariq-Developer-Portal/1.0'
      },
      body: JSON.stringify({
        model: model || 'lynxa-pro',
        messages,
        temperature,
        max_tokens,
        top_p,
        stream: false
      })
    })
    
    if (!lynxaResponse.ok) {
      const errorData = await lynxaResponse.json()
      throw new Error(`Lynxa Pro Backend Error: ${errorData.error || 'API request failed'}`)
    }
    
    const responseData = await lynxaResponse.json()
    
    const responseTime = Date.now() - startTime
    
    // Calculate tokens used from response
    const tokensUsed = responseData.usage?.total_tokens || 0

    // Log usage
    await db.usageLog.create({
      data: {
        apiKeyId: keyRecord.id,
        userId: keyRecord.userId,
        endpoint: '/api/lynxa',
        method: 'POST',
        statusCode: response.status,
        tokensUsed,
        ipAddress: clientIP,
        userAgent: headersList.get('user-agent') || undefined,
        responseTime
      }
    })

    // Update last used timestamp for API key
    await db.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() }
    })

    // Return the response
    return NextResponse.json(responseData)

  } catch (error) {
    console.error("Error in Lynxa API proxy:", error)
    
    // Log error if we have API key info
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7)
      const keyRecord = await db.apiKey.findUnique({
        where: { key: apiKey }
      })
      
      if (keyRecord) {
        await db.usageLog.create({
          data: {
            apiKeyId: keyRecord.id,
            userId: keyRecord.userId,
            endpoint: '/api/lynxa',
            method: 'POST',
            statusCode: 500,
            tokensUsed: 0,
            ipAddress: request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      request.headers.get('cf-connecting-ip') || 
                      'unknown',
            userAgent: request.headers.get('user-agent') || undefined,
            responseTime: Date.now() - startTime
          }
        })
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
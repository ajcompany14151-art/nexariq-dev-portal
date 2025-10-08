import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get API key from Authorization header
    const headersList = headers()
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
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
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
    
    // Call the actual Lynxa Pro API
    const response = await fetch('https://lynxa-pro-backend.vercel.app/api/lynxa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    })

    const responseData = await response.json()
    const responseTime = Date.now() - startTime

    // Calculate tokens used (simplified estimation)
    let tokensUsed = 0
    if (responseData.choices && responseData.choices[0]?.message?.content) {
      // Rough estimation: ~4 characters per token
      tokensUsed = Math.ceil(responseData.choices[0].message.content.length / 4)
    }

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
    return NextResponse.json(responseData, { status: response.status })

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
            ipAddress: request.ip || 'unknown',
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
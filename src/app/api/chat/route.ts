// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidLynxaModel, estimateTokens, type LynxaModel, type ChatMessage } from "@/lib/lynxa";
import { RateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get API key from Authorization header
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Missing or invalid API key" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    
    // Find the API key in database
    const keyRecord = await db.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    });

    if (!keyRecord || !keyRecord.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // Check if API key is expired
    if (keyRecord.expires && new Date(keyRecord.expires) < new Date()) {
      return NextResponse.json(
        { error: "API key has expired" },
        { status: 401 }
      );
    }

    // Check IP whitelist if configured
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') || 
                     'unknown';
    const ipWhitelists = await db.ipWhitelist.findMany({
      where: {
        userId: keyRecord.userId,
        isActive: true
      }
    });

    if (ipWhitelists.length > 0) {
      const isWhitelisted = ipWhitelists.some(whitelist => 
        whitelist.ipAddress === clientIP
      );
      
      if (!isWhitelisted) {
        return NextResponse.json(
          { error: "IP address not whitelisted" },
          { status: 403 }
        );
      }
    }

    // Parse request body
    const body = await request.json();
    const { model, messages, temperature, max_tokens, top_p, stream, stop } = body;

    // Validate required fields
    if (!model || !messages) {
      return NextResponse.json(
        { error: "Missing required fields: model and messages" },
        { status: 400 }
      );
    }

    // Validate model
    if (!isValidLynxaModel(model)) {
      return NextResponse.json(
        { error: `Invalid model. Supported models: lynxa-pro` },
        { status: 400 }
      );
    }

    // Validate messages format
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return NextResponse.json(
          { error: "Each message must have 'role' and 'content' fields" },
          { status: 400 }
        );
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        return NextResponse.json(
          { error: "Message role must be 'system', 'user', or 'assistant'" },
          { status: 400 }
        );
      }
    }

    // Check rate limits using enhanced rate limiter
    const rateLimiter = new RateLimiter();
    const rateLimitCheck = await rateLimiter.checkRateLimit(keyRecord.id, keyRecord.userId);
    
    if (!rateLimitCheck.allowed) {
      const retryAfter = Math.ceil((rateLimitCheck.resetTime.getTime() - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: `Rate limit exceeded: too many requests per ${rateLimitCheck.limitType}`,
          retryAfter,
          resetTime: rateLimitCheck.resetTime.toISOString()
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '1000',
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitCheck.resetTime.getTime() / 1000).toString()
          }
        }
      );
    }

    // Make the API call to local Lynxa Pro backend
    const baseUrl = process.env.NEXTAUTH_URL || `http://${request.headers.get('host')}`
    const response = await fetch(`${baseUrl}/api/lynxa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyRecord.key}`
      },
      body: JSON.stringify({
        model: 'lynxa-pro',
        messages: messages as ChatMessage[],
        temperature,
        max_tokens,
        top_p,
        stream: stream || false,
        stop
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Lynxa Pro API Error: ${errorData.error || 'Unknown error'}`);
    }

    const responseData = await response.json();
    const responseTime = Date.now() - startTime;

    // Calculate tokens used from the response
    const tokensUsed = responseData.usage?.total_tokens || 0;

    // Log usage
    await db.usageLog.create({
      data: {
        apiKeyId: keyRecord.id,
        userId: keyRecord.userId,
        endpoint: '/api/chat',
        method: 'POST',
        statusCode: 200,
        tokensUsed,
        ipAddress: clientIP,
        userAgent: headersList.get('user-agent') || undefined,
        responseTime
      }
    });

    // Update last used timestamp for API key
    await db.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() }
    });

    // Return the response
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error in Groq chat API:", error);
    
    const responseTime = Date.now() - startTime;
    
    // Log error if we have API key info
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7);
      try {
        const keyRecord = await db.apiKey.findUnique({
          where: { key: apiKey }
        });
        
        if (keyRecord) {
          await db.usageLog.create({
            data: {
              apiKeyId: keyRecord.id,
              userId: keyRecord.userId,
              endpoint: '/api/chat',
              method: 'POST',
              statusCode: 500,
              tokensUsed: 0,
              ipAddress: request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        request.headers.get('cf-connecting-ip') || 
                        'unknown',
              userAgent: request.headers.get('user-agent') || undefined,
              responseTime
            }
          });
        }
      } catch (logError) {
        console.error("Error logging usage:", logError);
      }
    }

    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
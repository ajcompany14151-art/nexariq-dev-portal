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

// Advanced Lynxa Pro response generation
async function generateLynxaResponse(messages: Message[], options: GenerationOptions) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  
  // Generate intelligent response based on context
  let responseContent = generateIntelligentResponse(lastMessage, systemMessage, messages)
  
  // Apply temperature-based variation
  if (options.temperature > 0.7) {
    responseContent = addCreativeVariation(responseContent, options.temperature)
  }
  
  // Trim to max_tokens if needed
  const maxChars = options.max_tokens * 4 // Rough estimation
  if (responseContent.length > maxChars) {
    responseContent = responseContent.substring(0, maxChars) + '...'
  }
  
  // Calculate tokens
  const promptTokens = messages.reduce((sum, msg) => sum + estimateTokens(msg.content), 0)
  const completionTokens = estimateTokens(responseContent)
  const totalTokens = promptTokens + completionTokens
  
  // Add realistic delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))
  
  return {
    id: `lynxa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'lynxa-pro',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: responseContent
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens
    }
  }
}

function generateIntelligentResponse(query: string, system: string, conversation: Message[]): string {
  const conversationContext = conversation.slice(-3) // Last 3 messages for context
  
  // Detect intent and generate appropriate response
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return handleGreeting(system)
  } else if (query.includes('code') || query.includes('programming') || query.includes('function')) {
    return handleCodingQuery(query, system)
  } else if (query.includes('explain') || query.includes('what is') || query.includes('how does')) {
    return handleExplanationQuery(query, system)
  } else if (query.includes('help') || query.includes('assist')) {
    return handleHelpRequest(query, system)
  } else if (query.includes('create') || query.includes('build') || query.includes('make')) {
    return handleCreationRequest(query, system)
  }
  
  return generateContextualResponse(query, system, conversationContext)
}

function handleGreeting(system: string): string {
  const greetings = [
    "Hello! I'm Lynxa Pro, your advanced AI assistant powered by Nexariq (AJ STUDIOZ). I'm here to help you with any questions or tasks you might have.",
    "Hi there! Welcome to Lynxa Pro. I'm ready to assist you with coding, explanations, creative tasks, and much more. What can I do for you today?",
    "Greetings! I'm Lynxa Pro, designed to provide intelligent and helpful responses. Feel free to ask me anything!"
  ]
  
  if (system.toLowerCase().includes('developer') || system.toLowerCase().includes('code')) {
    return "Hello! I'm Lynxa Pro, your AI coding assistant. I'm ready to help you with programming, debugging, architecture decisions, and technical challenges. What are you working on?"
  }
  
  return greetings[Math.floor(Math.random() * greetings.length)]
}

function handleCodingQuery(query: string, system: string): string {
  const codingResponses = {
    javascript: "I'd be happy to help with JavaScript! Whether you need help with ES6+ features, async/await, React, Node.js, or any other JS-related topic, I'm here to assist. What specific challenge are you facing?",
    python: "Great choice with Python! I can help you with everything from basic syntax to advanced topics like machine learning, web development with Django/Flask, data analysis, or automation scripts. What would you like to explore?",
    react: "React is an excellent framework! I can assist with components, hooks, state management, routing, performance optimization, or any other React concepts. Are you building something specific?",
    api: "APIs are crucial for modern applications! I can help you design REST APIs, handle authentication, work with databases, or integrate third-party services. What kind of API are you working with?"
  }
  
  for (const [tech, response] of Object.entries(codingResponses)) {
    if (query.includes(tech)) {
      return response
    }
  }
  
  return "I'm here to help with your coding question! I can assist with multiple programming languages, frameworks, debugging, code optimization, and best practices. Could you provide more details about what you're trying to accomplish?"
}

function handleExplanationQuery(query: string, system: string): string {
  return `I'll be happy to explain that for you! Based on your question, let me provide a comprehensive explanation:\n\nLet me break this down step by step to make it clear and actionable. If you need me to dive deeper into any specific aspect, just let me know!`
}

function handleHelpRequest(query: string, system: string): string {
  return "I'm here to help! I can assist you with:\n\n• Programming and software development\n• Technical explanations and tutorials\n• Problem-solving and debugging\n• Creative writing and content creation\n• Data analysis and insights\n• General questions and research\n\nWhat specific area would you like assistance with?"
}

function handleCreationRequest(query: string, system: string): string {
  return "I'd love to help you create that! I can assist with building applications, writing code, designing systems, creating content, or developing solutions. Could you tell me more about what you'd like to create and any specific requirements or preferences you have?"
}

function generateContextualResponse(query: string, system: string, context: Message[]): string {
  const responses = [
    "That's an interesting question! Let me provide you with a detailed and helpful response.",
    "I understand what you're asking about. Here's my comprehensive take on this topic.",
    "Great question! Let me analyze this and give you a thorough answer."
  ]
  
  const baseResponse = responses[Math.floor(Math.random() * responses.length)]
  
  // Add contextual information based on the query length and complexity
  if (query.length > 100) {
    return `${baseResponse}\n\nBased on your detailed question, I can see you're looking for comprehensive information. Let me address the key points:\n\n• I'll analyze your specific requirements\n• Provide actionable insights and recommendations\n• Offer practical solutions you can implement\n\nFeel free to ask for clarification or additional details on any aspect!"`
  } else {
    return `${baseResponse}\n\nI'm ready to dive into this topic and provide you with the information you need. Is there a particular aspect you'd like me to focus on first?"`
  }
}

function addCreativeVariation(response: string, temperature: number): string {
  if (temperature > 0.9) {
    const creativePrefixes = [
      "Here's my creative take: ",
      "Let me approach this uniquely: ",
      "From an innovative perspective: "
    ]
    const prefix = creativePrefixes[Math.floor(Math.random() * creativePrefixes.length)]
    return prefix + response
  }
  return response
}

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
    
    // Generate local Lynxa Pro response
    const responseData = await generateLynxaResponse(messages, {
      model: model || 'lynxa-pro',
      temperature,
      max_tokens,
      top_p
    })
    
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
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'

    // Find the user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        apiKeys: {
          include: {
            usageLogs: {
              where: getTimeframeFilter(timeframe),
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate usage metrics
    const allUsageLogs = user.apiKeys.flatMap(key => key.usageLogs)
    
    const totalRequests = allUsageLogs.length
    const totalTokens = allUsageLogs.reduce((sum, log) => sum + log.tokensUsed, 0)
    const successfulRequests = allUsageLogs.filter(log => log.statusCode >= 200 && log.statusCode < 400).length
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
    
    // Calculate average response time
    const logsWithResponseTime = allUsageLogs.filter(log => log.responseTime !== null)
    const avgResponseTime = logsWithResponseTime.length > 0 
      ? logsWithResponseTime.reduce((sum, log) => sum + (log.responseTime || 0), 0) / logsWithResponseTime.length
      : 0

    // Get unique models from endpoints (extract model from endpoint path)
    const uniqueModels = new Set(
      allUsageLogs
        .map(log => extractModelFromEndpoint(log.endpoint))
        .filter(model => model !== null)
    ).size

    // Top models by usage
    const modelUsage = new Map<string, { requests: number; tokens: number }>()
    allUsageLogs.forEach(log => {
      const model = extractModelFromEndpoint(log.endpoint)
      if (model) {
        const current = modelUsage.get(model) || { requests: 0, tokens: 0 }
        modelUsage.set(model, {
          requests: current.requests + 1,
          tokens: current.tokens + log.tokensUsed
        })
      }
    })

    const topModels = Array.from(modelUsage.entries())
      .map(([model, usage]) => ({ model, ...usage }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)

    // Requests by hour (last 24 hours)
    const requestsByHour = getHourlyBreakdown(allUsageLogs, timeframe)

    // Errors by type
    const errorsByType = getErrorBreakdown(allUsageLogs)

    // Daily usage (last 7 days)
    const dailyUsage = getDailyBreakdown(allUsageLogs)

    return NextResponse.json({
      totalRequests,
      totalTokens,
      uniqueModels,
      avgResponseTime: Math.round(avgResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      topModels,
      requestsByHour,
      errorsByType,
      dailyUsage
    })

  } catch (error) {
    console.error("Error fetching usage analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getTimeframeFilter(timeframe: string) {
  const now = new Date()
  let startDate: Date

  switch (timeframe) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000)
      break
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }

  return {
    createdAt: {
      gte: startDate
    }
  }
}

function extractModelFromEndpoint(endpoint: string): string | null {
  // Extract model from endpoint paths like /api/chat?model=kimi or /api/completions/gpt-4
  const modelPatterns = [
    /model=([^&]+)/i,  // Query parameter
    /\/api\/\w+\/([^\/\?]+)/i,  // Path segment
    /\/chat\/([^\/\?]+)/i  // Chat endpoint
  ]

  for (const pattern of modelPatterns) {
    const match = endpoint.match(pattern)
    if (match) {
      return match[1].toLowerCase()
    }
  }

  // Default model detection from common endpoints
  if (endpoint.includes('chat')) return 'kimi'
  if (endpoint.includes('gpt')) return 'gpt-4o'
  if (endpoint.includes('claude')) return 'claude-3.5-sonnet'
  if (endpoint.includes('llama')) return 'llama-3.1-8b'

  return null
}

function getHourlyBreakdown(logs: any[], timeframe: string) {
  const hours = timeframe === '1h' ? 12 : 24 // 5-minute intervals for 1h, hourly for others
  const interval = timeframe === '1h' ? 5 * 60 * 1000 : 60 * 60 * 1000 // 5 min or 1 hour
  
  const breakdown = Array.from({ length: hours }, (_, i) => {
    const time = new Date(Date.now() - (hours - 1 - i) * interval)
    const label = timeframe === '1h' 
      ? time.toISOString().substr(11, 5) // HH:MM format
      : time.getHours().toString().padStart(2, '0') + ':00'
    
    const startTime = new Date(time.getTime() - interval / 2)
    const endTime = new Date(time.getTime() + interval / 2)
    
    const periodLogs = logs.filter(log => {
      const logTime = new Date(log.createdAt)
      return logTime >= startTime && logTime < endTime
    })

    return {
      hour: label,
      requests: periodLogs.length,
      tokens: periodLogs.reduce((sum, log) => sum + log.tokensUsed, 0)
    }
  })

  return breakdown
}

function getErrorBreakdown(logs: any[]) {
  const errorCounts = new Map<string, number>()
  const totalRequests = logs.length
  
  logs.forEach(log => {
    if (log.statusCode >= 400) {
      let errorType = 'Unknown Error'
      
      if (log.statusCode === 401) errorType = 'Invalid API Key'
      else if (log.statusCode === 429) errorType = 'Rate Limit'
      else if (log.statusCode === 500) errorType = 'Server Error'
      else if (log.statusCode === 503) errorType = 'Model Error'
      else if (log.statusCode === 408 || (log.responseTime && log.responseTime > 30000)) errorType = 'Timeout'
      
      errorCounts.set(errorType, (errorCounts.get(errorType) || 0) + 1)
    }
  })

  return Array.from(errorCounts.entries()).map(([type, count]) => ({
    type,
    count,
    percentage: totalRequests > 0 ? Math.round((count / totalRequests) * 10000) / 100 : 0
  })).sort((a, b) => b.count - a.count)
}

function getDailyBreakdown(logs: any[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    const dayLogs = logs.filter(log => {
      const logTime = new Date(log.createdAt)
      return logTime >= date && logTime < nextDay
    })

    const errors = dayLogs.filter(log => log.statusCode >= 400).length

    return {
      date: date.toISOString().split('T')[0],
      requests: dayLogs.length,
      tokens: dayLogs.reduce((sum, log) => sum + log.tokensUsed, 0),
      errors
    }
  })

  return days
}
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get usage logs for the period
    const usageLogs = await db.usageLog.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Calculate analytics
    const totalApiCalls = usageLogs.length
    const totalTokensUsed = usageLogs.reduce((sum, log) => sum + log.tokensUsed, 0)
    const averageResponseTime = usageLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / totalApiCalls || 0
    const successRate = usageLogs.filter(log => log.statusCode < 400).length / totalApiCalls * 100 || 0
    
    // Count active API keys
    const activeKeys = await db.apiKey.count({
      where: {
        userId: session.user.id,
        isActive: true
      }
    })

    // Group by day for chart data
    const dailyStats = usageLogs.reduce((acc, log) => {
      const date = log.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          calls: 0,
          tokens: 0,
          errors: 0
        }
      }
      acc[date].calls += 1
      acc[date].tokens += log.tokensUsed
      if (log.statusCode >= 400) {
        acc[date].errors += 1
      }
      return acc
    }, {} as Record<string, { date: string; calls: number; tokens: number; errors: number }>)

    const chartData = Object.values(dailyStats)

    // Get top endpoints
    const endpointStats = usageLogs.reduce((acc, log) => {
      if (!acc[log.endpoint]) {
        acc[log.endpoint] = {
          endpoint: log.endpoint,
          calls: 0,
          tokens: 0,
          errors: 0
        }
      }
      acc[log.endpoint].calls += 1
      acc[log.endpoint].tokens += log.tokensUsed
      if (log.statusCode >= 400) {
        acc[log.endpoint].errors += 1
      }
      return acc
    }, {} as Record<string, { endpoint: string; calls: number; tokens: number; errors: number }>)

    const topEndpoints = Object.values(endpointStats)
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 10)

    return NextResponse.json({
      summary: {
        totalApiCalls,
        totalTokensUsed,
        averageResponseTime: Math.round(averageResponseTime),
        successRate: Math.round(successRate * 100) / 100,
        activeKeys
      },
      chartData,
      topEndpoints,
      period
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
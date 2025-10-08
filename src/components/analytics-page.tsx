"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap, 
  Clock, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  MousePointer,
  Cpu,
  Globe,
  Users,
  DollarSign,
  Target,
  BarChart,
  LineChart,
  PieChart
} from "lucide-react"
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts"

interface AnalyticsData {
  summary: {
    totalApiCalls: number
    totalTokensUsed: number
    averageResponseTime: number
    successRate: number
  }
  chartData: Array<{
    date: string
    calls: number
    tokens: number
    errors: number
  }>
  topEndpoints: Array<{
    endpoint: string
    calls: number
    tokens: number
    errors: number
  }>
  period: string
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchAnalytics()
  }, [period])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  const exportData = () => {
    if (!data) return
    
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Monitor your API usage and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Monitor your API usage and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.summary.totalApiCalls.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokens Used</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.summary.totalTokensUsed || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">+8.2%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.summary.averageResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDown className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">-5.3%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.summary.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">+0.8%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>API Calls Over Time</CardTitle>
            <CardDescription>
              Daily API call volume for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
            <CardDescription>
              Daily token consumption for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tokens" fill="#8b5cf6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
          <CardDescription>
            Most frequently used API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.topEndpoints.slice(0, 10).map((endpoint, index) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{endpoint.endpoint}</div>
                    <div className="text-sm text-muted-foreground">
                      {endpoint.calls} calls • {endpoint.tokens.toLocaleString()} tokens
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {((endpoint.calls / (data?.summary.totalApiCalls || 1)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">of total</div>
                  </div>
                  {endpoint.errors > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {endpoint.errors} errors
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
            <CardDescription>
              Distribution of API response times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: '< 100ms', value: 45, color: '#10b981' },
                    { name: '100-500ms', value: 35, color: '#3b82f6' },
                    { name: '500ms-1s', value: 15, color: '#f59e0b' },
                    { name: '> 1s', value: 5, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: '< 100ms', value: 45, color: '#10b981' },
                    { name: '100-500ms', value: 35, color: '#3b82f6' },
                    { name: '500ms-1s', value: 15, color: '#f59e0b' },
                    { name: '> 1s', value: 5, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>
              API error rate over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {data?.summary.successRate ? (100 - data.summary.successRate).toFixed(1) : 0}%
              </div>
              <p className="text-muted-foreground">Error Rate</p>
              <div className="mt-4 text-sm text-muted-foreground">
                Excellent performance with minimal errors
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>
              Estimated API costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                ${((data?.summary.totalTokensUsed || 0) * 0.0001).toFixed(2)}
              </div>
              <p className="text-muted-foreground">Estimated Cost</p>
              <div className="mt-4 text-sm text-muted-foreground">
                Based on current usage patterns
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeyDialog } from "@/components/api-key-dialog"
import { EnhancedAnalytics } from "@/components/enhanced-analytics"
import { SettingsPage } from "@/components/settings-page"
import { EnhancedApiPlayground } from "@/components/enhanced-api-playground"
import { SplashScreen } from "@/components/splash-screen"
import { UserProfile } from "@/components/user-profile"
import { ApiDocumentation } from "@/components/api-documentation"
import { ApiKeyUsage } from "@/components/api-key-usage"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { PageLoading, Skeleton } from "@/components/ui/loading"
import { 
  Key, 
  BarChart3, 
  FileText, 
  CreditCard, 
  Settings, 
  Users, 
  Shield,
  Zap,
  Globe,
  Lock,
  Activity,
  TrendingUp,
  Code,
  BookOpen,
  HelpCircle,
  Rocket,
  Cpu,
  Database,
  Terminal,
  MessageSquare,
  Brain,
  Sparkles,
  Bot,
  PlayCircle,
  PauseCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  environment: string
  isActive: boolean
  lastUsed: string | null
  createdAt: string
  rateLimitPerMinute?: number
  rateLimitPerHour?: number
  rateLimitPerDay?: number
  usageCount?: number
  isExpired?: boolean
}

export default function Home() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalApiCalls: 0,
    totalTokens: 0,
    activeKeys: 0,
    successRate: 0
  })

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalApiCalls: data.summary?.totalApiCalls || 0,
          totalTokens: data.summary?.totalTokensUsed || 0,
          activeKeys: apiKeys.filter(k => k.isActive && !k.isExpired).length,
          successRate: data.summary?.successRate || 0
        })
      } else {
        // Fallback to default values if API fails
        setStats({
          totalApiCalls: 0,
          totalTokens: 0,
          activeKeys: apiKeys.filter(k => k.isActive && !k.isExpired).length,
          successRate: 0
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      // Fallback to showing at least API key count
      setStats({
        totalApiCalls: 0,
        totalTokens: 0,
        activeKeys: apiKeys.filter(k => k.isActive && !k.isExpired).length,
        successRate: 0
      })
    }
  }

  useEffect(() => {
    if (session) {
      fetchApiKeys()
      fetchStats()
    }
  }, [session])
  
  useEffect(() => {
    if (session && apiKeys.length > 0) {
      fetchStats()
    }
  }, [apiKeys])

  const handleKeyCreated = () => {
    fetchApiKeys()
  }

  // Show advanced loading screen if not authenticated
  if (status === "loading") {
    return (
      <PageLoading 
        title="Nexariq Developer Portal"
        description="Loading your AI development experience..."
      />
    )
  }

  if (!session) {
    return <SplashScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Cpu className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="hidden xs:block">
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nexariq</span>
                <div className="text-xs text-muted-foreground hidden sm:block">Developer Portal</div>
              </div>
            </div>
            <Badge variant="secondary" className="hidden md:inline-flex">
              <Cpu className="w-3 h-3 mr-1" />
              Lynxa Pro AI
            </Badge>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={() => setActiveTab("settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            {session ? (
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium">{session.user?.name || session.user?.email}</div>
                  <div className="text-xs text-muted-foreground">Developer</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(session.user?.name || session.user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => signOut({ callbackUrl: "/signin" })}>
                  Sign Out
                </Button>
                <Button variant="outline" size="sm" className="sm:hidden" onClick={() => signOut({ callbackUrl: "/signin" })}>
                  <User className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 md:gap-6">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {[
                    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-600" },
                    { id: "profile", label: "Profile", icon: User, color: "text-indigo-600" },
                    { id: "keys", label: "API Keys", icon: Key, color: "text-green-600" },
                    { id: "playground", label: "Playground", icon: Terminal, color: "text-purple-600" },
                    { id: "analytics", label: "Analytics", icon: TrendingUp, color: "text-orange-600" },
                    { id: "docs", label: "Documentation", icon: FileText, color: "text-indigo-600" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200 ${
                        activeTab === item.id 
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-600 shadow-sm" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : item.color}`} />
                      <span className={`text-xs font-medium ${
                        activeTab === item.id ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1 px-2 pb-4">
                  {[
                    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-600" },
                    { id: "profile", label: "Profile", icon: User, color: "text-indigo-600" },
                    { id: "keys", label: "API Keys", icon: Key, color: "text-green-600" },
                    { id: "playground", label: "Playground", icon: Terminal, color: "text-purple-600" },
                    { id: "analytics", label: "Analytics", icon: TrendingUp, color: "text-orange-600" },
                    { id: "docs", label: "Documentation", icon: FileText, color: "text-indigo-600" },
                    { id: "settings", label: "Settings", icon: Settings, color: "text-gray-600" },
                    { id: "billing", label: "Billing", icon: CreditCard, color: "text-pink-600" },
                    { id: "team", label: "Team", icon: Users, color: "text-cyan-600" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                        activeTab === item.id 
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-2 border-blue-600 shadow-sm" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                      {activeTab === item.id && (
                        <div className="ml-auto w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl md:rounded-2xl p-6 md:p-8 text-white shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Welcome to Nexariq</h1>
                      <p className="text-blue-100 text-sm md:text-base lg:text-lg mb-4 md:mb-6 max-w-2xl">
                        Access Lynxa Pro, the advanced AI assistant developed by Nexariq (AJ STUDIOZ). 
                        Build, test, and deploy AI-powered applications with enterprise-grade security and real data analytics.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                          <Rocket className="w-4 h-4 mr-2" />
                          Get Started
                        </Button>
                        <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Documentation
                        </Button>
                      </div>
                    </div>
                    <div className="hidden lg:block flex-shrink-0">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Cpu className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">API Calls</CardTitle>
                      <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg md:text-2xl font-bold">{stats.totalApiCalls.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {stats.totalApiCalls > 0 ? (
                          <><span className="text-green-600">+{((stats.totalApiCalls / 30) * 100).toFixed(1)}%</span> this month</>
                        ) : (
                          'No calls yet'
                        )}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Active Keys</CardTitle>
                      <Key className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg md:text-2xl font-bold">{apiKeys.filter(k => k.isActive && !k.isExpired).length}</div>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {apiKeys.filter(k => k.environment === 'SANDBOX').length} sandbox, {apiKeys.filter(k => k.environment === 'PRODUCTION').length} prod
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Tokens</CardTitle>
                      <Zap className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg md:text-2xl font-bold">
                        {stats.totalTokens > 1000 ? `${(stats.totalTokens / 1000).toFixed(1)}K` : stats.totalTokens}
                      </div>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {stats.totalTokens > 0 ? 'Used this month' : 'No tokens used'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg md:text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {stats.successRate >= 95 ? 'Excellent' : stats.successRate >= 80 ? 'Good' : 'Needs improvement'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                    <CardDescription>
                      Get started with these common tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      <ApiKeyDialog onKeyCreated={handleKeyCreated}>
                        <Button variant="outline" className="h-auto p-3 md:p-4 flex flex-col items-center space-y-1 md:space-y-2 w-full hover:bg-blue-50 hover:border-blue-200 transition-colors">
                          <Key className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                          <div className="text-center">
                            <div className="font-medium text-xs md:text-sm">Create API Key</div>
                            <div className="text-xs text-muted-foreground hidden md:block">Generate new key</div>
                          </div>
                        </Button>
                      </ApiKeyDialog>
                      <Button 
                        variant="outline" 
                        className="h-auto p-3 md:p-4 flex flex-col items-center space-y-1 md:space-y-2 w-full hover:bg-purple-50 hover:border-purple-200 transition-colors"
                        onClick={() => setActiveTab("playground")}
                      >
                        <Terminal className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                        <div className="text-center">
                          <div className="font-medium text-xs md:text-sm">Playground</div>
                          <div className="text-xs text-muted-foreground hidden md:block">Test Lynxa Pro</div>
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-3 md:p-4 flex flex-col items-center space-y-1 md:space-y-2 w-full hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                        onClick={() => setActiveTab("docs")}
                      >
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                        <div className="text-center">
                          <div className="font-medium text-xs md:text-sm">Documentation</div>
                          <div className="text-xs text-muted-foreground hidden md:block">API reference</div>
                        </div>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-3 md:p-4 flex flex-col items-center space-y-1 md:space-y-2 w-full hover:bg-orange-50 hover:border-orange-200 transition-colors"
                        onClick={() => setActiveTab("analytics")}
                      >
                        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                        <div className="text-center">
                          <div className="font-medium text-xs md:text-sm">Analytics</div>
                          <div className="text-xs text-muted-foreground hidden md:block">Usage insights</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apiKeys.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent activity. Create an API key to get started!</p>
                        </div>
                      ) : (
                        apiKeys.slice(0, 3).map((key) => (
                          <div key={key.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                key.isActive ? 'bg-green-500' : 'bg-gray-500'
                              }`} />
                              <div>
                                <span className="text-sm font-medium">API Key: {key.name}</span>
                                <div className="text-xs text-muted-foreground">
                                  {key.lastUsed ? `Last used ${new Date(key.lastUsed).toLocaleDateString()}` : 'Never used'}
                                </div>
                              </div>
                            </div>
                            <Badge variant={key.environment === 'PRODUCTION' ? 'default' : 'secondary'}>
                              {key.environment}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "profile" && <UserProfile />}

            {activeTab === "playground" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Lynxa Pro Playground</h2>
                  <p className="text-muted-foreground text-lg">Test Lynxa Pro AI by Nexariq (AJ STUDIOZ) in real-time</p>
                </div>
                <EnhancedApiPlayground />
              </div>
            )}

            {activeTab === "keys" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">API Keys</h2>
                    <p className="text-muted-foreground text-lg">Manage your API keys and access tokens</p>
                  </div>
                  <ApiKeyDialog onKeyCreated={handleKeyCreated}>
                    <Button size="lg" className="shadow-lg">
                      <Key className="w-4 h-4 mr-2" />
                      Create New Key
                    </Button>
                  </ApiKeyDialog>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Your API Keys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {apiKeys.length === 0 ? (
                      <div className="text-center py-12">
                        <Key className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
                        <p className="text-muted-foreground mb-6">Create your first API key to start using Lynxa Pro</p>
                        <ApiKeyDialog onKeyCreated={handleKeyCreated}>
                          <Button size="lg">
                            <Rocket className="w-4 h-4 mr-2" />
                            Create your first API key
                          </Button>
                        </ApiKeyDialog>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {apiKeys.map((key) => (
                          <div 
                            key={key.id} 
                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedApiKey === key.id 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'bg-slate-50 dark:bg-slate-800 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedApiKey(selectedApiKey === key.id ? null : key.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`w-3 h-3 rounded-full ${
                                  key.isActive && !key.isExpired ? 'bg-green-500' : 'bg-gray-400'
                                }`} />
                                <div>
                                  <div className="font-medium">{key.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {key.environment} • Created {new Date(key.createdAt).toLocaleDateString()}
                                    {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={key.environment === 'PRODUCTION' ? 'default' : 'secondary'}>
                                  {key.environment}
                                </Badge>
                                {key.isExpired && (
                                  <Badge variant="destructive">Expired</Badge>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedApiKey(selectedApiKey === key.id ? null : key.id);
                                  }}
                                >
                                  {selectedApiKey === key.id ? 'Hide Details' : 'View Details'}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Usage Details - shown when key is selected */}
                            {selectedApiKey === key.id && (
                              <div className="mt-4 pt-4 border-t">
                                <ApiKeyUsage apiKeyId={key.id} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "analytics" && <EnhancedAnalytics />}

            {activeTab === "docs" && <ApiDocumentation />}

            {activeTab === "settings" && <SettingsPage />}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Billing</h2>
                  <p className="text-muted-foreground text-lg">Manage your subscription and payment methods</p>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">Free Plan</div>
                        <div className="text-muted-foreground">Up to 1,000 API calls per month</div>
                      </div>
                      <Button size="lg">Upgrade to Pro</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Security</h2>
                  <p className="text-muted-foreground text-lg">Manage your security settings and access controls</p>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Security Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center space-x-3">
                          <Lock className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                          </div>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium">IP Whitelisting</div>
                            <div className="text-sm text-muted-foreground">Restrict access to specific IP addresses</div>
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "team" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Team Management</h2>
                  <p className="text-muted-foreground text-lg">Manage team members and permissions</p>
                </div>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                      <p className="text-muted-foreground mb-6">Invite team members to collaborate on your projects</p>
                      <Button size="lg">
                        <Users className="w-4 h-4 mr-2" />
                        Invite Team Member
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced API Key Management Component
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ApiKeyDialog } from "@/components/api-key-dialog"
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Settings, 
  Activity, 
  Shield, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  Zap,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  Users
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LoadingSpinner } from "@/components/ui/loading"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  environment: string
  isActive: boolean
  lastUsed: string | null
  createdAt: string
  expires: string | null
  scopes: string[]
  rateLimitPerMinute: number
  rateLimitPerHour: number
  rateLimitPerDay: number
  usageStats?: {
    requestsToday: number
    tokensToday: number
    requestsThisMonth: number
    tokensThisMonth: number
    successRate: number
    avgResponseTime: number
  }
}

interface EnhancedApiKeysProps {
  apiKeys: ApiKey[]
  onKeyCreated: () => void
  onKeyUpdated: () => void
  onKeyDeleted: () => void
}

export function EnhancedApiKeys({ apiKeys, onKeyCreated, onKeyUpdated, onKeyDeleted }: EnhancedApiKeysProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEnvironment, setFilterEnvironment] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         key.key.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEnvironment = filterEnvironment === "all" || key.environment === filterEnvironment
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && key.isActive) ||
                         (filterStatus === "inactive" && !key.isActive) ||
                         (filterStatus === "expired" && key.expires && new Date(key.expires) < new Date())
    
    return matchesSearch && matchesEnvironment && matchesStatus
  })

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`API key "${keyName}" copied to clipboard`)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    setLoading(prev => ({ ...prev, [keyId]: true }))
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(`API key ${!currentStatus ? 'activated' : 'deactivated'}`)
        onKeyUpdated()
      } else {
        toast.error('Failed to update API key status')
      }
    } catch (error) {
      toast.error('Failed to update API key status')
    } finally {
      setLoading(prev => ({ ...prev, [keyId]: false }))
    }
  }

  const deleteKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to delete "${keyName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(prev => ({ ...prev, [keyId]: true }))
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(`API key "${keyName}" deleted`)
        onKeyDeleted()
      } else {
        toast.error('Failed to delete API key')
      }
    } catch (error) {
      toast.error('Failed to delete API key')
    } finally {
      setLoading(prev => ({ ...prev, [keyId]: false }))
    }
  }

  const getKeyStatus = (key: ApiKey) => {
    if (!key.isActive) return { status: 'Inactive', color: 'bg-gray-500', textColor: 'text-gray-600' }
    if (key.expires && new Date(key.expires) < new Date()) return { status: 'Expired', color: 'bg-red-500', textColor: 'text-red-600' }
    return { status: 'Active', color: 'bg-green-500', textColor: 'text-green-600' }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRateLimitUsage = (key: ApiKey) => {
    const stats = key.usageStats
    if (!stats) return { daily: 0, hourly: 0, minute: 0 }

    return {
      daily: Math.min((stats.requestsToday / key.rateLimitPerDay) * 100, 100),
      hourly: Math.min((stats.requestsToday / key.rateLimitPerHour) * 100, 100), // Approximation
      minute: Math.min((stats.requestsToday / key.rateLimitPerMinute) * 100, 100) // Approximation
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">API Key Management</h2>
          <p className="text-muted-foreground text-lg">
            Manage your API keys, monitor usage, and configure access controls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <ApiKeyDialog onKeyCreated={onKeyCreated}>
            <Button size="lg" className="shadow-lg">
              <Key className="w-4 h-4 mr-2" />
              Create New Key
            </Button>
          </ApiKeyDialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                Search API Keys
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by name or key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="min-w-[150px]">
                <Label className="text-sm font-medium mb-2 block">Environment</Label>
                <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="PRODUCTION">Production</SelectItem>
                    <SelectItem value="SANDBOX">Sandbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[130px]">
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredKeys.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardContent className="p-12 text-center">
                <Key className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {apiKeys.length === 0 ? 'No API keys yet' : 'No keys match your filters'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {apiKeys.length === 0 
                    ? 'Create your first API key to start using Lynxa Pro AI'
                    : 'Try adjusting your search criteria or filters'
                  }
                </p>
                {apiKeys.length === 0 && (
                  <ApiKeyDialog onKeyCreated={onKeyCreated}>
                    <Button size="lg">
                      <Key className="w-4 h-4 mr-2" />
                      Create your first API key
                    </Button>
                  </ApiKeyDialog>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredKeys.map((key, index) => {
              const keyStatus = getKeyStatus(key)
              const rateLimitUsage = getRateLimitUsage(key)
              
              return (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 transition-all duration-200 ${
                    selectedKey === key.id ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-xl'
                  }`}>
                    <CardContent className="p-6">
                      {/* Main Key Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-3 h-3 rounded-full ${keyStatus.color} mt-2`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{key.name}</h3>
                              <Badge variant={key.environment === 'PRODUCTION' ? 'default' : 'secondary'}>
                                {key.environment}
                              </Badge>
                              <Badge variant="outline" className={keyStatus.textColor}>
                                {keyStatus.status}
                              </Badge>
                            </div>
                            
                            {/* API Key Display */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded border">
                                {showKeys[key.id] ? key.key : '•'.repeat(32)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleKeyVisibility(key.id)}
                              >
                                {showKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.key, key.name)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Key Metadata */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Created {formatDate(key.createdAt)}
                              </div>
                              {key.lastUsed && (
                                <div className="flex items-center gap-1">
                                  <Activity className="w-4 h-4" />
                                  Last used {formatDate(key.lastUsed)}
                                </div>
                              )}
                              {key.expires && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Expires {formatDate(key.expires)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedKey(selectedKey === key.id ? null : key.id)}
                          >
                            {selectedKey === key.id ? 'Hide Details' : 'View Details'}
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleKeyStatus(key.id, key.isActive)}
                              disabled={loading[key.id]}
                            >
                              {loading[key.id] ? (
                                <LoadingSpinner size="sm" />
                              ) : key.isActive ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteKey(key.id, key.name)}
                              disabled={loading[key.id]}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Usage Stats Preview */}
                      {key.usageStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-lg font-semibold text-blue-600">
                              {key.usageStats.requestsToday}
                            </div>
                            <div className="text-xs text-muted-foreground">Requests Today</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-lg font-semibold text-purple-600">
                              {(key.usageStats.tokensToday / 1000).toFixed(1)}K
                            </div>
                            <div className="text-xs text-muted-foreground">Tokens Today</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-lg font-semibold text-green-600">
                              {key.usageStats.successRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Success Rate</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-lg font-semibold text-orange-600">
                              {key.usageStats.avgResponseTime}ms
                            </div>
                            <div className="text-xs text-muted-foreground">Avg Response</div>
                          </div>
                        </div>
                      )}

                      {/* Rate Limit Indicators */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Daily Limit</span>
                            <span>{rateLimitUsage.daily.toFixed(0)}%</span>
                          </div>
                          <Progress value={rateLimitUsage.daily} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Hourly Limit</span>
                            <span>{rateLimitUsage.hourly.toFixed(0)}%</span>
                          </div>
                          <Progress value={rateLimitUsage.hourly} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Per Minute</span>
                            <span>{rateLimitUsage.minute.toFixed(0)}%</span>
                          </div>
                          <Progress value={rateLimitUsage.minute} className="h-2" />
                        </div>
                      </div>

                      {/* Detailed View */}
                      <AnimatePresence>
                        {selectedKey === key.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-6 pt-6 border-t"
                          >
                            <Tabs defaultValue="usage" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="usage">Usage Details</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                              </TabsList>

                              <TabsContent value="usage" className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm">Monthly Usage</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-3">
                                        <div className="flex justify-between">
                                          <span className="text-sm">Requests</span>
                                          <span className="font-medium">
                                            {key.usageStats?.requestsThisMonth || 0}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm">Tokens</span>
                                          <span className="font-medium">
                                            {key.usageStats?.tokensThisMonth || 0}
                                          </span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm">Rate Limits</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                          <span>Per Minute</span>
                                          <span>{key.rateLimitPerMinute}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Per Hour</span>
                                          <span>{key.rateLimitPerHour}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Per Day</span>
                                          <span>{key.rateLimitPerDay}</span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="settings" className="mt-4">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label className="text-sm font-medium">Active Status</Label>
                                      <p className="text-xs text-muted-foreground">
                                        Enable or disable this API key
                                      </p>
                                    </div>
                                    <Switch
                                      checked={key.isActive}
                                      onCheckedChange={() => toggleKeyStatus(key.id, key.isActive)}
                                      disabled={loading[key.id]}
                                    />
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="security" className="mt-4">
                                <div className="space-y-4">
                                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-start gap-3">
                                      <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                                      <div>
                                        <h4 className="font-medium text-amber-800 dark:text-amber-200">
                                          Security Best Practices
                                        </h4>
                                        <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                          <li>• Keep your API keys secure and never share them publicly</li>
                                          <li>• Rotate keys regularly for better security</li>
                                          <li>• Monitor usage for any suspicious activity</li>
                                          <li>• Use environment-specific keys for development vs production</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
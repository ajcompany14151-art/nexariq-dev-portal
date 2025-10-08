"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Globe, 
  Palette, 
  Database,
  CreditCard,
  Users,
  FileText,
  Download,
  Upload,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Zap,
  Activity,
  BarChart3,
  Settings as SettingsIcon,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface UserProfile {
  name: string
  email: string
  phone: string
  company: string
  role: string
  bio: string
  location: string
  website: string
  avatar: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  apiAlerts: boolean
  billingAlerts: boolean
  securityAlerts: boolean
  productUpdates: boolean
  weeklyReports: boolean
  monthlyReports: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number
  ipWhitelist: boolean
  apiKeyRotation: boolean
  loginAlerts: boolean
  dataEncryption: boolean
  auditLogs: boolean
}

interface ApiSettings {
  defaultModel: string
  rateLimit: number
  webhookUrl: string
  customHeaders: Record<string, string>
  responseFormat: string
  timeout: number
  retries: number
}

export function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    company: "",
    role: "Developer",
    bio: "",
    location: "",
    website: "",
    avatar: ""
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    apiAlerts: true,
    billingAlerts: true,
    securityAlerts: true,
    productUpdates: false,
    weeklyReports: false,
    monthlyReports: true
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 24,
    ipWhitelist: false,
    apiKeyRotation: false,
    loginAlerts: true,
    dataEncryption: true,
    auditLogs: true
  })

  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    defaultModel: "lynxa-pro",
    rateLimit: 1000,
    webhookUrl: "",
    customHeaders: {},
    responseFormat: "json",
    timeout: 30,
    retries: 3
  })

  const [apiKeys, setApiKeys] = useState([
    {
      id: "1",
      name: "Production Key",
      key: "sk-lynxa-pro-1234567890abcdef",
      createdAt: "2024-01-15",
      lastUsed: "2024-01-20",
      status: "active",
      usage: 1250
    },
    {
      id: "2",
      name: "Development Key",
      key: "sk-lynxa-pro-0987654321fedcba",
      createdAt: "2024-01-10",
      lastUsed: "2024-01-19",
      status: "active",
      usage: 450
    }
  ])

  const saveProfile = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const saveNotifications = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Notification settings updated!")
    } catch (error) {
      toast.error("Failed to update notification settings")
    } finally {
      setLoading(false)
    }
  }

  const saveSecurity = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Security settings updated!")
    } catch (error) {
      toast.error("Failed to update security settings")
    } finally {
      setLoading(false)
    }
  }

  const saveApiSettings = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("API settings updated!")
    } catch (error) {
      toast.error("Failed to update API settings")
    } finally {
      setLoading(false)
    }
  }

  const regenerateApiKey = async (keyId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("API key regenerated successfully!")
    } catch (error) {
      toast.error("Failed to regenerate API key")
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setApiKeys(prev => prev.filter(key => key.id !== keyId))
      toast.success("API key deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={profile.role}
                      onValueChange={(value) => setProfile(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">General Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Alert Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>API Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about API issues</p>
                      </div>
                      <Switch
                        checked={notifications.apiAlerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, apiAlerts: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Billing Alerts</Label>
                        <p className="text-sm text-muted-foreground">Receive billing notifications</p>
                      </div>
                      <Switch
                        checked={notifications.billingAlerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, billingAlerts: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">Important security notifications</p>
                      </div>
                      <Switch
                        checked={notifications.securityAlerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, securityAlerts: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Get weekly usage summaries</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Monthly Reports</Label>
                        <p className="text-sm text-muted-foreground">Get monthly usage summaries</p>
                      </div>
                      <Switch
                        checked={notifications.monthlyReports}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, monthlyReports: checked }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Product Updates</Label>
                        <p className="text-sm text-muted-foreground">New features and announcements</p>
                      </div>
                      <Switch
                        checked={notifications.productUpdates}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, productUpdates: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveNotifications} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Notifications
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Authentication</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        checked={security.twoFactorAuth}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorAuth: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Session Timeout (hours)</Label>
                        <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                      </div>
                      <Select
                        value={security.sessionTimeout.toString()}
                        onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1h</SelectItem>
                          <SelectItem value="6">6h</SelectItem>
                          <SelectItem value="24">24h</SelectItem>
                          <SelectItem value="168">7d</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Access Control</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>IP Whitelist</Label>
                        <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
                      </div>
                      <Switch
                        checked={security.ipWhitelist}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, ipWhitelist: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>API Key Rotation</Label>
                        <p className="text-sm text-muted-foreground">Automatically rotate API keys</p>
                      </div>
                      <Switch
                        checked={security.apiKeyRotation}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, apiKeyRotation: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Monitoring</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                      </div>
                      <Switch
                        checked={security.loginAlerts}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, loginAlerts: checked }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Encryption</Label>
                        <p className="text-sm text-muted-foreground">Encrypt sensitive data</p>
                      </div>
                      <Switch
                        checked={security.dataEncryption}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, dataEncryption: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Audit Logs</Label>
                        <p className="text-sm text-muted-foreground">Track all account activity</p>
                      </div>
                      <Switch
                        checked={security.auditLogs}
                        onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, auditLogs: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveSecurity} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Security Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Configure your API settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default Model</Label>
                      <Select
                        value={apiSettings.defaultModel}
                        onValueChange={(value) => setApiSettings(prev => ({ ...prev, defaultModel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lynxa-pro">Lynxa Pro</SelectItem>
                          <SelectItem value="lynxa-pro-turbo">Lynxa Pro Turbo</SelectItem>
                          <SelectItem value="lynxa-pro-lite">Lynxa Pro Lite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Rate Limit (requests/minute)</Label>
                      <Input
                        type="number"
                        value={apiSettings.rateLimit}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Timeout (seconds)</Label>
                      <Input
                        type="number"
                        value={apiSettings.timeout}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={apiSettings.webhookUrl}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://your-webhook-url.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Response Format</Label>
                      <Select
                        value={apiSettings.responseFormat}
                        onValueChange={(value) => setApiSettings(prev => ({ ...prev, responseFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Retry Attempts</Label>
                      <Input
                        type="number"
                        value={apiSettings.retries}
                        onChange={(e) => setApiSettings(prev => ({ ...prev, retries: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveApiSettings} disabled={loading}>
                    {loading ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save API Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for accessing the Lynxa Pro API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{apiKey.name}</h4>
                          <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>
                            {apiKey.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created: {apiKey.createdAt}</span>
                          <span>Last used: {apiKey.lastUsed}</span>
                          <span>Usage: {apiKey.usage} calls</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {showApiKey ? apiKey.key : `${apiKey.key.slice(0, 20)}...`}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => regenerateApiKey(apiKey.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteApiKey(apiKey.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Billing Management</h3>
                <p className="text-muted-foreground mb-4">
                  Billing and subscription management will be available soon.
                </p>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
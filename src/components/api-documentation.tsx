// src/components/api-documentation.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  Check,
  Code,
  BookOpen,
  Terminal,
  Zap,
  Lock,
  Globe,
  FileText,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Key,
  Clock,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { LYNXA_MODEL_NAMES, type LynxaModel } from "@/lib/lynxa";

export function ApiDocumentation() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExample = (language: string) => {
    
    switch (language) {
      case "curl":
        return `curl -X POST https://api.ajstudioz.dev/api/chat \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "lynxa-pro",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Explain the theory of relativity"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }'`;

      case "javascript":
        return `const response = await fetch('https://lynxa-pro-backend.vercel.app/api/lynxa', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'lynxa-pro',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.'
      },
      {
        role: 'user',
        content: 'Explain the theory of relativity'
      }
    ],
    temperature: 0.7,
    max_tokens: 1024
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`;

      case "python":
        return `import requests

response = requests.post(
    'https://lynxa-pro-backend.vercel.app/api/lynxa',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'lynxa-pro',
        'messages': [
            {
                'role': 'system',
                'content': 'You are a helpful assistant.'
            },
            {
                'role': 'user',
                'content': 'Explain the theory of relativity'
            }
        ],
        'temperature': 0.7,
        'max_tokens': 1024
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`;

      default:
        return "";
    }
  };

  const responseExample = `{
  "id": "resp_abc123def456",
  "object": "response",
  "status": "completed",
  "created_at": 1699876543,
  "model": "kimi",
  "output": [
    {
      "type": "message",
      "id": "msg_xyz789abc123",
      "status": "completed",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Hello! I'm Lynxa Pro, an advanced AI assistant developed by Nexariq (AJ STUDIOZ). I specialize in providing intelligent, accurate, and helpful responses across all domains of knowledge."
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 45,
    "output_tokens": 38,
    "total_tokens": 83
  },
  "metadata": {
    "user_id": "user_123",
    "model_provider": "groq",
    "response_time_ms": 450,
    "deployment": "vercel_cloud"
  }
}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">API Documentation</h2>
        <p className="text-muted-foreground text-lg">
          Complete guide to integrating with Lynxa Pro AI by Nexariq (AJ STUDIOZ)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1 px-2 pb-4">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
                  { id: "authentication", label: "Authentication", icon: Lock },
                  { id: "models", label: "Models", icon: Zap },
                  { id: "endpoints", label: "Endpoints", icon: Globe },
                  { id: "examples", label: "Examples", icon: Code },
                  { id: "errors", label: "Error Handling", icon: AlertCircle },
                  { id: "rate-limits", label: "Rate Limits", icon: Clock },
                  { id: "billing", label: "Billing", icon: TrendingUp }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === item.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-6">
              {/* Overview */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        API Overview
                      </CardTitle>
                      <CardDescription>
                        Welcome to the Nexariq Developer Portal API documentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Our API provides access to Lynxa Pro, an advanced AI assistant developed by Nexariq, a sub-brand of AJ STUDIOZ.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <Zap className="w-8 h-8 text-blue-600 mb-2" />
                          <h3 className="font-semibold">Advanced AI</h3>
                          <p className="text-sm text-muted-foreground">
                            Powered by cutting-edge language models with professional assistance
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <Lock className="w-8 h-8 text-green-600 mb-2" />
                          <h3 className="font-semibold">Secure</h3>
                          <p className="text-sm text-muted-foreground">
                            Enterprise-grade security with API key authentication
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                          <h3 className="font-semibold">Scalable</h3>
                          <p className="text-sm text-muted-foreground">
                            Built to handle production workloads with rate limiting
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg font-mono text-sm">
                          {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Authentication */}
              {activeSection === "authentication" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Authentication
                      </CardTitle>
                      <CardDescription>
                        Secure your API requests with authentication tokens
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <Key className="h-4 w-4" />
                        <AlertDescription>
                          All API requests require authentication using your API key in the Authorization header.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Header Format</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg font-mono text-sm">
                          Authorization: Bearer YOUR_API_KEY
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Example Request</h3>
                        <div className="relative">
                          <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{`curl -H "Authorization: Bearer nxq_1234567890abcdef" \\
     ${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/chat`}</code>
                          </pre>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(`curl -H "Authorization: Bearer nxq_1234567890abcdef" ${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/chat`)}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Keep your API keys secure! Never expose them in client-side code or public repositories.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Models */}
              {activeSection === "models" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Available Models
                      </CardTitle>
                      <CardDescription>
                        Choose from our collection of high-performance AI models
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {Object.entries(LYNXA_MODEL_NAMES).map(([key, model]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{model.name}</h3>
                              <div className="flex gap-2">
                                <Badge variant="secondary">{key}</Badge>
                                <Badge variant="outline">{model.maxTokens} tokens</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{model.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Endpoints */}
              {activeSection === "endpoints" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        API Endpoints
                      </CardTitle>
                      <CardDescription>
                        Available endpoints for interacting with AI models
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Chat Completions */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">POST</Badge>
                          <code className="font-mono">/api/lynxa</code>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create a chat completion using Lynxa Pro AI model
                        </p>

                        <h4 className="font-semibold mb-2">Request Parameters</h4>
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-3 gap-2 font-mono">
                            <span className="font-semibold">Parameter</span>
                            <span className="font-semibold">Type</span>
                            <span className="font-semibold">Description</span>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-3 gap-2">
                            <code>model</code>
                            <span>string</span>
                            <span>Model to use for completion</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <code>messages</code>
                            <span>array</span>
                            <span>Array of message objects</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <code>temperature</code>
                            <span>number</span>
                            <span>Sampling temperature (0-2)</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <code>max_tokens</code>
                            <span>number</span>
                            <span>Maximum tokens to generate</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <code>top_p</code>
                            <span>number</span>
                            <span>Nucleus sampling (0-1)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Examples */}
              {activeSection === "examples" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Code Examples
                      </CardTitle>
                      <CardDescription>
                        Ready-to-use code examples in popular languages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="curl" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="curl" className="space-y-4">
                          <div className="relative">
                            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
                              <code>{codeExample("curl")}</code>
                            </pre>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(codeExample("curl"))}
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="javascript" className="space-y-4">
                          <div className="relative">
                            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
                              <code>{codeExample("javascript")}</code>
                            </pre>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(codeExample("javascript"))}
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="python" className="space-y-4">
                          <div className="relative">
                            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
                              <code>{codeExample("python")}</code>
                            </pre>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(codeExample("python"))}
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Response Example</h3>
                        <div className="relative">
                          <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{responseExample}</code>
                          </pre>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(responseExample)}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Error Handling */}
              {activeSection === "errors" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Error Handling
                      </CardTitle>
                      <CardDescription>
                        Understanding and handling API errors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        {[
                          { code: 400, status: "Bad Request", description: "Invalid request parameters", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" },
                          { code: 401, status: "Unauthorized", description: "Invalid or missing API key", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
                          { code: 403, status: "Forbidden", description: "IP not whitelisted or insufficient permissions", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
                          { code: 429, status: "Too Many Requests", description: "Rate limit exceeded", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
                          { code: 500, status: "Internal Server Error", description: "Server error occurred", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" }
                        ].map((error) => (
                          <div key={error.code} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={error.color}>{error.code}</Badge>
                              <span className="font-semibold">{error.status}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{error.description}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Error Response Example</h3>
                        <div className="relative">
                          <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{`{
  "error": "Invalid API key",
  "message": "The provided API key is invalid or has expired",
  "code": 401
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Rate Limits */}
              {activeSection === "rate-limits" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Rate Limits
                      </CardTitle>
                      <CardDescription>
                        Understanding API usage limits and quotas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Rate limits are applied per API key and help ensure fair usage across all users.
                        </AlertDescription>
                      </Alert>

                      <div className="grid gap-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Default Limits</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Per minute:</span>
                              <Badge>60 requests</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Per hour:</span>
                              <Badge>1,000 requests</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Per day:</span>
                              <Badge>10,000 requests</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Response Headers</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Rate limit information is included in response headers:
                          </p>
                          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg font-mono text-sm">
                            <div>X-RateLimit-Limit: 60</div>
                            <div>X-RateLimit-Remaining: 59</div>
                            <div>X-RateLimit-Reset: 1640995200</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Billing */}
              {activeSection === "billing" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Billing & Usage
                      </CardTitle>
                      <CardDescription>
                        Understanding costs and tracking your usage
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Start with our free tier that includes 1,000 requests per month at no cost.
                        </AlertDescription>
                      </Alert>

                      <div className="grid gap-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Pricing Tiers</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <Badge variant="secondary">Free</Badge>
                                <span className="ml-2 text-sm">Up to 1,000 requests/month</span>
                              </div>
                              <span className="font-semibold">$0</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <Badge>Pro</Badge>
                                <span className="ml-2 text-sm">Up to 100,000 requests/month</span>
                              </div>
                              <span className="font-semibold">$29/month</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <Badge variant="outline">Enterprise</Badge>
                                <span className="ml-2 text-sm">Unlimited requests</span>
                              </div>
                              <span className="font-semibold">Custom</span>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Usage Tracking</h3>
                          <p className="text-sm text-muted-foreground">
                            Monitor your API usage in real-time through the analytics dashboard. Track:
                          </p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                            <li>Total requests made</li>
                            <li>Tokens consumed</li>
                            <li>Response times</li>
                            <li>Error rates</li>
                            <li>Usage by model</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
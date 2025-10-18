// src/components/corporate-api-docs.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  Copy, 
  Check, 
  BookOpen, 
  Zap, 
  Shield, 
  Clock, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface CodeExample {
  language: string;
  code: string;
  title: string;
}

interface EndpointExample {
  method: string;
  endpoint: string;
  description: string;
  examples: CodeExample[];
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: string;
  }>;
  responses: Array<{
    status: number;
    description: string;
    example: string;
  }>;
}

const API_ENDPOINTS: EndpointExample[] = [
  {
    method: "POST",
    endpoint: "/api/chat",
    description: "Create a chat completion with Lynxa Pro AI models",
    parameters: [
      {
        name: "model",
        type: "string",
        required: true,
        description: "The model to use for completion",
        example: "lynxa-pro"
      },
      {
        name: "messages",
        type: "array",
        required: true,
        description: "Array of message objects",
        example: '[{"role": "user", "content": "Hello!"}]'
      },
      {
        name: "temperature",
        type: "number",
        required: false,
        description: "Controls randomness (0.0 to 2.0)",
        example: "0.7"
      },
      {
        name: "max_tokens",
        type: "integer",
        required: false,
        description: "Maximum tokens in response",
        example: "1024"
      }
    ],
    examples: [
      {
        language: "curl",
        title: "cURL",
        code: `curl -X POST https://your-app.vercel.app/api/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "lynxa-pro",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }'`
      },
      {
        language: "javascript",
        title: "JavaScript",
        code: `const response = await fetch('https://your-app.vercel.app/api/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'lynxa-pro',
    messages: [
      { role: 'user', content: 'Explain quantum computing' }
    ],
    temperature: 0.7,
    max_tokens: 1024
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`
      },
      {
        language: "python",
        title: "Python",
        code: `import requests

response = requests.post(
    'https://your-app.vercel.app/api/chat',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'lynxa-pro',
        'messages': [
            {'role': 'user', 'content': 'Explain quantum computing'}
        ],
        'temperature': 0.7,
        'max_tokens': 1024
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`
      }
    ],
    responses: [
      {
        status: 200,
        description: "Successful response",
        example: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "lynxa-pro",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Quantum computing is a revolutionary computing paradigm..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}`
      },
      {
        status: 401,
        description: "Unauthorized - Invalid API key",
        example: `{
  "error": "Invalid API key",
  "message": "The provided API key is invalid or has expired"
}`
      },
      {
        status: 429,
        description: "Rate limit exceeded",
        example: `{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "resetTime": "2023-10-18T12:00:00Z"
}`
      }
    ]
  }
];

const MODELS = [
  {
    name: "lynxa-pro",
    description: "Most capable model, best for complex reasoning and creative tasks",
    contextWindow: "8,192 tokens",
    outputLength: "4,096 tokens",
    speed: "Fast",
    pricing: "$0.01 per 1K tokens"
  }
];

export function CorporateApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [selectedExample, setSelectedExample] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const currentEndpoint = API_ENDPOINTS[selectedEndpoint];
  const currentExample = currentEndpoint.examples[selectedExample];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Lynxa Pro API Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enterprise-grade AI API powered by Nexariq (AJ STUDIOZ). Build intelligent applications with lightning-fast inference.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            Ultra-fast inference
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Shield className="w-3 h-3 mr-1" />
            Enterprise security
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <BarChart3 className="w-3 h-3 mr-1" />
            Real-time analytics
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-600" />
                  Ultra-Fast Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Average response time under 500ms with our optimized infrastructure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Enterprise Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  SOC 2 compliant with encrypted data transmission and API key authentication.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Real-time Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive usage tracking, token consumption, and performance metrics.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get started with Lynxa Pro API in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Get API Key</h4>
                    <p className="text-sm text-muted-foreground">Sign up and generate your API key from the dashboard</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Make Request</h4>
                    <p className="text-sm text-muted-foreground">Send your first API request using any HTTP client</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Scale Up</h4>
                    <p className="text-sm text-muted-foreground">Monitor usage and scale with our enterprise features</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models */}
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Models</CardTitle>
              <CardDescription>Choose the right model for your use case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MODELS.map((model, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{model.name}</h3>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                      </div>
                      <Badge>Recommended</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Context Window:</span>
                        <br />
                        <span className="text-muted-foreground">{model.contextWindow}</span>
                      </div>
                      <div>
                        <span className="font-medium">Max Output:</span>
                        <br />
                        <span className="text-muted-foreground">{model.outputLength}</span>
                      </div>
                      <div>
                        <span className="font-medium">Speed:</span>
                        <br />
                        <span className="text-green-600">{model.speed}</span>
                      </div>
                      <div>
                        <span className="font-medium">Pricing:</span>
                        <br />
                        <span className="text-muted-foreground">{model.pricing}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints */}
        <TabsContent value="endpoints" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Endpoint List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {API_ENDPOINTS.map((endpoint, index) => (
                    <Button
                      key={index}
                      variant={selectedEndpoint === index ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedEndpoint(index)}
                    >
                      <Badge variant="outline" className="mr-2 text-xs">
                        {endpoint.method}
                      </Badge>
                      {endpoint.endpoint}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Endpoint Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{currentEndpoint.method}</Badge>
                    <code className="text-sm">{currentEndpoint.endpoint}</code>
                  </div>
                  <CardDescription>{currentEndpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Parameters */}
                  <div>
                    <h4 className="font-semibold mb-3">Parameters</h4>
                    <div className="space-y-3">
                      {currentEndpoint.parameters.map((param, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono">{param.name}</code>
                            <Badge variant={param.required ? "default" : "secondary"} className="text-xs">
                              {param.required ? "required" : "optional"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{param.type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{param.description}</p>
                          {param.example && (
                            <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block">
                              Example: {param.example}
                            </code>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Responses */}
                  <div>
                    <h4 className="font-semibold mb-3">Responses</h4>
                    <div className="space-y-3">
                      {currentEndpoint.responses.map((response, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={response.status === 200 ? "default" : "destructive"}>
                              {response.status}
                            </Badge>
                            <span className="text-sm">{response.description}</span>
                          </div>
                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                            <code>{response.example}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Examples */}
        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Language Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentEndpoint.examples.map((example, index) => (
                    <Button
                      key={index}
                      variant={selectedExample === index ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedExample(index)}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      {example.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Code Example */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{currentExample.title} Example</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(currentExample.code)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{currentExample.code}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Guides */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Complete guide to integrating Lynxa Pro API into your applications.
                </p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Learn about API key management, security best practices, and authentication.
                </p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Understanding rate limits, quotas, and how to optimize your usage.
                </p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Error Handling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Best practices for handling errors, retries, and failure scenarios.
                </p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
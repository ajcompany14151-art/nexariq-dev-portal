"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Copy, Check } from "lucide-react"
import { toast } from "sonner"

export function ApiPlayground() {
  const [request, setRequest] = useState({
    model: "lynxa-pro",
    max_tokens: "1024",
    stream: "false",
    messages: '[{"role": "user", "content": "Hey Lynxa, who are you?"}]'
  })
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setResponse("")

    try {
      const parsedMessages = JSON.parse(request.messages)
      
      const response = await fetch("https://lynxa-pro-backend.vercel.app/api/lynxa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer your-api-key-here"
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: parseInt(request.max_tokens),
          stream: request.stream === "true",
          messages: parsedMessages
        })
      })

      const data = await response.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(JSON.stringify({ error: "Failed to make request", details: error }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const generateCurlCommand = () => {
    return `curl -X POST https://lynxa-pro-backend.vercel.app/api/lynxa \\
  -H "Authorization: Bearer <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    model: request.model,
    max_tokens: parseInt(request.max_tokens),
    stream: request.stream === "true",
    messages: JSON.parse(request.messages)
  }, null, 2)}'`
  }

  const generateJavaScriptCode = () => {
    return `const response = await fetch('https://lynxa-pro-backend.vercel.app/api/lynxa', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <your-api-key>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: '${request.model}',
    max_tokens: ${request.max_tokens},
    stream: ${request.stream},
    messages: ${request.messages}
  })
});

const data = await response.json();
console.log(data);`
  }

  const generatePythonCode = () => {
    return `import requests

response = requests.post(
    'https://lynxa-pro-backend.vercel.app/api/lynxa',
    headers={
        'Authorization': 'Bearer <your-api-key>',
        'Content-Type': 'application/json'
    },
    json={
        'model': '${request.model}',
        'max_tokens': ${request.max_tokens},
        'stream': ${request.stream},
        'messages': ${request.messages}
    }
)

data = response.json()
print(data)`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Playground</CardTitle>
          <CardDescription>
            Test the Lynxa Pro API directly from your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={request.model} onValueChange={(value) => setRequest(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lynxa-pro">lynxa-pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  value={request.max_tokens}
                  onChange={(e) => setRequest(prev => ({ ...prev, max_tokens: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream">Stream</Label>
                <Select value={request.stream} onValueChange={(value) => setRequest(prev => ({ ...prev, stream: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">False</SelectItem>
                    <SelectItem value="true">True</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="messages">Messages (JSON)</Label>
                <Textarea
                  id="messages"
                  rows={6}
                  value={request.messages}
                  onChange={(e) => setRequest(prev => ({ ...prev, messages: e.target.value }))}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>

            {/* Response Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Response</Label>
                {response && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(response)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              <Textarea
                rows={12}
                value={response}
                readOnly
                className="font-mono text-sm"
                placeholder="Response will appear here..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>
            Copy and paste these code examples into your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curl" className="space-y-2">
              <div className="relative">
                <pre className="block p-4 bg-slate-100 dark:bg-slate-800 rounded text-sm overflow-x-auto">
                  <code>{generateCurlCommand()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateCurlCommand())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="javascript" className="space-y-2">
              <div className="relative">
                <pre className="block p-4 bg-slate-100 dark:bg-slate-800 rounded text-sm overflow-x-auto">
                  <code>{generateJavaScriptCode()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateJavaScriptCode())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="python" className="space-y-2">
              <div className="relative">
                <pre className="block p-4 bg-slate-100 dark:bg-slate-800 rounded text-sm overflow-x-auto">
                  <code>{generatePythonCode()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generatePythonCode())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
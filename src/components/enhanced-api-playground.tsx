// src/components/enhanced-api-playground.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LYNXA_MODEL_NAMES, type LynxaModel } from "@/lib/lynxa";
import { 
  Send, 
  Copy, 
  Check, 
  PlayCircle, 
  PauseCircle, 
  RotateCcw, 
  Download,
  Upload,
  Bot,
  User,
  Sparkles,
  Brain,
  Zap,
  MessageSquare,
  Code,
  FileText,
  Settings,
  Plus,
  Trash2,
  Save,
  Share2,
  History,
  Lightbulb,
  TrendingUp,
  Clock,
  Cpu,
  Key
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { TypingIndicator, LoadingSpinner } from "@/components/ui/loading";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokens?: number;
  model?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  settings: PlaygroundSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface PlaygroundSettings {
  model: LynxaModel;
  temperature: number;
  maxTokens: number;
  stream: boolean;
  systemPrompt: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  environment: string;
  isActive: boolean;
  lastUsed: string | null;
  createdAt: string;
  expires: string | null;
}

export function EnhancedApiPlayground() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<PlaygroundSettings>({
    model: "lynxa-pro",
    temperature: 0.7,
    maxTokens: 1024,
    stream: false,
    systemPrompt: "You are Lynxa Pro, an advanced AI assistant developed by Nexariq, a sub-brand of AJ STUDIOZ. Provide clear, accurate, and thoughtful responses."
  });
  const [activeTab, setActiveTab] = useState("chat");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (session) {
      fetchApiKeys();
    }
  }, [session]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
        if (data.length > 0 && !selectedApiKey) {
          setSelectedApiKey(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      toast.error("Failed to fetch API keys");
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      settings: { ...settings },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating || !selectedApiKey) {
      if (!selectedApiKey) {
        toast.error("Please select an API key");
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    if (!currentConversation) {
      createNewConversation();
    }

    const updatedConversation = {
      ...currentConversation!,
      messages: [...(currentConversation?.messages || []), userMessage],
      updatedAt: new Date()
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev => prev.map(conv => 
      conv.id === updatedConversation.id ? updatedConversation : conv
    ));

    setInputMessage("");
    setIsGenerating(true);

    try {
      // Find the selected API key
      const apiKey = apiKeys.find(k => k.id === selectedApiKey);
      if (!apiKey) {
        throw new Error("Selected API key not found");
      }

      // Prepare messages for API
      const messages = [
        ...(settings.systemPrompt ? [{ role: "system" as const, content: settings.systemPrompt }] : []),
        ...updatedConversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.key}`
        },
        body: JSON.stringify({
          model: settings.model,
          max_tokens: settings.maxTokens,
          temperature: settings.temperature,
          stream: settings.stream,
          messages
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        tokens: data.usage?.total_tokens,
        model: data.model
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date()
      };

      setCurrentConversation(finalConversation);
      setConversations(prev => prev.map(conv => 
        conv.id === finalConversation.id ? finalConversation : conv
      ));

      // Update the last used timestamp for the API key
      await fetch(`/api/keys/${selectedApiKey}/usage`, {
        method: "POST"
      });

    } catch (error) {
      console.error("API Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error while processing your request. Please check your connection and try again.",
        timestamp: new Date()
      };

      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage],
        updatedAt: new Date()
      };

      setCurrentConversation(errorConversation);
      setConversations(prev => prev.map(conv => 
        conv.id === errorConversation.id ? errorConversation : conv
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const exportConversation = () => {
    if (!currentConversation) return;
    
    const exportData = {
      conversation: currentConversation,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${currentConversation.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Conversation exported!");
  };

  const clearConversation = () => {
    if (!currentConversation) return;
    
    const clearedConversation = {
      ...currentConversation,
      messages: [],
      updatedAt: new Date()
    };
    
    setCurrentConversation(clearedConversation);
    setConversations(prev => prev.map(conv => 
      conv.id === clearedConversation.id ? clearedConversation : conv
    ));
  };

  const generateCodeExample = (language: string) => {
    const messages = currentConversation?.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || [];

    const apiKey = apiKeys.find(k => k.id === selectedApiKey);

    switch (language) {
      case "curl":
        return `curl -X POST https://lynxa-pro-backend.vercel.app/api/lynxa \\
  -H "Authorization: Bearer ${apiKey?.key || '<your-api-key>'}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    model: settings.model,
    max_tokens: settings.maxTokens,
    temperature: settings.temperature,
    messages
  }, null, 2)}'`
      
      case "javascript":
        return `const response = await fetch('https://lynxa-pro-backend.vercel.app/api/lynxa', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey?.key || '<your-api-key>'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: '${settings.model}',
    max_tokens: ${settings.maxTokens},
    temperature: ${settings.temperature},
    messages: ${JSON.stringify(messages)}
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`
      
      case "python":
        return `import requests

response = requests.post(
    'https://lynxa-pro-backend.vercel.app/api/lynxa',
    headers={
        'Authorization': 'Bearer ${apiKey?.key || '<your-api-key>'}',
        'Content-Type': 'application/json'
    },
    json={
        'model': '${settings.model}',
        'max_tokens': ${settings.maxTokens},
        'temperature': ${settings.temperature},
        'messages': ${JSON.stringify(messages)}
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`
      
      default:
        return ""
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar */}
      <div className="w-80 space-y-4">
        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button size="sm" onClick={createNewConversation}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-1 p-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversation?.id === conv.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setCurrentConversation(conv)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {conv.title || "New Conversation"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {conv.messages.length} messages
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* API Key Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Key className="w-4 h-4 mr-2" />
              API Key
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
              <SelectTrigger>
                <SelectValue placeholder="Select an API key" />
              </SelectTrigger>
              <SelectContent>
                {apiKeys.map((apiKey) => (
                  <SelectItem key={apiKey.id} value={apiKey.id}>
                    <div className="flex items-center">
                      <span>{apiKey.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {apiKey.environment}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {apiKeys.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                No API keys available. Create one in your profile.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>
            
            {currentConversation && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearConversation}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={exportConversation}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <CardTitle>Lynxa Pro Playground</CardTitle>
                  <Badge variant="secondary">
                    {LYNXA_MODEL_NAMES[settings.model]?.name || settings.model}
                  </Badge>
                  {selectedApiKey && (
                    <Badge variant="outline">
                      {apiKeys.find(k => k.id === selectedApiKey)?.name}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Powered by Nexariq (AJ STUDIOZ) - Advanced AI Technology
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {currentConversation?.messages.length === 0 ? (
                      <div className="text-center py-12">
                        <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                        <p className="text-muted-foreground">
                          Ask me anything! I'm here to help with your questions and tasks.
                        </p>
                      </div>
                    ) : (
                      currentConversation?.messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            {message.tokens && (
                              <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                                <Zap className="w-3 h-3" />
                                {message.tokens} tokens
                              </div>
                            )}
                          </div>
                          {message.role === "user" && (
                            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                    {isGenerating && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <Separator className="my-4" />
                
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isGenerating || !selectedApiKey}
                    className="self-end"
                  >
                    {isGenerating ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Model Settings</CardTitle>
                <CardDescription>
                  Configure the AI model behavior and parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select
                        value={settings.model}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(LYNXA_MODEL_NAMES).map(([key, model]) => (
                            <SelectItem key={key} value={key}>
                              <div className="space-y-1">
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-muted-foreground">{model.description}</div>
                                <div className="text-xs text-blue-600">Max tokens: {model.maxTokens}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Temperature: {settings.temperature}</Label>
                      <Slider
                        value={[settings.temperature]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, temperature: value }))}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls randomness: 0 = focused, 2 = creative
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Max Tokens: {settings.maxTokens}</Label>
                      <Slider
                        value={[settings.maxTokens]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, maxTokens: value }))}
                        max={4096}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum length of the response
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">


                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.stream}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, stream: checked }))}
                      />
                      <Label>Stream responses</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    rows={3}
                    placeholder="Set the behavior and personality of the AI assistant..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="mt-4">
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
                        <code>{generateCodeExample("curl")}</code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateCodeExample("curl"))}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="javascript" className="space-y-2">
                    <div className="relative">
                      <pre className="block p-4 bg-slate-100 dark:bg-slate-800 rounded text-sm overflow-x-auto">
                        <code>{generateCodeExample("javascript")}</code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateCodeExample("javascript"))}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="python" className="space-y-2">
                    <div className="relative">
                      <pre className="block p-4 bg-slate-100 dark:bg-slate-800 rounded text-sm overflow-x-auto">
                        <code>{generateCodeExample("python")}</code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateCodeExample("python"))}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

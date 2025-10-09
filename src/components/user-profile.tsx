// src/components/user-profile.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Key, 
  Calendar, 
  Clock, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Trash2,
  Plus,
  Shield,
  Zap,
  Activity
} from "lucide-react";
import { ApiKeyDialog } from "@/components/api-key-dialog";
import { toast } from "sonner";

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

export function UserProfile() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      toast.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchApiKeys();
    }
  }, [session]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
  };

  const toggleShowKey = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        toast.success("API key revoked successfully");
      } else {
        toast.error("Failed to revoke API key");
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
      toast.error("Failed to revoke API key");
    }
  };

  const refreshApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/keys/${keyId}/refresh`, {
        method: "POST"
      });
      
      if (response.ok) {
        const updatedKey = await response.json();
        setApiKeys(prev => prev.map(key => 
          key.id === keyId ? updatedKey : key
        ));
        toast.success("API key refreshed successfully");
      } else {
        toast.error("Failed to refresh API key");
      }
    } catch (error) {
      console.error("Error refreshing API key:", error);
      toast.error("Failed to refresh API key");
    }
  };

  const isExpired = (expires: string | null) => {
    if (!expires) return false;
    return new Date(expires) < new Date();
  };

  const formatLastUsed = (lastUsed: string | null) => {
    if (!lastUsed) return "Never";
    const date = new Date(lastUsed);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="text-lg">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{session?.user?.name || "User"}</CardTitle>
              <CardDescription>{session?.user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">API Keys</p>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Keys</p>
                <p className="text-2xl font-bold">{apiKeys.filter(k => k.isActive && !isExpired(k.expires)).length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Security Level</p>
                <p className="text-2xl font-bold">High</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Tab */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for accessing the Lynxa Pro AI model</CardDescription>
            </div>
            <ApiKeyDialog onKeyCreated={fetchApiKeys}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Key
              </Button>
            </ApiKeyDialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
              <p className="text-gray-500 mb-4">Create your first API key to start using the Lynxa Pro AI model</p>
              <ApiKeyDialog onKeyCreated={fetchApiKeys}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Key
                </Button>
              </ApiKeyDialog>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <Card key={apiKey.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{apiKey.name}</h3>
                            <Badge variant={apiKey.environment === "production" ? "default" : "secondary"}>
                              {apiKey.environment}
                            </Badge>
                            {apiKey.isActive && !isExpired(apiKey.expires) ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                {isExpired(apiKey.expires) ? "Expired" : "Inactive"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {showKey[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 10)}...`}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleShowKey(apiKey.id)}
                            >
                              {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Last used: {formatLastUsed(apiKey.lastUsed)}</span>
                            </div>
                            {apiKey.expires && (
                              <div className="flex items-center space-x-1">
                                <Zap className="h-3 w-3" />
                                <span>Expires: {new Date(apiKey.expires).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshApiKey(apiKey.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeApiKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

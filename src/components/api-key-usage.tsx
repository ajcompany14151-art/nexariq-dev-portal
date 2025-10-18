// src/components/api-key-usage.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Zap, 
  Shield, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface ApiKeyUsageProps {
  apiKeyId: string;
}

interface UsageData {
  usage: {
    minute: { current: number; limit: number; remaining: number };
    hour: { current: number; limit: number; remaining: number };
    day: { current: number; limit: number; remaining: number; tokensUsed: number };
    total: number;
  };
  limits: {
    rateLimitPerMinute: number;
    rateLimitPerHour: number;
    rateLimitPerDay: number;
  };
  status: {
    isActive: boolean;
    isExpired: boolean;
    lastUsed: string | null;
  };
}

export function ApiKeyUsage({ apiKeyId }: ApiKeyUsageProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      const response = await fetch(`/api/keys/${apiKeyId}/usage`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch usage data`);
      }
      
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error("Failed to fetch usage:", error);
      toast.error("Failed to load usage data");
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    
    // Refresh usage every 30 seconds
    const interval = setInterval(() => fetchUsage(), 30000);
    
    return () => clearInterval(interval);
  }, [apiKeyId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>API Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load usage data</p>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = () => {
    if (usage.status.isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (!usage.status.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>API Usage & Limits</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchUsage(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>
          Current usage against your configured rate limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-time Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Per Minute */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Per Minute</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usage.usage.minute.current}/{usage.usage.minute.limit}
              </span>
            </div>
            <Progress 
              value={(usage.usage.minute.current / usage.usage.minute.limit) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {usage.usage.minute.remaining} remaining
            </p>
          </div>

          {/* Per Hour */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Per Hour</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usage.usage.hour.current}/{usage.usage.hour.limit}
              </span>
            </div>
            <Progress 
              value={(usage.usage.hour.current / usage.usage.hour.limit) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {usage.usage.hour.remaining} remaining
            </p>
          </div>

          {/* Per Day */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Per Day</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {usage.usage.day.current}/{usage.usage.day.limit}
              </span>
            </div>
            <Progress 
              value={(usage.usage.day.current / usage.usage.day.limit) * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {usage.usage.day.remaining} remaining • {usage.usage.day.tokensUsed} tokens used
            </p>
          </div>
        </div>

        {/* Usage Warnings */}
        {(usage.usage.minute.current >= usage.usage.minute.limit * 0.9 ||
          usage.usage.hour.current >= usage.usage.hour.limit * 0.9 ||
          usage.usage.day.current >= usage.usage.day.limit * 0.9) && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Rate Limit Warning</p>
              <p className="text-yellow-700">
                You're approaching your rate limits. Consider upgrading your plan or optimizing your usage.
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm font-medium">Total API Calls</p>
            <p className="text-2xl font-bold text-blue-600">{usage.usage.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Last Used</p>
            <p className="text-sm text-muted-foreground">
              {usage.status.lastUsed 
                ? new Date(usage.status.lastUsed).toLocaleString()
                : "Never used"
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
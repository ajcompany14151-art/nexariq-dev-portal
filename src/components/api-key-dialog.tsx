// src/components/api-key-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, Eye, EyeOff, Shield, Zap, Clock } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyDialogProps {
  children: React.ReactNode;
  onKeyCreated?: () => void;
}

export function ApiKeyDialog({ children, onKeyCreated }: ApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    environment: "production",
    rateLimitPerMinute: 60,
    rateLimitPerHour: 1000,
    rateLimitPerDay: 10000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create API key");
      }

      const data = await response.json();
      setCreatedKey(data);
      onKeyCreated?.();
      toast.success("API key created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedKey(null);
    setFormData({
      name: "",
      environment: "production",
      rateLimitPerMinute: 60,
      rateLimitPerHour: 1000,
      rateLimitPerDay: 10000
    });
    setShowKey(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Nexariq API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access the Lynxa Pro AI model with custom rate limits
          </DialogDescription>
        </DialogHeader>
        
        {!createdKey ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  placeholder="My API Key"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select 
                  value={formData.environment} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Rate Limits</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateLimitPerMinute" className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Per Minute
                  </Label>
                  <Input
                    id="rateLimitPerMinute"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.rateLimitPerMinute}
                    onChange={(e) => setFormData(prev => ({ ...prev, rateLimitPerMinute: parseInt(e.target.value) || 60 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimitPerHour" className="flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Per Hour
                  </Label>
                  <Input
                    id="rateLimitPerHour"
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.rateLimitPerHour}
                    onChange={(e) => setFormData(prev => ({ ...prev, rateLimitPerHour: parseInt(e.target.value) || 1000 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimitPerDay" className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Per Day
                  </Label>
                  <Input
                    id="rateLimitPerDay"
                    type="number"
                    min="1"
                    max="100000"
                    value={formData.rateLimitPerDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, rateLimitPerDay: parseInt(e.target.value) || 10000 }))}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Key Information:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Format: nxq_xxxxxxxxxxxxxxxx</li>
                    <li>• Valid for 30 days from creation</li>
                    <li>• Can be revoked at any time</li>
                    <li>• Rate limits protect against abuse</li>
                    <li>• Works with Lynxa Pro AI model</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.name}>
                {loading ? "Generating..." : "Generate Key"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 font-mono text-sm bg-muted p-3 rounded-md">
                  {showKey ? createdKey.key : "•".repeat(createdKey.key.length)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey.key)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">Per Minute</p>
                <p className="text-lg font-semibold">{createdKey.rateLimitPerMinute}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Per Hour</p>
                <p className="text-lg font-semibold">{createdKey.rateLimitPerHour}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Per Day</p>
                <p className="text-lg font-semibold">{createdKey.rateLimitPerDay}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Save this API key securely. You won't be able to see it again after closing this dialog.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                <strong>Ready to use:</strong> Your key is now active and can be used with the Lynxa Pro API.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

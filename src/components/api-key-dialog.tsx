"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Key, Eye, EyeOff, Mail } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface ApiKeyDialogProps {
  children: React.ReactNode
  onKeyCreated?: () => void
}

export function ApiKeyDialog({ children, onKeyCreated }: ApiKeyDialogProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create API key")
      }

      const data = await response.json()
      setCreatedKey(data.key)
      onKeyCreated?.()
      toast.success("API key created successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to create API key")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("API key copied to clipboard!")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Nexariq API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access the Lynxa Pro AI model
          </DialogDescription>
        </DialogHeader>
        
        {!createdKey ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Must be a valid Gmail address. Keys expire in 30 days.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <Key className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Key Information:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Format: nxq_xxxxxxxxxxxxxxxx</li>
                    <li>• Valid for 30 days from creation</li>
                    <li>• Can be revoked at any time</li>
                    <li>• Works with Lynxa Pro AI model</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !email}>
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
                  {showKey ? createdKey : "•".repeat(createdKey.length)}
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
                  onClick={() => copyToClipboard(createdKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
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
                onClick={() => {
                  setOpen(false)
                  setCreatedKey(null)
                  setEmail("")
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
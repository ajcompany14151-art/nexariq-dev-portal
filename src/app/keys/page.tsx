"use client";

import { ApiKeyDialog } from "@/components/api-key-dialog";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

export default function KeysPage() {
  const handleKeyCreated = () => {
    // Refresh API keys or handle the creation
    console.log("API key created");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">API Keys</h2>
            <p className="text-muted-foreground text-lg">Manage your API keys and access tokens</p>
          </div>
          <ApiKeyDialog onKeyCreated={handleKeyCreated}>
            <Button size="lg" className="shadow-lg">
              <Key className="w-4 h-4 mr-2" />
              Create New Key
            </Button>
          </ApiKeyDialog>
        </div>
      </div>
    </div>
  );
}

// src/app/init/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function InitPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const initializeDatabase = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Initialize Database</CardTitle>
            <CardDescription className="text-blue-200">
              Set up the database schema for Nexariq
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-white">
              <p className="text-sm mb-4">
                This will create all the necessary tables and enums in your Neon database.
              </p>
            </div>
            
            {result && (
              <div className={`p-4 rounded-md ${
                result.success 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                <div className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <p className="text-sm">{result.message}</p>
                </div>
              </div>
            )}
            
            <Button 
              onClick={initializeDatabase} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize Database"
              )}
            </Button>
            
            {result?.success && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => window.location.href = "/"}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

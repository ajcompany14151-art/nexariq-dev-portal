"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Rocket, Chrome, Github, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      console.log("User is authenticated, redirecting to home");
      router.push("/");
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/", // Redirect to home page after sign-in
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // For demo, use Google sign-in
      await handleGoogleSignIn();
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Welcome to Nexariq</CardTitle>
              <CardDescription className="text-blue-200">
                Sign in to access the Lynxa Pro AI Developer Portal
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OAuth Providers */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={isLoading}
              >
                <Github className="w-4 h-4 mr-2" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="bg-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-blue-200">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-blue-200">
                Don't have an account?{" "}
                <Button variant="link" className="p-0 h-auto text-blue-300 hover:text-blue-200">
                  Sign up
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

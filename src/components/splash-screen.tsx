"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { devSignIn } from "@/components/dev-session-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Rocket, Cpu, Zap, Shield, Globe, Code, Users, BarChart3, ArrowRight, Mail, Lock, Github, Chrome } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function SplashScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const [devMode, setDevMode] = useState(false)
  
  // Development bypass function
  const handleDevBypass = async () => {
    if (process.env.NODE_ENV === 'development') {
      setIsLoading(true)
      try {
        const response = await fetch('/api/auth/dev-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'dev@nexariq.com', 
            name: 'Development User' 
          })
        })
        if (response.ok) {
          const result = await response.json()
          devSignIn(result.user)
        }
      } catch (error) {
        console.error('Dev bypass error:', error)
      }
      setIsLoading(false)
    }
  }

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      if (provider === "credentials") {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
        if (result?.ok) {
          router.push("/")
        }
      } else {
        await signIn(provider, { callbackUrl: "/" })
      }
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // src/components/splash-screen.tsx

// Update the handleGetStarted function
const handleGetStarted = () => {
  router.push("/signin");
};

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
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
                {/* Development Mode Button - Only show in dev */}
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    onClick={handleDevBypass}
                    disabled={isLoading}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Development Mode (Bypass Auth)
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => handleSignIn("google")}
                  disabled={isLoading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => handleSignIn("github")}
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-300/50"
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
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={() => handleSignIn("credentials")}
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
              </div>

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
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Logo and Brand */}
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Rocket className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
                Nexariq
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 mb-2">
                Developer Portal
              </p>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-2 text-sm">
                <Cpu className="w-4 h-4 mr-2" />
                Powered by Lynxa Pro AI
              </Badge>
            </motion.div>
          </div>

          {/* Hero Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              Experience the future of AI development with our enterprise-grade platform. 
              Build, test, and deploy intelligent applications powered by cutting-edge AI technology.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized AI responses with sub-second latency"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-grade encryption and compliance"
              },
              {
                icon: Globe,
                title: "Global Scale",
                description: "99.9% uptime with worldwide CDN"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <feature.icon className="w-8 h-8 text-blue-300 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-200 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="pt-8"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
              onClick={handleGetStarted}
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-blue-200 mt-4 text-sm">
              No credit card required • Free tier available
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex justify-center items-center space-x-8 text-blue-300 text-sm"
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>10,000+ Developers</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>1M+ API Calls</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>100+ Integrations</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

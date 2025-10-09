"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      console.log("User is authenticated, redirecting to /dashboard");
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsSignUpActive(!isSignUpActive);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, use Google sign-in for sign-up
    await handleGoogleSignIn();
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, use Google sign-in
    await handleGoogleSignIn();
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-montserrat">
      <style jsx>{`
        /* ... (your existing styles remain unchanged) ... */
        .container {
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
          position: relative;
          overflow: hidden;
          width: 768px;
          max-width: 100%;
          min-height: 480px;
        }
        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }
        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
        }
        .container.right-panel-active .sign-in-container {
          transform: translateX(100%);
        }
        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }
        .container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.6s;
        }
        @keyframes show {
          0%, 49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%, 100% {
            opacity: 1;
            z-index: 5;
          }
        }
        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s ease-in-out;
          z-index: 100;
        }
        .container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }
        .overlay {
          background: linear-gradient(to right, #ff4b2b, #ff416c);
          background-repeat: no-repeat;
          background-size: cover;
          background-position: 0 0;
          color: #ffffff;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }
        .container.right-panel-active .overlay {
          transform: translateX(50%);
        }
        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }
        .overlay-left {
          transform: translateX(-20%);
        }
        .container.right-panel-active .overlay-left {
          transform: translateX(0);
        }
        .overlay-right {
          right: 0;
          transform: translateX(0);
        }
        .container.right-panel-active .overlay-right {
          transform: translateX(20%);
        }
        .social-container a {
          border: 1px solid #dddddd;
          border-radius: 50%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          margin: 0 5px;
          height: 40px;
          width: 40px;
        }
      `}</style>
      <div className={`container ${isSignUpActive ? "right-panel-active" : ""}`}>
        <div className="form-container sign-up-container">
          <form onSubmit={handleEmailSignUp} className="flex flex-col items-center justify-center bg-white p-12 h-full text-center">
            <h1 className="font-bold text-2xl mb-4">Create Account</h1>
            <div className="social-container flex justify-center mb-5">
              <a href="#" onClick={handleGoogleSignIn} className="social text-gray-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.24 10.4V14h3.2c-.1.7-.5 1.4-1.1 1.9-.6.5-1.4.8-2.3.8-1.8 0-3.3-1.5-3.3-3.3s1.5-3.3 3.3-3.3c.9 0 1.7.4 2.3.9l2.3-2.3C15.5 7.2 14 6.5 12.2 6.5 9.3 6.5 6.9 8.9 6.9 12s2.4 5.5 5.3 5.5c1.5 0 2.8-.6 3.8-1.6 1-1 1.5-2.3 1.5-3.9h-4.9z"
                  />
                </svg>
              </a>
            </div>
            <span className="text-xs mb-5">or use your email for registration</span>
            <Input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="mb-2 bg-gray-200 border-none p-3 w-full"
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="mb-2 bg-gray-200 border-none p-3 w-full"
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="mb-2 bg-gray-200 border-none p-3 w-full"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 rounded-full border border-[#FF4B2B] bg-[#FF4B2B] text-white uppercase px-12 py-3 font-bold transition-transform hover:scale-95"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form onSubmit={handleEmailSignIn} className="flex flex-col items-center justify-center bg-white p-12 h-full text-center">
            <h1 className="font-bold text-2xl mb-4">Sign In</h1>
            <div className="social-container flex justify-center mb-5">
              <a href="#" onClick={handleGoogleSignIn} className="social text-gray-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.24 10.4V14h3.2c-.1.7-.5 1.4-1.1 1.9-.6.5-1.4.8-2.3.8-1.8 0-3.3-1.5-3.3-3.3s1.5-3.3 3.3-3.3c.9 0 1.7.4 2.3.9l2.3-2.3C15.5 7.2 14 6.5 12.2 6.5 9.3 6.5 6.9 8.9 6.9 12s2.4 5.5 5.3 5.5c1.5 0 2.8-.6 3.8-1.6 1-1 1.5-2.3 1.5-3.9h-4.9z"
                  />
                </svg>
              </a>
            </div>
            <span className="text-xs mb-5">or use your account</span>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="mb-2 bg-gray-200 border-none p-3 w-full"
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="mb-2 bg-gray-200 border-none p-3 w-full"
            />
            <a href="#" className="text-sm text-gray-600 mb-5">Forgot your password?</a>
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 rounded-full border border-[#FF4B2B] bg-[#FF4B2B] text-white uppercase px-12 py-3 font-bold transition-transform hover:scale-95"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="font-bold text-2xl mb-4">Welcome Back!</h1>
              <p className="text-sm mb-5">To keep connected with us please login with your personal info</p>
              <Button
                onClick={handleToggle}
                className="ghost rounded-full border border-white bg-transparent text-white uppercase px-12 py-3 font-bold transition-transform hover:scale-95"
              >
                Sign In
              </Button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="font-bold text-2xl mb-4">Hello, Friend!</h1>
              <p className="text-sm mb-5">Enter your personal details and start your journey with us</p>
              <Button
                onClick={handleToggle}
                className="ghost rounded-full border border-white bg-transparent text-white uppercase px-12 py-3 font-bold transition-transform hover:scale-95"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

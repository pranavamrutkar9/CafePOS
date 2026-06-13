"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, signup } = useAuth();
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  // Signup State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await login({ email: loginEmail, password: loginPassword });
      router.push("/pos");
    } catch (err: any) {
      setLoginError(err.response?.data?.message || err.message || "Invalid credentials");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    try {
      await signup({ name: signupName, email: signupEmail, password: signupPassword });
      router.push("/pos");
    } catch (err: any) {
      setSignupError(err.response?.data?.message || err.message || "Error creating account");
    }
  };

  return (
    <div className="flex min-h-screen bg-cafe-bg items-center justify-center p-8 gap-8 flex-col lg:flex-row">
      {pathname === "/login" && (
        <div className="w-full max-w-md bg-cafe-card rounded-xl shadow-lg p-8 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-bold text-cafe-text mb-8 text-center">Login</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#1e1e1e] text-cafe-text focus:ring-2 focus:ring-cafe-primary focus:border-cafe-primary outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
              </div>
              <div className="relative">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#1e1e1e] text-cafe-text focus:ring-2 focus:ring-cafe-primary focus:border-cafe-primary outline-none transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {loginError && <p className="text-cafe-danger text-sm mt-2">{loginError}</p>}
            </div>

            <button 
              type="submit"
              className="w-full bg-cafe-primary hover:bg-cafe-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Log In
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-cafe-primary font-semibold hover:underline">
              Sign Up here
            </Link>
          </div>
        </div>
      )}

      {pathname === "/signup" && (
        <div className="w-full max-w-md bg-cafe-card rounded-xl shadow-lg p-8 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl font-bold text-cafe-text mb-8 text-center">Create an Account</h2>
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#1e1e1e] text-cafe-text focus:ring-2 focus:ring-cafe-primary focus:border-cafe-primary outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#1e1e1e] text-cafe-text focus:ring-2 focus:ring-cafe-primary focus:border-cafe-primary outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showSignupPassword ? "text" : "password"} 
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#1e1e1e] text-cafe-text focus:ring-2 focus:ring-cafe-primary focus:border-cafe-primary outline-none transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {signupError && <p className="text-cafe-danger text-sm mt-2">{signupError}</p>}
            </div>

            <button 
              type="submit"
              className="w-full bg-cafe-primary hover:bg-cafe-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-cafe-primary font-semibold hover:underline">
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

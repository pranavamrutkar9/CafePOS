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
    <div className="flex min-h-screen bg-[#faf8f5] items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Organic soft background accent glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#c86a50]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#d99c4c]/5 blur-[120px] pointer-events-none" />
      
      {pathname === "/login" && (
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#efece7] shadow-xl shadow-[#e0dbd3]/20 p-8 sm:p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 z-10 before:absolute before:inset-2 before:border before:border-[#fbfaf8] before:rounded-[2rem] before:pointer-events-none">
          <div className="flex justify-start mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#c86a50]/10 to-[#d99c4c]/5 rounded-2xl flex items-center justify-center overflow-hidden border border-[#efece7] shadow-sm">
               <div className="text-2xl animate-bounce">👨‍🍳</div>
            </div>
          </div>
          
          <h2 className="text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Welcome back to</h2>
          <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-[#2c2623]">
            <span>Joy</span><span className="text-[#c86a50]">Food</span>
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Email</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl paper-input placeholder-[#a09690] text-sm"
                placeholder="chef@joyfood.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl paper-input placeholder-[#a09690] text-sm pr-12"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e827b] hover:text-[#2c2623] transition-colors"
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {loginError && <p className="text-cafe-danger text-sm mt-2 ml-2 font-medium">{loginError}</p>}
            </div>

            <div className="flex items-center justify-between px-1 mt-6">
              <label className="flex items-center text-sm text-[#8e827b] cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none w-4 h-4 border border-[#e6e1da] rounded bg-[#faf8f5] checked:bg-[#c86a50] checked:border-[#c86a50] focus:outline-none transition-all mr-2" />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-[2px] top-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="group-hover:text-[#2c2623] transition-colors ml-1">Remember me</span>
              </label>
              <Link href="#" className="text-sm font-semibold text-[#c86a50] hover:text-[#b3563d] transition-colors">
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                className="w-full btn-terracotta text-white font-bold py-3.5 px-4 rounded-2xl text-sm cursor-pointer shadow-md"
              >
                Log in
              </button>
            </div>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#efece7]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-4 bg-white text-[#8e827b]">Or sign in with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center py-3 px-4 rounded-2xl border border-[#efece7] bg-[#faf8f5] hover:bg-[#efece7] text-[#2c2623] transition-all group font-semibold text-xs cursor-pointer">
                <svg className="w-5 h-5 mr-2 text-[#1877F2] group-hover:scale-105 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook</span>
              </button>
              <button type="button" className="flex items-center justify-center py-3 px-4 rounded-2xl border border-[#efece7] bg-[#faf8f5] hover:bg-[#efece7] text-[#2c2623] transition-all group font-semibold text-xs cursor-pointer">
                <svg className="w-5 h-5 mr-2 group-hover:scale-105 transition-transform" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span>Google</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-[#8e827b]">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#c86a50] font-semibold hover:text-[#b3563d] transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      )}

      {pathname === "/signup" && (
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#efece7] shadow-xl shadow-[#e0dbd3]/20 p-8 sm:p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 z-10 before:absolute before:inset-2 before:border before:border-[#fbfaf8] before:rounded-[2rem] before:pointer-events-none">
          <div className="flex justify-start mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#c86a50]/10 to-[#d99c4c]/5 rounded-2xl flex items-center justify-center overflow-hidden border border-[#efece7] shadow-sm">
               <div className="text-2xl animate-bounce">👨‍🍳</div>
            </div>
          </div>
          
          <h2 className="text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Create account for</h2>
          <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-[#2c2623]">
            <span>Joy</span><span className="text-[#c86a50]">Food</span>
          </h1>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl paper-input placeholder-[#a09690] text-sm"
                placeholder="Chef Joy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Email</label>
              <input 
                type="email" 
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl paper-input placeholder-[#a09690] text-sm"
                placeholder="chef@joyfood.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showSignupPassword ? "text" : "password"} 
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl paper-input placeholder-[#a09690] text-sm pr-12"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e827b] hover:text-[#2c2623] transition-colors"
                >
                  {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {signupError && <p className="text-cafe-danger text-sm mt-2 ml-2 font-medium">{signupError}</p>}
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full btn-terracotta text-white font-bold py-3.5 px-4 rounded-2xl text-sm cursor-pointer shadow-md"
              >
                Sign up
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-[#8e827b]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#c86a50] font-semibold hover:text-[#b3563d] transition-colors">
              Log in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


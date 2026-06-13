"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Eye, EyeOff, Coffee, Check, DollarSign, LogIn, UserPlus, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, signup } = useAuth();
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Signup Form State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Session Open Modal State
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);

  const handleAuthSuccess = async () => {
    try {
      // Verify if there is an active session
      const session = await apiClient.get('/sessions/current');
      if (session && session.status === 'OPEN') {
        router.push("/pos");
      } else {
        setSessionModalOpen(true);
      }
    } catch (err) {
      // Fallback: If current session call fails or 404s, just proceed to POS
      router.push("/pos");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      await handleAuthSuccess();
    } catch (err: any) {
      setLoginError(err.response?.data?.message || err.message || "Invalid credentials");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);
    try {
      await signup({ name: signupName, email: signupEmail, password: signupPassword });
      await handleAuthSuccess();
    } catch (err: any) {
      setSignupError(err.response?.data?.message || err.message || "Error creating account");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSessionLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const employeeId = user?.id || "";

      await apiClient.post('/sessions/open', {
        employeeId,
        openingCash: parseFloat(openingCash) || 0
      });
    } catch (err) {
      // Bypassed: ignore 501 or server errors and push to POS anyway
      console.warn("Session opening call returned:", err);
    } finally {
      setSessionLoading(false);
      setSessionModalOpen(false);
      router.push("/pos");
    }
  };

  const isLogin = pathname === "/login";

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] overflow-hidden relative font-sans">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#C86A50]/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#D99C4C]/5 blur-[130px] pointer-events-none" />

      {/* Two-Column Container */}
      <div className="w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Left Column: Visual Side Panel (Cozy Cafe Vibe) */}
        <div className="w-full md:w-[45%] bg-[#251A15] p-8 md:p-16 flex flex-col justify-between relative text-white overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#3E251C] to-[#1A110D] opacity-90 z-0" />
          
          {/* Coffee beans ambient pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] z-0 bg-[radial-gradient(#FAF8F5_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Coffee size={20} className="text-[#E89E78]" />
            </div>
            <span className="font-extrabold text-lg tracking-wider uppercase">JoyFood</span>
          </div>

          <div className="relative z-10 my-auto py-12 md:py-0">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Smart Checkout,<br/>
              <span className="text-[#E89E78]">Joyful Dining.</span>
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-sm">
              Manage your orders, payments, tables, and real-time kitchen displays from a single premium POS interface.
            </p>

            {/* Glassmorphic Dummy Stats Card */}
            <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xs animate-pulse">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-white/50">Current POS Load</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Optimal</span>
              </div>
              <div className="text-2xl font-bold mb-1">98.5%</div>
              <div className="text-xs text-white/40">Checkout performance rate today</div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-white/40 flex justify-between">
            <span>© 2026 JoyFood Systems</span>
            <span>v1.0.2</span>
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div className="flex-1 flex items-center justify-center p-8 sm:p-16 relative z-10">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#efece7] shadow-xl shadow-[#e0dbd3]/25 p-8 sm:p-10 relative overflow-hidden before:absolute before:inset-2 before:border before:border-[#fbfaf8] before:rounded-[2rem] before:pointer-events-none">
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#c86a50]/15 to-[#d99c4c]/5 rounded-xl flex items-center justify-center overflow-hidden border border-[#efece7]">
                <span className="text-xl">🍳</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#8e827b] tracking-widest bg-[#FAF8F5] border border-[#efece7] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles size={10} className="text-[#c86a50] animate-spin" />
                POS Core v1
              </span>
            </div>

            {isLogin ? (
              // LOGIN FORM
              <div>
                <h2 className="text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Welcome back to the terminal</h2>
                <h1 className="text-3xl font-black mb-8 tracking-tight text-[#2c2623]">
                  <span>Sign </span><span className="text-[#c86a50]">In</span>
                </h1>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Email / Username</label>
                    <input 
                      type="email" 
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#faf8f5] border border-[#efece7] text-[#2c2623] focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all text-sm placeholder-[#a09690]"
                      placeholder="chef@joyfood.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showLoginPassword ? "text" : "password"} 
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-2xl bg-[#faf8f5] border border-[#efece7] text-[#2c2623] focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all text-sm pr-12 placeholder-[#a09690]"
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
                    {loginError && <p className="text-red-500 text-xs mt-2 ml-1 font-semibold">{loginError}</p>}
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-[#c86a50] hover:bg-[#b3563d] text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn size={16} />
                      {loginLoading ? "Verifying..." : "Log in"}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center text-sm text-[#8e827b]">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-[#c86a50] font-semibold hover:text-[#b3563d] transition-colors">
                    Sign Up here
                  </Link>
                </div>
              </div>
            ) : (
              // SIGNUP FORM
              <div>
                <h2 className="text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Create your terminal credentials</h2>
                <h1 className="text-3xl font-black mb-8 tracking-tight text-[#2c2623]">
                  <span>Sign </span><span className="text-[#c86a50]">Up</span>
                </h1>

                <form onSubmit={handleSignup} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#faf8f5] border border-[#efece7] text-[#2c2623] focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all text-sm placeholder-[#a09690]"
                      placeholder="Chef Joy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Email / Username</label>
                    <input 
                      type="email" 
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#faf8f5] border border-[#efece7] text-[#2c2623] focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all text-sm placeholder-[#a09690]"
                      placeholder="chef@joyfood.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showSignupPassword ? "text" : "password"} 
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-2xl bg-[#faf8f5] border border-[#efece7] text-[#2c2623] focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all text-sm pr-12 placeholder-[#a09690]"
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
                    {signupError && <p className="text-red-500 text-xs mt-2 ml-1 font-semibold">{signupError}</p>}
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={signupLoading}
                      className="w-full bg-[#c86a50] hover:bg-[#b3563d] text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} />
                      {signupLoading ? "Registering..." : "Sign Up"}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center text-sm text-[#8e827b]">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#c86a50] font-semibold hover:text-[#b3563d] transition-colors">
                    Login here
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Open Modal */}
      {sessionModalOpen && (
        <div className="fixed inset-0 bg-[#251A15]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-[#efece7] shadow-2xl w-full max-w-md p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <DollarSign className="text-emerald-500" size={24} />
            </div>

            <h2 className="text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1">Cash Register Initialization</h2>
            <h1 className="text-2xl font-black mb-4 tracking-tight text-[#2c2623]">Open New Session</h1>
            
            <p className="text-sm text-[#8e827b] leading-relaxed mb-6">
              Enter the starting amount of cash currently in the drawer to open a new sales session.
            </p>

            <form onSubmit={handleOpenSession} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#8e827b] uppercase tracking-wider mb-1.5 ml-1">Opening Cash (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e827b] font-bold text-sm">₹</span>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    className="w-full px-8 py-3.5 rounded-2xl bg-[#faf8f5] border border-[#efece7] text-[#2c2623] focus:outline-none focus:border-[#c86a50] focus:ring-1 focus:ring-[#c86a50]/20 transition-all font-bold text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="submit"
                  disabled={sessionLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {sessionLoading ? "Opening..." : "Open Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

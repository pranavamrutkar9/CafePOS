"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Eye, EyeOff, Coffee, Check, DollarSign, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, signup } = useAuth();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);

  const handleAuthSuccess = async () => {
    try {
      const session = await apiClient.get("/sessions/current");
      if (session && session.status === "OPEN") {
        router.push("/pos");
      } else {
        setSessionModalOpen(true);
      }
    } catch {
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
      await apiClient.post("/sessions/open", {
        employeeId: user?.id || "",
        openingCash: parseFloat(openingCash) || 0,
      });
    } catch (err) {
      console.warn("Session opening call returned:", err);
    } finally {
      setSessionLoading(false);
      setSessionModalOpen(false);
      router.push("/pos");
    }
  };

  const isLogin = pathname === "/login";

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "var(--espresso-900)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Form Card */}
      <div
        className="relative w-full z-10"
        style={{
          maxWidth: 420,
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--espresso-900)" }}
          >
            <Coffee size={20} style={{ color: "var(--accent-500)" }} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-lg)",
              color: "var(--text-primary)",
            }}
          >
            Cafe POS
          </span>
        </div>

        {isLogin ? (
          <div>
            <h1
              className="mb-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-2xl)",
                color: "var(--text-primary)",
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-8)" }}>
              Sign in to continue to your POS terminal
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="form-input"
                  placeholder="chef@cafe.com"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingRight: 44 }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginError && (
                  <p style={{ color: "var(--status-danger)", fontSize: "var(--text-xs)", marginTop: 6 }}>
                    {loginError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full justify-center"
                style={{ marginTop: "var(--space-4)", height: 44 }}
              >
                <LogIn size={16} />
                {loginLoading ? "Signing in…" : "Log in"}
              </button>
            </form>

            <p
              className="text-center mt-6"
              style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                style={{ color: "var(--accent-700)", fontWeight: 600 }}
                className="hover:underline"
              >
                Sign Up here
              </Link>
            </p>
          </div>
        ) : (
          <div>
            <h1
              className="mb-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-2xl)",
                color: "var(--text-primary)",
              }}
            >
              Create Account
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-8)" }}>
              Set up your POS terminal credentials
            </p>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="form-input"
                  placeholder="Chef Joy"
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="form-input"
                  placeholder="chef@cafe.com"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingRight: 44 }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupError && (
                  <p style={{ color: "var(--status-danger)", fontSize: "var(--text-xs)", marginTop: 6 }}>
                    {signupError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="btn-primary w-full justify-center"
                style={{ marginTop: "var(--space-4)", height: 44 }}
              >
                <UserPlus size={16} />
                {signupLoading ? "Creating account…" : "Sign Up"}
              </button>
            </form>

            <p
              className="text-center mt-6"
              style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                style={{ color: "var(--accent-700)", fontWeight: 600 }}
                className="hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Session Open Modal */}
      {sessionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(42,24,16,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full"
            style={{
              maxWidth: 420,
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-8)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "var(--status-success-bg)" }}
            >
              <DollarSign size={22} style={{ color: "var(--status-success)" }} />
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-xl)",
                color: "var(--text-primary)",
                marginBottom: "var(--space-2)",
              }}
            >
              Open New Session
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
              Enter the opening cash amount in the drawer to begin a new sales session.
            </p>

            <form onSubmit={handleOpenSession} className="space-y-5">
              <div>
                <label className="form-label">Opening Cash (₹)</label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold"
                    style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    className="form-input font-mono-num"
                    style={{ paddingLeft: 28 }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sessionLoading}
                className="btn-primary w-full justify-center"
                style={{ height: 44 }}
              >
                <Check size={16} />
                {sessionLoading ? "Opening…" : "Open Session"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

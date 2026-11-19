"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Lock, Mail, Music2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setEmail("producer@soundforge.app");
    setPassword("soundforge123");

    try {
      // In demo mode, sign in directly or proceed to dashboard
      const res = await signIn("credentials", {
        email: "producer@soundforge.app",
        password: "soundforge123",
        redirect: false,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-card border border-cardBorder rounded-3xl p-8 shadow-2xl relative">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-black text-lg shadow-lg shadow-primary/20">
              SF
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Sound<span className="text-primary">Forge</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Sign in to your Studio
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Access your multi-track audio projects and recordings.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-text-dim" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="producer@soundforge.app"
                className="w-full bg-surface border border-cardBorder rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-text-dim focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-muted">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-text-dim" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-cardBorder rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-text-dim focus:border-primary outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-6 pt-6 border-t border-cardBorder/60">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-surface hover:bg-surfaceHover text-white text-xs font-semibold border border-cardBorder transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>1-Click Instant Demo Studio Access</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}

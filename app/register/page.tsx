"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/actions/project-actions";
import { ArrowRight, AlertCircle, Lock, Mail, User, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const res = await registerUserAction(formData);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Automatically sign in the newly registered user
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
            Create your Artist Account
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Produce, record, and export tracks in minutes.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1.5">
              Producer Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-text-dim" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivers"
                className="w-full bg-surface border border-cardBorder rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-text-dim focus:border-primary outline-none"
              />
            </div>
          </div>

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
                placeholder="alex@soundforge.app"
                className="w-full bg-surface border border-cardBorder rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-text-dim focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-text-dim" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-surface border border-cardBorder rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-text-dim focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-text-dim" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-surface border border-cardBorder rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-text-dim focus:border-primary outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Creating Account..." : "Create Free Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

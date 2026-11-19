"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/project-actions";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await forgotPasswordAction(email);
      if (res?.error) {
        setStatus({ type: "error", message: res.error });
      } else {
        setStatus({
          type: "success",
          message:
            res?.message ||
            "If an account exists for this email, password reset instructions have been sent.",
        });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-card border border-cardBorder rounded-3xl p-8 shadow-2xl relative">
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
            Reset Your Password
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {status && (
          <div
            className={`mb-6 p-3.5 rounded-xl flex items-start gap-2.5 text-xs ${
              status.type === "success"
                ? "bg-primary/10 border border-primary/40 text-primary"
                : "bg-red-500/10 border border-red-500/40 text-red-400"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{status.message}</span>
          </div>
        )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Sending link..." : "Send Reset Link"}</span>
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-xs text-text-muted hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

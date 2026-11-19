"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Sliders,
  Download,
  Play,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  HardDrive,
  Radio,
  FileAudio,
} from "lucide-react";

export default function LandingPage() {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text selection:bg-primary selection:text-black">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-cardBorder">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-black font-black text-base shadow-lg shadow-primary/25">
              SF
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Sound<span className="text-primary">Forge</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-text-muted">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Studio Preview
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-white hover:bg-surface transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-cardBorder text-white hover:bg-surfaceHover transition-colors"
            >
              Register
            </Link>
            <Link
              href="/studio/demo-project-1"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-black shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Ambient radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-cardBorder text-xs text-text-muted font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>SoundForge DAW MVP • Web Audio Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Simplified Music Production. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-300 to-accent-blue">
              Directly in Your Browser.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-text-muted leading-relaxed">
            Record vocal and instrumental takes, arrange multi-track audio clips,
            fine-tune stereo panning and levels, and export final broadcast-quality
            mixdowns — with zero latency and zero software installs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/studio/demo-project-1"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-black font-extrabold text-sm shadow-xl shadow-primary/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Studio</span>
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-card hover:bg-surface border border-cardBorder text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-xs text-text-dim">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" /> Zero Audio Drift
            </span>
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-accent-blue" /> 16-Bit WAV Recording
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-accent-purple" /> WAV & MP3 Export
            </span>
          </div>
        </div>
      </section>

      {/* Studio Preview / Screenshot Mock Section */}
      <section id="preview" className="py-12 px-6 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-cardBorder bg-card shadow-2xl overflow-hidden">
          {/* Mock Window Title Bar */}
          <div className="h-10 bg-surface border-b border-cardBorder px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-[11px] font-mono text-text-dim ml-2">
                SoundForge Studio — Neon Sunrise (Demo) — 124 BPM
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                Master 44.1kHz
              </span>
            </div>
          </div>

          {/* Mock DAW Viewport */}
          <div className="p-4 bg-daw-grid space-y-3">
            {/* Mock Transport bar */}
            <div className="h-12 bg-card border border-cardBorder rounded-xl px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                  className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold pl-0.5 shadow-md shadow-primary/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
                <div className="bg-surface px-3 py-1 rounded border border-cardBorder font-mono text-xs font-bold text-primary">
                  00:14.2
                </div>
                <div className="bg-surface px-2.5 py-1 rounded border border-cardBorder font-mono text-xs text-text-muted">
                  124 BPM
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-dim">Master Level</span>
                <div className="w-24 h-2 bg-surface rounded-full overflow-hidden border border-cardBorder">
                  <div className="w-3/4 h-full bg-primary" />
                </div>
              </div>
            </div>

            {/* Mock Multi-track Timeline */}
            <div className="space-y-2">
              {/* Track 1 */}
              <div className="h-16 bg-card border border-cardBorder rounded-xl flex items-center overflow-hidden">
                <div className="w-44 h-full bg-surface border-r border-cardBorder p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-white">Lead Synth</span>
                  </div>
                  <div className="flex gap-1 text-[9px] font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-cardBorder text-white">M</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary">S</span>
                    <span className="text-text-dim font-mono ml-auto">Vol: 85%</span>
                  </div>
                </div>
                <div className="flex-1 h-full p-1.5 relative flex items-center">
                  <div className="w-3/5 h-12 bg-emerald-950/60 border border-primary/50 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-[10px] text-primary font-bold">Synth Riff Take 1</span>
                    <div className="h-4 flex items-end gap-1 opacity-70">
                      {[...Array(32)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary rounded-t"
                          style={{ height: `${Math.max(3, (i % 5) * 4)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Track 2 */}
              <div className="h-16 bg-card border border-cardBorder rounded-xl flex items-center overflow-hidden">
                <div className="w-44 h-full bg-surface border-r border-cardBorder p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-blue" />
                    <span className="text-xs font-bold text-white">808 Bass</span>
                  </div>
                  <div className="flex gap-1 text-[9px] font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-cardBorder text-white">M</span>
                    <span className="px-1.5 py-0.5 rounded bg-cardBorder text-text-dim">S</span>
                    <span className="text-text-dim font-mono ml-auto">Vol: 90%</span>
                  </div>
                </div>
                <div className="flex-1 h-full p-1.5 relative flex items-center">
                  <div className="w-4/5 h-12 bg-sky-950/60 border border-accent-blue/50 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-[10px] text-accent-blue font-bold">Sub Bass Pattern</span>
                    <div className="h-4 flex items-end gap-1 opacity-70">
                      {[...Array(40)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-accent-blue rounded-t"
                          style={{ height: `${Math.max(4, (i % 4) * 5)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Track 3 */}
              <div className="h-16 bg-card border border-cardBorder rounded-xl flex items-center overflow-hidden">
                <div className="w-44 h-full bg-surface border-r border-cardBorder p-2.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
                    <span className="text-xs font-bold text-white">Vocal Lead</span>
                  </div>
                  <div className="flex gap-1 text-[9px] font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-red-600/40 text-red-200">REC</span>
                    <span className="text-text-dim font-mono ml-auto">Pan: R10</span>
                  </div>
                </div>
                <div className="flex-1 h-full p-1.5 relative flex items-center">
                  <div className="w-2/5 h-12 bg-purple-950/60 border border-accent-purple/50 rounded-lg p-2 flex flex-col justify-between ml-20">
                    <span className="text-[10px] text-accent-purple font-bold">Chorus Vocal.wav</span>
                    <div className="h-4 flex items-end gap-1 opacity-70">
                      {[...Array(24)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-accent-purple rounded-t"
                          style={{ height: `${Math.max(2, (i % 6) * 3)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Built for Musicians & Producers
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Everything You Need. Nothing You Don&apos;t.
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Engineered around the core audio workflow: capture ideas, trim clips,
            mix channels, and export final tracks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-card border border-cardBorder space-y-3 hover:border-cardBorder/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Audio Recording</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Connect your studio microphone with real-time level meters and record
              uncompressed 16-bit linear PCM WAV takes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-card border border-cardBorder space-y-3 hover:border-cardBorder/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Track Arrangement</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Drag, slice, and trim audio clips across tracks with an interactive
              seconds ruler and zoomable playhead.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-card border border-cardBorder space-y-3 hover:border-cardBorder/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Stereo Mixer</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Fine-tune volume gain curves, stereo pan (-100 to +100), mute, and
              solo buttons with zero audio clock drift.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-card border border-cardBorder space-y-3 hover:border-cardBorder/80 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Master Mixdown Export</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Render your full arrangement into a master WAV or 320kbps MP3
              using the browser&apos;s OfflineAudioContext.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-cardBorder bg-surface/30">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Straightforward Pricing
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Start Producing for Free.
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Choose the plan that suits your music production needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="p-6 rounded-3xl bg-card border border-cardBorder flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
                  Free Starter
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">$0</span>
                  <span className="text-xs text-text-dim">/ month</span>
                </div>
                <p className="text-xs text-text-muted">
                  Perfect for solo musicians and beatmakers exploring ideas.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Unlimited active projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>16-bit WAV audio recording</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Multi-track timeline editing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>1.0 GB Supabase cloud storage</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-surface hover:bg-surfaceHover border border-cardBorder text-white font-bold text-xs text-center transition-colors block"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Creator */}
            <div className="p-6 rounded-3xl bg-card border-2 border-primary relative flex flex-col justify-between space-y-6 shadow-2xl shadow-primary/10">
              <div className="absolute -top-3 right-6 bg-primary text-black font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Pro Creator
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">$9</span>
                  <span className="text-xs text-text-dim">/ month</span>
                </div>
                <p className="text-xs text-text-muted">
                  For active producers releasing finished tracks and masters.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>100 GB Supabase cloud audio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>High-res 24-bit 96kHz export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Built-in synthesizer presets</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-black font-bold text-xs text-center transition-all shadow-md shadow-primary/20 block"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Studio Pass */}
            <div className="p-6 rounded-3xl bg-card border border-cardBorder flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
                  Studio Pass
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">$19</span>
                  <span className="text-xs text-text-dim">/ month</span>
                </div>
                <p className="text-xs text-text-muted">
                  For recording engineers and boutique production studios.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Unlimited cloud audio storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Individual track stem export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Lossless WAV & 320k MP3 packaging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Priority offline rendering engine</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-surface hover:bg-surfaceHover border border-cardBorder text-white font-bold text-xs text-center transition-colors block"
              >
                Choose Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Ready to Forge Your Next Track?
        </h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
          Start recording right away with no payment required. Pure Web Audio,
          streamlined BandLab-style workflow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/studio/demo-project-1"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-black font-extrabold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            Start Creating Now
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-surface hover:bg-surfaceHover border border-cardBorder text-white font-bold text-sm transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cardBorder py-8 bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-dim">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary text-black font-extrabold flex items-center justify-center text-[10px]">
              SF
            </div>
            <span className="font-bold text-white">SoundForge DAW</span>
            <span>© 2026. Production MVP.</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Next.js 15</span>
            <span>Web Audio API</span>
            <span>Wavesurfer.js</span>
            <span>Prisma</span>
            <span>Supabase Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

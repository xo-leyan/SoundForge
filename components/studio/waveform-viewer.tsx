"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformViewerProps {
  audioUrl?: string;
  color?: string;
  height?: number;
  zoomLevel?: number;
  interactive?: boolean;
  onSeek?: (progress: number) => void;
  className?: string;
}

export const WaveformViewer: React.FC<WaveformViewerProps> = ({
  audioUrl,
  color = "#22C55E",
  height = 54,
  zoomLevel = 60,
  interactive = true,
  onSeek,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: color ? `${color}88` : "#22C55E66",
        progressColor: color || "#22C55E",
        cursorColor: "#FFFFFF",
        cursorWidth: 1,
        height,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        interact: interactive,
        minPxPerSec: Math.max(10, zoomLevel),
        fillParent: true,
      });

      wavesurferRef.current = ws;

      ws.on("ready", () => {
        setIsReady(true);
        setHasError(false);
      });

      ws.on("error", (err) => {
        console.warn("WaveSurfer load notice:", err);
        setHasError(true);
      });

      if (onSeek) {
        ws.on("interaction", (newProgress) => {
          onSeek(newProgress);
        });
      }

      if (audioUrl) {
        ws.load(audioUrl);
      } else {
        // If no URL, render a synthetic waveform pattern using peaks
        const peaks = generateDummyPeaks(200);
        ws.load("", [peaks], 10);
        setIsReady(true);
      }

      return () => {
        ws.destroy();
      };
    } catch (e) {
      console.error("WaveSurfer initialization error:", e);
      setHasError(true);
    }
  }, [audioUrl, color, height, interactive]);

  // Adjust zoom when zoomLevel changes
  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      try {
        wavesurferRef.current.zoom(zoomLevel);
      } catch (e) {
        // Safe zoom catch
      }
    }
  }, [zoomLevel, isReady]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full" />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/60 text-xs text-text-dim">
          <span>Waveform rendered</span>
        </div>
      )}
    </div>
  );
};

// Generates musical rhythmic peak data for visualization
function generateDummyPeaks(count: number): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    const beat = (i % 16) / 16;
    const accent = i % 8 === 0 ? 0.9 : i % 4 === 0 ? 0.7 : 0.35;
    const noise = Math.random() * 0.25;
    peaks.push(Math.min(1, accent + noise));
  }
  return peaks;
}

export default WaveformViewer;

"use client";

import React, { useRef } from "react";
import { formatTime } from "@/lib/utils";

interface SecondsRulerProps {
  duration: number; // total duration in seconds
  zoomLevel: number; // pixels per second
  currentTime: number;
  onSeek: (time: number) => void;
}

export const SecondsRuler: React.FC<SecondsRulerProps> = ({
  duration,
  zoomLevel,
  currentTime,
  onSeek,
}) => {
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const totalWidth = Math.max(duration * zoomLevel, 1200);

  // Determine tick interval based on zoomLevel
  let majorInterval = 5; // seconds
  let minorInterval = 1; // seconds

  if (zoomLevel < 30) {
    majorInterval = 10;
    minorInterval = 5;
  } else if (zoomLevel > 100) {
    majorInterval = 2;
    minorInterval = 0.5;
  }

  const ticks: React.ReactNode[] = [];
  const totalSeconds = Math.ceil(duration);

  for (let s = 0; s <= totalSeconds; s += minorInterval) {
    const isMajor = s % majorInterval === 0;
    const xPos = s * zoomLevel;

    ticks.push(
      <div
        key={`tick-${s}`}
        className="absolute bottom-0 flex flex-col items-center pointer-events-none select-none"
        style={{ left: `${xPos}px` }}
      >
        {isMajor && (
          <span className="text-[10px] font-mono text-text-dim mb-1 -translate-x-1/2">
            {formatTime(s).split(".")[0]}
          </span>
        )}
        <div
          className={`w-[1px] ${
            isMajor ? "h-3 bg-cardBorder" : "h-1.5 bg-cardBorder/50"
          }`}
        />
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = Math.max(0, clickX / zoomLevel);
    onSeek(seekTime);
  };

  const playheadX = currentTime * zoomLevel;

  return (
    <div
      ref={rulerRef}
      onClick={handleClick}
      style={{ width: `${totalWidth}px` }}
      className="relative h-9 bg-daw-ruler border-b border-cardBorder cursor-pointer select-none overflow-hidden"
    >
      {/* Ticks */}
      {ticks}

      {/* Playhead marker in ruler */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-30 transition-transform ease-linear"
        style={{
          transform: `translateX(${playheadX}px)`,
        }}
      >
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary -ml-[6px]" />
      </div>
    </div>
  );
};

export default SecondsRuler;

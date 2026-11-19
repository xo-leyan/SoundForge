"use client";

import React from "react";

interface PlayheadProps {
  currentTime: number;
  zoomLevel: number;
  height?: number | string;
}

export const Playhead: React.FC<PlayheadProps> = ({
  currentTime,
  zoomLevel,
  height = "100%",
}) => {
  const x = currentTime * zoomLevel;

  return (
    <div
      className="absolute top-0 pointer-events-none z-30 transition-transform ease-linear"
      style={{
        transform: `translateX(${x}px)`,
        height,
      }}
    >
      {/* Playhead Vertical Line */}
      <div className="w-[1.5px] h-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
    </div>
  );
};

export default Playhead;

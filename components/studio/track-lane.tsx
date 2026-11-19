"use client";

import React from "react";
import { TrackData } from "@/types";
import AudioClip from "./audio-clip";

interface TrackLaneProps {
  track: TrackData;
  zoomLevel: number;
  duration: number;
  onLaneClick?: (e: React.MouseEvent) => void;
  isRecording?: boolean;
  recordingDuration?: number;
}

export const TrackLane: React.FC<TrackLaneProps> = ({
  track,
  zoomLevel,
  duration,
  onLaneClick,
  isRecording = false,
  recordingDuration = 0,
}) => {
  const totalWidth = Math.max(duration * zoomLevel, 1200);

  return (
    <div
      onClick={onLaneClick}
      style={{ width: `${totalWidth}px` }}
      className={`relative h-20 border-b border-cardBorder/60 bg-daw-trackBg hover:bg-[#15151b] transition-colors overflow-hidden select-none ${
        track.muted ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* Background Grid Lines (1-second intervals) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, #27272A 0, #27272A 1px, transparent 1px, transparent ${zoomLevel}px)`,
        }}
      />

      {/* Audio Clips */}
      {track.timelineItems.map((clip) => (
        <AudioClip
          key={clip.id}
          clip={clip}
          trackId={track.id}
          trackColor={track.color}
          zoomLevel={zoomLevel}
        />
      ))}

      {/* Live Recording Ghost Preview */}
      {isRecording && (
        <div
          style={{
            left: "0px",
            width: `${Math.max(20, recordingDuration * zoomLevel)}px`,
          }}
          className="absolute top-1 bottom-1 bg-red-600/30 border border-red-500 rounded-md animate-pulse flex items-center px-2 z-20"
        >
          <div className="flex items-center gap-1.5 text-xs text-red-200 font-mono font-semibold">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Recording...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackLane;

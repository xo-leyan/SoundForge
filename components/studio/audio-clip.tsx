"use client";

import React, { useState, useRef } from "react";
import { TimelineItemData } from "@/types";
import { useStudioStore } from "@/lib/studio-store";
import WaveformViewer from "./waveform-viewer";
import { Trash2, GripHorizontal } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface AudioClipProps {
  clip: TimelineItemData;
  trackId: string;
  trackColor: string;
  zoomLevel: number;
}

export const AudioClip: React.FC<AudioClipProps> = ({
  clip,
  trackId,
  trackColor,
  zoomLevel,
}) => {
  const {
    selectedClipId,
    setSelectedClipId,
    updateClip,
    deleteClip,
  } = useStudioStore();

  const isSelected = selectedClipId === clip.id;
  const clipRef = useRef<HTMLDivElement | null>(null);

  // Interaction dragging & trimming states
  const [isInteracting, setIsInteracting] = useState(false);

  const duration = Math.max(0.2, clip.endTime - clip.startTime);
  const leftPx = clip.startTime * zoomLevel;
  const widthPx = duration * zoomLevel;

  // Handle Drag Move
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setIsInteracting(true);

    const startMouseX = e.clientX;
    const initialStartTime = clip.startTime;
    const clipDuration = clip.endTime - clip.startTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startMouseX;
      const deltaTime = deltaPx / zoomLevel;
      const newStartTime = Math.max(0, initialStartTime + deltaTime);
      const newEndTime = newStartTime + clipDuration;

      updateClip(trackId, clip.id, {
        startTime: Number(newStartTime.toFixed(2)),
        endTime: Number(newEndTime.toFixed(2)),
      });
    };

    const handleMouseUp = () => {
      setIsInteracting(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Handle Left Trim (adjusts startTime)
  const handleLeftTrimStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInteracting(true);

    const startMouseX = e.clientX;
    const initialStartTime = clip.startTime;
    const endTime = clip.endTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startMouseX;
      const deltaTime = deltaPx / zoomLevel;
      // Start time must not exceed endTime - 0.2s and not be less than 0
      const newStartTime = Math.max(0, Math.min(endTime - 0.2, initialStartTime + deltaTime));

      updateClip(trackId, clip.id, {
        startTime: Number(newStartTime.toFixed(2)),
      });
    };

    const handleMouseUp = () => {
      setIsInteracting(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Handle Right Trim (adjusts endTime)
  const handleRightTrimStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInteracting(true);

    const startMouseX = e.clientX;
    const initialEndTime = clip.endTime;
    const startTime = clip.startTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startMouseX;
      const deltaTime = deltaPx / zoomLevel;
      // End time must be at least startTime + 0.2s
      const newEndTime = Math.max(startTime + 0.2, initialEndTime + deltaTime);

      updateClip(trackId, clip.id, {
        endTime: Number(newEndTime.toFixed(2)),
      });
    };

    const handleMouseUp = () => {
      setIsInteracting(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={clipRef}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedClipId(clip.id);
      }}
      style={{
        left: `${leftPx}px`,
        width: `${Math.max(28, widthPx)}px`,
      }}
      className={`absolute top-1 bottom-1 rounded-md border group select-none cursor-move transition-shadow flex flex-col overflow-hidden ${
        isSelected
          ? "border-primary shadow-lg shadow-primary/20 ring-1 ring-primary z-20"
          : "border-cardBorder hover:border-text-dim z-10"
      } bg-[#1a1f29]`}
    >
      {/* Clip Header */}
      <div
        onMouseDown={handleDragStart}
        className="h-5 px-1.5 flex items-center justify-between text-[11px] font-medium border-b border-cardBorder/40 cursor-grab active:cursor-grabbing"
        style={{
          backgroundColor: `${trackColor}22`,
          color: trackColor || "#22C55E",
        }}
      >
        <div className="flex items-center gap-1 truncate">
          <GripHorizontal className="w-3 h-3 opacity-60 flex-shrink-0" />
          <span className="truncate">{clip.name}</span>
          <span className="text-[9px] opacity-60 ml-1 font-mono">
            {formatTime(duration).split(".")[0]}s
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteClip(trackId, clip.id);
          }}
          title="Delete clip"
          className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Waveform Area */}
      <div
        onMouseDown={handleDragStart}
        className="flex-1 w-full relative overflow-hidden pointer-events-auto"
      >
        <WaveformViewer
          audioUrl={clip.audioUrl}
          color={trackColor}
          height={48}
          zoomLevel={zoomLevel}
          interactive={false}
          className="opacity-90 pointer-events-none"
        />
      </div>

      {/* Left Trim Handle */}
      <div
        onMouseDown={handleLeftTrimStart}
        title="Trim Start"
        className="absolute left-0 top-0 bottom-0 w-2.5 hover:w-3 cursor-ew-resize bg-cardBorder/40 hover:bg-primary/80 transition-all z-30 group/trim flex items-center justify-center"
      >
        <div className="w-[1.5px] h-3 bg-white/40 rounded-full" />
      </div>

      {/* Right Trim Handle */}
      <div
        onMouseDown={handleRightTrimStart}
        title="Trim End"
        className="absolute right-0 top-0 bottom-0 w-2.5 hover:w-3 cursor-ew-resize bg-cardBorder/40 hover:bg-primary/80 transition-all z-30 group/trim flex items-center justify-center"
      >
        <div className="w-[1.5px] h-3 bg-white/40 rounded-full" />
      </div>
    </div>
  );
};

export default AudioClip;

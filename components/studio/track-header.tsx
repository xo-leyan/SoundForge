"use client";

import React, { useState } from "react";
import { TrackData } from "@/types";
import { useStudioStore } from "@/lib/studio-store";
import { Volume2, VolumeX, Mic, Trash2, Edit2, Check } from "lucide-react";

interface TrackHeaderProps {
  track: TrackData;
  isRecordingThisTrack?: boolean;
  onRecordClick?: () => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  isRecordingThisTrack = false,
  onRecordClick,
}) => {
  const {
    activeTrackId,
    setActiveTrackId,
    updateTrack,
    deleteTrack,
  } = useStudioStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(track.name);

  const isActive = activeTrackId === track.id;

  const handleNameSubmit = () => {
    if (nameValue.trim()) {
      updateTrack(track.id, { name: nameValue.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <div
      onClick={() => setActiveTrackId(track.id)}
      className={`h-20 w-64 flex-shrink-0 border-b border-r border-cardBorder bg-card p-2.5 flex flex-col justify-between transition-colors select-none ${
        isActive ? "border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
      }`}
    >
      {/* Top row: Track Title & Action icons */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Color pill */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: track.color }}
          />

          {isEditingName ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                autoFocus
                className="bg-surface text-xs text-white px-1.5 py-0.5 rounded border border-primary w-full outline-none"
              />
              <button
                onClick={handleNameSubmit}
                className="text-primary hover:text-primary-hover p-0.5"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onDoubleClick={() => setIsEditingName(true)}
              className="text-xs font-semibold text-white truncate cursor-text flex items-center gap-1 group/name flex-1"
            >
              <span className="truncate">{track.name}</span>
              <Edit2
                onClick={() => setIsEditingName(true)}
                className="w-2.5 h-2.5 opacity-0 group-hover/name:opacity-60 hover:opacity-100 flex-shrink-0 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Delete Track button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete ${track.name}?`)) {
              deleteTrack(track.id);
            }
          }}
          title="Delete track"
          className="text-text-dim hover:text-red-400 p-1 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Middle row: Mute, Solo, Record buttons */}
      <div className="flex items-center gap-1.5">
        {/* Mute Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTrack(track.id, { muted: !track.muted });
          }}
          title={track.muted ? "Unmute Track" : "Mute Track"}
          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
            track.muted
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : "bg-surface text-text-dim hover:text-white border border-cardBorder"
          }`}
        >
          M
        </button>

        {/* Solo Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTrack(track.id, { solo: !track.solo });
          }}
          title={track.solo ? "Unsolo Track" : "Solo Track"}
          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
            track.solo
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "bg-surface text-text-dim hover:text-white border border-cardBorder"
          }`}
        >
          S
        </button>

        {/* Record Arm Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onRecordClick) onRecordClick();
          }}
          title="Record to this track"
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
            isRecordingThisTrack
              ? "bg-red-600 text-white animate-pulse"
              : "bg-surface text-text-dim hover:text-red-400 border border-cardBorder"
          }`}
        >
          <Mic className="w-3 h-3" />
          <span>REC</span>
        </button>
      </div>

      {/* Bottom row: Volume & Pan Sliders */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {/* Volume */}
        <div className="flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-text-dim flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={track.volume}
            onChange={(e) => {
              e.stopPropagation();
              updateTrack(track.id, { volume: parseFloat(e.target.value) });
            }}
            title={`Volume: ${Math.round(track.volume * 100)}%`}
            className="w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Pan */}
        <div className="flex items-center gap-1">
          <span className="text-text-dim font-mono">
            {track.pan === 0
              ? "C"
              : track.pan < 0
              ? `L${Math.round(Math.abs(track.pan) * 100)}`
              : `R${Math.round(track.pan * 100)}`}
          </span>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={track.pan}
            onChange={(e) => {
              e.stopPropagation();
              updateTrack(track.id, { pan: parseFloat(e.target.value) });
            }}
            title={`Pan: ${track.pan === 0 ? "Center" : track.pan}`}
            className="w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default TrackHeader;

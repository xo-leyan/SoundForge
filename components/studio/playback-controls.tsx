"use client";

import React, { useEffect, useState, useRef } from "react";
import { useStudioStore } from "@/lib/studio-store";
import audioEngine from "@/lib/audio-engine";
import { formatTime } from "@/lib/utils";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Volume2,
  Save,
  Radio,
} from "lucide-react";

interface PlaybackControlsProps {
  onSave?: () => void;
  isSaving?: boolean;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  onSave,
  isSaving = false,
}) => {
  const {
    project,
    isPlaying,
    currentTime,
    zoomLevel,
    setZoomLevel,
    updateProjectMeta,
    play,
    pause,
    stop,
    seek,
  } = useStudioStore();

  const [masterVol, setMasterVol] = useState(0.9);
  const [bpmInput, setBpmInput] = useState(project?.bpm || 120);
  const [isEditingBpm, setIsEditingBpm] = useState(false);
  const [meterLevel, setMeterLevel] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync BPM input with project
  useEffect(() => {
    if (project?.bpm) {
      setBpmInput(project.bpm);
    }
  }, [project?.bpm]);

  // Master Audio Meter visualizer
  useEffect(() => {
    let animationId: number;
    const analyser = audioEngine.getAnalyserNode();
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const renderMeter = () => {
      if (analyser && dataArray && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMeterLevel(Math.min(100, Math.round((avg / 255) * 130)));
      } else {
        setMeterLevel(0);
      }
      animationId = requestAnimationFrame(renderMeter);
    };

    renderMeter();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  const handleBpmCommit = () => {
    setIsEditingBpm(false);
    const parsed = parseInt(String(bpmInput), 10);
    if (!isNaN(parsed) && parsed >= 40 && parsed <= 280) {
      updateProjectMeta({ bpm: parsed });
    } else {
      setBpmInput(project?.bpm || 120);
    }
  };

  const handleMasterVolChange = (v: number) => {
    setMasterVol(v);
    audioEngine.setMasterVolume(v);
  };

  return (
    <div className="h-14 bg-card border-b border-cardBorder px-4 flex items-center justify-between gap-4 select-none">
      {/* Left: Time & Transport Buttons */}
      <div className="flex items-center gap-3">
        {/* Rewind to Start */}
        <button
          onClick={() => seek(0)}
          title="Return to Zero (0:00)"
          className="p-2 rounded-md hover:bg-surface text-text-dim hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Play / Pause Button */}
        {isPlaying ? (
          <button
            onClick={pause}
            title="Pause (Space)"
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover text-black flex items-center justify-center font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            <Pause className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <button
            onClick={play}
            title="Play (Space)"
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary-hover text-black flex items-center justify-center font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95 pl-0.5"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
        )}

        {/* Stop Button */}
        <button
          onClick={stop}
          title="Stop"
          className="p-2 rounded-md hover:bg-surface text-text-dim hover:text-white transition-colors"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* Time Display */}
        <div className="bg-surface px-3 py-1.5 rounded-md border border-cardBorder flex items-center gap-2">
          <span className="text-[10px] text-text-dim uppercase font-mono font-bold tracking-wider">
            POS
          </span>
          <span className="text-base font-mono font-bold text-primary tracking-widest">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Center: BPM & Master VU Meter */}
      <div className="flex items-center gap-4">
        {/* Tempo / BPM */}
        <div className="bg-surface px-3 py-1 rounded-md border border-cardBorder flex items-center gap-2">
          <span className="text-[11px] text-text-dim font-bold">BPM</span>
          {isEditingBpm ? (
            <input
              type="number"
              min="40"
              max="280"
              value={bpmInput}
              onChange={(e) => setBpmInput(Number(e.target.value))}
              onBlur={handleBpmCommit}
              onKeyDown={(e) => e.key === "Enter" && handleBpmCommit()}
              autoFocus
              className="w-14 bg-card text-sm font-mono text-white text-center rounded border border-primary outline-none"
            />
          ) : (
            <span
              onClick={() => setIsEditingBpm(true)}
              title="Click to edit tempo"
              className="text-sm font-mono font-bold text-white cursor-pointer hover:text-primary transition-colors"
            >
              {project?.bpm || 120}
            </span>
          )}
        </div>

        {/* Master Output Meter */}
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-text-dim" />
          <div className="w-24 h-2.5 bg-surface rounded-full overflow-hidden border border-cardBorder p-0.5">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${meterLevel}%`,
                backgroundColor:
                  meterLevel > 85 ? "#EF4444" : meterLevel > 65 ? "#F59E0B" : "#22C55E",
              }}
            />
          </div>
        </div>
      </div>

      {/* Right: Master Volume, Zoom, Save */}
      <div className="flex items-center gap-3">
        {/* Zoom In / Out */}
        <div className="flex items-center bg-surface rounded-md border border-cardBorder p-0.5">
          <button
            onClick={() => setZoomLevel(zoomLevel - 15)}
            title="Zoom Out"
            className="p-1.5 text-text-dim hover:text-white rounded hover:bg-card transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-text-dim px-1.5">
            {zoomLevel}px
          </span>
          <button
            onClick={() => setZoomLevel(zoomLevel + 15)}
            title="Zoom In"
            className="p-1.5 text-text-dim hover:text-white rounded hover:bg-card transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-2 bg-surface px-2.5 py-1 rounded-md border border-cardBorder">
          <Volume2 className="w-3.5 h-3.5 text-text-dim" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={masterVol}
            onChange={(e) => handleMasterVolChange(parseFloat(e.target.value))}
            title={`Master Volume: ${Math.round(masterVol * 100)}%`}
            className="w-16 h-1 bg-card rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Save Button */}
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface hover:bg-cardBorder text-white text-xs font-semibold border border-cardBorder transition-colors disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaybackControls;

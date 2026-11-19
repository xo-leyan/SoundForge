"use client";

import React, { useState } from "react";
import { useStudioStore } from "@/lib/studio-store";
import audioEngine from "@/lib/audio-engine";
import {
  Layers,
  Settings,
  Download,
  Plus,
  Music,
  Sliders,
  CheckCircle2,
  FileAudio,
  Radio,
  Sparkles,
} from "lucide-react";

interface StudioSidebarProps {
  onAddTrack: () => void;
  onAddSynthSample?: (type: "synth" | "bass" | "drums") => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  onAddTrack,
  onAddSynthSample,
}) => {
  const {
    project,
    updateProjectMeta,
    activeTrackId,
    setActiveTrackId,
  } = useStudioStore();

  const [activeTab, setActiveTab] = useState<"tracks" | "settings" | "export">("tracks");
  const [exportFormat, setExportFormat] = useState<"wav" | "mp3">("wav");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Handle Mixdown Export
  const handleExport = async () => {
    if (!project) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const result = await audioEngine.exportMixdown(project, exportFormat);

      // Trigger browser download of mixed audio file
      const downloadUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error("Export mixdown failed:", err);
      alert("Export failed: " + (err as any).message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-80 h-full bg-card border-r border-cardBorder flex flex-col select-none">
      {/* Top Sidebar Tab Navigation */}
      <div className="flex border-b border-cardBorder bg-surface">
        <button
          onClick={() => setActiveTab("tracks")}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "tracks"
              ? "text-primary border-b-2 border-primary bg-card"
              : "text-text-dim hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tracks</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "settings"
              ? "text-primary border-b-2 border-primary bg-card"
              : "text-text-dim hover:text-white"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setActiveTab("export")}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "export"
              ? "text-primary border-b-2 border-primary bg-card"
              : "text-text-dim hover:text-white"
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* Tab Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: TRACKS */}
        {activeTab === "tracks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
                Project Tracks ({project?.tracks.length || 0})
              </span>
              <button
                onClick={onAddTrack}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary hover:bg-primary-hover text-black text-xs font-bold transition-all shadow-md shadow-primary/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Track</span>
              </button>
            </div>

            {/* Track Mini List */}
            <div className="space-y-1.5">
              {project?.tracks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTrackId(t.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    activeTrackId === t.id
                      ? "border-primary bg-surface"
                      : "border-cardBorder hover:border-text-dim/40 bg-surface/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs font-medium text-white">
                      {t.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-dim font-mono">
                    {t.timelineItems.length} clips
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Generator Samples / Instrument Riffs */}
            {onAddSynthSample && (
              <div className="pt-4 border-t border-cardBorder/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Quick Sound Generators</span>
                </div>
                <p className="text-[11px] text-text-dim">
                  Insert synthesized audio patterns into the active track:
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => onAddSynthSample("synth")}
                    className="p-2 rounded-md bg-surface hover:bg-surfaceHover border border-cardBorder text-[11px] font-semibold text-white flex flex-col items-center gap-1 hover:border-primary transition-colors"
                  >
                    <Music className="w-4 h-4 text-primary" />
                    <span>Lead Synth</span>
                  </button>

                  <button
                    onClick={() => onAddSynthSample("bass")}
                    className="p-2 rounded-md bg-surface hover:bg-surfaceHover border border-cardBorder text-[11px] font-semibold text-white flex flex-col items-center gap-1 hover:border-primary transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-accent-blue" />
                    <span>808 Bass</span>
                  </button>

                  <button
                    onClick={() => onAddSynthSample("drums")}
                    className="p-2 rounded-md bg-surface hover:bg-surfaceHover border border-cardBorder text-[11px] font-semibold text-white flex flex-col items-center gap-1 hover:border-primary transition-colors"
                  >
                    <Radio className="w-4 h-4 text-accent-purple" />
                    <span>Beat Loop</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
              Session Settings
            </span>

            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">
                Project Name
              </label>
              <input
                type="text"
                value={project?.name || ""}
                onChange={(e) => updateProjectMeta({ name: e.target.value })}
                className="w-full bg-surface border border-cardBorder rounded-md px-3 py-2 text-xs text-white focus:border-primary outline-none"
              />
            </div>

            {/* Tempo BPM */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">
                Tempo (BPM)
              </label>
              <input
                type="number"
                min="40"
                max="260"
                value={project?.bpm || 120}
                onChange={(e) =>
                  updateProjectMeta({ bpm: parseInt(e.target.value) || 120 })
                }
                className="w-full bg-surface border border-cardBorder rounded-md px-3 py-2 text-xs text-white focus:border-primary outline-none font-mono"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-medium">
                Timeline Duration (seconds)
              </label>
              <input
                type="number"
                min="30"
                max="600"
                value={project?.duration || 120}
                onChange={(e) =>
                  updateProjectMeta({ duration: parseInt(e.target.value) || 120 })
                }
                className="w-full bg-surface border border-cardBorder rounded-md px-3 py-2 text-xs text-white focus:border-primary outline-none font-mono"
              />
            </div>

            {/* Project Statistics */}
            <div className="pt-4 border-t border-cardBorder/60 space-y-2">
              <span className="text-xs font-bold text-text-dim">Information</span>
              <div className="bg-surface rounded-md p-3 text-xs space-y-1.5 text-text-muted">
                <div className="flex justify-between">
                  <span>Total Tracks:</span>
                  <span className="font-mono text-white">
                    {project?.tracks.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Clips:</span>
                  <span className="font-mono text-white">
                    {project?.tracks.reduce(
                      (acc, t) => acc + t.timelineItems.length,
                      0
                    ) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Engine Sample Rate:</span>
                  <span className="font-mono text-white">44.1 kHz 24-bit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXPORT */}
        {activeTab === "export" && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-dim">
              Master Audio Export
            </span>

            <p className="text-xs text-text-muted leading-relaxed">
              Mix down all enabled tracks, panning, volume, and clips into a high-fidelity master recording.
            </p>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExportFormat("wav")}
                  className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                    exportFormat === "wav"
                      ? "border-primary bg-primary/10 text-white"
                      : "border-cardBorder hover:border-text-dim/40 bg-surface text-text-muted"
                  }`}
                >
                  <FileAudio className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <div className="text-xs font-bold">WAV</div>
                    <div className="text-[10px] text-text-dim">
                      Lossless 16-bit PCM
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setExportFormat("mp3")}
                  className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                    exportFormat === "mp3"
                      ? "border-primary bg-primary/10 text-white"
                      : "border-cardBorder hover:border-text-dim/40 bg-surface text-text-muted"
                  }`}
                >
                  <FileAudio className="w-4 h-4 text-accent-blue mt-0.5" />
                  <div>
                    <div className="text-xs font-bold">MP3</div>
                    <div className="text-[10px] text-text-dim">
                      High Quality 320kbps
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Export Action Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`} />
              <span>{isExporting ? "Rendering Mixdown..." : `Export ${exportFormat.toUpperCase()}`}</span>
            </button>

            {exportSuccess && (
              <div className="p-3 bg-primary/10 border border-primary/40 rounded-lg flex items-center gap-2 text-xs text-primary">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Mixdown rendered & downloaded successfully!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioSidebar;

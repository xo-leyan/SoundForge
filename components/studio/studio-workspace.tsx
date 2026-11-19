"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProjectData } from "@/types";
import { useStudioStore } from "@/lib/studio-store";
import audioEngine from "@/lib/audio-engine";
import { saveProjectAction } from "@/actions/project-actions";
import PlaybackControls from "./playback-controls";
import StudioSidebar from "./studio-sidebar";
import TrackHeader from "./track-header";
import TrackLane from "./track-lane";
import SecondsRuler from "./seconds-ruler";
import Playhead from "./playhead";
import RecordingModal from "./recording-modal";
import { Plus, ArrowLeft, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

interface StudioWorkspaceProps {
  initialProject: ProjectData;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  initialProject,
}) => {
  const {
    project,
    setProject,
    isPlaying,
    currentTime,
    setCurrentTime,
    setIsPlaying,
    zoomLevel,
    activeTrackId,
    setActiveTrackId,
    addTrack,
    addClipToTrack,
    seek,
    play,
    pause,
    stop,
    hasUnsavedChanges,
  } = useStudioStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Recording Modal State
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [recordingTargetTrack, setRecordingTargetTrack] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize store and audio engine on mount
  useEffect(() => {
    setProject(initialProject);

    // Audio engine event listeners
    audioEngine.onTimeUpdate((time) => {
      setCurrentTime(time);
    });

    audioEngine.onPlayStateChange((playing) => {
      setIsPlaying(playing);
    });

    // Cleanup audio playback on leave
    return () => {
      audioEngine.stop();
    };
  }, [initialProject, setProject, setCurrentTime, setIsPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      } else if (e.code === "Enter") {
        e.preventDefault();
        seek(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, play, pause, seek]);

  // Handle Save Project
  const handleSave = async () => {
    if (!project) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await saveProjectAction(project);
      setSaveStatus("Saved successfully");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Recording modal for a track
  const handleStartRecording = (trackId: string, trackName: string) => {
    setRecordingTargetTrack({ id: trackId, name: trackName });
    setIsRecordingModalOpen(true);
  };

  // Recording completed callback
  const handleRecordingSaved = (audioData: {
    url: string;
    duration: number;
    name: string;
  }) => {
    if (!recordingTargetTrack) return;
    addClipToTrack(recordingTargetTrack.id, {
      name: audioData.name,
      audioUrl: audioData.url,
      startTime: Number(currentTime.toFixed(2)),
      endTime: Number((currentTime + audioData.duration).toFixed(2)),
      duration: audioData.duration,
    });
  };

  // Add synthetic sample
  const handleAddSynthSample = (type: "synth" | "bass" | "drums") => {
    const targetId = activeTrackId || project?.tracks[0]?.id;
    if (!targetId) return;

    const names = {
      synth: "Synth Lead Arp",
      bass: "808 Bass Groove",
      drums: "Classic Drum Pattern",
    };

    addClipToTrack(targetId, {
      name: names[type],
      audioUrl: `synth://${type}`,
      startTime: Number(currentTime.toFixed(2)),
      endTime: Number((currentTime + 8).toFixed(2)),
      duration: 8,
    });
  };

  if (!project) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading SoundForge Studio...</span>
        </div>
      </div>
    );
  }

  const duration = project.duration || 120;
  const totalTimelineWidth = Math.max(duration * zoomLevel, 1400);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-text overflow-hidden select-none">
      {/* Studio Top Navigation Bar */}
      <header className="h-12 bg-card border-b border-cardBorder px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-surface"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-cardBorder" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{project.name}</span>
            {hasUnsavedChanges && (
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-medium">
                Unsaved
              </span>
            )}
            {saveStatus && (
              <span className="text-[10px] text-primary flex items-center gap-1">
                <Check className="w-3 h-3" />
                {saveStatus}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-text-dim hidden md:inline">
            Space: Play/Pause | Enter: 0:00
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1 bg-primary hover:bg-primary-hover text-black text-xs font-bold rounded-md shadow-sm transition-all"
          >
            {isSaving ? "Saving..." : "Save Project"}
          </button>
        </div>
      </header>

      {/* Playback Controls & Transport */}
      <PlaybackControls onSave={handleSave} isSaving={isSaving} />

      {/* Main Studio Body: Sidebar | Main Timeline */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar
          onAddTrack={() => addTrack()}
          onAddSynthSample={handleAddSynthSample}
        />

        {/* Main Timeline View */}
        <div className="flex-1 flex flex-col overflow-hidden bg-daw-grid relative">
          {/* Timeline Header Row (Track Headers title + Seconds Ruler) */}
          <div className="flex border-b border-cardBorder bg-card z-20">
            {/* Corner header */}
            <div className="w-64 h-9 flex-shrink-0 border-r border-cardBorder bg-card flex items-center justify-between px-3">
              <span className="text-[11px] font-bold text-text-dim uppercase tracking-wider">
                Tracks
              </span>
              <button
                onClick={() => addTrack()}
                title="Add Track"
                className="text-primary hover:text-primary-hover p-1 rounded hover:bg-surface transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Seconds Ruler (Scrolls horizontally with timeline) */}
            <div
              ref={timelineContainerRef}
              className="flex-1 overflow-x-hidden overflow-y-hidden"
            >
              <SecondsRuler
                duration={duration}
                zoomLevel={zoomLevel}
                currentTime={currentTime}
                onSeek={(time) => seek(time)}
              />
            </div>
          </div>

          {/* Timeline Track Rows */}
          <div className="flex-1 flex overflow-y-auto overflow-x-auto">
            {/* Left Track Headers Column */}
            <div className="w-64 flex-shrink-0 bg-card z-10 sticky left-0 shadow-md">
              {project.tracks.map((track) => (
                <TrackHeader
                  key={track.id}
                  track={track}
                  isRecordingThisTrack={
                    isRecordingModalOpen && recordingTargetTrack?.id === track.id
                  }
                  onRecordClick={() => handleStartRecording(track.id, track.name)}
                />
              ))}

              {/* Add Track Bottom Button */}
              <button
                onClick={() => addTrack()}
                className="w-full h-12 border-b border-r border-cardBorder bg-surface hover:bg-surfaceHover flex items-center justify-center gap-1.5 text-xs text-text-dim hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Track</span>
              </button>
            </div>

            {/* Right Multi-track Timeline Lanes */}
            <div
              style={{ width: `${totalTimelineWidth}px` }}
              className="relative flex-1"
              onClick={(e) => {
                // Seek on timeline background click
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const seekTime = Math.max(0, clickX / zoomLevel);
                seek(seekTime);
              }}
            >
              {/* Playhead line crossing all lanes */}
              <Playhead
                currentTime={currentTime}
                zoomLevel={zoomLevel}
                height={`${project.tracks.length * 80 + 120}px`}
              />

              {/* Track Lanes */}
              {project.tracks.map((track) => (
                <TrackLane
                  key={track.id}
                  track={track}
                  zoomLevel={zoomLevel}
                  duration={duration}
                  isRecording={
                    isRecordingModalOpen && recordingTargetTrack?.id === track.id
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recording Modal / HUD */}
      {isRecordingModalOpen && recordingTargetTrack && (
        <RecordingModal
          isOpen={isRecordingModalOpen}
          targetTrackId={recordingTargetTrack.id}
          targetTrackName={recordingTargetTrack.name}
          onClose={() => setIsRecordingModalOpen(false)}
          onRecordingComplete={handleRecordingSaved}
        />
      )}
    </div>
  );
};

export default StudioWorkspace;

import { create } from "zustand";
import { ProjectData, TrackData, TimelineItemData } from "@/types";
import audioEngine from "./audio-engine";

interface StudioState {
  project: ProjectData | null;
  isPlaying: boolean;
  currentTime: number;
  zoomLevel: number; // Pixels per second
  activeTrackId: string | null;
  selectedClipId: string | null;
  isRecording: boolean;
  recordingTrackId: string | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setProject: (project: ProjectData) => void;
  updateProjectMeta: (updates: { name?: string; bpm?: number; duration?: number }) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  setActiveTrackId: (id: string | null) => void;
  setSelectedClipId: (id: string | null) => void;
  setIsRecording: (isRecording: boolean, trackId?: string | null) => void;
  setIsSaving: (isSaving: boolean) => void;

  // Track manipulation
  addTrack: (name?: string) => void;
  deleteTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<TrackData>) => void;

  // Clip manipulation
  addClipToTrack: (trackId: string, clip: Omit<TimelineItemData, "id" | "trackId">) => void;
  updateClip: (trackId: string, clipId: string, updates: Partial<TimelineItemData>) => void;
  deleteClip: (trackId: string, clipId: string) => void;

  // Transport commands
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
}

const TRACK_COLORS = [
  "#22C55E", // Emerald
  "#38BDF8", // Sky blue
  "#A855F7", // Purple
  "#F59E0B", // Amber
  "#F43F5E", // Rose
  "#06B6D4", // Cyan
  "#EC4899", // Pink
];

export const useStudioStore = create<StudioState>((set, get) => ({
  project: null,
  isPlaying: false,
  currentTime: 0,
  zoomLevel: 60, // 60px per second default
  activeTrackId: null,
  selectedClipId: null,
  isRecording: false,
  recordingTrackId: null,
  isSaving: false,
  hasUnsavedChanges: false,

  setProject: (project) => {
    set({
      project,
      activeTrackId: project.tracks[0]?.id || null,
      hasUnsavedChanges: false,
    });
    audioEngine.setProject(project);
  },

  updateProjectMeta: (updates) => {
    const { project } = get();
    if (!project) return;

    const updated = { ...project, ...updates };
    set({ project: updated, hasUnsavedChanges: true });
    audioEngine.setProject(updated);
  },

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel: Math.max(20, Math.min(200, zoomLevel)) }),
  setActiveTrackId: (activeTrackId) => set({ activeTrackId }),
  setSelectedClipId: (selectedClipId) => set({ selectedClipId }),
  setIsRecording: (isRecording, trackId = null) =>
    set({ isRecording, recordingTrackId: trackId }),
  setIsSaving: (isSaving) => set({ isSaving }),

  addTrack: (name) => {
    const { project } = get();
    if (!project) return;

    const trackIndex = project.tracks.length;
    const color = TRACK_COLORS[trackIndex % TRACK_COLORS.length];
    const newTrack: TrackData = {
      id: `trk_${project.id}_${Date.now()}`,
      name: name || `Track ${trackIndex + 1}`,
      projectId: project.id,
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      order: trackIndex,
      color,
      timelineItems: [],
    };

    const updatedProject = {
      ...project,
      tracks: [...project.tracks, newTrack],
    };

    set({
      project: updatedProject,
      activeTrackId: newTrack.id,
      hasUnsavedChanges: true,
    });
    audioEngine.setProject(updatedProject);
  },

  deleteTrack: (trackId) => {
    const { project } = get();
    if (!project) return;

    const updatedTracks = project.tracks.filter((t) => t.id !== trackId);
    const updatedProject = { ...project, tracks: updatedTracks };

    set({
      project: updatedProject,
      activeTrackId: updatedTracks[0]?.id || null,
      hasUnsavedChanges: true,
    });
    audioEngine.setProject(updatedProject);
  },

  updateTrack: (trackId, updates) => {
    const { project } = get();
    if (!project) return;

    const updatedTracks = project.tracks.map((t) =>
      t.id === trackId ? { ...t, ...updates } : t
    );
    const updatedProject = { ...project, tracks: updatedTracks };

    set({ project: updatedProject, hasUnsavedChanges: true });
    audioEngine.setProject(updatedProject);
  },

  addClipToTrack: (trackId, clipData) => {
    const { project } = get();
    if (!project) return;

    const clipId = `clip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newClip: TimelineItemData = {
      ...clipData,
      id: clipId,
      trackId,
    };

    const updatedTracks = project.tracks.map((t) => {
      if (t.id === trackId) {
        return {
          ...t,
          timelineItems: [...t.timelineItems, newClip],
        };
      }
      return t;
    });

    const updatedProject = { ...project, tracks: updatedTracks };
    set({
      project: updatedProject,
      selectedClipId: clipId,
      hasUnsavedChanges: true,
    });
    audioEngine.setProject(updatedProject);
  },

  updateClip: (trackId, clipId, updates) => {
    const { project } = get();
    if (!project) return;

    const updatedTracks = project.tracks.map((t) => {
      if (t.id === trackId) {
        return {
          ...t,
          timelineItems: t.timelineItems.map((item) =>
            item.id === clipId ? { ...item, ...updates } : item
          ),
        };
      }
      return t;
    });

    const updatedProject = { ...project, tracks: updatedTracks };
    set({ project: updatedProject, hasUnsavedChanges: true });
    audioEngine.setProject(updatedProject);
  },

  deleteClip: (trackId, clipId) => {
    const { project } = get();
    if (!project) return;

    const updatedTracks = project.tracks.map((t) => {
      if (t.id === trackId) {
        return {
          ...t,
          timelineItems: t.timelineItems.filter((item) => item.id !== clipId),
        };
      }
      return t;
    });

    const updatedProject = { ...project, tracks: updatedTracks };
    set({
      project: updatedProject,
      selectedClipId: null,
      hasUnsavedChanges: true,
    });
    audioEngine.setProject(updatedProject);
  },

  play: () => {
    const { currentTime } = get();
    audioEngine.play(currentTime);
  },

  pause: () => {
    audioEngine.pause();
  },

  stop: () => {
    audioEngine.stop();
  },

  seek: (time) => {
    audioEngine.seek(time);
  },
}));

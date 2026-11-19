export interface UserProfile {
  id: string;
  name?: string | null;
  email: string;
}

export interface TimelineItemData {
  id: string;
  name: string;
  trackId: string;
  audioUrl: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  duration: number;  // original audio duration in seconds
  createdAt?: string | Date;
}

export interface TrackData {
  id: string;
  name: string;
  projectId: string;
  audioUrl?: string | null;
  volume: number; // 0.0 to 1.0
  pan: number;    // -1.0 to 1.0
  muted: boolean;
  solo: boolean;
  order: number;
  color: string;
  timelineItems: TimelineItemData[];
}

export interface ProjectData {
  id: string;
  name: string;
  userId: string;
  bpm: number;
  duration: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  tracks: TrackData[];
}

export interface DashboardStats {
  totalProjects: number;
  recentlyEdited: ProjectData[];
  storageUsedBytes: number;
  storageLimitBytes: number;
}

export interface AudioRecordingResult {
  blob: Blob;
  url: string;
  duration: number;
}

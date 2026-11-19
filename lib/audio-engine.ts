import { ProjectData, TrackData, TimelineItemData } from "@/types";
import { audioBufferToWav, generateSyntheticAudio } from "./audio-encoder";

class SoundForgeAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Track nodes: trackId -> { gain: GainNode, panner: StereoPannerNode }
  private trackNodes: Map<
    string,
    { gain: GainNode; panner: StereoPannerNode }
  > = new Map();

  // Cached decoded AudioBuffers: url -> AudioBuffer
  private audioBufferCache: Map<string, AudioBuffer> = new Map();

  // Active playing sources: source -> clean up callback
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  private isPlaying = false;
  private playheadPosition = 0; // seconds
  private playStartTime = 0; // audioContext.currentTime when playback started
  private animationFrameId: number | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onPlayStateChangeCallback: ((isPlaying: boolean) => void) | null = null;

  private currentProject: ProjectData | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.9;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  public getAnalyserNode(): AnalyserNode | null {
    this.init();
    return this.analyser;
  }

  public onTimeUpdate(cb: (time: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onPlayStateChange(cb: (isPlaying: boolean) => void) {
    this.onPlayStateChangeCallback = cb;
  }

  public setProject(project: ProjectData) {
    this.currentProject = project;
    this.updateTrackNodes(project.tracks);
  }

  /**
   * Configures Gain and Panner nodes for each track according to volume, pan, mute, solo
   */
  public updateTrackNodes(tracks: TrackData[]) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const hasAnySolo = tracks.some((t) => t.solo);

    tracks.forEach((track) => {
      let nodes = this.trackNodes.get(track.id);
      if (!nodes) {
        const gain = this.ctx!.createGain();
        const panner = this.ctx!.createStereoPanner();
        panner.connect(gain);
        gain.connect(this.masterGain!);
        nodes = { gain, panner };
        this.trackNodes.set(track.id, nodes);
      }

      // Mute / Solo logic
      const isAudible = hasAnySolo ? track.solo : !track.muted;
      const targetGain = isAudible ? Math.max(0, Math.min(1, track.volume)) : 0;
      nodes.gain.gain.setValueAtTime(targetGain, this.ctx!.currentTime);

      // Stereo Pan (-1.0 to 1.0)
      const targetPan = Math.max(-1, Math.min(1, track.pan));
      nodes.panner.pan.setValueAtTime(targetPan, this.ctx!.currentTime);
    });
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        Math.max(0, Math.min(1, vol)),
        this.ctx.currentTime
      );
    }
  }

  /**
   * Preload or decode an audio clip from URL into an AudioBuffer
   */
  public async loadAudio(url: string, fallbackType?: "synth" | "bass" | "drums"): Promise<AudioBuffer> {
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!;
    }

    this.init();

    try {
      if (url && url.length > 5 && !url.startsWith("synth://")) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
        this.audioBufferCache.set(url, audioBuffer);
        return audioBuffer;
      }
    } catch (e) {
      console.warn("Could not fetch remote audio, using synthetic generator:", url);
    }

    // Fallback: Generate synthetic sample matching track character
    const type = fallbackType || (url.includes("bass") ? "bass" : url.includes("synth") ? "synth" : "drums");
    const syntheticBuffer = generateSyntheticAudio(type, 16, this.currentProject?.bpm || 120);
    this.audioBufferCache.set(url, syntheticBuffer);
    return syntheticBuffer;
  }

  /**
   * Cache an already created AudioBuffer (e.g. from recording)
   */
  public cacheAudioBuffer(url: string, buffer: AudioBuffer) {
    this.audioBufferCache.set(url, buffer);
  }

  /**
   * Start synchronized multi-track playback from the current playhead position
   */
  public async play(fromPosition?: number) {
    this.init();
    if (!this.ctx || !this.currentProject) return;

    if (this.isPlaying) {
      this.stopSources();
    }

    if (fromPosition !== undefined) {
      this.playheadPosition = Math.max(0, fromPosition);
    }

    this.isPlaying = true;
    this.playStartTime = this.ctx.currentTime;
    if (this.onPlayStateChangeCallback) {
      this.onPlayStateChangeCallback(true);
    }

    // Schedule all clips across all tracks
    const startOffset = this.playheadPosition;
    const projectDuration = this.currentProject.duration || 120;

    for (const track of this.currentProject.tracks) {
      const nodes = this.trackNodes.get(track.id);
      if (!nodes) continue;

      for (const item of track.timelineItems) {
        // Only schedule if clip has not finished before playhead
        if (item.endTime <= startOffset) continue;

        try {
          const buffer = await this.loadAudio(
            item.audioUrl,
            track.name.toLowerCase().includes("bass")
              ? "bass"
              : track.name.toLowerCase().includes("synth")
              ? "synth"
              : "drums"
          );

          if (!this.isPlaying) return; // If stopped while loading

          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(nodes.panner);

          // Calculate start timing
          let scheduledTime = 0;
          let bufferOffset = 0;
          let playDuration = 0;

          if (item.startTime <= startOffset) {
            // Playhead starts within this clip
            scheduledTime = this.ctx.currentTime;
            bufferOffset = startOffset - item.startTime;
            playDuration = item.endTime - startOffset;
          } else {
            // Clip starts in the future relative to playhead
            const delay = item.startTime - startOffset;
            scheduledTime = this.ctx.currentTime + delay;
            bufferOffset = 0;
            playDuration = item.endTime - item.startTime;
          }

          if (playDuration > 0 && bufferOffset < buffer.duration) {
            source.start(scheduledTime, bufferOffset, playDuration);
            this.activeSources.add(source);

            source.onended = () => {
              this.activeSources.delete(source);
            };
          }
        } catch (err) {
          console.error("Error scheduling clip:", item.name, err);
        }
      }
    }

    this.startTimeLoop(projectDuration);
  }

  private startTimeLoop(maxDuration: number) {
    const initialPosition = this.playheadPosition;
    const initialCtxTime = this.ctx!.currentTime;

    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;

      const elapsed = this.ctx.currentTime - initialCtxTime;
      const currentPos = initialPosition + elapsed;
      this.playheadPosition = currentPos;

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(currentPos);
      }

      if (currentPos >= maxDuration) {
        this.stop();
        return;
      }

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  public pause() {
    if (!this.isPlaying) return;
    this.stopSources();
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.onPlayStateChangeCallback) {
      this.onPlayStateChangeCallback(false);
    }
  }

  public stop() {
    this.stopSources();
    this.isPlaying = false;
    this.playheadPosition = 0;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(0);
    }
    if (this.onPlayStateChangeCallback) {
      this.onPlayStateChangeCallback(false);
    }
  }

  public seek(positionSeconds: number) {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.playheadPosition = Math.max(0, positionSeconds);
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.playheadPosition);
    }
    if (wasPlaying) {
      this.play(this.playheadPosition);
    }
  }

  public getCurrentTime(): number {
    return this.playheadPosition;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private stopSources() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source may already have ended
      }
    }
    this.activeSources.clear();
  }

  /**
   * Phase 8: Offline Mixdown & Export
   * Mixes down all audible tracks and timeline items with their respective
   * volume, pan, offsets, and durations into a single stereo WAV file.
   */
  public async exportMixdown(
    project: ProjectData,
    format: "wav" | "mp3" = "wav"
  ): Promise<{ blob: Blob; filename: string }> {
    const sampleRate = 44100;
    // Calculate total duration based on maximum end time of clips or project duration
    let totalSeconds = 0;
    project.tracks.forEach((t) => {
      t.timelineItems.forEach((i) => {
        if (i.endTime > totalSeconds) totalSeconds = i.endTime;
      });
    });
    totalSeconds = Math.max(totalSeconds + 1, 10); // Minimum 10 seconds

    const totalFrames = Math.ceil(sampleRate * totalSeconds);
    const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);
    const masterGain = offlineCtx.createGain();
    masterGain.gain.value = 0.95;
    masterGain.connect(offlineCtx.destination);

    const hasAnySolo = project.tracks.some((t) => t.solo);

    for (const track of project.tracks) {
      const isAudible = hasAnySolo ? track.solo : !track.muted;
      if (!isAudible) continue;

      const trackGain = offlineCtx.createGain();
      trackGain.gain.value = track.volume;

      const trackPanner = offlineCtx.createStereoPanner();
      trackPanner.pan.value = track.pan;

      trackPanner.connect(trackGain);
      trackGain.connect(masterGain);

      for (const item of track.timelineItems) {
        try {
          const buffer = await this.loadAudio(
            item.audioUrl,
            track.name.toLowerCase().includes("bass")
              ? "bass"
              : track.name.toLowerCase().includes("synth")
              ? "synth"
              : "drums"
          );

          const source = offlineCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(trackPanner);

          const startTime = item.startTime;
          const duration = item.endTime - item.startTime;
          source.start(startTime, 0, duration);
        } catch (err) {
          console.error("Export error on item:", item.name, err);
        }
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWav(renderedBuffer);

    const cleanProjectName = project.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${cleanProjectName}_master.${format}`;

    return {
      blob: wavBlob,
      filename,
    };
  }
}

// Singleton export
export const audioEngine = new SoundForgeAudioEngine();
export default audioEngine;

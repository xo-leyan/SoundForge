import { useState, useRef, useCallback } from "react";
import { audioBufferToWav } from "@/lib/audio-encoder";
import { uploadAudio } from "@/lib/supabase";
import audioEngine from "@/lib/audio-engine";

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  audioLevel: number; // 0 to 1 for visualizer
  error: string | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    recordingDuration: 0,
    audioLevel: 0,
    error: null,
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const recordedChunksRef = useRef<Float32Array[]>([]);
  const totalSamplesRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef<boolean>(false);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserNodeRef.current = analyser;
      source.connect(analyser);

      // 4096 buffer size, 1 input channel, 1 output channel
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      recordedChunksRef.current = [];
      totalSamplesRef.current = 0;
      isPausedRef.current = false;

      processor.onaudioprocess = (e) => {
        if (isPausedRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Make a copy of float32 samples
        const copy = new Float32Array(inputData.length);
        copy.set(inputData);
        recordedChunksRef.current.push(copy);
        totalSamplesRef.current += copy.length;

        // Calculate simple RMS volume level
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const level = Math.min(1, rms * 5); // boosted for UI display

        setState((prev) => ({ ...prev, audioLevel: level }));
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      setState({
        isRecording: true,
        isPaused: false,
        recordingDuration: 0,
        audioLevel: 0,
        error: null,
      });

      // Start duration counter
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          const elapsed = (Date.now() - startTime) / 1000;
          setState((prev) => ({ ...prev, recordingDuration: elapsed }));
        }
      }, 100);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setState((prev) => ({
        ...prev,
        isRecording: false,
        error:
          err.name === "NotAllowedError"
            ? "Microphone access was denied. Please allow microphone permissions."
            : "Could not access microphone: " + err.message,
      }));
    }
  }, []);

  const pauseRecording = useCallback(() => {
    isPausedRef.current = true;
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeRecording = useCallback(() => {
    isPausedRef.current = false;
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const stopRecording = useCallback(
    async (trackName = "Vocal Take"): Promise<{
      blob: Blob;
      url: string;
      duration: number;
    } | null> => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Disconnect audio nodes
      if (processorNodeRef.current) {
        processorNodeRef.current.disconnect();
        processorNodeRef.current = null;
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setState({
        isRecording: false,
        isPaused: false,
        recordingDuration: 0,
        audioLevel: 0,
        error: null,
      });

      const totalSamples = totalSamplesRef.current;
      if (totalSamples === 0) return null;

      // Merge recorded chunks into a single Float32Array
      const mergedSamples = new Float32Array(totalSamples);
      let offset = 0;
      for (const chunk of recordedChunksRef.current) {
        mergedSamples.set(chunk, offset);
        offset += chunk.length;
      }

      // Create an AudioBuffer (mono to stereo)
      const offlineCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = offlineCtx.createBuffer(2, totalSamples, sampleRate);
      audioBuffer.copyToChannel(mergedSamples, 0);
      audioBuffer.copyToChannel(mergedSamples, 1);

      // Convert to WAV
      const wavBlob = audioBufferToWav(audioBuffer);
      const duration = totalSamples / sampleRate;

      // Upload to Supabase / local storage
      const filename = `${trackName}_${Date.now()}.wav`;
      const uploadResult = await uploadAudio(wavBlob, filename);

      // Pre-cache buffer in audio engine for instant zero-latency playback
      audioEngine.cacheAudioBuffer(uploadResult.url, audioBuffer);

      return {
        blob: wavBlob,
        url: uploadResult.url,
        duration,
      };
    },
    []
  );

  return {
    ...state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}

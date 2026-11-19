"use client";

import React, { useEffect } from "react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { formatTime } from "@/lib/utils";
import { Mic, Square, Pause, Play, AlertCircle, X } from "lucide-react";

interface RecordingModalProps {
  isOpen: boolean;
  targetTrackName: string;
  targetTrackId: string;
  onClose: () => void;
  onRecordingComplete: (audioData: {
    url: string;
    duration: number;
    name: string;
  }) => void;
}

export const RecordingModal: React.FC<RecordingModalProps> = ({
  isOpen,
  targetTrackName,
  targetTrackId,
  onClose,
  onRecordingComplete,
}) => {
  const {
    isRecording,
    isPaused,
    recordingDuration,
    audioLevel,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useAudioRecorder();

  // Trigger recording when modal opens
  useEffect(() => {
    if (isOpen && !isRecording && !error) {
      startRecording();
    }
  }, [isOpen, startRecording]);

  if (!isOpen) return null;

  const handleStop = async () => {
    const result = await stopRecording(targetTrackName);
    if (result) {
      onRecordingComplete({
        url: result.url,
        duration: result.duration,
        name: `${targetTrackName} Take`,
      });
    }
    onClose();
  };

  const handleCancel = async () => {
    if (isRecording) {
      await stopRecording();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-cardBorder w-full max-w-md rounded-2xl p-6 shadow-2xl relative select-none">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-text-dim hover:text-white p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Recording to: <span className="text-primary">{targetTrackName}</span>
          </h2>
        </div>

        {/* Error Alert */}
        {error ? (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-xs text-red-300 flex items-start gap-2.5 my-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] opacity-80">
                Ensure microphone permissions are enabled in your browser settings.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 my-6">
            {/* Live Audio Level Meter */}
            <div className="h-16 bg-surface rounded-xl border border-cardBorder flex items-center justify-center px-4 overflow-hidden relative">
              <div
                className="absolute inset-y-0 left-0 bg-red-500/20 transition-all duration-75"
                style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
              />
              <div className="z-10 flex items-center gap-1.5">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cardBorder rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(4, Math.sin(i * 0.4 + audioLevel * 5) * 40 * audioLevel + 10)}px`,
                      backgroundColor:
                        i < audioLevel * 24
                          ? i > 18
                            ? "#EF4444"
                            : i > 12
                            ? "#F59E0B"
                            : "#22C55E"
                          : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Duration Display */}
            <div className="text-center">
              <span className="text-4xl font-mono font-bold text-white tracking-widest">
                {formatTime(recordingDuration)}
              </span>
              <div className="text-xs text-text-dim mt-1">
                {isPaused ? "Recording Paused" : "Recording in 16-bit WAV..."}
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {/* Pause / Resume */}
          {!error && (
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="p-3 rounded-full bg-surface hover:bg-surfaceHover text-white border border-cardBorder transition-colors"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5" />}
            </button>
          )}

          {/* Stop & Save */}
          {!error && (
            <button
              onClick={handleStop}
              className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Save Recording</span>
            </button>
          )}

          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="px-4 py-3 rounded-full bg-surface hover:bg-surfaceHover text-text-dim hover:text-white font-semibold text-xs border border-cardBorder transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingModal;

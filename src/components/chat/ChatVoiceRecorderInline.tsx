"use client";

import React, { useState } from "react";
import { Mic, Square, X, Send, Play, Pause, Flame } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { audioPlayerService } from "@/lib/audio/audioPlayerService";

interface ChatVoiceRecorderInlineProps {
  onSend: (audioDataUri: string, durationSeconds: number, waveform: number[]) => void;
  onCancel: () => void;
  isBurnMode: boolean;
}

export const ChatVoiceRecorderInline: React.FC<ChatVoiceRecorderInlineProps> = ({
  onSend,
  onCancel,
  isBurnMode,
}) => {
  const { t, language } = useVessel();
  
  const {
    status,
    secondsElapsed,
    maxSeconds,
    waveformLevels,
    recordedResult,
    startRecording,
    stopRecording,
    discardRecording,
  } = useAudioRecorder({ maxDurationMs: 60000 });

  const [isPlaying, setIsPlaying] = useState(false);

  // Automatically start recording when mounted if idle
  React.useEffect(() => {
    if (status === "idle") {
      startRecording();
    }
  }, [status, startRecording]);

  const handleStop = () => {
    audioEngine.playPulse();
    stopRecording();
  };

  const handleCancel = () => {
    discardRecording();
    audioPlayerService.stop();
    onCancel();
  };

  const handleSend = () => {
    if (recordedResult) {
      onSend(recordedResult.dataUri, recordedResult.durationSeconds, recordedResult.waveform);
    }
  };

  const togglePlayPreview = () => {
    if (!recordedResult) return;
    
    if (isPlaying) {
      audioPlayerService.pause();
      setIsPlaying(false);
    } else {
      audioPlayerService.onStateChange = (state) => {
        setIsPlaying(state === "playing");
      };
      audioPlayerService.play(recordedResult.dataUri, "preview");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex w-full items-center p-2.5 sm:p-3 bg-obsidian-surface border-t border-white/10 space-x-2">
      {/* Cancel Button (44x44px) */}
      <button
        onClick={handleCancel}
        type="button"
        aria-label={t.chat.voiceCancel || (language === "es" ? "Cancelar grabación" : "Cancel recording")}
        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Recording State */}
      {(status === "recording" || status === "requesting") && (
        <div className="flex-1 flex items-center justify-between px-3 min-h-[44px] rounded-2xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs text-red-400">
              {formatDuration(secondsElapsed)} / {formatDuration(maxSeconds)}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 h-5 overflow-hidden flex-1 mx-3 justify-center">
            {waveformLevels.slice(0, 20).map((level, i) => (
              <div
                key={i}
                className="w-1 bg-red-500/50 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(20, level)}%` }}
              />
            ))}
          </div>

          <button
            onClick={handleStop}
            type="button"
            aria-label={t.chat.voiceTapToStop || (language === "es" ? "Detener grabación" : "Stop recording")}
            className="w-10 h-10 min-w-[44px] min-h-[44px] -mr-1 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="flex-1 flex items-center justify-between px-3 min-h-[44px] rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-[11px]">
          <span className="truncate">
            {language === "es" ? "⚠️ Micrófono bloqueado o no disponible" : "⚠️ Microphone blocked or unavailable"}
          </span>
          <button
            type="button"
            onClick={() => startRecording()}
            className="px-3 py-1.5 min-h-[36px] bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-[10px] uppercase font-bold transition-colors ml-2 flex-shrink-0 cursor-pointer"
          >
            {language === "es" ? "Reintentar" : "Retry"}
          </button>
        </div>
      )}

      {/* Recorded State */}
      {status === "recorded" && recordedResult && (
        <div className="flex-1 flex items-center justify-between px-3 min-h-[44px] rounded-2xl bg-electricViolet/10 border border-electricViolet/20">
          <button
            onClick={togglePlayPreview}
            type="button"
            aria-label={isPlaying ? (language === "es" ? "Pausar vista previa" : "Pause preview") : (language === "es" ? "Escuchar grabación" : "Play preview")}
            className="w-10 h-10 min-w-[44px] min-h-[44px] -ml-1 flex items-center justify-center rounded-full bg-electricViolet/20 text-electricViolet hover:bg-electricViolet/40 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          
          <div className="flex items-center space-x-1 h-5 overflow-hidden flex-1 mx-3 justify-center">
            {recordedResult.waveform.slice(0, 20).map((level, i) => (
              <div
                key={i}
                className="w-1 bg-electricViolet/50 rounded-full"
                style={{ height: `${Math.max(20, level)}%` }}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {isBurnMode && <Flame className="w-4 h-4 text-red-500" />}
            <span className="font-mono text-xs text-neutral-300">
              {formatDuration(Math.floor(recordedResult.durationSeconds))}
            </span>
          </div>
        </div>
      )}

      {/* Send Button (44x44px) */}
      <button
        onClick={handleSend}
        disabled={status !== "recorded"}
        type="button"
        aria-label={t.chat.voiceSendBtn || (language === "es" ? "Enviar audio de voz" : "Send voice note")}
        className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-all ${
          status === "recorded"
            ? "bg-electricViolet hover:bg-electricViolet-glow text-white shadow-violet-soft border-transparent cursor-pointer"
            : "bg-white/5 border border-white/10 text-neutral-600 cursor-not-allowed"
        }`}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};

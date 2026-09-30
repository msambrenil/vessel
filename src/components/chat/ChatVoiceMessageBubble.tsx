"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Flame } from "lucide-react";
import { audioPlayerService } from "@/lib/audio/audioPlayerService";
import { useVessel } from "@/context/VesselContext";

interface ChatVoiceMessageBubbleProps {
  messageId: string;
  voiceData: { audioUrl: string; durationSeconds: number; waveform: number[] };
  isMine: boolean;
  isBurnOnView?: boolean;
  isBurned?: boolean;
  timestamp: string;
  onBurn?: (messageId: string) => void;
}

export const ChatVoiceMessageBubble: React.FC<ChatVoiceMessageBubbleProps> = ({
  messageId,
  voiceData,
  isMine,
  isBurnOnView,
  isBurned,
  timestamp,
  onBurn,
}) => {
  const { t, language } = useVessel();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Sync initial state if it's already playing
    if (audioPlayerService.isPlaying(messageId)) {
      setIsPlaying(true);
    }
  }, [messageId]);

  useEffect(() => {
    // Poll for progress ONLY while actively playing this voice message (Zero idle CPU drain)
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const playing = audioPlayerService.isPlaying(messageId);
      if (!playing) {
        setIsPlaying(false);
        if (!audioPlayerService.getCurrentPlayingId()) {
          setProgress(0);
        }
        return;
      }

      const current = audioPlayerService.getCurrentTime();
      const dur = voiceData.durationSeconds || 1;
      setProgress(Math.min(1, current / dur));
    }, 100);

    return () => clearInterval(interval);
  }, [messageId, isPlaying, voiceData.durationSeconds]);

  const togglePlay = () => {
    if (isBurned) return;

    // Register callbacks specifically for this bubble just before playing
    audioPlayerService.onStateChange = (state, id) => {
      if (id === messageId) {
        setIsPlaying(state === "playing");
        if (state === "ended") {
          setProgress(0);
          if (isBurnOnView && !isBurned) {
            onBurn?.(messageId);
          }
        }
      } else if (state === "playing") {
        setIsPlaying(false);
      }
    };

    audioPlayerService.onProgress = (prog, id) => {
      if (id === messageId) {
        setProgress(prog.progress);
      }
    };

    audioPlayerService.play(voiceData.audioUrl, messageId);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine colors based on ownership
  const bubbleBg = isMine ? "bg-electricViolet/20" : "bg-white/5";
  const bubbleBorder = isMine ? "border-electricViolet/30" : "border-white/10";
  const iconColor = isMine ? "text-electricViolet-glow" : "text-neutral-300";

  return (
    <div
      className={`relative flex items-center p-2 rounded-2xl border ${bubbleBg} ${bubbleBorder} min-w-[210px] max-w-[290px] space-x-3 backdrop-blur-sm`}
    >
      {/* Play/Pause Button (44x44px ergonomic target) */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={isBurned}
        className={`flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center bg-obsidian-deep border ${bubbleBorder} transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
          isBurned ? "opacity-50 cursor-not-allowed" : "hover:border-white/30 cursor-pointer"
        }`}
        aria-label={
          isPlaying
            ? (language === "es" ? "Pausar nota de voz" : "Pause voice note")
            : (language === "es" ? "Reproducir nota de voz" : "Play voice note")
        }
      >
        {isPlaying ? (
          <Pause className={`w-4 h-4 ${iconColor}`} />
        ) : (
          <Play className={`w-4 h-4 ml-0.5 ${iconColor}`} />
        )}
      </button>

      {/* Waveform and Duration */}
      <div className="flex-1 flex flex-col justify-center">
        {isBurned ? (
          <div className="flex items-center space-x-2 text-neutral-500">
            <Flame className="w-4 h-4 text-red-500/50" />
            <span className="text-xs">{t.chat.voiceBurnNotice}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-1 mb-1 h-5">
              {(Array.isArray(voiceData?.waveform) && voiceData.waveform.length > 0
                ? voiceData.waveform
                : [30, 50, 70, 40, 60, 80, 50, 40, 30, 60, 45, 35]
              ).slice(0, 20).map((h, i) => {
                const isActive = (i / 20) <= progress;
                const barHeight = Math.max(4, (h / 100) * 16);
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-colors duration-150 ${
                      isActive ? (isMine ? "bg-electricViolet" : "bg-white") : "bg-neutral-600/50"
                    }`}
                    style={{ height: `${barHeight}px` }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-neutral-400">
                {isPlaying ? formatDuration(Math.floor(progress * voiceData.durationSeconds)) : formatDuration(voiceData.durationSeconds)}
              </span>
              {isBurnOnView && <Flame className="w-3 h-3 text-red-500/80" />}
            </div>
          </>
        )}
      </div>

      {/* Timestamp */}
      <div className="absolute -bottom-5 right-1 flex items-center space-x-1">
        <span className="text-[10px] text-neutral-500">{timestamp}</span>
      </div>
    </div>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { VoiceSnippet } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import { audioPlayerService } from "@/lib/audio/audioPlayerService";

interface VoiceVibePlayerProps {
  voice?: VoiceSnippet;
  compact?: boolean;
}

export const VoiceVibePlayer: React.FC<VoiceVibePlayerProps> = ({ voice, compact = false }) => {
  const { activePlayingVoiceId, playVoiceVibe, stopVoiceVibe, t } = useVessel();
  const [progress, setProgress] = useState(0);

  const isPlaying = voice ? activePlayingVoiceId === voice.id : false;

  useEffect(() => {
    if (isPlaying && voice) {
      const prevProgress = audioPlayerService.onProgress;
      audioPlayerService.onProgress = (p, id) => {
        if (id === voice.id) setProgress(p.progress);
        if (prevProgress) prevProgress(p, id);
      };
      return () => {
        audioPlayerService.onProgress = prevProgress;
        setProgress(0);
      };
    } else {
      setProgress(0);
    }
  }, [isPlaying, voice]);

  if (!voice) return null;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopVoiceVibe();
    } else {
      playVoiceVibe(voice);
    }
  };

  const defaultWaveform = [25, 55, 80, 100, 65, 45, 90, 85, 60, 40, 75, 50, 30];
  const waveform = voice.waveform && voice.waveform.length > 0 ? voice.waveform : defaultWaveform;

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleTogglePlay}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all ${
          isPlaying
            ? "bg-electricViolet text-white border-electricViolet font-bold shadow-violet-soft animate-pulse"
            : "bg-neutral-900 text-purple-200 border-electricViolet/30 hover:border-electricViolet hover:bg-neutral-800"
        }`}
        title={isPlaying ? t.tacticalSuite.voiceVibe.playing : t.tacticalSuite.voiceVibe.listen}
      >
        <span>{isPlaying ? "⏸" : "▶"}</span>
        <span>{voice.durationSeconds || 5}s</span>
        <span className="flex items-end gap-0.5 h-2.5">
          {[40, 90, 60].map((h, i) => {
            const isPassed = progress >= (i / 3);
            return (
              <span
                key={i}
                className={`w-0.5 rounded-full transition-all ${
                  isPlaying ? (isPassed ? "bg-white" : "bg-white/50") : "bg-electricViolet/80"
                }`}
                style={{ height: `${isPlaying ? (isPassed ? h : h * 0.7) : h}%` }}
              />
            );
          })}
        </span>
      </button>
    );
  }

  return (
    <div
      onClick={handleTogglePlay}
      className={`w-full p-2.5 rounded-xl border cursor-pointer transition-all ${
        isPlaying
          ? "bg-gradient-to-r from-purple-950/40 via-neutral-900 to-neutral-950 border-electricViolet shadow-violet-soft"
          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-all ${
              isPlaying
                ? "bg-electricViolet text-white shadow-violet-soft"
                : "bg-neutral-800 text-purple-200 hover:bg-neutral-700"
            }`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-neutral-200 uppercase tracking-wider">
                Voice Vibe
              </span>
              <span className="px-1.5 py-0.2 rounded bg-neutral-800 font-mono text-[9px] text-purple-200">
                {voice.durationSeconds || 5}s
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate max-w-[180px]">
              {voice.label || "Audio de voz // Tono auténtico"}
            </p>
          </div>
        </div>

        {/* Ecualizador / Waveform visual brutalista */}
        <div className="flex items-end gap-1 h-6 pr-1 relative overflow-hidden">
          {/* Fondo para indicar progreso opcional (opcional: o solo colorear barras) */}
          {waveform.map((val, idx) => {
            const isPassed = progress >= (idx / waveform.length);
            return (
              <span
                key={idx}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying 
                    ? isPassed 
                      ? "bg-electricViolet shadow-sm shadow-electricViolet" 
                      : "bg-electricViolet/30"
                    : "bg-neutral-700"
                }`}
                style={{
                  height: `${isPlaying ? (isPassed ? val : Math.max(15, val * 0.6)) : val}%`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useRef, useEffect } from "react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { Zap, Check } from "lucide-react";

import { RoleType } from "@/types/vessel";
import { getRoleActionMeta } from "@/data/roleActionCatalog";
import { useVessel } from "@/context/VesselContext";

interface FillMeterProps {
  profileId: string;
  targetCodename: string;
  role?: RoleType | string;
  onSignalSent?: () => void;
  isAlreadySent?: boolean;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const FillMeter: React.FC<FillMeterProps> = ({
  profileId,
  targetCodename,
  role,
  onSignalSent,
  isAlreadySent = false,
  label,
  className = "",
  compact = false,
}) => {
  const { language } = useVessel();
  const roleAction = getRoleActionMeta(role, language, targetCodename);
  const displayLabel = label || roleAction.actionLabel;
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [completed, setCompleted] = useState(isAlreadySent);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const DURATION_MS = 1100; // 1.1s para llenado

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (completed) return;

    setIsPressing(true);
    startTimeRef.current = Date.now();
    audioEngine.startFillSound();

    const animate = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const nextProgress = Math.min(elapsed / DURATION_MS, 1);

      setProgress(nextProgress);
      audioEngine.updateFillProgress(nextProgress);

      if (nextProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCompleted(true);
        setIsPressing(false);
        audioEngine.playSignalSent();
        if (onSignalSent) {
          onSignalSent();
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (completed) return;

    setIsPressing(false);
    startTimeRef.current = null;
    audioEngine.stopFillSound();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioEngine.stopFillSound();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === " " || e.key === "Enter") && !isPressing && !completed) {
      e.preventDefault();
      handleStart(e as unknown as React.MouseEvent);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if ((e.key === " " || e.key === "Enter") && isPressing) {
      e.preventDefault();
      handleEnd(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div className={`relative select-none ${className}`}>
      <button
        type="button"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        aria-label={completed ? roleAction.sentLabel : displayLabel}
        className={`relative w-full min-h-[44px] overflow-hidden rounded-full border transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          completed
            ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
            : isPressing
            ? "bg-electricViolet/20 border-electricViolet text-white"
            : "bg-white/5 border-white/10 text-neutral-300 hover:border-electricViolet/60 hover:text-white"
        } ${compact ? "py-2 px-3 text-xs" : "py-3 px-4 text-xs font-semibold"}`}
      >
        {/* Barra de progreso de llenado líquido con gradiente violeta */}
        <div
          className="absolute inset-0 bg-electricViolet/40 transition-[width] duration-75 pointer-events-none rounded-full"
          style={{
            width: `${completed ? 100 : progress * 100}%`,
            background:
              "linear-gradient(90deg, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.85) 100%)",
          }}
        />

        {/* Texto y Estado de la Micro-interacción */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {completed ? (
            <>
              <Check className="w-4 h-4 text-white stroke-[3]" />
              <span className="text-white font-bold uppercase tracking-wider">
                {roleAction.sentLabel}
              </span>
            </>
          ) : isPressing ? (
            <>
              <span className="text-base animate-bounce leading-none">{roleAction.icon}</span>
              <span className="text-electricViolet-glow font-bold uppercase tracking-wider">
                {roleAction.shortLabel}... {Math.round(progress * 100)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-sm leading-none">{roleAction.icon}</span>
              <span>{displayLabel}</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

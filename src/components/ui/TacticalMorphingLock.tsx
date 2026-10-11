"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export type TacticalLockVariant = "default" | "violet" | "blood" | "emerald";
export type TacticalLockSize = "sm" | "md" | "lg" | "xl";

export interface TacticalMorphingLockProps {
  isLocked: boolean;
  onToggle?: (locked: boolean) => void;
  size?: TacticalLockSize;
  variant?: TacticalLockVariant;
  asButton?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  soundEffect?: boolean;
  "aria-label"?: string;
}

const sizeConfig: Record<
  TacticalLockSize,
  {
    iconSize: number;
    strokeWidth: number;
    containerSize: string;
  }
> = {
  sm: { iconSize: 16, strokeWidth: 2.2, containerSize: "w-8 h-8" },
  md: { iconSize: 20, strokeWidth: 2.2, containerSize: "w-11 h-11" },
  lg: { iconSize: 26, strokeWidth: 2, containerSize: "w-13 h-13" },
  xl: { iconSize: 34, strokeWidth: 1.8, containerSize: "w-16 h-16" },
};

const variantColors: Record<
  TacticalLockVariant,
  {
    lockedColor: string;
    unlockedColor: string;
    lockedGlow: string;
    unlockedGlow: string;
    buttonBorder: string;
    buttonBg: string;
  }
> = {
  default: {
    lockedColor: "#A3A3A3", // neutral-400
    unlockedColor: "#A78BFA", // electricViolet-glow
    lockedGlow: "rgba(163, 163, 163, 0.2)",
    unlockedGlow: "rgba(139, 92, 246, 0.5)",
    buttonBorder: "border-white/10 hover:border-white/30",
    buttonBg: "bg-obsidian-surface hover:bg-white/5",
  },
  violet: {
    lockedColor: "#71717A", // zinc-500
    unlockedColor: "#C084FC", // violet-400
    lockedGlow: "rgba(113, 113, 122, 0.2)",
    unlockedGlow: "rgba(192, 132, 252, 0.6)",
    buttonBorder: "border-electricViolet/30 hover:border-electricViolet",
    buttonBg: "bg-electricViolet/10 hover:bg-electricViolet/20",
  },
  blood: {
    lockedColor: "#E61937", // bloodNeon
    unlockedColor: "#34D399", // mintNeon
    lockedGlow: "rgba(230, 25, 55, 0.6)",
    unlockedGlow: "rgba(52, 211, 153, 0.6)",
    buttonBorder: "border-bloodNeon/40 hover:border-bloodNeon",
    buttonBg: "bg-bloodNeon/10 hover:bg-bloodNeon/20",
  },
  emerald: {
    lockedColor: "#71717A",
    unlockedColor: "#10B981", // emerald-500
    lockedGlow: "rgba(113, 113, 122, 0.2)",
    unlockedGlow: "rgba(16, 185, 129, 0.6)",
    buttonBorder: "border-emerald-500/30 hover:border-emerald-400",
    buttonBg: "bg-emerald-500/10 hover:bg-emerald-500/20",
  },
};

/**
 * TacticalMorphingLock — Primitiva de icono y botón de candado táctico
 *
 * Microinteracción brutalista:
 * - Al abrirse: el grillete (shackle) se eleva y gira en pivote suavemente con brillo de color.
 * - Al cerrarse: el grillete cae en seco y el cuerpo del candado sufre un micro-slam mecánico.
 * - Feedback háptico/sub-bass sincronizado con SubBassAudioEngine.
 */
export const TacticalMorphingLock: React.FC<TacticalMorphingLockProps> = ({
  isLocked,
  onToggle,
  size = "md",
  variant = "default",
  asButton = false,
  disabled = false,
  className = "",
  label,
  soundEffect = true,
  "aria-label": ariaLabel,
}) => {
  const prevLockedRef = useRef(isLocked);
  const cfg = sizeConfig[size];
  const colors = variantColors[variant];

  useEffect(() => {
    if (soundEffect && prevLockedRef.current !== isLocked) {
      if (isLocked) {
        audioEngine.playPulse();
      } else {
        audioEngine.playVaultUnlock();
      }
    }
    prevLockedRef.current = isLocked;
  }, [isLocked, soundEffect]);

  const handleToggle = () => {
    if (disabled || !onToggle) return;
    onToggle(!isLocked);
  };

  const lockColor = isLocked ? colors.lockedColor : colors.unlockedColor;
  const glow = isLocked ? colors.lockedGlow : colors.unlockedGlow;

  const svgContent = (
    <motion.svg
      width={cfg.iconSize}
      height={cfg.iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke={lockColor}
      strokeWidth={cfg.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        filter: `drop-shadow(0 0 8px ${glow})`,
      }}
      animate={{
        scale: isLocked ? [1, 0.88, 1.1, 1] : [1, 1.18, 1],
      }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="overflow-visible select-none transition-all duration-500"
    >
      {/* Grillete (Shackle) animado con morphing angular amplio y traslación deliberada */}
      <motion.path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        initial={false}
        animate={{
          y: isLocked ? 0 : -4.5,
          rotate: isLocked ? 0 : 35,
          transformOrigin: "17px 7px",
        }}
        transition={{
          type: "spring",
          stiffness: 140,
          damping: 15,
          mass: 1,
        }}
      />

      {/* Cuerpo del candado (Caja blindada) */}
      <rect x="3" y="11" width="18" height="11" rx="3" ry="3" />

      {/* Ranura/Punto táctico de seguridad */}
      <motion.circle
        cx="12"
        cy="16.5"
        r="1.5"
        fill={isLocked ? lockColor : "currentColor"}
        animate={{
          scale: isLocked ? 1 : 1.4,
          opacity: isLocked ? 0.8 : 1,
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.svg>
  );

  if (asButton || onToggle) {
    return (
      <button
        type="button"
        role="button"
        aria-pressed={isLocked}
        aria-label={
          ariaLabel ||
          label ||
          (isLocked ? "Desbloquear acceso" : "Bloquear acceso")
        }
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex items-center justify-center gap-2 rounded-2xl border transition-all duration-500 cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet disabled:opacity-40 disabled:cursor-not-allowed ${cfg.containerSize} ${colors.buttonBorder} ${colors.buttonBg} ${className}`}
      >
        {svgContent}
        {label && (
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-300">
            {label}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {svgContent}
    </div>
  );
};

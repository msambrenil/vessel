"use client";

import React, { useEffect, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export type BrutalistButtonVariant =
  | "primary"
  | "danger"
  | "secondary"
  | "ghost"
  | "outline"
  | "mint"
  | "amber"
  | "tactical"
  | "favorite";

export type BrutalistButtonSize =
  | "default"
  | "sm"
  | "lg"
  | "icon"
  | "compact"
  | "compact-icon";

export interface BrutalistButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BrutalistButtonVariant;
  size?: BrutalistButtonSize;
  soundEffect?: "pulse" | "subbass" | "vault" | "none";
  isLoading?: boolean;
  isSaving?: boolean;
  isSuccess?: boolean;
  savingText?: string;
  successText?: string;
}

export const BrutalistButton = React.forwardRef<
  HTMLButtonElement,
  BrutalistButtonProps
>(
  (
    {
      variant = "primary",
      size = "default",
      soundEffect = "pulse",
      isLoading = false,
      isSaving = false,
      isSuccess = false,
      savingText = "Guardando...",
      successText = "¡Guardado!",
      disabled = false,
      onClick,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const prevSuccessRef = useRef(false);

    useEffect(() => {
      if (isSuccess && !prevSuccessRef.current) {
        audioEngine.playSuccess();
      }
      prevSuccessRef.current = isSuccess;
    }, [isSuccess]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading || isSaving) return;

      if (soundEffect === "pulse") {
        audioEngine.playPulse();
      } else if (soundEffect === "subbass") {
        audioEngine.playSubBass(75);
      } else if (soundEffect === "vault") {
        audioEngine.playVaultUnlock();
      }

      onClick?.(e);
    };

    // 1. Clases base comunes para todos los botones brutalistas
    const baseClasses =
      "relative overflow-hidden inline-flex items-center justify-center rounded-2xl font-mono uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";

    // 2. Variantes semánticas
    const variantClasses: Record<BrutalistButtonVariant, string> = {
      primary:
        "bg-electricViolet text-white hover:bg-electricViolet-glow hover:shadow-[0_0_18px_rgba(139,92,246,0.45)] active:bg-purple-700 focus-visible:ring-electricViolet border border-electricViolet/50",
      danger:
        "bg-bloodNeon text-white hover:bg-bloodNeon-glow hover:shadow-[0_0_15px_rgba(230,25,55,0.4)] active:bg-red-700 focus-visible:ring-bloodNeon border border-bloodNeon/50",
      secondary:
        "bg-concrete text-neutral-200 hover:bg-concrete-mid hover:text-white active:bg-concrete-dark focus-visible:ring-white/40 border border-white/10 hover:border-white/20",
      ghost:
        "bg-transparent text-neutral-400 hover:text-neutral-100 hover:bg-white/5 active:bg-white/10 focus-visible:ring-white/30 border border-transparent hover:border-white/10",
      outline:
        "bg-transparent text-neutral-200 hover:text-electricViolet-glow hover:border-electricViolet active:bg-electricViolet/10 focus-visible:ring-electricViolet border border-white/20",
      mint:
        "bg-emerald-400 text-obsidian-deep hover:bg-emerald-300 hover:shadow-[0_0_18px_rgba(16,185,129,0.5)] active:bg-emerald-600 focus-visible:ring-emerald-400 border border-emerald-300 font-black",
      amber:
        "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-obsidian-deep hover:from-amber-400 hover:to-amber-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] active:bg-amber-600 focus-visible:ring-amber-400 border border-amber-300 font-black tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)]",
      tactical:
        "bg-black/60 hover:bg-electricViolet/25 border border-white/15 hover:border-electricViolet/60 text-white shadow-sm hover:shadow-violet-soft backdrop-blur-xs active:bg-electricViolet/30 focus-visible:ring-electricViolet",
      favorite:
        "border border-white/15 bg-black/60 text-neutral-400 hover:border-amber-400/60 hover:text-amber-300 hover:bg-black/90 focus-visible:ring-amber-400 aria-pressed:border-amber-400 aria-pressed:bg-amber-950/80 aria-pressed:text-amber-400 aria-pressed:shadow-[0_0_10px_rgba(251,191,36,0.4)]",
    };

    // 3. Tamaños ergonómicos (cumpliendo 44px mínimo para touch-targets de pulgar según WCAG 2.5.5)
    const sizeClasses: Record<BrutalistButtonSize, string> = {
      default: "min-h-[44px] px-4 py-2.5 text-xs gap-2",
      sm: "min-h-[36px] px-3 py-1.5 text-[11px] gap-1.5 after:absolute after:-inset-1 after:content-['']",
      lg: "min-h-[50px] px-6 py-3 text-sm gap-2.5",
      icon: "w-11 h-11 min-w-[44px] min-h-[44px] p-0 flex items-center justify-center text-sm",
      compact: "min-h-[34px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 text-[10px] sm:text-[10.5px] gap-1.5 after:absolute after:-inset-1.5 after:content-['']",
      "compact-icon": "w-8 h-8 sm:w-9 sm:h-9 min-w-0 min-h-0 p-0 flex items-center justify-center text-xs after:absolute after:-inset-2 after:content-['']",
    };

    const savingClasses = isSaving
      ? "!bg-electricViolet/85 !border-electricViolet-glow shadow-violet-soft shadow-[0_0_22px_rgba(139,92,246,0.55)] cursor-wait transition-all duration-500 ease-out"
      : "";
    const successClasses = isSuccess
      ? "!bg-mintNeon !text-obsidian-deep !border-mintNeon shadow-[0_0_25px_rgba(52,211,153,0.65)] font-black transition-all duration-500 ease-out"
      : "";

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${savingClasses} ${successClasses} ${className}`;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading || isSaving}
        aria-busy={isLoading || isSaving ? "true" : undefined}
        onClick={handleClick}
        className={combinedClasses}
        {...props}
      >
        {/* Shimmer cinemático activo durante el proceso de guardado */}
        {isSaving && (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-tactical-shimmer pointer-events-none"
          />
        )}

        {/* Flash microinteractivo al confirmar éxito */}
        {isSuccess && (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-white/35 pointer-events-none animate-out fade-out duration-500"
          />
        )}

        {isSuccess ? (
          <span className="relative z-10 inline-flex items-center gap-1.5 animate-in zoom-in-90 duration-300">
            <CheckCircle2 className="w-4 h-4 stroke-[3] text-obsidian-deep animate-success-pop" />
            <span>{successText}</span>
          </span>
        ) : isSaving ? (
          <span className="relative z-10 inline-flex items-center gap-1.5 animate-in fade-in duration-300">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>{savingText}</span>
          </span>
        ) : isLoading ? (
          <span className="relative z-10 inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );


  }
);

BrutalistButton.displayName = "BrutalistButton";


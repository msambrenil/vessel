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
  | "amber";

export type BrutalistButtonSize = "default" | "sm" | "lg" | "icon";

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
      "inline-flex items-center justify-center rounded-2xl font-mono uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100";

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
    };

    // 3. Tamaños ergonómicos (cumpliendo 44px mínimo para touch-targets de pulgar)
    const sizeClasses: Record<BrutalistButtonSize, string> = {
      default: "min-h-[44px] px-4 py-2.5 text-xs gap-2",
      sm: "min-h-[36px] px-3 py-1.5 text-[11px] gap-1.5",
      lg: "min-h-[50px] px-6 py-3 text-sm gap-2.5",
      icon: "w-11 h-11 min-w-[44px] min-h-[44px] p-0 flex items-center justify-center text-sm",
    };

    const savingClasses = isSaving
      ? "!bg-electricViolet/80 !border-electricViolet-glow shadow-violet-soft cursor-wait"
      : "";
    const successClasses = isSuccess
      ? "!bg-mintNeon !text-obsidian-deep !border-mintNeon shadow-[0_0_20px_rgba(16,185,129,0.5)] font-black"
      : "";

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${savingClasses} ${successClasses} ${className}`;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading || isSaving}
        onClick={handleClick}
        className={combinedClasses}
        {...props}
      >
        {isSuccess ? (
          <span className="inline-flex items-center gap-1.5 animate-in zoom-in-95 duration-150">
            <CheckCircle2 className="w-4 h-4 stroke-[3] text-obsidian-deep" />
            <span>{successText}</span>
          </span>
        ) : isSaving ? (
          <span className="inline-flex items-center gap-1.5 animate-in fade-in duration-150">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>{savingText}</span>
          </span>
        ) : isLoading ? (
          <span className="inline-flex items-center gap-2">
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


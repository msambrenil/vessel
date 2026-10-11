"use client";

import React from "react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export type FilterPillVariant =
  | "default"
  | "violet"
  | "amber"
  | "emerald"
  | "cyan"
  | "blood";

export interface FilterPillProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  count?: number;
  variant?: FilterPillVariant;
  onClick?: () => void;
  onClear?: () => void;
  soundEffect?: boolean;
}

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  icon,
  active = false,
  count,
  variant = "default",
  onClick,
  onClear,
  soundEffect = true,
  disabled = false,
  className = "",
  title,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (soundEffect) {
      audioEngine.playPulse();
    }
    onClick?.();
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (soundEffect) {
      audioEngine.playPulse();
    }
    onClear?.();
  };

  const activeStyles: Record<FilterPillVariant, string> = {
    default:
      "bg-white/20 text-white border-white/40 shadow-xs font-black",
    violet:
      "bg-electricViolet text-white border-electricViolet-glow font-black shadow-violet-glow",
    amber:
      "bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)] font-black",
    emerald:
      "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)] font-black",
    cyan:
      "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] font-black",
    blood:
      "bg-bloodNeon/25 border-bloodNeon text-bloodNeon shadow-blood-glow font-black",
  };

  const idleStyles =
    "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10";

  if (active && onClear) {
    return (
      <div
        className={`inline-flex items-center min-h-[36px] sm:min-h-[34px] rounded-full text-[10.5px] font-mono font-bold border transition-all duration-150 flex-shrink-0 select-none ${
          activeStyles[variant]
        } ${className}`}
      >
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={active}
          disabled={disabled}
          title={title}
          className="px-2.5 py-1 min-h-[36px] sm:min-h-[34px] flex items-center gap-1.5 cursor-pointer rounded-l-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          {...props}
        >
          {icon && <span className="flex-shrink-0 leading-none">{icon}</span>}
          <span className="whitespace-nowrap truncate">{label}</span>
          {typeof count === "number" && count > 0 && (
            <span className="text-[9px] px-1 rounded-full font-mono flex-shrink-0 bg-white/20 text-white font-black">
              {count}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={handleClear}
          aria-label={`Limpiar ${label}`}
          title={`Limpiar ${label}`}
          className="pr-2.5 pl-1 py-1 min-h-[36px] min-w-[28px] sm:min-h-[34px] rounded-r-full hover:bg-white/20 text-neutral-200 hover:text-white cursor-pointer flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
        >
          <span className="text-[11px] font-bold leading-none">✕</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      disabled={disabled}
      title={title}
      className={`px-2.5 py-1 min-h-[36px] sm:min-h-[34px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all duration-150 flex-shrink-0 cursor-pointer border select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? activeStyles[variant] : idleStyles
      } ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0 leading-none">{icon}</span>}
      <span className="whitespace-nowrap truncate">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span
          className={`text-[9px] px-1 rounded-full font-mono flex-shrink-0 ${
            active
              ? "bg-white/20 text-white font-black"
              : "bg-white/10 text-neutral-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

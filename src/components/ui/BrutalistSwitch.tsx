"use client";

import React from "react";
import { Eye, EyeOff, Lock, Unlock, Bell, BellOff } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export interface BrutalistSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "violet" | "emerald" | "blood";
  icon?: "eye" | "lock" | "bell" | "none";
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export const BrutalistSwitch: React.FC<BrutalistSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  variant = "violet",
  icon = "none",
  disabled = false,
  size = "md",
  className = "",
  id,
  "aria-label": ariaLabel,
}) => {
  const handleToggle = () => {
    if (disabled) return;
    audioEngine.playPulse();
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  const variantColors = {
    violet: {
      activeBg: "bg-electricViolet shadow-violet-soft",
      ring: "focus-visible:ring-electricViolet",
      dot: "bg-white text-electricViolet",
    },
    emerald: {
      activeBg: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]",
      ring: "focus-visible:ring-emerald-400",
      dot: "bg-white text-emerald-600",
    },
    blood: {
      activeBg: "bg-bloodNeon shadow-blood-glow",
      ring: "focus-visible:ring-bloodNeon",
      dot: "bg-white text-bloodNeon",
    },
  };

  const selectedVariant = variantColors[variant] || variantColors.violet;

  const isSmall = size === "sm";
  const pillDimensions = isSmall ? "w-10 h-6 p-0.5" : "w-12 h-7 p-1";
  const dotDimensions = isSmall ? "w-5 h-5" : "w-5 h-5";
  const translateActive = isSmall ? "translate-x-4" : "translate-x-5";

  // Microinteracción de icono de estado (Morphing State Icon) en el pulgar
  const renderThumbIcon = () => {
    if (icon === "eye") {
      return checked ? (
        <Eye className="w-3 h-3 stroke-[2.5] transition-all duration-400 scale-100 rotate-0" />
      ) : (
        <EyeOff className="w-3 h-3 stroke-[2.5] text-neutral-500 transition-all duration-400 scale-90 -rotate-12" />
      );
    }
    if (icon === "lock") {
      return checked ? (
        <Lock className="w-3 h-3 stroke-[2.5] transition-all duration-400 scale-100 rotate-0" />
      ) : (
        <Unlock className="w-3 h-3 stroke-[2.5] text-neutral-500 transition-all duration-400 scale-90 12" />
      );
    }
    if (icon === "bell") {
      return checked ? (
        <Bell className="w-3 h-3 stroke-[2.5] transition-all duration-400 scale-100 rotate-0" />
      ) : (
        <BellOff className="w-3 h-3 stroke-[2.5] text-neutral-500 transition-all duration-400 scale-90 -rotate-12" />
      );
    }
    return null;
  };

  const switchButton = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center rounded-full transition-all duration-400 cursor-pointer flex-shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${pillDimensions} ${selectedVariant.ring} ${
        checked ? selectedVariant.activeBg : "bg-neutral-800 border border-white/10"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none rounded-full shadow-md transition-all duration-400 ease-out flex items-center justify-center ${dotDimensions} ${selectedVariant.dot} ${
          checked ? translateActive : "translate-x-0"
        }`}
      >
        {renderThumbIcon()}
      </span>
    </button>
  );


  if (!label && !description) {
    return (
      <div className={`min-w-[44px] min-h-[44px] flex items-center justify-center ${className}`}>
        {switchButton}
      </div>
    );
  }

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center justify-between gap-3 min-h-[44px] cursor-pointer select-none group ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div className="flex flex-col min-w-0 pr-1">
        {label && (
          <span className="text-xs font-mono font-bold text-white group-hover:text-neutral-100 transition-colors">
            {label}
          </span>
        )}
        {description && (
          <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-300 transition-colors">
            {description}
          </span>
        )}
      </div>
      <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
        {switchButton}
      </div>
    </div>
  );
};

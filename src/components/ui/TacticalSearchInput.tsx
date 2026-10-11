"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export interface TacticalSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  testId?: string;
  className?: string;
  autoFocus?: boolean;
}

export const TacticalSearchInput: React.FC<TacticalSearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Buscar...",
  ariaLabel = "Buscar",
  testId,
  className = "",
  autoFocus = false,
}) => {
  const handleClear = () => {
    audioEngine.playPulse();
    onChange("");
    onClear?.();
  };

  return (
    <div className={`relative flex-1 min-w-0 ${className}`}>
      <Search
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${
          value ? "text-electricViolet-glow" : "text-neutral-400"
        }`}
      />
      <input
        type="text"
        data-testid={testId}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[44px] sm:min-h-[40px] bg-white/5 border border-white/10 rounded-xl text-white text-base sm:text-xs pl-9 pr-8 py-2 sm:py-1.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all font-sans select-text"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

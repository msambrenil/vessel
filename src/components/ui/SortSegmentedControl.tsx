"use client";

import React from "react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export interface SortOption<T extends string> {
  id: T;
  label: string;
  icon?: string | React.ReactNode;
  title?: string;
}

export interface SortSegmentedControlProps<T extends string> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  testId?: string;
  size?: "default" | "sm";
}

export function SortSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  testId = "sort-segmented-control",
  size = "default",
}: SortSegmentedControlProps<T>) {
  const handleSelect = (id: T) => {
    audioEngine.playPulse();
    onChange(id);
  };

  const isSmall = size === "sm";

  return (
    <div
      data-testid={testId}
      role="radiogroup"
      aria-label="Criterio de ordenamiento"
      className={`flex items-center gap-1 w-full bg-neutral-950/80 border border-white/15 rounded-xl p-1 font-mono select-none ${className}`}
    >
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-testid={`sort-option-${opt.id}`}
            onClick={() => handleSelect(opt.id)}
            title={opt.title}
            className={`flex-1 ${
              isSmall ? "min-h-[34px] text-[10px] py-1 px-2" : "min-h-[44px] text-xs sm:text-sm py-2 px-3"
            } rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.98] ${
              isSelected
                ? "bg-electricViolet text-white font-black shadow-[0_0_15px_rgba(139,92,246,0.35)] border border-electricViolet-glow"
                : "text-neutral-300 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {opt.icon && <span className="text-sm shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

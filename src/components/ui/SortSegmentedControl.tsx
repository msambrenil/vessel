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
}

export function SortSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  testId = "sort-segmented-control",
}: SortSegmentedControlProps<T>) {
  const handleSelect = (id: T) => {
    audioEngine.playPulse();
    onChange(id);
  };

  return (
    <div
      data-testid={testId}
      role="radiogroup"
      aria-label="Criterio de ordenamiento"
      className={`flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-full p-0.5 font-mono text-[9.5px] flex-shrink-0 ${className}`}
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
            className={`px-2 py-1 min-h-[28px] sm:min-h-[30px] rounded-full transition-all duration-150 cursor-pointer flex items-center gap-1 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electricViolet ${
              isSelected
                ? "bg-electricViolet text-white font-black shadow-violet-soft"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

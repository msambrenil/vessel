"use client";

import React from "react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export interface SegmentedTabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  testId?: string;
  badge?: React.ReactNode;
  accentClass?: string;
  glowColor?: string;
}

export interface SegmentedTabGroupProps<T extends string = string> {
  tabs: SegmentedTabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  size?: "sm" | "default";
  variant?: "obsidian" | "violet" | "glass";
  testId?: string;
  ariaLabel?: string;
}

export function SegmentedTabGroup<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
  size = "default",
  variant = "obsidian",
  testId = "segmented-tab-group",
  ariaLabel = "Selector de pestañas segmentado",
}: SegmentedTabGroupProps<T>) {
  const handleSelect = (id: T) => {
    audioEngine.playSubBass(60, 0.08);
    onChange(id);
  };

  const containerVariantClasses = {
    obsidian: "bg-black/60 border-white/10",
    violet: "bg-electricViolet/10 border-electricViolet/25",
    glass: "bg-obsidian-surface/80 backdrop-blur-md border-white/15",
  };

  const sizeClasses = {
    sm: "min-h-[30px] text-[10px] py-1 px-1.5",
    default: "min-h-[34px] sm:min-h-[36px] text-[10px] sm:text-[11.5px] py-1 px-2",
  };

  return (
    <div
      data-testid={testId}
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-1 p-0.5 border rounded-xl select-none ${containerVariantClasses[variant]} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            data-testid={tab.testId || `segmented-tab-${tab.id}`}
            onClick={() => handleSelect(tab.id)}
            title={tab.title}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg font-mono font-bold tracking-tight transition-all duration-150 cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              sizeClasses[size]
            } ${
              isActive
                ? tab.accentClass ||
                  "bg-electricViolet/20 border border-electricViolet text-white font-black shadow-[0_0_12px_rgba(138,43,226,0.3)]"
                : "bg-transparent border border-transparent text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
            style={{
              boxShadow: isActive && tab.glowColor ? `0 0 10px ${tab.glowColor}` : undefined,
            }}
          >
            {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
            <span className="truncate max-w-full">{tab.label}</span>
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}

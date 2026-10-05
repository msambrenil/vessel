"use client";

import React from "react";
import { useRadarMatrix, useSettings } from "@/context/VesselContext";
import { OperatingIntentMode } from "@/types/vessel";
import { Zap, Moon, ShieldCheck, Flame } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface IntentTabConfig {
  id: OperatingIntentMode;
  labelKey: "now" | "nightlife" | "kink" | "stealth";
  icon: React.ReactNode;
  accentBorder: string;
  accentText: string;
  accentBg: string;
  glowColor: string;
}

export const IntentHubSelector: React.FC = () => {
  const {
    operatingIntent,
    setOperatingIntent,
    matrixTab,
    setMatrixTab,
  } = useRadarMatrix();
  const { language, t } = useSettings();

  const peopleTabs: IntentTabConfig[] = [
    {
      id: "now",
      labelKey: "now",
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      accentBorder: "border-amber-400/80",
      accentText: "text-amber-300",
      accentBg: "bg-amber-400/15",
      glowColor: "rgba(251, 191, 36, 0.25)",
    },
    {
      id: "kink",
      labelKey: "kink",
      icon: <Flame className="w-3.5 h-3.5 text-bloodNeon" />,
      accentBorder: "border-bloodNeon/80",
      accentText: "text-bloodNeon",
      accentBg: "bg-bloodNeon/15",
      glowColor: "rgba(255, 0, 85, 0.25)",
    },
    {
      id: "stealth",
      labelKey: "stealth",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />,
      accentBorder: "border-cyan-400/80",
      accentText: "text-cyan-300",
      accentBg: "bg-cyan-400/15",
      glowColor: "rgba(34, 211, 238, 0.25)",
    },
  ];

  const handleSelectPeopleIntent = (mode: OperatingIntentMode) => {
    audioEngine.playSubBass(60, 0.1);
    setMatrixTab("people");
    setOperatingIntent(mode);
  };

  const handleSelectPlaces = () => {
    audioEngine.playSubBass(60, 0.1);
    setMatrixTab("places");
    setOperatingIntent("nightlife");
  };

  const isPlacesActive = matrixTab === "places";

  return (
    <section
      aria-label="Selector de Sintonías e Intenciones"
      className="w-full bg-obsidian-deep/95 border-b border-white/10 px-2 sm:px-4 py-1.5 backdrop-blur-md sticky top-[52px] z-20 select-none shadow-sm"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-1 p-0.5 bg-black/60 border border-white/10 rounded-xl">
          {/* Grupo 1: Sintonías de Gente (La Matriz) */}
          <div className="grid grid-cols-3 gap-1 flex-[3] min-w-0">
            {peopleTabs.map((tab) => {
              const isActive = matrixTab === "people" && operatingIntent === tab.id;
              const label = t.intents[tab.labelKey];

              return (
                <button
                  key={tab.id}
                  data-testid={`intent-tab-${tab.id}`}
                  onClick={() => handleSelectPeopleIntent(tab.id)}
                  className={`min-h-[34px] sm:min-h-[36px] flex items-center justify-center gap-1 sm:gap-1.5 px-1 py-1 rounded-lg transition-all duration-150 cursor-pointer select-none text-[10px] sm:text-[11.5px] font-bold tracking-tight ${
                    isActive
                      ? `${tab.accentBg} ${tab.accentBorder} border shadow-lg ${tab.accentText} font-black`
                      : "bg-transparent border border-transparent text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95"
                  }`}
                  style={{
                    boxShadow: isActive ? `0 0 10px ${tab.glowColor}` : "none",
                  }}
                  title={label}
                  aria-pressed={isActive}
                >
                  {tab.icon}
                  <span className="tracking-tight truncate max-w-full">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divisor Visual Táctico: Separa Sintonías de Personas de Lugares & Fiestas */}
          <div className="w-px h-5 bg-white/20 flex-shrink-0" />

          {/* Grupo 2: Portal de Boliches, Lugares & Fiestas (Visualmente Diferenciado) */}
          <div className="flex-1 min-w-0">
            <button
              data-testid="intent-tab-nightlife"
              onClick={handleSelectPlaces}
              className={`w-full min-h-[34px] sm:min-h-[36px] flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-1.5 py-1 rounded-lg transition-all duration-150 cursor-pointer select-none text-[10px] sm:text-[11.5px] font-bold tracking-tight ${
                isPlacesActive
                  ? "bg-gradient-to-r from-pink-600/30 to-purple-600/25 border border-pink-400 text-pink-100 font-black shadow-[0_0_14px_rgba(236,72,153,0.35)] ring-1 ring-pink-400/50"
                  : "bg-pink-950/25 border border-pink-500/30 text-pink-300/90 hover:bg-pink-500/20 hover:border-pink-500/60 hover:text-pink-100 active:scale-95"
              }`}
              title={t.intents.nightlife}
              aria-pressed={isPlacesActive}
            >
              <Moon className={`w-3.5 h-3.5 flex-shrink-0 ${isPlacesActive ? "text-pink-300 animate-pulse" : "text-pink-400"}`} />
              <span className="tracking-tight truncate max-w-full font-black">
                {t.intents.nightlife}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

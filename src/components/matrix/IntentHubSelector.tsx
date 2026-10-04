"use client";

import React from "react";
import { useRadarMatrix, useSettings, useAuth } from "@/context/VesselContext";
import { OperatingIntentMode } from "@/types/vessel";
import { Zap, Moon, ShieldCheck, Flame, Home, Clock } from "lucide-react";
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
    myOnTheClock,
    startOnTheClock,
    stopOnTheClock,
    intentClusters,
  } = useRadarMatrix();
  const { language, t } = useSettings();
  const { myProfile } = useAuth();

  const intentTabs: IntentTabConfig[] = [
    {
      id: "now",
      labelKey: "now",
      icon: <Zap className="w-4 h-4 text-amber-400 animate-pulse" />,
      accentBorder: "border-amber-400/80",
      accentText: "text-amber-400",
      accentBg: "bg-amber-400/10",
      glowColor: "rgba(251, 191, 36, 0.25)",
    },
    {
      id: "nightlife",
      labelKey: "nightlife",
      icon: <Moon className="w-4 h-4 text-pink-400" />,
      accentBorder: "border-pink-500/80",
      accentText: "text-pink-400",
      accentBg: "bg-pink-500/10",
      glowColor: "rgba(236, 72, 153, 0.25)",
    },
    {
      id: "kink",
      labelKey: "kink",
      icon: <Flame className="w-4 h-4 text-bloodNeon" />,
      accentBorder: "border-bloodNeon/80",
      accentText: "text-bloodNeon",
      accentBg: "bg-bloodNeon/10",
      glowColor: "rgba(255, 0, 85, 0.25)",
    },
    {
      id: "stealth",
      labelKey: "stealth",
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
      accentBorder: "border-cyan-400/80",
      accentText: "text-cyan-400",
      accentBg: "bg-cyan-400/10",
      glowColor: "rgba(34, 211, 238, 0.25)",
    },
  ];

  const handleSelectIntent = (mode: OperatingIntentMode) => {
    if (mode === operatingIntent) return;
    setOperatingIntent(mode);
  };

  const handleToggleOnTheClock = () => {
    audioEngine.playSubBass(70, 0.15);
    if (myOnTheClock.isActive) {
      stopOnTheClock();
    } else {
      startOnTheClock(60, language === "es" ? "Disponible ahora" : "Available now");
    }
  };

  const activeTabConfig = intentTabs.find((t) => t.id === operatingIntent) || intentTabs[0];

  const getSubLabel = () => {
    if (operatingIntent === "now") {
      return language === "es"
        ? "Sintonizando anfitriones con lugar y perfiles listos en <90m"
        : "Matching hosts with place & ready profiles in <90m";
    }
    if (operatingIntent === "nightlife") {
      return language === "es"
        ? "Clubes, saunas, afters y perfiles en ruta de fiesta hoy"
        : "Clubs, saunas, afters & active nightlife profiles tonight";
    }
    if (operatingIntent === "kink") {
      return language === "es"
        ? "Fetiches, roles explícitos y alta intensidad sin censura"
        : "Explicit fetishes, defined roles & raw intensity";
    }
    return language === "es"
      ? "Navegación ultra discreta, modo niebla forzado y cero rastro"
      : "Ultra-discreet browsing, forced fog mode & zero public trace";
  };

  return (
    <section
      aria-label="Selector de Sintonías e Intenciones"
      className="w-full bg-obsidian-deep/90 border-b border-white/10 px-3 pt-2 pb-2.5 backdrop-blur-md sticky top-14 z-20"
    >
      {/* Selector Táctico de 4 Modos (Thumb-Zone Friendly) */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/60 border border-white/10 rounded-md">
        {intentTabs.map((tab) => {
          const isActive = operatingIntent === tab.id;
          const label = t.intents[tab.labelKey];

          return (
            <button
              key={tab.id}
              onClick={() => handleSelectIntent(tab.id)}
              className={`min-h-[46px] flex flex-col items-center justify-center px-1 py-1 rounded transition-all duration-200 select-none ${
                isActive
                  ? `${tab.accentBg} ${tab.accentBorder} border shadow-lg text-white font-bold`
                  : "bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5 active:scale-95"
              }`}
              style={{
                boxShadow: isActive ? `0 0 12px ${tab.glowColor}` : "none",
              }}
              title={label}
            >
              <div className="flex items-center gap-1">
                {tab.icon}
                <span className="text-[11px] font-mono tracking-wider uppercase leading-none hidden sm:inline">
                  {label}
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-tight uppercase leading-none sm:hidden mt-0.5 truncate max-w-full">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Franja de Contexto Operativo & Disparador Táctico Listo YA */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[11px]">
        <div className="flex items-center gap-1.5 text-zinc-400 min-w-0 pr-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <p className="font-mono text-[10.5px] truncate text-zinc-300">
            {getSubLabel()}
          </p>
        </div>

        {/* Botón Táctico Listo YA (On The Clock) en 1 Tap */}
        <button
          onClick={handleToggleOnTheClock}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] font-mono uppercase tracking-wider shrink-0 transition-all active:scale-95 ${
            myOnTheClock.isActive
              ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse"
              : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
          }`}
          title={myOnTheClock.isActive ? "Desactivar Listo YA" : "Activar disponibilidad inmediata (1 hora)"}
        >
          <Clock className="w-3 h-3" />
          <span>{myOnTheClock.isActive ? "LISTO YA ⚡" : "ACTIVAR YA"}</span>
        </button>
      </div>
    </section>
  );
};

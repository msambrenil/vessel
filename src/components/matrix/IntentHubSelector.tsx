"use client";

import React from "react";
import { useRadarMatrix, useSettings } from "@/context/VesselContext";
import { OperatingIntentMode } from "@/types/vessel";
import { Zap, Moon, ShieldCheck, Flame } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { SegmentedTabGroup, SegmentedTabItem } from "@/components/ui/SegmentedTabGroup";

export const IntentHubSelector: React.FC = () => {
  const {
    operatingIntent,
    setOperatingIntent,
    matrixTab,
    setMatrixTab,
  } = useRadarMatrix();
  const { language, t } = useSettings();

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

  const getShortLabel = (key: string, fullLabel: string) => {
    if (language === "es") {
      if (key === "kink") return "Morbos";
      if (key === "nightlife") return "Boliches";
      if (key === "now") return "Pinta ya";
      if (key === "stealth") return "Discreto";
    } else {
      if (key === "kink") return "Kink";
      if (key === "nightlife") return "Places";
      if (key === "now") return "Ready";
      if (key === "stealth") return "Stealth";
    }
    return fullLabel;
  };

  const currentTab: OperatingIntentMode =
    matrixTab === "places" ? "nightlife" : operatingIntent;

  const tabs: SegmentedTabItem<OperatingIntentMode>[] = [
    {
      id: "now",
      label: (
        <>
          <span className="hidden sm:inline tracking-tight truncate max-w-full">
            {t.intents.now}
          </span>
          <span className="sm:hidden tracking-tight truncate max-w-full">
            {getShortLabel("now", t.intents.now)}
          </span>
        </>
      ),
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      title: t.intents.now,
      testId: "intent-tab-now",
      accentClass:
        "bg-amber-400/15 border-amber-400/80 border text-amber-300 font-black shadow-lg",
      glowColor: "rgba(251, 191, 36, 0.25)",
    },
    {
      id: "kink",
      label: (
        <>
          <span className="hidden sm:inline tracking-tight truncate max-w-full">
            {t.intents.kink}
          </span>
          <span className="sm:hidden tracking-tight truncate max-w-full">
            {getShortLabel("kink", t.intents.kink)}
          </span>
        </>
      ),
      icon: <Flame className="w-3.5 h-3.5 text-bloodNeon" />,
      title: t.intents.kink,
      testId: "intent-tab-kink",
      accentClass:
        "bg-bloodNeon/15 border-bloodNeon/80 border text-bloodNeon font-black shadow-lg",
      glowColor: "rgba(255, 0, 85, 0.25)",
    },
    {
      id: "stealth",
      label: (
        <>
          <span className="hidden sm:inline tracking-tight truncate max-w-full">
            {t.intents.stealth}
          </span>
          <span className="sm:hidden tracking-tight truncate max-w-full">
            {getShortLabel("stealth", t.intents.stealth)}
          </span>
        </>
      ),
      icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />,
      title: t.intents.stealth,
      testId: "intent-tab-stealth",
      accentClass:
        "bg-cyan-400/15 border-cyan-400/80 border text-cyan-300 font-black shadow-lg",
      glowColor: "rgba(34, 211, 238, 0.25)",
    },
    {
      id: "nightlife",
      label: (
        <>
          <span className="hidden sm:inline tracking-tight truncate max-w-full font-black">
            {t.intents.nightlife}
          </span>
          <span className="sm:hidden tracking-tight truncate max-w-full font-black">
            {getShortLabel("nightlife", t.intents.nightlife)}
          </span>
        </>
      ),
      icon: (
        <Moon
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            currentTab === "nightlife"
              ? "text-pink-300 animate-pulse"
              : "text-pink-400"
          }`}
        />
      ),
      title: t.intents.nightlife,
      testId: "intent-tab-nightlife",
      accentClass:
        "bg-gradient-to-r from-pink-600/30 to-purple-600/25 border border-pink-400 text-pink-100 font-black shadow-[0_0_14px_rgba(236,72,153,0.35)] ring-1 ring-pink-400/50",
      glowColor: "rgba(236, 72, 153, 0.35)",
    },
  ];

  const handleSelectTab = (tabId: OperatingIntentMode) => {
    if (tabId === "nightlife") {
      handleSelectPlaces();
    } else {
      handleSelectPeopleIntent(tabId);
    }
  };

  return (
    <nav
      aria-label="Selector de Sintonías e Intenciones"
      className="w-full px-2 sm:px-4 py-1 pb-1.5 border-t border-white/5 select-none"
    >
      <div className="max-w-4xl mx-auto">
        <SegmentedTabGroup<OperatingIntentMode>
          tabs={tabs}
          activeTab={currentTab}
          onChange={handleSelectTab}
          testId="intent-hub-segmented-group"
          ariaLabel="Sintonías e Intención Operativa"
        />
      </div>
    </nav>
  );
};

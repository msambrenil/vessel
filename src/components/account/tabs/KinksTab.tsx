"use client";

import React, { useState, useEffect } from "react";
import { useRadarMatrix, useSettings } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getActiveKinks, KINKS_UPDATED_EVENT, getKinkLocalizedLabel } from "@/lib/kinks/kinkAdminService";
import { KinkItemDefinition } from "@/data/energyCatalog";
import { Flame } from "lucide-react";
import { TacticalBadge, SectionHeroHeader, BrutalistButton } from "@/components/ui";

export const KinksTab: React.FC = () => {
  const { myKinkMatrix, setKinkPreference } = useRadarMatrix();
  const { t } = useSettings();
  const [activeKinksList, setActiveKinksList] = useState<KinkItemDefinition[]>(() => getActiveKinks());

  useEffect(() => {
    setActiveKinksList(getActiveKinks());
    const handleUpdate = () => {
      setActiveKinksList(getActiveKinks());
    };
    window.addEventListener(KINKS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(KINKS_UPDATED_EVENT, handleUpdate);
  }, []);

  const activeKinksCount = Object.values(myKinkMatrix).filter(
    (v) => v !== "pass"
  ).length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
        <SectionHeroHeader
          title="QUÉ TE MORBOSEA 😈"
          tag={`${activeKinksCount} DE ${activeKinksList.length} ACTIVOS`}
          subtitle="Tus gustos no son públicos. Solo se revelan ante coincidencia mutua de morbo."
          variant="blood"
          icon={<Flame className="w-4 h-4 fill-current text-bloodNeon-glow" />}
        />

        <div className="p-3 rounded-2xl bg-purple-950/20 border border-electricViolet/20 text-neutral-300 text-xs font-mono leading-relaxed">
          🔒 <strong>Regla Cero de Discreción:</strong> Ningún usuario puede ver tus respuestas en tu perfil. Cuando chatees o abras el perfil de alguien que también marcó un morbo en <em>"Me encanta"</em> o <em>"Curioso"</em>, la app iluminará un sello de morbo mutuo 🔥.
        </div>

        <div className="space-y-2.5 pt-1">
          {activeKinksList.map((kink) => {
            const currentPref = myKinkMatrix[kink.id] || "pass";

            return (
              <div
                key={kink.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 group"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform select-none mt-0.5 sm:mt-0">
                    {kink.emoji}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide truncate">
                      {getKinkLocalizedLabel(kink.id, t, kink.name)}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-sans leading-snug line-clamp-2">
                      {kink.description}
                    </p>
                  </div>
                </div>

                {/* Selector Segmentado de 3 Estados (Blindado contra desbordes en mobile) */}
                <div className="grid grid-cols-3 items-center gap-1 w-full md:w-auto md:min-w-[320px] bg-neutral-950/90 p-1 rounded-xl border border-white/10 shrink-0 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setKinkPreference(kink.id, "love");
                    }}
                    className={`w-full min-w-0 py-2 px-1 sm:px-2 min-h-[40px] rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 active:scale-95 ${
                      currentPref === "love"
                        ? "bg-emerald-500 text-black font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">Me encanta 🔥</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Curiosidad"
                    onClick={() => {
                      audioEngine.playPulse();
                      setKinkPreference(kink.id, "curious");
                    }}
                    className={`w-full min-w-0 py-2 px-1 sm:px-2 min-h-[40px] rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 active:scale-95 ${
                      currentPref === "curious"
                        ? "bg-amber-400 text-black font-black shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">Curioso 👀</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setKinkPreference(kink.id, "pass");
                    }}
                    className={`w-full min-w-0 py-2 px-1 sm:px-2 min-h-[40px] rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bloodNeon active:scale-95 ${
                      currentPref === "pass"
                        ? "bg-bloodNeon text-white font-black shadow-blood-glow"
                        : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">Paso ✕</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

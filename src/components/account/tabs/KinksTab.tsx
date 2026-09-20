"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getActiveKinks, KINKS_UPDATED_EVENT } from "@/lib/kinks/kinkAdminService";
import { KinkItemDefinition } from "@/data/energyCatalog";
import { Flame } from "lucide-react";
import { TacticalBadge, SectionHeroHeader } from "@/components/ui";

export const KinksTab: React.FC = () => {
  const { myKinkMatrix, setKinkPreference } = useVessel();
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
          title="QUÉ TE MORBOSEA 😈 // MORBOS"
          tag={`${activeKinksCount} / ${activeKinksList.length} ACTIVOS`}
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
                className="p-3 rounded-2xl bg-black/50 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl flex-shrink-0">{kink.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-mono font-bold text-white tracking-wide">
                        {kink.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono truncate">
                      {kink.description}
                    </p>
                  </div>
                </div>

                {/* Selector de 3 Estados Impeccable */}
                <div className="flex items-center gap-1 self-end sm:self-center bg-white/5 p-1 rounded-xl border border-white/10 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setKinkPreference(kink.id, "love");
                    }}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-[0.96] ${
                      currentPref === "love"
                        ? "bg-bloodNeon text-white font-black shadow-blood-glow scale-105"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    🔥 Me encanta
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setKinkPreference(kink.id, "curious");
                    }}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.96] ${
                      currentPref === "curious"
                        ? "bg-electricViolet text-white font-black shadow-violet-soft scale-105"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    👀 Curioso
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setKinkPreference(kink.id, "pass");
                    }}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-[0.96] ${
                      currentPref === "pass"
                        ? "bg-neutral-800 text-neutral-300 font-bold border border-white/10"
                        : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                    }`}
                  >
                    ✕ Paso
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

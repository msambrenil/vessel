"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { PreFlightChecklist } from "@/types/vessel";

interface PreFlightCardProps {
  data: PreFlightChecklist;
  isCurrentUser: boolean;
}

export const PreFlightCard: React.FC<PreFlightCardProps> = ({ data, isCurrentUser }) => {
  const { t, language } = useVessel();
  const tempoLabels: Record<string, string> = {
    fast_carnal: language === "es" ? "⚡ Rápido & Carnal" : "⚡ Fast & Carnal",
    sensual_slow: language === "es" ? "🔥 Sensual & Pausado" : "🔥 Sensual & Slow",
    rough_dom: language === "es" ? "⛓️ Dominación & Fuerte" : "⛓️ Dom & Intense",
    chill: language === "es" ? "🫂 Tranqui / Mimos" : "🫂 Chill / Cuddle",
  };

  const protectionLabels: Record<string, string> = {
    bareback_prep: language === "es" ? "PrEP e I=I" : "PrEP + U=U",
    prep_doxypep: language === "es" ? "PrEP + Doxy-PEP" : "PrEP + Doxy-PEP",
    condoms: language === "es" ? "Preservativo estricto" : "Strict Condoms",
    discuss: language === "es" ? "Conversar en persona" : "Discuss in person",
  };

  const vibeLabels: Record<string, string> = {
    "100_sober": language === "es" ? "100% Sobrio 💧" : "100% Sober 💧",
    drinks: language === "es" ? "Un trago 🍸" : "Drinks 🍸",
    "420_friendly": language === "es" ? "Cannabis / Flores 🌿" : "Cannabis Friendly 🌿",
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-electricViolet/40 bg-gradient-to-b from-[#14101e] to-[#09090b] p-3 shadow-lg shadow-purple-950/30 text-left">
      <div className="flex items-center justify-between border-b border-electricViolet/20 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📋</span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-electricViolet-glow">
            {t.tacticalSuite?.preFlight?.title || "Sintonía Previa de Encuentro"}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-electricViolet/20 border border-electricViolet/40 text-[10px] font-mono font-bold text-electricViolet-glow uppercase">
          <span>🔥</span> {language === "es" ? "Sintonía Mutua" : "Mutual Accord"}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Ritmo */}
        <div className="flex items-center justify-between text-neutral-300">
          <span className="font-mono text-[10px] text-neutral-500 uppercase">{language === "es" ? "Ritmo:" : "Tempo:"}</span>
          <span className="font-mono font-bold text-neutral-200">
            {tempoLabels[data.tempo] || data.tempo}
          </span>
        </div>

        {/* Protección */}
        <div className="flex items-center justify-between text-neutral-300">
          <span className="font-mono text-[10px] text-neutral-500 uppercase">{language === "es" ? "Salud / Barrera:" : "Health / Barrier:"}</span>
          <span className="font-mono text-purple-300 font-bold">
            {protectionLabels[data.protection] || data.protection}
          </span>
        </div>

        {/* Vibe */}
        <div className="flex items-center justify-between text-neutral-300">
          <span className="font-mono text-[10px] text-neutral-500 uppercase">{language === "es" ? "Sustancias:" : "Substances:"}</span>
          <span className="font-mono text-neutral-300">
            {vibeLabels[data.vibe] || data.vibe}
          </span>
        </div>

        {/* Dinámicas / Prácticas */}
        {data.dynamics && data.dynamics.length > 0 && (
          <div className="pt-1.5 border-t border-neutral-800/80">
            <span className="font-mono text-[10px] text-neutral-500 uppercase block mb-1">
              {language === "es" ? "Prácticas en sintonía:" : "Agreed practices:"}
            </span>
            <div className="flex flex-wrap gap-1">
              {data.dynamics.map((dyn) => (
                <span
                  key={dyn}
                  className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300"
                >
                  {dyn === "oral_focus" && (language === "es" ? "👅 Oral" : "👅 Oral")}
                  {dyn === "penetration" && (language === "es" ? "🍆 Penetración" : "🍆 Penetration")}
                  {dyn === "massage" && (language === "es" ? "💆 Masaje" : "💆 Massage")}
                  {dyn === "kink_gear" && (language === "es" ? "⛓️ Fetiche" : "⛓️ Kink")}
                  {dyn === "sensual_kiss" && (language === "es" ? "💋 Besos" : "💋 Kissing")}
                  {dyn === "voyeur_jerk" && (language === "es" ? "👁️ Voyeur" : "👁️ Voyeur")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-electricViolet/10 flex items-center justify-between text-[10px] font-mono text-neutral-500">
        <span>{isCurrentUser ? (language === "es" ? "Emitido por vos" : "Issued by you") : (language === "es" ? "Propuesto para el encuentro" : "Proposed for encounter")}</span>
        <span className="text-electricViolet-glow">{language === "es" ? "Acuerdo de Sintonía ✓" : "Tuning Accord ✓"}</span>
      </div>
    </div>
  );
};

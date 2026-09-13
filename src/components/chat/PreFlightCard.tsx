"use client";

import React from "react";
import { PreFlightChecklist } from "@/types/vessel";

interface PreFlightCardProps {
  data: PreFlightChecklist;
  isCurrentUser: boolean;
}

export const PreFlightCard: React.FC<PreFlightCardProps> = ({ data, isCurrentUser }) => {
  const tempoLabels: Record<string, string> = {
    fast_carnal: "⚡ Rápido & Carnal",
    sensual_slow: "🔥 Sensual & Pausado",
    rough_dom: "⛓️ Dominación & Fuerte",
    chill: "🫂 Tranqui / Mimos",
  };

  const protectionLabels: Record<string, string> = {
    bareback_prep: "PrEP // U=U",
    prep_doxypep: "PrEP + Doxy-PEP",
    condoms: "Preservativo estricto",
    discuss: "Conversar en persona",
  };

  const vibeLabels: Record<string, string> = {
    "100_sober": "100% Sobrio 💧",
    drinks: "Un trago 🍸",
    "420_friendly": "420 Friendly 🌿",
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-electricViolet/40 bg-gradient-to-b from-[#14101e] to-[#09090b] p-3 shadow-lg shadow-purple-950/30 text-left">
      <div className="flex items-center justify-between border-b border-electricViolet/20 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📋</span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-electricViolet-glow">
            Pre-Flight Checklist
          </span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-electricViolet/20 border border-electricViolet/40 text-[10px] font-mono font-bold text-electricViolet-glow uppercase">
          <span>🔥</span> Sintonía Fuego
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Ritmo */}
        <div className="flex items-center justify-between text-neutral-300">
          <span className="font-mono text-[10px] text-neutral-500 uppercase">Ritmo:</span>
          <span className="font-mono font-bold text-neutral-200">
            {tempoLabels[data.tempo] || data.tempo}
          </span>
        </div>

        {/* Protección */}
        <div className="flex items-center justify-between text-neutral-300">
          <span className="font-mono text-[10px] text-neutral-500 uppercase">Salud / Barrera:</span>
          <span className="font-mono text-purple-300 font-bold">
            {protectionLabels[data.protection] || data.protection}
          </span>
        </div>

        {/* Vibe */}
        <div className="flex items-center justify-between text-neutral-300">
          <span className="font-mono text-[10px] text-neutral-500 uppercase">Sustancias:</span>
          <span className="font-mono text-neutral-300">
            {vibeLabels[data.vibe] || data.vibe}
          </span>
        </div>

        {/* Dinámicas / Prácticas */}
        {data.dynamics && data.dynamics.length > 0 && (
          <div className="pt-1.5 border-t border-neutral-800/80">
            <span className="font-mono text-[10px] text-neutral-500 uppercase block mb-1">
              Prácticas en sintonía:
            </span>
            <div className="flex flex-wrap gap-1">
              {data.dynamics.map((dyn) => (
                <span
                  key={dyn}
                  className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300"
                >
                  {dyn === "oral_focus" && "👅 Oral"}
                  {dyn === "penetration" && "🍆 Penetración"}
                  {dyn === "massage" && "💆 Masaje"}
                  {dyn === "kink_gear" && "⛓️ Fetiche"}
                  {dyn === "sensual_kiss" && "💋 Besos"}
                  {dyn === "voyeur_jerk" && "👁️ Voyeur"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-electricViolet/10 flex items-center justify-between text-[10px] font-mono text-neutral-500">
        <span>{isCurrentUser ? "Emitido por ti" : "Propuesto para la sesión"}</span>
        <span className="text-electricViolet-glow">Acuerdo Cifrado ✓</span>
      </div>
    </div>
  );
};

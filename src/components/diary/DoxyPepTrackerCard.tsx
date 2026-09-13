"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { DoxyPepTracker } from "@/types/vessel";

interface DoxyPepTrackerCardProps {
  tracker: DoxyPepTracker;
}

export const DoxyPepTrackerCard: React.FC<DoxyPepTrackerCardProps> = ({ tracker }) => {
  const { toggleDoxyPepDose, dismissDoxyPepTracker, t } = useVessel();

  const now = Date.now();
  const due72Ms = new Date(tracker.due72h).getTime();
  const diffHours = Math.max(0, Math.round((due72Ms - now) / (1000 * 60 * 60)));
  const isExpired = now > due72Ms;

  return (
    <div className="p-3.5 rounded-xl border border-neutral-800 bg-gradient-to-b from-[#141414] to-[#0c0c0c] space-y-3 text-xs shadow-md">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">💊</span>
          <div>
            <span className="font-mono font-bold text-neutral-200 uppercase tracking-wider text-[11px] block">
              {t.tacticalSuite.doxyPep.title} // {tracker.partnerCodename}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              Encuentro del {tracker.encounterDate} ({tracker.encounterTime} hs)
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dismissDoxyPepTracker(tracker.id)}
          className="text-neutral-500 hover:text-neutral-300 font-mono text-xs"
          title="Descartar seguimiento"
        >
          ✕
        </button>
      </div>

      {/* Ventana de tiempo */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 font-mono text-[11px]">
        <span className="text-neutral-400">Ventana activa de protección:</span>
        <span
          className={`font-bold ${
            isExpired ? "text-red-400" : diffHours < 12 ? "text-amber-400 animate-pulse" : "text-emerald-400"
          }`}
        >
          {isExpired ? "VENTANA CERRADA" : `~${diffHours} hs restantes`}
        </span>
      </div>

      {/* Dosis */}
      <div className="grid grid-cols-2 gap-2">
        {/* Dosis 1: 24h */}
        <button
          type="button"
          onClick={() => toggleDoxyPepDose(tracker.id, "24h")}
          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
            tracker.taken24h
              ? "bg-emerald-950/30 border-emerald-500/60 text-emerald-300"
              : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
          }`}
        >
          <div>
            <span className="font-mono text-[10px] font-bold uppercase block">Dosis 1 (24h)</span>
            <span className="text-[10px] text-neutral-500">200mg Doxiciclina</span>
          </div>
          <span className="text-sm font-mono font-bold">{tracker.taken24h ? "✓" : "○"}</span>
        </button>

        {/* Dosis 2: 72h */}
        <button
          type="button"
          onClick={() => toggleDoxyPepDose(tracker.id, "72h")}
          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
            tracker.taken72h
              ? "bg-emerald-950/30 border-emerald-500/60 text-emerald-300"
              : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
          }`}
        >
          <div>
            <span className="font-mono text-[10px] font-bold uppercase block">Dosis 2 (Cierre)</span>
            <span className="text-[10px] text-neutral-500">Refuerzo opcional</span>
          </div>
          <span className="text-sm font-mono font-bold">{tracker.taken72h ? "✓" : "○"}</span>
        </button>
      </div>

      <p className="text-[10px] text-neutral-500 italic">
        * Doxy-PEP previene infecciones bacterianas (sífilis, clamidia). Tomar preferentemente con comida y abundante agua dentro de las 72 hs post-exposición.
      </p>
    </div>
  );
};

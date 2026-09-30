"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { DoxyPepTracker } from "@/types/vessel";
import { formatDiaryDateDisplay } from "@/lib/calendar/dateLocale";

interface DoxyPepTrackerCardProps {
  tracker: DoxyPepTracker;
}

export const DoxyPepTrackerCard: React.FC<DoxyPepTrackerCardProps> = ({ tracker }) => {
  const { toggleDoxyPepDose, dismissDoxyPepTracker, language, t } = useVessel();

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
              {t.tacticalSuite.doxyPep.title} • {tracker.partnerCodename}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {language === "es"
                ? `Encuentro del ${formatDiaryDateDisplay(tracker.encounterDate, language)} (${tracker.encounterTime} hs)`
                : `Encounter on ${formatDiaryDateDisplay(tracker.encounterDate, language)} (${tracker.encounterTime})`}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dismissDoxyPepTracker(tracker.id)}
          className="text-neutral-500 hover:text-neutral-300 font-mono text-xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/5"
          title={language === "es" ? "Descartar seguimiento" : "Dismiss tracker"}
        >
          ✕
        </button>
      </div>

      {/* Ventana de tiempo */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 font-mono text-[11px]">
        <span className="text-neutral-400">
          {language === "es" ? "Ventana activa de protección:" : "Active protection window:"}
        </span>
        <span
          className={`font-bold ${
            isExpired ? "text-red-400" : diffHours < 12 ? "text-amber-400 animate-pulse" : "text-emerald-400"
          }`}
        >
          {isExpired
            ? (language === "es" ? "VENTANA CERRADA" : "WINDOW CLOSED")
            : (language === "es" ? `~${diffHours} hs restantes` : `~${diffHours} hrs remaining`)}
        </span>
      </div>

      {/* Dosis */}
      <div className="grid grid-cols-2 gap-2">
        {/* Dosis 1: 24h */}
        <button
          type="button"
          onClick={() => toggleDoxyPepDose(tracker.id, "24h")}
          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
            tracker.taken24h
              ? "bg-emerald-950/30 border-emerald-500/60 text-emerald-300"
              : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
          }`}
        >
          <div>
            <span className="font-mono text-[10px] font-bold uppercase block">
              {language === "es" ? "Dosis 1 (24h)" : "Dose 1 (24h)"}
            </span>
            <span className="text-[10px] text-neutral-500">200mg Doxiciclina</span>
          </div>
          <span className="text-sm font-mono font-bold">{tracker.taken24h ? "✓" : "○"}</span>
        </button>

        {/* Dosis 2: 72h */}
        <button
          type="button"
          onClick={() => toggleDoxyPepDose(tracker.id, "72h")}
          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
            tracker.taken72h
              ? "bg-emerald-950/30 border-emerald-500/60 text-emerald-300"
              : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
          }`}
        >
          <div>
            <span className="font-mono text-[10px] font-bold uppercase block">
              {language === "es" ? "Dosis 2 (Cierre)" : "Dose 2 (Close)"}
            </span>
            <span className="text-[10px] text-neutral-500">
              {language === "es" ? "Refuerzo opcional" : "Optional booster"}
            </span>
          </div>
          <span className="text-sm font-mono font-bold">{tracker.taken72h ? "✓" : "○"}</span>
        </button>
      </div>

      <p className="text-[10px] text-neutral-500 italic">
        {language === "es"
          ? "* Doxy-PEP previene infecciones bacterianas (sífilis, clamidia). Tomar preferentemente con comida y abundante agua dentro de las 72 hs post-exposición."
          : "* Doxy-PEP prevents bacterial STIs (syphilis, chlamydia). Take preferably with food and plenty of water within 72h post-exposure."}
      </p>
    </div>
  );
};

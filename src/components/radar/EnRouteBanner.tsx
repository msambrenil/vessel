"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";

export const EnRouteBanner: React.FC = () => {
  const { enRouteState, openEnRouteModal, arrivedEnRoute, t } = useVessel();

  if (!enRouteState.isActive) return null;

  return (
    <div className="w-full bg-gradient-to-r from-purple-950/80 via-neutral-900 to-purple-950/80 border-y border-electricViolet/40 px-4 py-2 flex items-center justify-between shadow-lg shadow-black/40 z-30 shadow-violet-soft">
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-electricViolet-glow uppercase tracking-wider">
              {t.tacticalSuite.enRoute.onMyWay}
            </span>
            <span className="font-mono text-xs text-neutral-200 font-bold">
              • ~{enRouteState.etaMinutes} min
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 truncate max-w-[200px]">
            Hacia {enRouteState.targetCodename || "Encuentro"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={arrivedEnRoute}
          className="px-2.5 py-1 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded transition-all active:scale-95 shadow-violet-soft"
        >
          {enRouteState.isArrived ? "¡En la puerta!" : "Llegué 📍"}
        </button>
        <button
          type="button"
          onClick={() => openEnRouteModal()}
          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[10px] uppercase rounded"
        >
          Ver
        </button>
      </div>
    </div>
  );
};

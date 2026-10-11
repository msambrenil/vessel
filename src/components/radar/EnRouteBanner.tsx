"use client";

import React from "react";
import { useLogistics, useSettings } from "@/context/VesselContext";
import { BrutalistButton } from "@/components/ui";

export const EnRouteBanner: React.FC = () => {
  const { enRouteState, openEnRouteModal, arrivedEnRoute } = useLogistics();
  const { t } = useSettings();

  if (!enRouteState.isActive) return null;

  return (
    <div className="w-full bg-gradient-to-r from-purple-950/80 via-neutral-900 to-purple-950/80 border-y border-electricViolet/40 px-3 sm:px-4 py-2 flex items-center justify-between shadow-lg shadow-black/40 z-30 shadow-violet-soft select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-electricViolet-glow uppercase tracking-wider">
              {t.tacticalSuite.enRoute.onMyWay}
            </span>
            <span className="font-mono text-xs text-neutral-200 font-bold">
              • ~{enRouteState.etaMinutes} min
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 truncate max-w-[180px] sm:max-w-[240px]">
            Hacia {enRouteState.targetCodename || "Encuentro"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <BrutalistButton
          type="button"
          variant="primary"
          size="compact"
          soundEffect="pulse"
          onClick={arrivedEnRoute}
          className="min-h-[40px] !px-3 !py-1 text-[10px] font-mono font-bold uppercase tracking-wider !rounded-xl shadow-violet-soft"
        >
          {enRouteState.isArrived ? "¡En la puerta!" : "Llegué 📍"}
        </BrutalistButton>
        <BrutalistButton
          type="button"
          variant="ghost"
          size="compact"
          soundEffect="none"
          onClick={() => openEnRouteModal()}
          className="min-h-[40px] !px-2.5 !py-1 text-[10px] font-mono uppercase !rounded-xl !bg-neutral-800/80 hover:!bg-neutral-700 text-neutral-300 border border-white/10"
        >
          Ver
        </BrutalistButton>
      </div>
    </div>
  );
};

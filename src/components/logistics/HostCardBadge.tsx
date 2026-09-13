"use client";

import React from "react";
import { HostCardInfo } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";

interface HostCardBadgeProps {
  hostCard?: HostCardInfo;
  onClick?: () => void;
  compact?: boolean;
}

export const HostCardBadge: React.FC<HostCardBadgeProps> = ({
  hostCard,
  onClick,
  compact = false,
}) => {
  const { t } = useVessel();

  if (!hostCard) return null;

  const hasPlace = hostCard.hasPlace;

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border transition-all ${
          hasPlace
            ? "bg-purple-950/40 text-purple-200 border-electricViolet/40 hover:bg-purple-900/60 hover:border-electricViolet"
            : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200"
        }`}
        title={hasPlace ? t.tacticalSuite.hostCard.hasPlace : t.tacticalSuite.hostCard.noPlace}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${hasPlace ? "bg-electricViolet animate-pulse" : "bg-neutral-600"}`} />
        <span>{hasPlace ? t.tacticalSuite.hostCard.badgeHasPlace : t.tacticalSuite.hostCard.badgeTravels}</span>
        {hostCard.amenities?.showerReady && <span title="Ducha lista">🚿</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
        hasPlace
          ? "bg-gradient-to-r from-purple-950/30 to-neutral-950 border-electricViolet/40 hover:border-electricViolet shadow-violet-soft"
          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded flex items-center justify-center font-mono text-sm border ${
            hasPlace
              ? "bg-electricViolet/15 text-purple-200 border-electricViolet/30"
              : "bg-neutral-800 text-neutral-400 border-neutral-700"
          }`}
        >
          {hasPlace ? "🏠" : "🚗"}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                hasPlace ? "text-purple-200" : "text-neutral-300"
              }`}
            >
              {hasPlace ? t.tacticalSuite.hostCard.hasPlace : t.tacticalSuite.hostCard.noPlace}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate max-w-[200px]">
            {hostCard.livingArrangement === "solo" && "Solo • Espacio privado"}
            {hostCard.livingArrangement === "roommates" && "Con roommates"}
            {hostCard.livingArrangement === "partner_aware" && "Pareja en casa"}
            {hostCard.livingArrangement === "hotel" && "Hotel / Temporal"}
            {hostCard.notes && ` — ${hostCard.notes}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
        {hostCard.amenities?.showerReady && <span title="Ducha lista">🚿</span>}
        {hostCard.amenities?.cleanTowels && <span title="Toallas limpias">🧼</span>}
        {hostCard.amenities?.elevator && <span title="Ascensor">🛗</span>}
        {hostCard.supplies?.lube && <span title="Lube listo">💧</span>}
        <span className="font-mono text-[10px] text-neutral-500 uppercase ml-1">Ver Ficha →</span>
      </div>
    </button>
  );
};

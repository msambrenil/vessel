"use client";

import React from "react";
import { SubstanceAtmosphere } from "@/types/vessel";
import { SUBSTANCE_ATMOSPHERE_CATALOG } from "@/data/substanceCatalog";
import { useVessel } from "@/context/VesselContext";

interface Props {
  vibe?: SubstanceAtmosphere;
  compact?: boolean;
}

export const SubstanceAtmosphereBadge: React.FC<Props> = ({ vibe, compact = false }) => {
  const { language } = useVessel();
  if (!vibe) return null;

  const meta = SUBSTANCE_ATMOSPHERE_CATALOG[vibe] || SUBSTANCE_ATMOSPHERE_CATALOG.sober;
  const langKey = language === "en" ? "en" : "es";

  if (compact) {
    return (
      <span
        title={meta.title[langKey]}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-mono font-medium ${meta.badgeClass}`}
      >
        <span>{meta.icon}</span>
        <span>{meta.title[langKey]}</span>
      </span>
    );
  }

  return (
    <div className={`p-3 rounded-xl border ${meta.badgeClass} flex items-start gap-3 shadow-sm`}>
      <span className="text-xl leading-none flex-shrink-0 mt-0.5">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            {meta.title[langKey]}
          </span>
          <span className="text-[9.5px] font-mono text-neutral-300 opacity-80">
            {meta.subtitle[langKey]}
          </span>
        </div>
        <p className="text-[11px] text-neutral-200 mt-1 leading-snug">
          {meta.description[langKey]}
        </p>
      </div>
    </div>
  );
};

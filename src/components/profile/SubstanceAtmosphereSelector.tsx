"use client";

import React from "react";
import { useRadarMatrix, useSettings } from "@/context/VesselContext";
import { SubstanceAtmosphere } from "@/types/vessel";
import { SUBSTANCE_ATMOSPHERE_CATALOG } from "@/data/substanceCatalog";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { Check } from "lucide-react";

export const SubstanceAtmosphereSelector: React.FC = () => {
  const { mySubstanceAtmosphere, setMySubstanceAtmosphere } = useRadarMatrix();
  const { language } = useSettings();

  const handleSelect = (vibe: SubstanceAtmosphere) => {
    setMySubstanceAtmosphere(vibe);
    audioEngine.playSubBass(60);
  };

  const currentMeta = SUBSTANCE_ATMOSPHERE_CATALOG[mySubstanceAtmosphere] || SUBSTANCE_ATMOSPHERE_CATALOG.sober;
  const langKey = language === "en" ? "en" : "es";

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <span className="font-mono text-xs font-bold text-neutral-200 block uppercase tracking-wider">
          🍸 Atmósfera de Consumo & Sustancias
        </span>
        <span className="text-[10.5px] text-neutral-400">
          Define la sintonía de tu encuentro (Zero-Knowledge, guardado local)
        </span>
      </div>

      {/* Grid de 4 Opciones Tácticas (2 cols en mobile, 4 en desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.keys(SUBSTANCE_ATMOSPHERE_CATALOG) as SubstanceAtmosphere[]).map((key) => {
          const item = SUBSTANCE_ATMOSPHERE_CATALOG[key];
          const isSelected = mySubstanceAtmosphere === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between relative cursor-pointer ${
                isSelected
                  ? `${item.badgeClass} ring-1 ring-white/20 shadow-md scale-[1.01]`
                  : "bg-neutral-900/80 hover:bg-neutral-800/80 border-neutral-800 text-neutral-300"
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-lg leading-none">{item.icon}</span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              <div>
                <span className={`text-xs font-bold block leading-tight ${isSelected ? "text-white" : "text-neutral-200"}`}>
                  {item.title[langKey]}
                </span>
                <span className="text-[9.5px] text-neutral-400 block line-clamp-1 mt-0.5">
                  {item.subtitle[langKey]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

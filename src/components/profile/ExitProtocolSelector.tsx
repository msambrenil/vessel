"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { ExitProtocol } from "@/types/vessel";

export const ExitProtocolSelector: React.FC = () => {
  const { myExitProtocol, setMyExitProtocol, t } = useVessel();

  const options: { protocol: ExitProtocol; icon: string; title: string; subtitle: string }[] = [
    {
      protocol: "fast_encounter",
      icon: "⏱️",
      title: t.tacticalSuite.exitProtocol.fastEncounter,
      subtitle: "Acción puntual sin sobremesa; ideal para agendas ajustadas",
    },
    {
      protocol: "chill_cuddle",
      icon: "🫂",
      title: t.tacticalSuite.exitProtocol.chillCuddle,
      subtitle: "Ducha, charla amena y post-encuentro de 20 a 30 minutos",
    },
    {
      protocol: "sleepover",
      icon: "🌙",
      title: t.tacticalSuite.exitProtocol.sleepover,
      subtitle: "Posibilidad de pasar la noche si la química física es excelente",
    },
  ];

  return (
    <div className="space-y-2 text-xs">
      <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block">
        {t.tacticalSuite.exitProtocol.title}:
      </label>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const isSelected = myExitProtocol === opt.protocol;
          return (
            <button
              key={opt.protocol}
              type="button"
              onClick={() => setMyExitProtocol(opt.protocol)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                isSelected
                  ? "bg-purple-950/40 border-electricViolet text-white font-bold shadow-violet-soft"
                  : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{opt.icon}</span>
                <div>
                  <span className="font-mono text-xs block">{opt.title}</span>
                  <p className="text-[10px] text-neutral-500 font-normal">{opt.subtitle}</p>
                </div>
              </div>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  isSelected ? "border-electricViolet bg-electricViolet shadow-violet-soft" : "border-neutral-600"
                }`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

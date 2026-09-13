"use client";

import React from "react";
import { ExitProtocol } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";

interface ExitProtocolBadgeProps {
  protocol?: ExitProtocol;
  compact?: boolean;
  variant?: "default" | "compact" | "tactical";
  onClick?: () => void;
}

export const ExitProtocolBadge: React.FC<ExitProtocolBadgeProps> = ({
  protocol = "fast_encounter",
  compact = false,
  variant = "default",
  onClick,
}) => {
  const { t } = useVessel();

  const labels: Record<ExitProtocol, { label: string; icon: string; desc: string }> = {
    fast_encounter: {
      label: t.tacticalSuite.exitProtocol.fastEncounter,
      icon: "⏱️",
      desc: "Encuentro puntual, sin sobremesa prolongada.",
    },
    chill_cuddle: {
      label: t.tacticalSuite.exitProtocol.chillCuddle,
      icon: "🫂",
      desc: "Espacio para ducha, charla y mimos de 20-30 min.",
    },
    sleepover: {
      label: t.tacticalSuite.exitProtocol.sleepover,
      icon: "🌙",
      desc: "Posibilidad de pasar la noche si hay buena química mutua.",
    },
  };

  const item = labels[protocol] || labels.fast_encounter;

  if (compact || variant === "compact") {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-electricViolet/40 text-[10px] font-mono font-bold text-electricViolet-glow backdrop-blur-md shadow-sm ${
          onClick ? "cursor-pointer hover:border-electricViolet hover:text-white active:scale-95" : ""
        }`}
        title={item.desc}
      >
        <span className="text-xs">{item.icon}</span>
        <span className="truncate max-w-[130px] uppercase tracking-wider">{item.label}</span>
      </span>
    );
  }

  if (variant === "tactical") {
    return (
      <div
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={`flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 to-obsidian-surface border border-electricViolet/50 shadow-violet-soft text-purple-200 transition-all ${
          onClick ? "cursor-pointer hover:border-electricViolet hover:bg-purple-950/50 active:scale-98" : ""
        }`}
      >
        <span className="text-xl leading-none select-none flex-shrink-0 mt-0.5">{item.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-white text-xs uppercase tracking-wider truncate">
              {item.label}
            </span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow font-bold uppercase tracking-wider flex-shrink-0">
              Protocolo Acordado
            </span>
          </div>
          <p className="text-[11px] text-neutral-300 font-sans leading-relaxed mt-1">
            {item.desc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-neutral-300 ${
        onClick ? "cursor-pointer hover:border-electricViolet/40 active:scale-98" : ""
      }`}
    >
      <span className="text-base flex-shrink-0">{item.icon}</span>
      <div className="min-w-0 flex-1">
        <span className="font-mono font-bold text-neutral-200 block text-[11px] uppercase tracking-wide truncate">
          {item.label}
        </span>
        <p className="text-[10px] text-neutral-400 leading-tight">{item.desc}</p>
      </div>
    </div>
  );
};

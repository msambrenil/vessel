"use client";

import React from "react";
import { BodyState } from "@/types/vessel";

export interface TelemetryPillProps {
  bodyState?: BodyState;
  distanceLabel: string;
  isRemote?: boolean;
  title?: string;
  className?: string;
  testId?: string;
}

export const TelemetryPill: React.FC<TelemetryPillProps> = ({
  bodyState = "open",
  distanceLabel,
  isRemote = false,
  title,
  className = "",
  testId = "distance-telemetry-pill",
}) => {
  return (
    <div
      data-testid={testId}
      onClick={(e) => e.stopPropagation()}
      title={title}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm font-mono text-[9px] font-bold border cursor-default select-none transition-all ${
        isRemote
          ? "bg-black/90 border-purple-500/50 text-purple-300"
          : "bg-black/90 border-white/15 text-white"
      } ${className}`}
    >
      {/* Dot indicador de Estado Corporal */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          bodyState === "open"
            ? "bg-mintNeon shadow-mint-glow animate-pulse"
            : bodyState === "occupied"
            ? "bg-bloodNeon shadow-blood-glow"
            : "bg-purple-400"
        }`}
      />

      {/* Ícono de Satélite Táctico para perfiles fuera de radio local (>1km) */}
      {isRemote && <span className="leading-none text-[10px]">🛰️</span>}

      {/* Distancia discretizada S2 */}
      <span>{distanceLabel}</span>

      {/* Tag de Señal Remota */}
      {isRemote && (
        <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-electricViolet-glow ml-0.5">
          REMOTO
        </span>
      )}
    </div>
  );
};

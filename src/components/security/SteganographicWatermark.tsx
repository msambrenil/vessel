"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";

interface SteganographicWatermarkProps {
  ownerCodename?: string;
  className?: string;
  variant?: "dense" | "subtle";
  showBadge?: boolean;
}

export const SteganographicWatermark: React.FC<SteganographicWatermarkProps> = ({
  ownerCodename,
  className = "",
  variant = "subtle",
}) => {
  const { myProfile, currentUserUid } = useVessel();

  // Nombre de usuario: prioriza el dueño de la foto o perfil, fallback al usuario activo
  const userIdentifier = ownerCodename || myProfile?.codename || currentUserUid || "vessel";

  // Formato limpio y solicitado: Nombre de la app + Nombre del usuario
  const watermarkText = `VESSEL • @${userIdentifier.toLowerCase()}`;

  // Líneas espaciadas para garantizar legibilidad absoluta de rostros y cuerpos
  const linesCount = variant === "dense" ? 8 : 5;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none z-20 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Trama Reticular Ultra Transparente (Elegante, sin sombras invasivas) */}
      <div className="absolute -inset-20 flex flex-col justify-around rotate-[-25deg] opacity-[0.12] mix-blend-overlay scale-110 pointer-events-none select-none">
        {Array.from({ length: linesCount }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="flex items-center justify-around whitespace-nowrap gap-16 my-5"
          >
            {Array.from({ length: 4 }).map((_, cIdx) => (
              <span
                key={cIdx}
                className="font-mono font-medium text-[11px] sm:text-xs uppercase tracking-[0.25em] text-white"
              >
                {watermarkText}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import {
  Ghost,
  ShieldCheck,
  Sparkles,
  X,
  HeartHandshake,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface AntiGhostBadgeProps {
  respectScore?: number;
  responseRateMinutes?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  interactive?: boolean;
  className?: string;
}

export const AntiGhostBadge: React.FC<AntiGhostBadgeProps> = ({
  respectScore = 98,
  responseRateMinutes = 3,
  size = "sm",
  showLabel = false,
  interactive = true,
  className = "",
}) => {
  const [showModal, setShowModal] = useState(false);

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (interactive) {
      e.stopPropagation();
      setShowModal(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-full px-2 py-0.5 font-bold shadow-sm transition-all select-none ${
          interactive ? "cursor-pointer hover:bg-emerald-500/25 hover:border-emerald-400" : ""
        } ${className}`}
        title={`Insignia Anti-Fantasma // ${respectScore}% Respect Score`}
      >
        <div className="relative flex items-center justify-center">
          <Ghost className={`${iconSizes[size]} text-emerald-400 stroke-[2.3]`} />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
        </div>

        {showLabel && (
          <span className="text-[10px] uppercase font-mono tracking-tight font-extrabold text-white">
            Anti-Ghost • {respectScore}%
          </span>
        )}
      </div>

      {/* Modal Informativo de Cultura del Respeto */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in select-none text-left"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-obsidian-deep border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-mintNeon text-obsidian-deep shadow-mint-glow">
                  <Ghost className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Insignia Anti-Fantasma
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    Cultura del Respeto & Cero Ghosteo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Respect Score & Métricas de Respuesta */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">
                  Respect Score:
                </span>
                <span className="text-xs font-extrabold text-emerald-400 font-mono bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {respectScore}% EXCELENCIA
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">
                  Respuesta Rápida:
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>~{responseRateMinutes} min promedio</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium">
                  Modo No Ghost:
                </span>
                <span className="text-xs font-mono text-emerald-300 font-bold">
                  ACTIVADO POR DEFECTO
                </span>
              </div>
            </div>

            {/* Principios de la Comunidad */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <HeartHandshake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Pacto de Transparencia & Salidas Amables</span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">
                Este perfil utiliza el <strong>Protocolo Anti-Ghosteo</strong> de VESSEL. Si no hay química o desea cerrar una conversación, envía una salida amable y sexy en lugar de desaparecer, ganando puntos de visibilidad y respeto mutuo.
              </p>
            </div>

            <div className="bg-electricViolet/10 border border-electricViolet/30 rounded-2xl p-3 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-electricViolet-glow flex-shrink-0" />
              <div className="text-[10px] text-neutral-200">
                <strong className="text-electricViolet-glow">Visibilidad Aumentada:</strong> Los usuarios con insignia Anti-Fantasma tienen prioridad de transmisión en el radar y la matriz de cuerpos.
              </div>
            </div>

            {/* Botón de Cierre */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Comprendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

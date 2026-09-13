"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { AppDisguiseMode } from "@/types/vessel";

export const AppDisguiseModal: React.FC = () => {
  const {
    appDisguise,
    setAppDisguiseMode,
    setCoverScreenActive,
    t,
  } = useVessel();

  const [isOpen, setIsOpen] = React.useState(false);

  // Selector global o accesible desde settings
  return null; // Exportamos AppDisguiseModalConfigurable si se necesita
};

export const AppDisguiseSection: React.FC = () => {
  const { appDisguise, setAppDisguiseMode, setCoverScreenActive, t } = useVessel();

  return (
    <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-mono font-bold text-neutral-200 uppercase tracking-wider">
            {t.tacticalSuite.appDisguise.title}
          </h3>
          <p className="text-[11px] text-neutral-400">
            {t.tacticalSuite.appDisguise.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCoverScreenActive(true)}
          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-[11px] uppercase tracking-wider rounded border border-neutral-700 transition-all"
        >
          Probar Cobertura 🛡️
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {[
          { mode: "notes" as AppDisguiseMode, label: "Bloc de Notas Brutalista", icon: "📝" },
          { mode: "calculator" as AppDisguiseMode, label: "Calculadora", icon: "🔢" },
          { mode: "weather" as AppDisguiseMode, label: "Reporte del Clima", icon: "⛅" },
          { mode: "normal" as AppDisguiseMode, label: "Icono VESSEL Nativo", icon: "⚑" },
        ].map((item) => {
          const isSelected = appDisguise.mode === item.mode;
          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => setAppDisguiseMode(item.mode)}
              className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                isSelected
                  ? "bg-amber-950/30 border-amber-500 text-amber-300 font-bold"
                  : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-2.5 bg-neutral-950/80 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
        <span className="font-mono text-neutral-300 font-bold block">
          ⚡ Flip-to-Cover (Sensor de Giro):
        </span>
        <p>
          Si das vuelta el teléfono boca abajo sobre una mesa o superficie, la app salta de inmediato a la pantalla de cobertura señuelo.
        </p>
      </div>
    </div>
  );
};

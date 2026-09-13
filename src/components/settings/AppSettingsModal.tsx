"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { VesselLogo } from "@/components/brand/VesselLogo";
import { AppSettingsSection } from "@/components/account/AppSettingsSection";
import { X } from "lucide-react";

export const AppSettingsModal: React.FC = () => {
  const { isAppSettingsModalOpen, closeAppSettingsModal, t } = useVessel();

  if (!isAppSettingsModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.settings.title}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex justify-center items-center p-3 sm:p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-obsidian-surface border border-white/10 rounded-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-card-elevation relative">
        {/* Cabecera del Modal de Configuración de la Aplicación */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-deep/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <VesselLogo size={22} showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  {t.settings.title}
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-electricViolet/15 text-electricViolet-glow font-bold border border-electricViolet/30">
                  SYSTEM
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {t.settings.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAppSettingsModal}
            aria-label="Cerrar configuración del sistema"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Modular con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AppSettingsSection />
        </div>
      </div>
    </div>
  );
};

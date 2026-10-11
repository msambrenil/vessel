"use client";

import React, { useState } from "react";
import { useSettings, useLogistics } from "@/context/VesselContext";
import { isLocalEnvironment } from "@/lib/storage/localStorageSync";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BetaFeedbackModal } from "./BetaFeedbackModal";
import { BetaDiagnosticsModal } from "./BetaDiagnosticsModal";
import { Bug, Terminal, Wrench, Loader2 } from "lucide-react";
import { BrutalistButton, TacticalBadge } from "@/components/ui";

export interface BetaFeedbackMenuSectionProps {
  onCloseMenu?: () => void;
}

export const BetaFeedbackMenuSection: React.FC<BetaFeedbackMenuSectionProps> = ({ onCloseMenu }) => {
  const { language } = useSettings();
  const {
    isSimulatedLocationActive,
    setSimulatedLocationActive,
    myCoordinates,
    isLocating,
  } = useLogistics();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isSwitchingLocation, setIsSwitchingLocation] = useState(false);

  const handleOpenFeedback = () => {
    onCloseMenu?.();
    audioEngine.playPulse();
    setIsFeedbackOpen(true);
  };

  const handleOpenDiagnostics = () => {
    onCloseMenu?.();
    audioEngine.playPulse();
    setIsDiagnosticsOpen(true);
  };

  const handleToggleSimulatedLocation = async () => {
    setIsSwitchingLocation(true);
    try {
      await setSimulatedLocationActive(!isSimulatedLocationActive);
    } finally {
      setIsSwitchingLocation(false);
    }
  };

  return (
    <>
      {/* Sección Táctica Beta Tester Lab Integrada en el Menú */}
      <div
        data-testid="beta-tester-lab-section"
        className="p-2.5 bg-black/60 rounded-xl border border-electricViolet/30 space-y-2 mb-1"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-200">
            <Wrench className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
            <span>BETA TESTER LAB</span>
          </div>
          <TacticalBadge
            role="button"
            tabIndex={0}
            data-testid="beta-toggle-location-pill"
            onClick={handleToggleSimulatedLocation}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggleSimulatedLocation();
              }
            }}
            variant={isSimulatedLocationActive ? "violet" : "emerald"}
            size="xs"
            pulse
            className={`cursor-pointer active:scale-95 transition-all !text-[8.5px] font-black ${
              isSwitchingLocation || isLocating ? "opacity-50 pointer-events-none" : ""
            } ${
              isSimulatedLocationActive
                ? "!bg-electricViolet/30 text-electricViolet-glow !border-electricViolet/50 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                : "!bg-emerald-500/20 text-emerald-400 !border-emerald-500/40"
            }`}
            title={isSimulatedLocationActive ? "Fija en Saavedra 620 · Tocá para usar GPS Real" : "GPS Real activo · Tocá para fijar en Saavedra 620"}
            aria-label={isSimulatedLocationActive ? "Desactivar y usar GPS Real" : "Fijar en Saavedra 620"}
          >
            <span>{isSimulatedLocationActive ? "RÍO CUARTO" : "GPS REAL"}</span>
          </TacticalBadge>
        </div>

        {/* Info de Ubicación Compacta */}
        <div className="text-[10px] font-mono text-neutral-300 flex items-center justify-between bg-black/40 px-2 py-1 rounded-lg border border-white/5">
          <span className="truncate">
            {isSimulatedLocationActive ? "Saavedra 620 · Río IV" : myCoordinates ? `${myCoordinates.lat.toFixed(4)}, ${myCoordinates.lng.toFixed(4)}` : "GPS Activo"}
          </span>
          <BrutalistButton
            variant="ghost"
            size="compact"
            soundEffect="none"
            disabled={isSwitchingLocation || isLocating}
            onClick={handleToggleSimulatedLocation}
            className="!p-0 !min-h-0 text-[9px] text-electricViolet-glow hover:underline ml-1 flex-shrink-0 font-bold"
          >
            {isSwitchingLocation || isLocating ? (
              <Loader2 className="w-3 h-3 animate-spin inline" />
            ) : isSimulatedLocationActive ? (
              (language === "es" ? "GPS Real" : "Real GPS")
            ) : (
              (language === "es" ? "Fijar Río IV" : "Set Río IV")
            )}
          </BrutalistButton>
        </div>

        {/* Botones de acción rápida: Reportar Bug + Diagnóstico */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <BrutalistButton
            variant="ghost"
            size="compact"
            soundEffect="pulse"
            onClick={handleOpenFeedback}
            className="!px-2 !py-1.5 !rounded-lg !bg-white/5 hover:!bg-electricViolet/20 text-neutral-200 hover:text-white !border-white/10 hover:!border-electricViolet/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5"
          >
            <Bug className="w-3 h-3 text-electricViolet-glow flex-shrink-0" />
            <span className="truncate">{language === "es" ? "Reportar Bug" : "Report Bug"}</span>
          </BrutalistButton>

          <BrutalistButton
            variant="ghost"
            size="compact"
            soundEffect="pulse"
            onClick={handleOpenDiagnostics}
            className="!px-2 !py-1.5 !rounded-lg !bg-white/5 hover:!bg-mintNeon/20 text-neutral-200 hover:text-white !border-white/10 hover:!border-mintNeon/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5"
          >
            <Terminal className="w-3 h-3 text-mintNeon flex-shrink-0" />
            <span className="truncate">{language === "es" ? "Sensores" : "Sensors"}</span>
          </BrutalistButton>
        </div>
      </div>

      <BetaFeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <BetaDiagnosticsModal isOpen={isDiagnosticsOpen} onClose={() => setIsDiagnosticsOpen(false)} />
    </>
  );
};

// Componente FAB deprecado / neutro para evitar elementos flotantes en la matriz
export const BetaFeedbackFab: React.FC = () => null;

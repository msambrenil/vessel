"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { isLocalEnvironment } from "@/lib/storage/localStorageSync";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BetaFeedbackModal } from "./BetaFeedbackModal";
import { BetaDiagnosticsModal } from "./BetaDiagnosticsModal";
import { AppModeModal } from "@/components/settings/AppModeModal";
import { Bug, Terminal, Wrench, Sliders, Loader2 } from "lucide-react";

export interface BetaFeedbackMenuSectionProps {
  onCloseMenu?: () => void;
}

export const BetaFeedbackMenuSection: React.FC<BetaFeedbackMenuSectionProps> = ({ onCloseMenu }) => {
  const {
    language,
    appMode,
    isSimulatedLocationActive,
    setSimulatedLocationActive,
    myCoordinates,
    isLocating,
  } = useVessel();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isAppModeOpen, setIsAppModeOpen] = useState(false);
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

  const handleOpenAppMode = () => {
    onCloseMenu?.();
    audioEngine.playPulse();
    setIsAppModeOpen(true);
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
          <button
            type="button"
            data-testid="beta-toggle-location-pill"
            onClick={handleToggleSimulatedLocation}
            disabled={isSwitchingLocation || isLocating}
            className={`text-[8.5px] font-mono px-2 py-0.5 rounded font-black border flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
              isSimulatedLocationActive
                ? "bg-electricViolet/30 text-electricViolet-glow border-electricViolet/50 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            }`}
            title={isSimulatedLocationActive ? "Fija en Saavedra 620 · Tocá para usar GPS Real" : "GPS Real activo · Tocá para fijar en Saavedra 620"}
            aria-label={isSimulatedLocationActive ? "Desactivar y usar GPS Real" : "Fijar en Saavedra 620"}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{isSimulatedLocationActive ? "RÍO CUARTO" : "GPS REAL"}</span>
          </button>
        </div>

        {/* Info de Ubicación Compacta */}
        <div className="text-[10px] font-mono text-neutral-300 flex items-center justify-between bg-black/40 px-2 py-1 rounded-lg border border-white/5">
          <span className="truncate">
            {isSimulatedLocationActive ? "Saavedra 620 · Río IV" : myCoordinates ? `${myCoordinates.lat.toFixed(4)}, ${myCoordinates.lng.toFixed(4)}` : "GPS Activo"}
          </span>
          <button
            type="button"
            disabled={isSwitchingLocation || isLocating}
            onClick={handleToggleSimulatedLocation}
            className="text-[9px] text-electricViolet-glow hover:underline ml-1 flex-shrink-0 font-bold cursor-pointer disabled:opacity-50"
          >
            {isSwitchingLocation || isLocating ? (
              <Loader2 className="w-3 h-3 animate-spin inline" />
            ) : isSimulatedLocationActive ? (
              (language === "es" ? "GPS Real" : "Real GPS")
            ) : (
              (language === "es" ? "Fijar Río IV" : "Set Río IV")
            )}
          </button>
        </div>

        {/* Botones de acción rápida: Reportar Bug + Diagnóstico */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={handleOpenFeedback}
            className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-electricViolet/20 text-neutral-200 hover:text-white border border-white/10 hover:border-electricViolet/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Bug className="w-3 h-3 text-electricViolet-glow flex-shrink-0" />
            <span className="truncate">{language === "es" ? "Reportar Bug" : "Report Bug"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenDiagnostics}
            className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-mintNeon/20 text-neutral-200 hover:text-white border border-white/10 hover:border-mintNeon/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Terminal className="w-3 h-3 text-mintNeon flex-shrink-0" />
            <span className="truncate">{language === "es" ? "Sensores" : "Sensors"}</span>
          </button>
        </div>

        {/* Solo en entorno local se expone el switcher de modo Mock / Real */}
        {isLocalEnvironment() && (
          <button
            type="button"
            onClick={handleOpenAppMode}
            className="w-full px-2 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-neutral-300 hover:text-white border border-transparent hover:border-amber-500/40 text-[9.5px] font-mono font-bold flex items-center justify-between transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span>{language === "es" ? "Modo Dev" : "Dev Mode"}</span>
            </div>
            <span
              className={`text-[8.5px] font-mono px-1 py-0.2 rounded font-bold border ${
                appMode === "real"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-electricViolet/20 text-electricViolet-glow border-electricViolet/40"
              }`}
            >
              {appMode === "real" ? "REAL" : "TEST"}
            </span>
          </button>
        )}
      </div>

      <BetaFeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <BetaDiagnosticsModal isOpen={isDiagnosticsOpen} onClose={() => setIsDiagnosticsOpen(false)} />
      {isLocalEnvironment() && (
        <AppModeModal isOpen={isAppModeOpen} onClose={() => setIsAppModeOpen(false)} />
      )}
    </>
  );
};

// Componente FAB deprecado / neutro para evitar elementos flotantes en la matriz
export const BetaFeedbackFab: React.FC = () => null;

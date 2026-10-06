"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { isLocalEnvironment } from "@/lib/storage/localStorageSync";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BetaFeedbackModal } from "./BetaFeedbackModal";
import { BetaDiagnosticsModal } from "./BetaDiagnosticsModal";
import { AppModeModal } from "@/components/settings/AppModeModal";
import { Bug, Terminal, Wrench, X, Sliders, MapPin, Navigation, Loader2 } from "lucide-react";

export const BetaFeedbackFab: React.FC = () => {
  const { language, appMode, isSimulatedLocationActive, setSimulatedLocationActive, myCoordinates, isLocating } = useVessel();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isAppModeOpen, setIsAppModeOpen] = useState(false);
  const [isSwitchingLocation, setIsSwitchingLocation] = useState(false);

  // La píldora beta está siempre activa y visible en producción y staging para testers
  const isTester = true;

  if (!isTester) return null;

  const toggleMenu = () => {
    audioEngine.playSubBass(70);
    setIsOpenMenu((prev) => !prev);
  };

  const handleOpenFeedback = () => {
    setIsOpenMenu(false);
    audioEngine.playPulse();
    setIsFeedbackOpen(true);
  };

  const handleOpenDiagnostics = () => {
    setIsOpenMenu(false);
    audioEngine.playPulse();
    setIsDiagnosticsOpen(true);
  };

  const handleOpenAppMode = () => {
    setIsOpenMenu(false);
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
      <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 select-none">
        {/* Menú desplegable táctico */}
        {isOpenMenu && (
          <div className="bg-obsidian-surface border border-white/20 rounded-2xl p-2.5 shadow-2xl space-y-2 min-w-[250px] animate-in fade-in slide-in-from-bottom-2">
            <div className="px-2 py-1 text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest border-b border-white/10 flex items-center justify-between">
              <span>BETA TESTER LAB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Selector Táctico de Ubicación (Río Cuarto / GPS Real) */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                  <MapPin className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                  <span>{language === "es" ? "Ubicación GPS" : "GPS Location"}</span>
                </div>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                    isSimulatedLocationActive
                      ? "bg-electricViolet/20 text-electricViolet-glow border-electricViolet/40"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  }`}
                >
                  {isSimulatedLocationActive
                    ? (language === "es" ? "FIJA" : "FIXED")
                    : (language === "es" ? "GPS REAL" : "LIVE GPS")}
                </span>
              </div>

              <div className="text-[11px] font-mono text-neutral-300 flex items-center justify-between bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className="truncate">
                  {isSimulatedLocationActive ? "Río Cuarto · Saavedra 620" : `${myCoordinates.lat.toFixed(4)}, ${myCoordinates.lng.toFixed(4)}`}
                </span>
                <span className="text-[9px] text-neutral-400 flex-shrink-0 ml-1">
                  {isSimulatedLocationActive ? "-33.13, -64.34" : (language === "es" ? "En vivo" : "Live")}
                </span>
              </div>

              <button
                type="button"
                disabled={isSwitchingLocation || isLocating}
                onClick={handleToggleSimulatedLocation}
                className={`w-full px-2.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border disabled:opacity-50 ${
                  isSimulatedLocationActive
                    ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                    : "bg-electricViolet/20 hover:bg-electricViolet/30 text-electricViolet-glow border-electricViolet/40"
                }`}
              >
                {isSwitchingLocation || isLocating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                    <span>{language === "es" ? "Obteniendo GPS..." : "Acquiring GPS..."}</span>
                  </>
                ) : isSimulatedLocationActive ? (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{language === "es" ? "Desactivar y Usar GPS Real" : "Deactivate & Use Real GPS"}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                    <span>{language === "es" ? "Fijar en Saavedra 620 (Río IV)" : "Set Saavedra 620 (Río IV)"}</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenFeedback}
              className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-electricViolet/20 text-neutral-200 hover:text-white border border-transparent hover:border-electricViolet/40 text-xs font-mono font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left"
            >
              <Bug className="w-4 h-4 text-electricViolet-glow flex-shrink-0" />
              <span>{language === "es" ? "Reportar Bug / UX" : "Report Bug / UX"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenDiagnostics}
              className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-mintNeon/20 text-neutral-200 hover:text-white border border-transparent hover:border-mintNeon/40 text-xs font-mono font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left"
            >
              <Terminal className="w-4 h-4 text-mintNeon flex-shrink-0" />
              <span>{language === "es" ? "Simulador Sensores" : "Sensor Diagnostics"}</span>
            </button>

            {/* Solo en entorno local se expone el switcher de modo Mock / Real */}
            {isLocalEnvironment() && (
              <button
                type="button"
                onClick={handleOpenAppMode}
                className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-neutral-200 hover:text-white border border-transparent hover:border-amber-500/40 text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{language === "es" ? "Modo Dev (Local)" : "Dev Mode (Local)"}</span>
                </div>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
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
        )}

        {/* Botón flotante píldora principal */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-label="Abrir panel de beta tester"
          className="h-9 px-3.5 rounded-full bg-obsidian-surface/90 hover:bg-obsidian-deep backdrop-blur-md border border-electricViolet/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] flex items-center gap-2 transition-all cursor-pointer group active:scale-95"
        >
          {isOpenMenu ? (
            <X className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
          ) : (
            <Wrench className="w-3.5 h-3.5 text-electricViolet-glow group-hover:rotate-45 transition-transform" />
          )}
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-200 group-hover:text-white flex items-center gap-1.5">
            <span>BETA</span>
            <span
              className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-black ${
                isSimulatedLocationActive
                  ? "bg-electricViolet/40 text-electricViolet-glow border border-electricViolet/50"
                  : "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {isSimulatedLocationActive ? "RÍO CUARTO" : "GPS REAL"}
            </span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      <BetaFeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <BetaDiagnosticsModal isOpen={isDiagnosticsOpen} onClose={() => setIsDiagnosticsOpen(false)} />
      {isLocalEnvironment() && (
        <AppModeModal isOpen={isAppModeOpen} onClose={() => setIsAppModeOpen(false)} />
      )}
    </>
  );
};

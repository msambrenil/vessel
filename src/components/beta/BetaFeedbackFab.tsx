"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { isLocalEnvironment } from "@/lib/storage/localStorageSync";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { BetaFeedbackModal } from "./BetaFeedbackModal";
import { BetaDiagnosticsModal } from "./BetaDiagnosticsModal";
import { AppModeModal } from "@/components/settings/AppModeModal";
import { Bug, Terminal, Wrench, X, Sliders } from "lucide-react";

export const BetaFeedbackFab: React.FC = () => {
  const { myProfile, language, appMode } = useVessel();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isAppModeOpen, setIsAppModeOpen] = useState(false);

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

  return (
    <>
      <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 select-none">
        {/* Menú desplegable táctico */}
        {isOpenMenu && (
          <div className="bg-obsidian-surface border border-white/20 rounded-2xl p-2 shadow-2xl space-y-1.5 min-w-[230px] animate-in fade-in slide-in-from-bottom-2">
            <div className="px-2.5 py-1 text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest border-b border-white/10 flex items-center justify-between">
              <span>BETA TESTER LAB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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

            <button
              type="button"
              onClick={handleOpenAppMode}
              className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 text-neutral-200 hover:text-white border border-transparent hover:border-amber-500/40 text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{language === "es" ? "Modo de Entorno" : "Environment Mode"}</span>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                  appMode === "real"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-electricViolet/20 text-electricViolet-glow border-electricViolet/40"
                }`}
              >
                {appMode === "real" ? "REAL" : "BETA"}
              </span>
            </button>
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
              className={`text-[8px] px-1 py-0.5 rounded font-mono font-black ${
                appMode === "real"
                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                  : "bg-electricViolet/40 text-electricViolet-glow border border-electricViolet/50"
              }`}
            >
              {appMode === "real" ? "REAL" : "TEST"}
            </span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      <BetaFeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <BetaDiagnosticsModal isOpen={isDiagnosticsOpen} onClose={() => setIsDiagnosticsOpen(false)} />
      <AppModeModal isOpen={isAppModeOpen} onClose={() => setIsAppModeOpen(false)} />
    </>
  );
};

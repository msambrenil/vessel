"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { FlaskConical, Zap, Trash2, X, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

interface AppModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppModeModal: React.FC<AppModeModalProps> = ({ isOpen, onClose }) => {
  const { appMode, setAppMode, resetModeData, language } = useVessel();

  if (!isOpen) return null;

  const isReal = appMode === "real";

  const handleSelectMode = (mode: "test" | "real") => {
    if (mode === appMode) return;
    audioEngine.playSubBass(70);
    setAppMode(mode);
  };

  const handleResetData = () => {
    const confirmMsg =
      language === "es"
        ? `¿Confirmas reiniciar y vaciar todo el almacenamiento local para el ${isReal ? "MODO REAL" : "MODO DE PRUEBA"}? Esta acción reiniciará la aplicación limpia.`
        : `Confirm resetting and clearing all local storage for ${isReal ? "REAL MODE" : "TEST MODE"}? This will reload a clean application state.`;

    if (window.confirm(confirmMsg)) {
      audioEngine.playPulse();
      resetModeData();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Selector de Modo de Aplicación"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex justify-center items-center p-3 sm:p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-obsidian-surface border border-white/10 rounded-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-card-elevation relative">
        {/* Cabecera Brutalista */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-deep/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border flex items-center justify-center ${
                isReal
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-electricViolet/10 border-electricViolet/30 text-electricViolet-glow shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              }`}
            >
              {isReal ? <Zap className="w-5 h-5 stroke-[2.5]" /> : <FlaskConical className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white tracking-wider uppercase font-mono">
                  {language === "es" ? "ENTORNO OPERATIVO" : "OPERATING ENVIRONMENT"}
                </h2>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    isReal
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-electricViolet/20 text-electricViolet-glow border-electricViolet/40"
                  }`}
                >
                  {isReal ? "⚡ REAL DATA" : "🧪 TEST DATA"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {language === "es"
                  ? "Alterna entre simulación con datos mock y pruebas operativas reales."
                  : "Switch between mock simulation and real operative testing."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de entorno"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opciones de Modo */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Card: Modo de Prueba */}
          <button
            type="button"
            onClick={() => handleSelectMode("test")}
            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              !isReal
                ? "bg-electricViolet/10 border-electricViolet text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/8 hover:border-white/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    !isReal ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow" : "bg-white/5 border-white/10 text-neutral-400"
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm uppercase tracking-wide text-white">
                      {language === "es" ? "Modo de Prueba (Mock)" : "Test Mode (Mock)"}
                    </span>
                    {!isReal && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-electricViolet text-white font-extrabold uppercase shadow-violet-soft">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-electricViolet-glow block mt-0.5">
                    NAMESPACE: vessel_test_*
                  </span>
                </div>
              </div>

              {!isReal && <CheckCircle2 className="w-5 h-5 text-electricViolet-glow flex-shrink-0" />}
            </div>

            <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
              {language === "es"
                ? "Ideal para evaluar la interfaz, probar los sintetizadores Sub-Bass y simular radares y chats con 6 perfiles mock precargados (vessel-01 a vessel-06)."
                : "Ideal for inspecting UI, testing Sub-Bass synthesizers, and simulating radar/chats with 6 pre-loaded mock profiles."}
            </p>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-electricViolet-glow" /> Perfiles Ficticios
              </span>
              <span>•</span>
              <span>Galerías de Demostración</span>
              <span>•</span>
              <span>Sin Contaminar Firestore</span>
            </div>
          </button>

          {/* Card: Modo Real */}
          <button
            type="button"
            onClick={() => handleSelectMode("real")}
            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              isReal
                ? "bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/8 hover:border-white/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    isReal
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-white/5 border-white/10 text-neutral-400"
                  }`}
                >
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm uppercase tracking-wide text-white">
                      {language === "es" ? "Modo Real (Producción Local)" : "Real Mode (Local Production)"}
                    </span>
                    {isReal && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-mintNeon text-obsidian-deep font-black uppercase shadow-mint-glow">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                    NAMESPACE: vessel_real_*
                  </span>
                </div>
              </div>

              {isReal && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
            </div>

            <p className="text-xs text-neutral-300 mt-3 leading-relaxed">
              {language === "es"
                ? "Inicia 100% limpia. Permite registrar y autenticar usuarios reales en Firebase Auth, publicar perfiles en Firestore en tiempo real y probar la interacción entre dispositivos o ventanas incógnito."
                : "Starts 100% clean. Allows registering real users in Firebase Auth, publishing profiles in Firestore in real-time, and testing multi-user interactions."}
            </p>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> Datos Limpios
              </span>
              <span>•</span>
              <span>Firestore Real-Time</span>
              <span>•</span>
              <span>Multi-Usuario Local</span>
            </div>
          </button>

          {/* Sección de Peligro / Purga de Datos del Modo */}
          <div className="p-3.5 bg-bloodNeon/10 border border-bloodNeon/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-bloodNeon text-xs font-bold font-mono uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>{language === "es" ? "Purga de Estado Local" : "Local State Purge"}</span>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-xl bg-bloodNeon/20 hover:bg-bloodNeon text-bloodNeon hover:text-white border border-bloodNeon/40 text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {language === "es" ? `Limpiar ${isReal ? "Real" : "Prueba"}` : `Clear ${isReal ? "Real" : "Test"}`}
                </span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              {language === "es"
                ? `Elimina únicamente la caché de localStorage correspondiente a '${appMode}' sin alterar el otro modo ni borrar colecciones globales.`
                : `Clears only the '${appMode}' localStorage cache without touching the other mode.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

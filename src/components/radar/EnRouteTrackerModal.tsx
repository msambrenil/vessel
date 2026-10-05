"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";

export const EnRouteTrackerModal: React.FC = () => {
  const {
    isEnRouteModalOpen,
    closeEnRouteModal,
    enRouteState,
    startEnRoute,
    cancelEnRoute,
    arrivedEnRoute,
    profiles,
    t,
  } = useVessel();

  const [selectedEta, setSelectedEta] = useState<number>(15);

  if (!isEnRouteModalOpen) return null;

  const targetProfile = profiles.find((p) => p.id === enRouteState.targetProfileId);
  const targetCodename = targetProfile?.codename || enRouteState.targetCodename || "VESSEL";

  const handleStart = () => {
    if (targetProfile) {
      startEnRoute(targetProfile, selectedEta);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.tacticalSuite.enRoute.title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none [overscroll-behavior:contain]"
      onClick={closeEnRouteModal}
    >
      <div
        className="relative w-full max-w-md bg-[#0c0c0c] border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh] animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚗</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100">
                {t.tacticalSuite.enRoute.title}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Telemetría de viaje anónima sin compartir WhatsApp ni número
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeEnRouteModal}
            aria-label="Cerrar rastreador de trayecto"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-5 text-xs">
          {enRouteState.isActive ? (
            /* Estado Activo: Viaje en curso */
            <div className="space-y-4 text-center">
              <div className="p-4 bg-purple-950/40 border border-electricViolet/40 rounded-xl space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-electricViolet animate-ping" />
                  <span className="font-mono text-sm font-bold uppercase text-electricViolet-glow">
                    En Trayecto Hacia {targetCodename}
                  </span>
                </div>
                <div className="text-3xl font-mono font-black text-neutral-100 py-1">
                  ~{enRouteState.etaMinutes} min
                </div>
                <p className="text-[11px] text-neutral-400">
                  {enRouteState.isArrived
                    ? t.tacticalSuite.enRoute.arrivedAlert
                    : "El anfitrión puede ver tu cuenta regresiva en vivo sin triangulación exacta."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={arrivedEnRoute}
                  className="p-3 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-violet-soft active:scale-95 transition-all"
                >
                  {t.tacticalSuite.enRoute.notifyBtn}
                </button>
                <button
                  type="button"
                  onClick={cancelEnRoute}
                  className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 font-mono text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  {t.tacticalSuite.enRoute.cancelBtn}
                </button>
              </div>
            </div>
          ) : (
            /* Configurar Salida */
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
                  Destino del Encuentro:
                </span>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center font-mono font-bold text-electricViolet-glow text-sm">
                    {targetCodename.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-neutral-100 text-sm">{targetCodename}</h3>
                    <p className="text-[11px] text-neutral-400">Distancia aproximada: ~1.2 km</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-2">
                  {t.tacticalSuite.enRoute.etaLabel || "Tiempo Estimado de Llegada"}:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { mins: 5, icon: "🏃" },
                    { mins: 10, icon: "🚗" },
                    { mins: 15, icon: "⏱️" },
                    { mins: 30, icon: "📍" },
                  ].map(({ mins, icon }) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedEta(mins)}
                      className={`p-3 min-h-[48px] rounded-xl border text-center font-mono transition-all cursor-pointer active:scale-95 ${
                        selectedEta === mins
                          ? "bg-purple-950/50 border-electricViolet text-white font-bold shadow-violet-soft"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="text-xs mb-0.5">{icon}</div>
                      <div className="text-sm font-bold">{mins} min</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl text-[11px] text-neutral-400 space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-300 font-mono">
                  <span>🔒</span>
                  <span>Privacidad Criptográfica Total</span>
                </div>
                <p>
                  No se comparten tus coordenadas exactas. Cuando estés a menos de 50 metros, se emitirá una alerta sonora de puerta para que te abran.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStart}
                className="w-full py-3 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-violet-soft active:scale-95 transition-all"
              >
                Iniciar Modo &quot;Voy en Camino&quot; 🚗
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

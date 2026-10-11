"use client";

import React, { useState } from "react";
import { useLogistics, useRadarMatrix, useSettings } from "@/context/VesselContext";

import { BrutalistButton, BrutalistModal } from "@/components/ui";

export const EnRouteTrackerModal: React.FC = () => {
  const {
    isEnRouteModalOpen,
    closeEnRouteModal,
    enRouteState,
    startEnRoute,
    cancelEnRoute,
    arrivedEnRoute,
  } = useLogistics();
  const { profiles } = useRadarMatrix();
  const { t } = useSettings();

  const [selectedEta, setSelectedEta] = useState<number>(15);

  const targetProfile = profiles.find((p) => p.id === enRouteState.targetProfileId);
  const targetCodename = targetProfile?.codename || enRouteState.targetCodename || "VESSEL";

  const handleStart = () => {
    if (targetProfile) {
      startEnRoute(targetProfile, selectedEta);
    }
  };

  return (
    <BrutalistModal
      isOpen={isEnRouteModalOpen}
      onClose={closeEnRouteModal}
      icon="🚗"
      title={t.tacticalSuite.enRoute.title}
      subtitle="Telemetría de viaje anónima sin compartir WhatsApp ni número"
      maxWidth="md"
      ariaLabel={t.tacticalSuite.enRoute.title}
      contentClassName="p-5 space-y-5 text-xs"
    >
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
                <BrutalistButton
                  type="button"
                  variant="primary"
                  size="default"
                  soundEffect="pulse"
                  onClick={arrivedEnRoute}
                  className="w-full min-h-[48px] text-xs font-mono font-bold uppercase tracking-wider !rounded-xl shadow-violet-soft"
                >
                  {t.tacticalSuite.enRoute.notifyBtn}
                </BrutalistButton>
                <BrutalistButton
                  type="button"
                  variant="ghost"
                  size="default"
                  soundEffect="none"
                  onClick={cancelEnRoute}
                  className="w-full min-h-[48px] !bg-neutral-900 hover:!bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 font-mono text-xs uppercase tracking-wider !rounded-xl"
                >
                  {t.tacticalSuite.enRoute.cancelBtn}
                </BrutalistButton>
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
                    <BrutalistButton
                      key={mins}
                      type="button"
                      variant="ghost"
                      soundEffect="pulse"
                      onClick={() => setSelectedEta(mins)}
                      className={`!p-3 min-h-[48px] !rounded-xl border !text-center !font-mono flex-col !justify-center ${
                        selectedEta === mins
                          ? "!bg-purple-950/50 !border-electricViolet text-white font-bold shadow-violet-soft"
                          : "!bg-neutral-900 !border-neutral-800 text-neutral-400 hover:!border-neutral-700"
                      }`}
                    >
                      <span className="text-xs mb-0.5">{icon}</span>
                      <span className="text-sm font-bold">{mins} min</span>
                    </BrutalistButton>
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

              <BrutalistButton
                type="button"
                variant="primary"
                size="lg"
                soundEffect="pulse"
                onClick={handleStart}
                className="w-full min-h-[48px] text-xs font-mono font-bold uppercase tracking-wider !rounded-xl shadow-violet-soft"
              >
                Iniciar Modo &quot;Voy en Camino&quot; 🚗
              </BrutalistButton>
        </div>
      )}
    </BrutalistModal>
  );
};

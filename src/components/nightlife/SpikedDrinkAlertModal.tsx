"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { ShieldAlert, PhoneCall, X, AlertTriangle } from "lucide-react";
import { BrutalistButton } from "@/components/ui";

export const SpikedDrinkAlertModal: React.FC = () => {
  const {
    isSpikedAlertModalOpen,
    closeSpikedAlertModal,
    triggerSpikedAlert,
    wingmanPair,
  } = useVessel();

  const [alertTriggered, setAlertTriggered] = useState(false);

  // Bloqueo de scroll de fondo y Escape key
  useEffect(() => {
    if (!isSpikedAlertModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSpikedAlertModal();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSpikedAlertModalOpen, closeSpikedAlertModal]);

  if (!isSpikedAlertModalOpen) return null;

  const handleTriggerAlert = () => {
    triggerSpikedAlert();
    setAlertTriggered(true);
    audioEngine.playSubBass(85);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl animate-fade-in select-none"
    >
      <div
        className="w-full max-w-md bg-obsidian border border-red-500/50 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header de Emergencia */}
        <div className="p-4 border-b border-red-500/20 bg-red-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-red-300 uppercase tracking-wider">
                Alerta de Vaso Seguro & Auxilio
              </h2>
              <p className="text-[10.5px] text-neutral-400">
                Respuesta inmediata ante mareo o sospecha de adulteración
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSpikedAlertModal}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.96]"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!alertTriggered ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-950/60 border-2 border-red-500/80 mx-auto flex items-center justify-center text-red-400">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h3 className="font-mono text-base font-bold text-white uppercase">
                  ¿Sentís mareo repentino o sospecha?
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto leading-relaxed">
                  Al pulsar el botón, se alertará de inmediato a tu Wingman y contactos designados con tu estado de auxilio.
                </p>
              </div>

              <BrutalistButton
                variant="danger"
                size="lg"
                onClick={handleTriggerAlert}
                className="w-full min-h-[48px] text-sm uppercase tracking-wider font-black shadow-blood-glow"
              >
                🚨 EMITIR ALERTA DE AUXILIO INMEDIATO
              </BrutalistButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-red-950/60 border border-red-500 rounded-2xl text-center">
                <span className="text-xs font-mono font-bold text-red-300 uppercase block">
                  ✓ Alerta Silenciosa Emitida
                </span>
                <span className="text-[11px] text-neutral-300 mt-0.5 block">
                  {wingmanPair
                    ? `Notificación prioritaria enviada a tu Wingman (${wingmanPair.partnerCodename}).`
                    : "Modo auxilio activo en tu dispositivo."}
                </span>
              </div>

              {/* Protocolo de Acción Médica */}
              <div className="p-3.5 bg-neutral-900 border border-white/10 rounded-2xl space-y-2 text-xs text-neutral-300 font-mono">
                <span className="font-mono font-bold text-white uppercase block text-[11px]">
                  📋 Protocolo Inmediato de Resguardo:
                </span>
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">1.</span>
                  <span><strong>Dirigite a la barra o guardarropa:</strong> Avisale al personal del local que no te sentís bien.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">2.</span>
                  <span><strong>No salgas solo:</strong> Mantenete en un área iluminada con personas de confianza.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">3.</span>
                  <span><strong>No aceptes más bebidas abiertas</strong> de personas desconocidas.</span>
                </p>
              </div>

              {/* Llamadas de Emergencia */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="tel:107"
                  className="py-3 px-2 min-h-[44px] bg-neutral-900 hover:bg-neutral-800 border border-red-500/40 text-red-300 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.96]"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>SAME (107)</span>
                </a>
                <a
                  href="tel:911"
                  className="py-3 px-2 min-h-[44px] bg-neutral-900 hover:bg-neutral-800 border border-red-500/40 text-red-300 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.96]"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Emergencias (911)</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

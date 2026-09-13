"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";

export const DuressPinSettingsModal: React.FC = () => {
  const {
    isDuressPinSettingsOpen,
    closeDuressPinSettings,
    updateSafetyBeaconPins,
    t,
  } = useVessel();

  const [pinCode, setPinCode] = useState<string>("");
  const [duressCode, setDuressCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!isDuressPinSettingsOpen) return null;

  const handleSave = () => {
    setError(null);
    if (!/^\d{4}$/.test(pinCode)) {
      setError("El PIN Seguro debe contener exactamente 4 dígitos numéricos.");
      return;
    }
    if (!/^\d{4}$/.test(duressCode)) {
      setError("El PIN de Coacción debe contener exactamente 4 dígitos numéricos.");
      return;
    }
    if (pinCode === duressCode) {
      setError("El PIN Seguro y el PIN de Coacción deben ser diferentes.");
      return;
    }

    updateSafetyBeaconPins(pinCode, duressCode);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      closeDuressPinSettings();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔐</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100">
                PIN de Coacción & Pánico
              </h2>
              <p className="text-[11px] text-neutral-400">
                Protocolo silencioso ante situaciones de robo o amenaza
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDuressPinSettings}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-red-950/20 border border-red-500/40 rounded-xl space-y-1.5 text-neutral-300">
            <span className="font-mono font-bold text-red-400 uppercase text-xs block">
              ¿Cómo funciona el PIN de Coacción?
            </span>
            <p className="text-[11px] leading-relaxed">
              Si un atacante o situación hostil te exige desbloquear el Guardián o la app bajo amenaza, ingresas tu <strong>PIN de Coacción</strong> configurado aquí (4 dígitos).
            </p>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              La app aparentará desactivarse normalmente pero abrirá el <strong>Bloc de Notas señuelo</strong> y despachará la señal silenciosa de alerta a tu contacto de confianza.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-red-950/40 border border-red-500/50 rounded-lg text-red-300 font-mono text-[11px]">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                PIN Seguro Real (Desactivación normal):
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="4 dígitos numéricos"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-center font-mono text-base tracking-widest text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-electricViolet"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] text-red-400 uppercase tracking-wider block mb-1">
                PIN de Coacción / Alerta Silenciosa:
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="4 dígitos distintos al PIN real"
                value={duressCode}
                onChange={(e) => setDuressCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-neutral-900 border border-red-900/60 rounded-lg p-2.5 text-center font-mono text-base tracking-widest text-red-400 placeholder:text-neutral-600 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeDuressPinSettings}
            className="px-3 py-1.5 rounded font-mono text-xs text-neutral-400 hover:text-neutral-200"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-violet-soft active:scale-95 transition-all cursor-pointer"
          >
            {saved ? "¡Guardado!" : "Guardar Códigos"}
          </button>
        </div>
      </div>
    </div>
  );
};

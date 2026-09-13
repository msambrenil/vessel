"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { BrutalistModal, BrutalistButton } from "@/components/ui";

export const SafetyBeaconModal: React.FC = () => {
  const {
    isSafetyBeaconModalOpen,
    closeSafetyBeaconModal,
    safetyBeacon,
    startSafetyBeacon,
    extendSafetyBeacon,
    deactivateSafetyBeacon,
    dispatchSosAlert,
    t,
  } = useVessel();

  const [durationMinutes, setDurationMinutes] = useState<number>(safetyBeacon.durationMinutes || 45);
  const [emergencyPhone, setEmergencyPhone] = useState<string>(safetyBeacon.emergencyContactPhone || "");
  const [emergencyName, setEmergencyName] = useState<string>(safetyBeacon.emergencyContactName || "");
  const [locationText, setLocationText] = useState<string>(safetyBeacon.lastLocationText || "");
  const [pinCode, setPinCode] = useState<string>("");
  const [duressCode, setDuressCode] = useState<string>("");
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<boolean>(false);

  const handleStart = () => {
    startSafetyBeacon({
      durationMinutes,
      emergencyPhone,
      emergencyName,
      locationText,
      targetCodename: safetyBeacon.targetProfileCodename || "Encuentro",
      pinCode,
      duressCode,
    });
  };

  const handleDeactivate = () => {
    const success = deactivateSafetyBeacon(enteredPin);
    if (success) {
      setEnteredPin("");
      setPinError(false);
      closeSafetyBeaconModal();
    } else {
      setPinError(true);
    }
  };

  return (
    <BrutalistModal
      isOpen={isSafetyBeaconModalOpen}
      onClose={closeSafetyBeaconModal}
      title={t.tacticalSuite.safetyBeacon.title}
      subtitle={t.tacticalSuite.safetyBeacon.subtitle}
      icon="🛡️"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-mono">
        {safetyBeacon.isActive ? (
          /* Modo Activo: Guardián en cuenta regresiva */
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-red-400 font-mono font-bold text-xs uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>GUARDIÁN ACTIVO // SESIÓN MONITOREADA</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Expira en: <strong className="font-mono text-neutral-100">{safetyBeacon.expiresAt ? new Date(safetyBeacon.expiresAt).toLocaleTimeString() : "--:--"}</strong>
              </p>
              <p className="text-[10px] text-neutral-400">
                Contacto de auxilio: {safetyBeacon.emergencyContactName} ({safetyBeacon.emergencyContactPhone})
              </p>
            </div>

            {/* Extensión rápida y Botón de Auxilio Inmediato */}
            <div className="flex items-center gap-2">
              <BrutalistButton
                variant="secondary"
                size="default"
                onClick={() => extendSafetyBeacon(30)}
                className="flex-1 min-h-[44px]"
              >
                +30 min
              </BrutalistButton>
              <BrutalistButton
                variant="primary"
                size="default"
                onClick={() => extendSafetyBeacon(60)}
                className="flex-1 min-h-[44px]"
              >
                +60 min
              </BrutalistButton>
            </div>

            {/* BOTÓN REAL DE AUXILIO SOS */}
            <button
              type="button"
              onClick={() => dispatchSosAlert()}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>DISPARAR ALERTA SOS A CONTACTO (SMS / SHARE)</span>
            </button>

            {/* Desactivación con PIN */}
            <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2.5">
              <label className="font-mono text-[11px] text-neutral-300 uppercase tracking-wider block">
                Ingresar PIN para Desactivar:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-center font-mono text-lg tracking-widest text-neutral-100 min-h-[44px] focus:outline-none focus:border-electricViolet focus:ring-1 focus:ring-electricViolet"
                />
                <BrutalistButton
                  variant="primary"
                  size="default"
                  onClick={handleDeactivate}
                  className="min-h-[44px] px-4"
                >
                  Desactivar
                </BrutalistButton>
              </div>
              {pinError && (
                <p className="text-[11px] text-red-400 font-mono">
                  ⚠️ PIN incorrecto. Intentá nuevamente.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Modo Configuración */
          <div className="space-y-3.5">
            <div>
              <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1.5">
                Duración de la Sesión:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[45, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`p-2.5 min-h-[44px] rounded-xl border font-mono transition-all text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                      durationMinutes === mins
                        ? "bg-electricViolet text-white font-bold border-electricViolet shadow-violet-soft"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                  >
                    <div className="text-sm font-bold">{mins}</div>
                    <div className="text-[10px] text-neutral-500 uppercase">min</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                Contacto de Emergencia (Local-First):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Nombre o Alias"
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 min-h-[44px] focus:outline-none focus:border-electricViolet font-mono"
                />
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+54 9 11..."
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 min-h-[44px] focus:outline-none focus:border-electricViolet font-mono"
                />
              </div>
              <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                🔒 Cero servidores: se almacena únicamente en tu teléfono para disparar la señal de auxilio local.
              </p>
            </div>

            <div>
              <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                Dirección o Referencia del Encuentro:
              </label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Ej: Gorriti 4820, timbre 4B"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 min-h-[44px] focus:outline-none focus:border-electricViolet font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                  PIN Normal (4 dígitos):
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-center text-sm font-mono text-neutral-200 min-h-[44px] focus:outline-none focus:border-electricViolet"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                  PIN Coacción / Pánico:
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={duressCode}
                  onChange={(e) => setDuressCode(e.target.value)}
                  className="w-full bg-neutral-900 border border-red-900/60 rounded-xl p-2 text-center text-sm font-mono text-red-400 min-h-[44px] focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <BrutalistButton
              variant="danger"
              size="lg"
              onClick={handleStart}
              className="w-full min-h-[44px] uppercase tracking-wider font-bold mt-2"
            >
              Activar Guardián Silencioso 🛡️
            </BrutalistButton>
          </div>
        )}
      </div>
    </BrutalistModal>
  );
};

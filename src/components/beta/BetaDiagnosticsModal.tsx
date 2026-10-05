"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  Terminal,
  Activity,
  Volume2,
  Navigation,
  Battery,
  Trash2,
  X,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface BetaDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaDiagnosticsModal: React.FC<BetaDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const {
    myCoordinates,
    setMyCoordinates,
    batteryEngineState,
    language,
    appMode,
    currentUserUid,
    myProfile,
  } = useVessel();

  const [simulatedFreq, setSimulatedFreq] = useState(55);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const GPS_PRESETS = [
    { name: "Saavedra 620 (Río Cuarto)", lat: -33.1325, lng: -64.3470 },
    { name: "Plaza Roca (Centro)", lat: -33.1275, lng: -64.3490 },
    { name: "Barrio Alberdi", lat: -33.1365, lng: -64.3410 },
    { name: "Banda Norte", lat: -33.1160, lng: -64.3480 },
    { name: "Palermo Soho", lat: -34.5875, lng: -58.4289 },
  ];

  const handleTeleportGps = (lat: number, lng: number, name: string) => {
    setMyCoordinates({ lat, lng });
    audioEngine.playSubBass(70);
    setToastMessage(
      language === "es"
        ? `GPS Simulado: Teletransportado a ${name}`
        : `Simulated GPS: Teleported to ${name}`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePlaySubBass = (freq: number) => {
    setSimulatedFreq(freq);
    audioEngine.playSubBass(freq);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex justify-center items-end sm:items-center p-0 sm:p-4 select-none animate-in fade-in [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-obsidian-surface border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[88vh] sm:max-h-[92vh] overflow-hidden shadow-card-elevation relative animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Cabecera */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-obsidian-deep/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-mintNeon/15 border border-mintNeon/30 text-mintNeon">
              <Terminal className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                  {language === "es" ? "DIAGNÓSTICO TÁCTICO // BETA LAB" : "TACTICAL DIAGNOSTICS // BETA LAB"}
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-mintNeon text-obsidian-deep font-black uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {language === "es"
                  ? "Herramientas de simulación de sensores y telemetría de hardware."
                  : "Sensor simulation and hardware telemetry toolset."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel de Contenido */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs font-mono">
          {/* 1. Generador de Audio Sub-Bass */}
          <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 font-bold uppercase flex items-center gap-1.5 text-[11px]">
                <Volume2 className="w-4 h-4 text-electricViolet-glow" />
                <span>Oscilador Sub-Bass (45-80Hz)</span>
              </span>
              <span className="text-electricViolet-glow text-[10px] font-bold">{simulatedFreq} Hz</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[45, 55, 70, 80].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handlePlaySubBass(f)}
                  className={`py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    simulatedFreq === f
                      ? "bg-electricViolet/30 border-electricViolet text-white shadow-violet-soft"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{f}Hz</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => audioEngine.playPulse()}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 transition-colors"
              >
                Pulso Háptico
              </button>
              <button
                type="button"
                onClick={() => audioEngine.playVesselCrescendoAlert()}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 transition-colors"
              >
                Crescendo Alert
              </button>
            </div>
          </div>

          {/* 2. Simulador GPS / Teletransportación */}
          <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 font-bold uppercase flex items-center gap-1.5 text-[11px]">
                <Navigation className="w-4 h-4 text-mintNeon" />
                <span>Simulador GPS (Distancias Radar)</span>
              </span>
              <span className="text-mintNeon text-[9px]">
                {myCoordinates.lat.toFixed(4)}, {myCoordinates.lng.toFixed(4)}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
              {language === "es"
                ? "Teletransportá tus coordenadas para auditar cómo se ordenan los perfiles en el Radar."
                : "Teleport coordinates to test Radar profile ordering."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {GPS_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleTeleportGps(p.lat, p.lng, p.name)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-mintNeon/15 border border-white/10 hover:border-mintNeon/40 text-[10px] text-neutral-300 hover:text-white transition-all text-left cursor-pointer"
                >
                  <div className="font-bold">{p.name}</div>
                  <div className="text-[8px] text-neutral-500">
                    {p.lat.toFixed(3)}, {p.lng.toFixed(3)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Telemetría de Dispositivo */}
          <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-2 text-[10px]">
            <div className="flex items-center justify-between text-neutral-300 font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-amber-400" />
                <span>Telemetría Activa</span>
              </span>
              <span className="text-emerald-400 font-bold uppercase">{appMode} MODE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-neutral-400 pt-1">
              <div>
                Tester UID: <span className="text-white">{currentUserUid?.slice(0, 10)}...</span>
              </div>
              <div>
                Codename: <span className="text-white">{myProfile.codename}</span>
              </div>
              <div>
                Verificado:{" "}
                <span className={myProfile.verification?.isVerified ? "text-mintNeon" : "text-neutral-500"}>
                  {myProfile.verification?.isVerified ? "SÍ" : "NO"}
                </span>
              </div>
              <div>
                Batería:{" "}
                <span className="text-white">
                  {batteryEngineState ? `${batteryEngineState.level}% (${batteryEngineState.mode})` : "OK"}
                </span>
              </div>
            </div>

            {toastMessage && (
              <div className="p-2.5 rounded-xl bg-mintNeon/15 border border-mintNeon/30 text-mintNeon text-[10px] text-center font-bold animate-in fade-in">
                {toastMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

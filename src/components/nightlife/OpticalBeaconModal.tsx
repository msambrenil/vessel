"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { Zap, X, Sun, Sparkles, Radio } from "lucide-react";

type BeaconMode = "fuchsia" | "fuchsia_solid" | "fuchsia_rave" | "violet";

export const OpticalBeaconModal: React.FC = () => {
  const { isOpticalBeaconOpen, closeOpticalBeacon } = useVessel();
  const [strobeMode, setStrobeMode] = useState<BeaconMode>("fuchsia");
  const [isOn, setIsOn] = useState(true);

  // Intervalo estroboscópico de pantalla adaptado al modo
  useEffect(() => {
    if (!isOpticalBeaconOpen) return;

    if (strobeMode === "fuchsia_solid") {
      setIsOn(true);
      return;
    }

    const intervalMs =
      strobeMode === "fuchsia_rave"
        ? 150
        : strobeMode === "fuchsia"
        ? 280
        : 380;

    const timer = setInterval(() => {
      setIsOn((prev) => !prev);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpticalBeaconOpen, strobeMode]);

  if (!isOpticalBeaconOpen) return null;

  // Clases cromáticas dinámicas: NUNCA pantalla en negro muerto
  const getBeaconBackgroundClass = () => {
    switch (strobeMode) {
      case "fuchsia_solid":
        return "bg-[#ff007f] text-white shadow-[inset_0_0_120px_rgba(255,42,133,0.8)]";
      case "fuchsia_rave":
        return isOn
          ? "bg-[#ff007f] text-white shadow-[inset_0_0_140px_rgba(255,255,255,0.9)]"
          : "bg-white text-[#ff007f] shadow-[inset_0_0_140px_rgba(255,0,127,0.7)]";
      case "violet":
        return isOn
          ? "bg-electricViolet text-white shadow-[inset_0_0_100px_rgba(139,92,246,0.8)]"
          : "bg-[#3b0764] text-purple-200 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]";
      case "fuchsia":
      default:
        return isOn
          ? "bg-[#ff007f] text-white shadow-[inset_0_0_120px_rgba(255,42,133,0.9)]"
          : "bg-[#500028] text-fuchsia-200 shadow-[inset_0_0_80px_rgba(255,0,127,0.4)]";
    }
  };

  return (
    <div
      onClick={closeOpticalBeacon}
      className={`fixed inset-0 z-[100] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-75 select-none cursor-pointer overflow-hidden ${getBeaconBackgroundClass()}`}
    >
      {/* Borde Animado Neón Fucsia Giratorio del Sistema VESSEL (Border Beam) */}
      <div
        className="border-beam-fuchsia pointer-events-none"
        style={{ padding: "6px" }}
        aria-hidden="true"
      />

      {/* Halo concéntrico de energía en el centro */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40"
        aria-hidden="true"
      >
        <div className="w-[500px] h-[500px] rounded-full border-4 border-white/20 animate-ping duration-1000" />
        <div className="absolute w-[350px] h-[350px] rounded-full border-2 border-white/30 animate-pulse" />
      </div>

      {/* =========================================================
          BARRA SUPERIOR DE CONTROL
          ========================================================= */}
      <header
        className="flex items-center justify-between z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white border border-fuchsia-400/50 shadow-[0_0_20px_rgba(255,0,127,0.4)]">
          <Radio className="w-4 h-4 text-[#ff2a85] animate-pulse" />
          <span className="font-mono text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
            <span>BALIZA ÓPTICA // FUCSIA NEÓN</span>
          </span>
        </div>

        <button
          type="button"
          onClick={closeOpticalBeacon}
          className="px-4 py-2 rounded-full bg-black/80 hover:bg-black text-white text-xs font-mono font-bold border border-white/30 transition-all flex items-center gap-1.5 shadow-2xl active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>✕ Cerrar</span>
        </button>
      </header>

      {/* =========================================================
          CENTRO: IDENTIDAD VESSEL & BALIZA VISUAL MASIVA
          ========================================================= */}
      <div className="flex flex-col items-center justify-center text-center my-auto z-20">
        <div className="relative">
          <span className="text-7xl sm:text-9xl font-black font-mono tracking-tighter drop-shadow-[0_10px_35px_rgba(0,0,0,0.6)] select-none">
            VESSEL
          </span>
          <div className="text-[11px] sm:text-xs font-mono font-black tracking-[0.3em] uppercase opacity-90 mt-[-8px]">
            ⚡ RADAR BEACON // SEÑAL ACTIVA ⚡
          </div>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-md text-white border border-fuchsia-400/40 max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] mt-6">
          <p className="font-mono text-xs font-black uppercase tracking-wider text-fuchsia-300 flex items-center justify-center gap-1.5">
            <span>📱</span>
            <span>Alzá la pantalla hacia la pista</span>
          </p>
          <p className="text-[11px] text-neutral-200 mt-1 leading-relaxed font-sans">
            El destello fucsia neón atraviesa el humo, los láseres y la multitud para que tu contacto te ubique de inmediato.
          </p>
        </div>
      </div>

      {/* =========================================================
          SELECTOR DE MODOS DE DESTELLO INFERIOR
          ========================================================= */}
      <footer
        className="flex flex-wrap items-center justify-center gap-2 pb-2 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modo 1: Fucsia Neón Rítmico (Por defecto) */}
        <button
          type="button"
          onClick={() => {
            setStrobeMode("fuchsia");
            audioEngine.playSubBass(65);
          }}
          className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            strobeMode === "fuchsia"
              ? "bg-black text-[#ff007f] border-fuchsia-400 shadow-[0_0_25px_rgba(255,0,127,0.7)] scale-105"
              : "bg-black/70 text-neutral-300 border-white/20 hover:border-fuchsia-400 hover:text-white"
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>⚡ Fucsia Strobe (3.5 Hz)</span>
        </button>

        {/* Modo 2: Fucsia Fijo Continuo (Linterna 100%) */}
        <button
          type="button"
          onClick={() => {
            setStrobeMode("fuchsia_solid");
            audioEngine.playSubBass(80);
          }}
          className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            strobeMode === "fuchsia_solid"
              ? "bg-black text-amber-300 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.7)] scale-105"
              : "bg-black/70 text-neutral-300 border-white/20 hover:border-amber-400 hover:text-white"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>💡 Fucsia Continuo (Linterna)</span>
        </button>

        {/* Modo 3: Rave Turbo */}
        <button
          type="button"
          onClick={() => {
            setStrobeMode("fuchsia_rave");
            audioEngine.playSubBass(90);
          }}
          className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            strobeMode === "fuchsia_rave"
              ? "bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.8)] scale-105"
              : "bg-black/70 text-neutral-300 border-white/20 hover:border-white hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✨ Rave Turbo (6.5 Hz)</span>
        </button>

        {/* Modo 4: Violeta Club */}
        <button
          type="button"
          onClick={() => {
            setStrobeMode("violet");
            audioEngine.playSubBass(55);
          }}
          className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
            strobeMode === "violet"
              ? "bg-black text-purple-300 border-purple-400 shadow-[0_0_25px_rgba(139,92,246,0.7)] scale-105"
              : "bg-black/70 text-neutral-300 border-white/20 hover:border-purple-400 hover:text-white"
          }`}
        >
          <span>🟣 Violeta Club</span>
        </button>
      </footer>
    </div>
  );
};

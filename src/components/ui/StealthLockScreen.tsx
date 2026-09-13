"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { Lock } from "lucide-react";

export const StealthLockScreen: React.FC = () => {
  const { stealthMode, toggleStealthMode } = useVessel();
  const [pin, setPin] = useState("");

  if (!stealthMode) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    toggleStealthMode();
    setPin("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 select-none animate-in fade-in">
      <div className="w-full max-w-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-neutral-400">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Modo Discreto Activo
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Ingresa tu PIN o toca para volver a la app
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="password"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            aria-label="Código PIN de desbloqueo"
            className="w-full bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg py-3 tracking-[0.5em] focus:outline-none focus:border-electricViolet focus-visible:ring-2 focus-visible:ring-electricViolet/50 placeholder:text-neutral-600 transition-all font-mono"
            autoFocus
          />

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 bg-electricViolet text-white hover:bg-electricViolet-glow font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-violet-soft cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98 font-mono"
          >
            Desbloquear
          </button>
        </form>

        <button
          type="button"
          onClick={toggleStealthMode}
          className="text-xs text-neutral-400 hover:text-white font-medium p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet rounded-lg transition-colors"
        >
          Tocar para continuar
        </button>
      </div>
    </div>
  );
};

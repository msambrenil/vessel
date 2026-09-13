"use client";

import React from "react";
import Link from "next/link";
import { Radio, Navigation, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col items-center justify-center p-4 selection:bg-electricViolet selection:text-white">
      <div className="w-full max-w-md bg-obsidian-surface border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95">
        {/* Icono Radar 404 */}
        <div className="w-14 h-14 rounded-2xl bg-electricViolet/15 border border-electricViolet/40 flex items-center justify-center text-electricViolet-glow shadow-violet-soft">
          <Compass className="w-7 h-7 animate-spin-slow" />
        </div>

        {/* Textos */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-electricViolet-glow">
            ERROR 404 // RADAR FUERA DE RANGO
          </span>
          <h1 className="text-xl font-black text-white tracking-tight">
            Cuadrante No Encontrado
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
            La coordenada o ruta a la que intentas acceder no existe en la matriz espacial de VESSEL.
          </p>
        </div>

        {/* Botón de Retorno al Radar */}
        <div className="w-full pt-2">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-electricViolet text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-violet-soft hover:bg-electricViolet-glow active:scale-[0.98] transition-all"
          >
            <Radio className="w-4 h-4" />
            <span>Volver a la Matriz Principal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Radio } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[VESSEL Recovery Engine] Error capturado por ErrorBoundary:", error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        window.location.href = "/";
      }
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col items-center justify-center p-4 selection:bg-electricViolet selection:text-white">
      <div className="w-full max-w-md bg-obsidian-surface border border-bloodNeon/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(255,0,85,0.15)] flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95">
        {/* Icono de Alerta Brutalista */}
        <div className="w-14 h-14 rounded-2xl bg-bloodNeon/10 border border-bloodNeon/40 flex items-center justify-center text-bloodNeon shadow-[0_0_20px_rgba(255,0,85,0.3)]">
          <AlertTriangle className="w-7 h-7 animate-pulse" />
        </div>

        {/* Textos de Diagnóstico */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-bloodNeon">
            SISTEMA // PROTOCOLO DE RECUPERACIÓN
          </span>
          <h1 className="text-xl font-black text-white tracking-tight">
            Interrupción en la Conexión
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Se detectó una excepción en la interfaz. El sistema VESSEL evitó el bloqueo y preservó tu sesión.
          </p>
        </div>

        {/* Detalle Técnico */}
        {error.message && (
          <div className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-left">
            <span className="text-[9px] font-mono text-neutral-500 block mb-1">
              DIAGNÓSTICO:
            </span>
            <p className="text-[11px] font-mono text-neutral-300 break-words line-clamp-3">
              {error.message}
            </p>
          </div>
        )}

        {/* Acciones de Recuperación Inmediata */}
        <div className="w-full flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-electricViolet text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-violet-soft hover:bg-electricViolet-glow active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar Conexión</span>
          </button>

          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Radio className="w-4 h-4 text-electricViolet-glow" />
            <span>Reiniciar al Radar Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

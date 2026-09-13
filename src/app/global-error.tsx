"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-obsidian min-h-screen text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121216] border border-bloodNeon/50 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-bloodNeon/10 border border-bloodNeon/40 flex items-center justify-center text-bloodNeon">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Falla Crítica de Sistema</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Ocurrió un error en el núcleo de la aplicación.
            </p>
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-electricViolet text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-violet-soft hover:bg-electricViolet-glow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restablecer Núcleo</span>
          </button>
        </div>
      </body>
    </html>
  );
}

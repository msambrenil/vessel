"use client";

import React from "react";

export const PulsesListSkeleton: React.FC = () => {
  return (
    <div
      className="flex flex-col flex-1 p-3 sm:p-4 pb-48 space-y-4 bg-obsidian-deep min-h-[calc(100vh-140px)] select-none"
      aria-busy="true"
      aria-label="Cargando bandeja de toques"
    >
      {/* Cabecera Táctica Skeleton */}
      <div className="space-y-3 border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-7 w-20 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="flex items-center gap-1 p-0.5 border border-white/10 bg-black/60 rounded-xl">
          <div className="flex-1 h-9 bg-electricViolet/20 rounded-lg animate-pulse" />
          <div className="flex-1 h-9 bg-white/5 rounded-lg animate-pulse" />
          <div className="flex-1 h-9 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Tarjetas de Toques Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-obsidian-surface space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-3 w-24 bg-electricViolet/20 rounded animate-pulse" />
                <div className="flex gap-1.5 pt-0.5">
                  <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
                  <div className="h-5 w-20 bg-white/5 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Tira de compatibilidad compacta Skeleton (Alternativa A) */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                <div className="h-2.5 w-20 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <div className="h-6 w-16 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-6 w-20 bg-white/5 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Botonera de 2 botones Skeleton */}
            <div className="pt-2 mt-2.5 border-t border-white/10 grid grid-cols-2 gap-2">
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-10 bg-electricViolet/25 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

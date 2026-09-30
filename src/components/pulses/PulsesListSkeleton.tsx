"use client";

import React from "react";

export const PulsesListSkeleton: React.FC = () => {
  return (
    <div
      className="flex flex-col flex-1 p-3 sm:p-4 pb-48 space-y-4 bg-obsidian-deep min-h-[calc(100vh-140px)]"
      aria-busy="true"
      aria-label="Cargando bandeja de zumbidos"
    >
      {/* Cabecera Táctica Skeleton */}
      <div className="space-y-3 border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-2 p-1 bg-obsidian-surface rounded-2xl border border-white/10">
          <div className="h-11 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-11 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-11 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Tarjetas de Zumbidos Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-white/10 bg-obsidian-surface space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-electricViolet/20 rounded animate-pulse" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-5 w-16 bg-white/5 rounded-lg animate-pulse" />
                  <div className="h-5 w-20 bg-white/5 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
            <div className="pt-2.5 border-t border-white/10 grid grid-cols-2 gap-2">
              <div className="h-11 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-11 bg-electricViolet/20 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

"use client";

import React from "react";

export const ProfileGridSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-pulse select-none">
      {/* Skeleton de la barra táctica compacta (Tabs + Fila 1 + Fila 2) */}
      <div className="p-2 sm:p-2.5 space-y-2 border-b border-white/10">
        <div className="h-8 bg-white/5 rounded-xl w-full border border-white/10" />
        <div className="flex gap-1.5">
          <div className="h-[38px] flex-1 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-[38px] w-20 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-[38px] w-20 bg-white/5 rounded-xl border border-white/10" />
        </div>
        <div className="flex gap-1.5 overflow-x-hidden pb-0.5">
          <div className="h-8 w-44 bg-white/5 rounded-full border border-white/10 flex-shrink-0" />
          <div className="h-8 w-16 bg-white/5 rounded-full border border-white/10 flex-shrink-0" />
          <div className="h-8 w-20 bg-white/5 rounded-full border border-white/10 flex-shrink-0" />
          <div className="h-8 w-20 bg-white/5 rounded-full border border-white/10 flex-shrink-0" />
        </div>
      </div>

      {/* Skeleton de la grilla de perfiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5 p-2 sm:p-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] bg-obsidian-surface rounded-2xl border border-white/10 overflow-hidden relative p-3 flex flex-col justify-between"
          >
            {/* Badge superior izquierdo */}
            <div className="h-4 w-16 bg-white/10 rounded-full" />

            {/* Datos inferiores */}
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-white/15 rounded" />
              <div className="h-3 w-16 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

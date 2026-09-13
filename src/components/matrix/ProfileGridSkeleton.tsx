"use client";

import React from "react";

export const ProfileGridSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-pulse select-none">
      {/* Skeleton de la barra táctica de filtros */}
      <div className="p-2 sm:p-3 space-y-2 border-b border-white/5">
        <div className="h-9 bg-white/5 rounded-xl w-full border border-white/10" />
        <div className="flex gap-1.5 overflow-x-hidden pt-1">
          <div className="h-7 w-20 bg-white/5 rounded-full border border-white/10" />
          <div className="h-7 w-24 bg-white/5 rounded-full border border-white/10" />
          <div className="h-7 w-20 bg-white/5 rounded-full border border-white/10" />
          <div className="h-7 w-24 bg-white/5 rounded-full border border-white/10" />
        </div>
      </div>

      {/* Skeleton de la grilla de perfiles */}
      <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 p-2 sm:p-2.5">
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

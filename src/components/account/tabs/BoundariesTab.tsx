"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { LocationPrivacySection } from "../LocationPrivacySection";
import { BoundaryManagerModal } from "@/components/chat/BoundaryManagerModal";
import { BOUNDARY_PROTOCOLS_CATALOG } from "@/data/energyCatalog";
import { ShieldCheck, SlidersHorizontal, RotateCcw } from "lucide-react";
import { TacticalBadge, BrutalistButton, SectionHeroHeader } from "@/components/ui";

export const BoundariesTab: React.FC = () => {
  const {
    boundaries: connectionBoundaries,
    removeBoundaryProtocol,
    profiles,
  } = useVessel();

  const [editingBoundaryProfileId, setEditingBoundaryProfileId] = useState<string | null>(null);

  const activeBoundariesCount = Object.keys(connectionBoundaries).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Sección de Privacidad de Ubicación, Anti-Triangulación y Batería */}
      <LocationPrivacySection />

      {/* Sección de Límites y Desconexión Gradual */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-purple-500/30 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title="LÍMITES // DESCONEXIÓN GRADUAL"
          tag={`${activeBoundariesCount} ACTIVOS`}
          subtitle="Protocolos activos sin bloqueos abruptos ni hostilidad digital"
          variant="violet"
          icon={<ShieldCheck className="w-4 h-4 text-electricViolet-glow" />}
        />

        {activeBoundariesCount > 0 ? (
          <div className="space-y-2.5">
            {Object.entries(connectionBoundaries).map(([pId, bound]) => {
              const targetP = profiles.find((p) => p.id === pId);
              const protoDef = BOUNDARY_PROTOCOLS_CATALOG.find((b) => b.id === bound.protocol);

              return (
                <div
                  key={pId}
                  className="bg-black/60 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={targetP?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                      alt={targetP?.codename || pId}
                      className="w-10 h-10 rounded-xl object-cover border border-white/15 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-mono font-bold text-white truncate">
                          {targetP?.codename || pId}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${protoDef?.tagColor || "bg-white/10 text-white"}`}>
                          {protoDef?.badge || bound.protocol.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 block truncate mt-0.5">
                        Chat: <strong className="text-neutral-200">{bound.chatStatus}</strong> • Álbumes: <strong className="text-neutral-200">{bound.publicAlbumsVisible ? "Públicos" : "Ocultos"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <BrutalistButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingBoundaryProfileId(pId)}
                      title="Editar Límites de esta conexión"
                      aria-label="Editar Límites de esta conexión"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] bg-white/10 hover:bg-white/20 text-neutral-200 rounded-xl"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </BrutalistButton>
                    <BrutalistButton
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBoundaryProtocol(pId)}
                      title="Restaurar conexión completa"
                      aria-label="Restaurar conexión completa"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] bg-white/10 hover:bg-mintNeon hover:text-obsidian-deep text-neutral-200 rounded-xl"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </BrutalistButton>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center space-y-1">
            <p className="text-xs font-mono text-neutral-300 font-bold">
              No tienes conexiones limitadas activas.
            </p>
            <span className="text-[10px] font-mono text-neutral-500 block">
              Puedes configurar la desconexión gradual de cualquier usuario desde su chat o perfil en la matriz.
            </span>
          </div>
        )}
      </div>

      {/* Modal de edición de límites granulares */}
      {editingBoundaryProfileId && (
        <BoundaryManagerModal
          profileId={editingBoundaryProfileId}
          onClose={() => setEditingBoundaryProfileId(null)}
        />
      )}
    </div>
  );
};

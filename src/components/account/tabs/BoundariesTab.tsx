"use client";

import React, { useState } from "react";
import { useChat, useRadarMatrix, useSettings } from "@/context/VesselContext";
import { LocationPrivacySection } from "../LocationPrivacySection";
import { BoundaryManagerModal } from "@/components/chat/BoundaryManagerModal";
import { BOUNDARY_PROTOCOLS_CATALOG } from "@/data/energyCatalog";
import {
  ShieldCheck,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  BrutalistButton,
  SectionHeroHeader,
} from "@/components/ui";

export const BoundariesTab: React.FC = () => {
  const {
    boundaries: connectionBoundaries,
    removeBoundaryProtocol,
  } = useChat();
  const { profiles } = useRadarMatrix();
  const { language } = useSettings();

  const [editingBoundaryProfileId, setEditingBoundaryProfileId] = useState<string | null>(null);

  const activeBoundariesCount = Object.keys(connectionBoundaries).length;

  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* 1. SECCIÓN DE PRIVACIDAD DE UBICACIÓN, ANTI-TRIANGULACIÓN Y BATERÍA */}
      <LocationPrivacySection />

      {/* 2. SECCIÓN DE LÍMITES Y DESPEDIDA SIN DRAMA */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-purple-500/30 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "LÍMITES Y DESPEDIDA SIN DRAMA" : "BOUNDARIES & GRADUAL FADE"}
          tag={`${activeBoundariesCount} ${language === "es" ? "ACTIVOS" : "ACTIVE"}`}
          subtitle={
            language === "es"
              ? "Protocolos activos sin bloqueos hostiles ni escenas digitales"
              : "Active protocols with zero harsh blocks or digital hostility"
          }
          variant="violet"
          icon={<ShieldCheck className="w-4 h-4 text-electricViolet-glow" />}
        />

        {activeBoundariesCount > 0 ? (
          <div className="space-y-2.5">
            {Object.entries(connectionBoundaries).map(([pId, bound]) => {
              const targetP = profiles.find((p) => p.id === pId);
              const protoDef = BOUNDARY_PROTOCOLS_CATALOG.find((b) => b.id === bound.protocol);

              const chatStatusLabel: Record<string, string> = {
                active: language === "es" ? "Activo" : "Active",
                muted: language === "es" ? "Silenciado" : "Muted",
                readonly: language === "es" ? "Solo Lectura" : "Read-only",
                disconnected: language === "es" ? "Desconectado" : "Disconnected",
              };

              const protocolLabelFallback: Record<string, string> = {
                polite_archive: "CIERRE RESPETUOSO",
                pause: "MODO PAUSA",
                stealth_fade: "MODO SIGILO",
                hard_boundary: "LÍMITE ESTRICTO",
                custom: "PERSONALIZADO",
              };

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
                          {protoDef?.badge || protocolLabelFallback[bound.protocol] || bound.protocol}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 block truncate mt-0.5">
                        Chat: <strong className="text-neutral-200">{chatStatusLabel[bound.chatStatus] || bound.chatStatus}</strong> • Álbumes: <strong className="text-neutral-200">{bound.publicAlbumsVisible ? (language === "es" ? "Públicos" : "Public") : (language === "es" ? "Ocultos" : "Hidden")}</strong>
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
              {language === "es" ? "No tenés conexiones limitadas activas." : "No limited connections active."}
            </p>
            <span className="text-[10px] font-mono text-neutral-500 block">
              {language === "es"
                ? "Podés activar la despedida sin drama o soft-block de cualquier usuario directamente desde su chat o tarjeta en el radar."
                : "You can configure gradual disconnect for any profile directly from chat or radar."}
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

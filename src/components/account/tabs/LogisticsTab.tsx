"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { KinksTab } from "./KinksTab";
import { ExitProtocolSelector } from "@/components/profile/ExitProtocolSelector";
import { SubstanceAtmosphereSelector } from "@/components/profile/SubstanceAtmosphereSelector";
import { Home, Flame, Clock, Sparkles } from "lucide-react";
import { SectionHeroHeader, TacticalBadge } from "@/components/ui";

export const LogisticsTab: React.FC = () => {
  const { openHostCardModal, myProfile, language, t } = useVessel();

  const isHosting =
    myProfile.mobility?.toLowerCase().includes("casa") ||
    myProfile.mobility?.toLowerCase().includes("lugar") ||
    myProfile.mobility?.toLowerCase().includes("depto");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. FICHA DE HOSPEDAJE // MI LUGAR */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-amber-500/30 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "MI LUGAR // LOGÍSTICA DE ENCUENTRO" : "MY PLACE // HOST LOGISTICS"}
          tag={isHosting ? (language === "es" ? "PONGO LUGAR" : "CAN HOST") : (language === "es" ? "ME MUEVO" : "MOBILE")}
          subtitle={
            language === "es"
              ? "Detalles de tu espacio: toallas, ducha, insumos y convivencia sin malos entendidos"
              : "Space details: towels, shower, supplies, and privacy without awkwardness"
          }
          variant="blood"
          icon={<Home className="w-4 h-4 text-amber-400" />}
        />

        <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">
                {language === "es" ? "Ficha de Hospedaje" : "Host Logistics Card"}
              </span>
              <TacticalBadge variant={isHosting ? "emerald" : "neutral"} size="sm">
                {isHosting ? (language === "es" ? "Recibo" : "Hosting") : (language === "es" ? "Voy yo" : "Mobile")}
              </TacticalBadge>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              {language === "es"
                ? "Configurá si tenés aire acondicionado, toallas limpias, preservativos o si vivís con gente."
                : "Configure AC, clean towels, condoms, or if you live with roommates."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              openHostCardModal();
            }}
            className="w-full sm:w-auto px-4 py-2 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🏠</span>
            <span>{language === "es" ? "Configurar Mi Lugar" : "Configure Place"}</span>
          </button>
        </div>
      </div>

      {/* 2. CATÁLOGO DE MORBOS & FETICHES (COINCIDENCIA MUTUA Y CIEGA) */}
      <KinksTab />

      {/* 3. PROTOCOLO DE SALIDA ACORDADO (PRE-FLIGHT) */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "PROTOCOLO DE SALIDA // TIEMPOS CLAROS" : "EXIT PROTOCOL // CLEAR TIME"}
          tag={language === "es" ? "ACUERDO PREVIO" : "PRE-AGREEMENT"}
          subtitle={
            language === "es"
              ? "Evitá situaciones incómodas acordando cómo termina el encuentro de antemano"
              : "Avoid awkward moments by agreeing on how the encounter concludes"
          }
          variant="violet"
          icon={<Clock className="w-4 h-4 text-electricViolet-glow" />}
        />
        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl">
          <ExitProtocolSelector />
        </div>
      </div>

      {/* 4. ATMÓSFERA DE SUSTANCIAS Y CONSUMO */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "ATMÓSFERA Y CONSUMO // ZERO-KNOWLEDGE" : "SUBSTANCE ATMOSPHERE // ZERO-KNOWLEDGE"}
          tag={language === "es" ? "DISCRECIÓN TOTAL" : "ZERO-KNOWLEDGE"}
          subtitle={
            language === "es"
              ? "Sintonía de contexto (alcohol, humo, chill o sobriedad) sin revelar nada en tu perfil público"
              : "Context alignment (alcohol, 420, chill, or sober) without exposing anything publicly"
          }
          variant="mint"
          icon={<Sparkles className="w-4 h-4 text-mintNeon" />}
        />
        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl">
          <SubstanceAtmosphereSelector />
        </div>
      </div>
    </div>
  );
};

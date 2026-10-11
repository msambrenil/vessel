"use client";

import React from "react";
import { useAuth, useSettings } from "@/context/VesselContext";
import { IdentityVerificationCard } from "../IdentityVerificationCard";
import { PendingTestimonialsManager } from "../PendingTestimonialsManager";
import { Ghost, Zap, HeartHandshake } from "lucide-react";
import { TacticalBadge, SectionHeroHeader, BrutalistSwitch } from "@/components/ui";

export const ReputationTab: React.FC = () => {
  const { myProfile, toggleNoGhostMode } = useAuth();
  const { t, language } = useSettings();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Tarjeta de Verificación de Identidad Digital */}
      <div id="identity-verification-section">
        <IdentityVerificationCard />
      </div>

      {/* Tarjeta de Cultura del Respeto & Protocolo Anti-Ghost */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-emerald-500/30 space-y-3.5 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <SectionHeroHeader
          title={language === "es" ? "KARMA & CERO PLANTONES" : "RESPECT CULTURE & ANTI-GHOST"}
          tag={`${myProfile.respectScore || 98}% ${language === "es" ? "RESPETO" : "KARMA"}`}
          subtitle={language === "es" ? "Sumás visibilidad y confianza cerrando chats con buena onda" : "Earn visibility and trust points by closing chats politely"}
          variant="mint"
          icon={<Ghost className="w-4 h-4 stroke-[2.3] text-mintNeon" />}
        />

        {/* Switch Modo Cero Plantones activado por default con BrutalistSwitch */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5">
          <BrutalistSwitch
            checked={Boolean(myProfile.noGhostMode)}
            onChange={() => toggleNoGhostMode()}
            variant="emerald"
            label={
              <span className="flex items-center gap-1.5">
                <span>{t.account.noGhostMode}</span>
                <TacticalBadge variant="emerald" size="sm">
                  {t.account.noGhostDefault}
                </TacticalBadge>
              </span>
            }
            description={t.account.noGhostDesc}
            aria-label={t.account.noGhostMode}
          />
        </div>

        {/* Beneficios de Visibilidad */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-black/50 p-3 rounded-2xl border border-white/10 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-electricViolet-glow flex-shrink-0" />
            <div>
              <span className="text-[9px] text-neutral-400 block uppercase font-mono font-bold">
                {t.account.radarBoost}
              </span>
              <span className="text-xs font-mono font-bold text-electricViolet-glow">
                {t.account.boostActive}
              </span>
            </div>
          </div>

          <div className="bg-black/50 p-3 rounded-2xl border border-white/10 flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-[9px] text-neutral-400 block uppercase font-mono font-bold">
                {t.account.badgeVisible}
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {t.account.badgeVisibleSub}
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* Bandeja de Testimonios Recibidos y Moderación */}
      <PendingTestimonialsManager />
    </div>
  );
};

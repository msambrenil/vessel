"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { IdentityVerificationCard } from "../IdentityVerificationCard";
import { PendingTestimonialsManager } from "../PendingTestimonialsManager";
import { AppDisguiseSection } from "@/components/safety/AppDisguiseSection";
import { Ghost, Zap, HeartHandshake, ShieldCheck } from "lucide-react";
import { TacticalBadge, SectionHeroHeader } from "@/components/ui";

export const ReputationTab: React.FC = () => {
  const {
    myProfile,
    toggleNoGhostMode,
    openSafetyBeaconModal,
    openDuressPinSettings,
    t,
    language,
  } = useVessel();

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
          title={language === "es" ? "CULTURA DEL RESPETO & CERO PLANTONES" : "RESPECT CULTURE & ANTI-GHOST"}
          tag={`${myProfile.respectScore || 98}% ${language === "es" ? "RESPETO" : "KARMA"}`}
          subtitle={language === "es" ? "Ganás puntos de visibilidad y confianza cerrando chats con amabilidad" : "Earn visibility and trust points by closing chats politely"}
          variant="mint"
          icon={<Ghost className="w-4 h-4 stroke-[2.3] text-mintNeon" />}
        />

        {/* Switch Modo Cero Plantones activado por default */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>{t.account.noGhostMode}</span>
              <TacticalBadge variant="emerald" size="sm">
                {t.account.noGhostDefault}
              </TacticalBadge>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              {t.account.noGhostDesc}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(myProfile.noGhostMode)}
            onClick={() => {
              toggleNoGhostMode();
              audioEngine.playPulse();
            }}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              myProfile.noGhostMode ? "bg-emerald-500 shadow-sm" : "bg-neutral-800"
            }`}
            aria-label={t.account.noGhostMode}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                myProfile.noGhostMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
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

      {/* Tarjeta de Seguridad Personal & Discreción */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-purple-500/30 space-y-4 shadow-card-elevation backdrop-blur-md">
        <SectionHeroHeader
          title={language === "es" ? "SEGURIDAD PERSONAL & DISCRECIÓN" : "PERSONAL SAFETY & DISCRETION"}
          tag={language === "es" ? "PROTECCIÓN ACTIVA" : "ACTIVE SHIELD"}
          subtitle={
            language === "es"
              ? "Guardián silencioso, PIN señuelo de coacción y camuflaje de pantalla"
              : "Silent guardian, decoy duress PIN, and screen disguise"
          }
          variant="violet"
          icon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
        />

        {/* Guardián Silencioso & PIN de Coacción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => openSafetyBeaconModal()}
            className="p-3.5 min-h-[50px] bg-neutral-900 border border-neutral-800 hover:border-red-500/50 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-[0.98]"
          >
            <div>
              <span className="font-mono text-xs font-bold text-neutral-200 block">
                🛡️ {t.safety?.guardianLabel || "Guardián Silencioso"}
              </span>
              <span className="text-[10px] text-neutral-500">
                {language === "es" ? "Apagado de seguridad & contacto SOS" : "Safety shutoff & SOS contact"}
              </span>
            </div>
            <span className="text-xs font-mono text-red-400 font-bold">
              {language === "es" ? "Abrir →" : "Open →"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => openDuressPinSettings()}
            className="p-3.5 min-h-[50px] bg-neutral-900 border border-neutral-800 hover:border-red-500/50 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-[0.98]"
          >
            <div>
              <span className="font-mono text-xs font-bold text-neutral-200 block">
                🔐 {language === "es" ? "PIN de Coacción" : "Duress PIN"}
              </span>
              <span className="text-[10px] text-neutral-500">
                {language === "es" ? "Alerta silenciosa y bóveda señuelo" : "Silent alert & decoy vault"}
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-400 font-bold">
              {language === "es" ? "Configurar →" : "Configure →"}
            </span>
          </button>
        </div>

        {/* Camuflaje de App & Bloc de Notas */}
        <AppDisguiseSection />
      </div>

      {/* Bandeja de Testimonios Recibidos y Moderación */}
      <PendingTestimonialsManager />
    </div>
  );
};

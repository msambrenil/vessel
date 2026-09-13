"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { IdentityVerificationCard } from "../IdentityVerificationCard";
import { PendingTestimonialsManager } from "../PendingTestimonialsManager";
import { ExitProtocolSelector } from "@/components/profile/ExitProtocolSelector";
import { SubstanceAtmosphereSelector } from "@/components/profile/SubstanceAtmosphereSelector";
import { AppDisguiseSection } from "@/components/safety/AppDisguiseModal";
import { Ghost, Zap, HeartHandshake } from "lucide-react";
import { TacticalBadge, SectionHeroHeader } from "@/components/ui";

export const ReputationTab: React.FC = () => {
  const {
    myProfile,
    toggleNoGhostMode,
    openHostCardModal,
    openVoiceRecorder,
    myVoiceVibe,
    openSafetyBeaconModal,
    openDuressPinSettings,
    openDuoModal,
    openVaultAuditModal,
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
          title="CULTURA DEL RESPETO // ANTI-GHOST"
          tag={`${myProfile.respectScore || 98}% KARMA`}
          subtitle="Gana puntos de visibilidad y confianza cerrando chats con amabilidad"
          variant="mint"
          icon={<Ghost className="w-4 h-4 stroke-[2.3] text-mintNeon" />}
        />

        {/* Switch Modo No Ghost activado por default */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>Modo No Ghost</span>
              <TacticalBadge variant="emerald" size="sm">
                Por Defecto
              </TacticalBadge>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              Sugerencias de salida amable y sexy en 1 tap al cerrar chats
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              toggleNoGhostMode();
              audioEngine.playPulse();
            }}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              myProfile.noGhostMode ? "bg-emerald-500 shadow-sm" : "bg-neutral-800"
            }`}
            aria-label="Conmutar Modo No Ghost"
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
                Visibilidad en Radar
              </span>
              <span className="text-xs font-mono font-bold text-electricViolet-glow">+35% Boost Activo</span>
            </div>
          </div>

          <div className="bg-black/50 p-3 rounded-2xl border border-white/10 flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-[9px] text-neutral-400 block uppercase font-mono font-bold">
                Insignia Anti-Fantasma
              </span>
              <span className="text-xs font-mono font-bold text-white">Visible en Perfil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta Maestra de la Suite Táctica (Logística, Seguridad & Discreción) */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Herramientas Tácticas de Encuentro
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                Logística, acuerdos de salida, seguridad física y discreción
              </p>
            </div>
          </div>
          <TacticalBadge variant="violet" size="sm">
            SUITE ACTIVA
          </TacticalBadge>
        </div>

        {/* Ficha de Hospedaje & Voice Vibe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openHostCardModal()}
            className="p-3 min-h-[44px] bg-neutral-900 border border-neutral-800 hover:border-electricViolet/40 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.98]"
          >
            <div>
              <span className="font-mono text-xs font-bold text-neutral-200 block">🏠 Ficha de Hospedaje</span>
              <span className="text-[10px] text-neutral-500">Configurar depto, insumos y ducha</span>
            </div>
            <span className="text-xs font-mono text-electricViolet-glow">Editar →</span>
          </button>

          <button
            type="button"
            onClick={() => openVoiceRecorder()}
            className="p-3 min-h-[44px] bg-neutral-900 border border-neutral-800 hover:border-electricViolet/40 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.98]"
          >
            <div>
              <span className="font-mono text-xs font-bold text-neutral-200 block">🎙️ Voice Vibe (Audio 5s)</span>
              <span className="text-[10px] text-neutral-500">{myVoiceVibe ? "Audio registrado ✓" : "Grabar audio de voz"}</span>
            </div>
            <span className="text-xs font-mono text-electricViolet-glow">{myVoiceVibe ? "Cambiar →" : "Grabar →"}</span>
          </button>
        </div>

        {/* Protocolo de Salida Selector */}
        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl">
          <ExitProtocolSelector />
        </div>

        {/* Atmósfera de Consumo & Sustancias (Zero-Knowledge) */}
        <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl">
          <SubstanceAtmosphereSelector />
        </div>

        {/* Guardián Silencioso & PIN de Coacción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openSafetyBeaconModal()}
            className="p-3 min-h-[44px] bg-neutral-900 border border-neutral-800 hover:border-red-500/40 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-[0.98]"
          >
            <div>
              <span className="font-mono text-xs font-bold text-neutral-200 block">🛡️ Guardián Silencioso</span>
              <span className="text-[10px] text-neutral-500">Dead-Man Switch & Contacto Local</span>
            </div>
            <span className="text-xs font-mono text-red-400">Abrir →</span>
          </button>

          <button
            type="button"
            onClick={() => openDuressPinSettings()}
            className="p-3 min-h-[44px] bg-neutral-900 border border-neutral-800 hover:border-red-500/40 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-[0.98]"
          >
            <div>
              <span className="font-mono text-xs font-bold text-neutral-200 block">🔐 PIN de Coacción</span>
              <span className="text-[10px] text-neutral-500">Alerta silenciosa y señuelo</span>
            </div>
            <span className="text-xs font-mono text-neutral-400">Configurar →</span>
          </button>
        </div>

        {/* Camuflaje de App & Bloc de Notas */}
        <AppDisguiseSection />

        {/* Modo Dúo & Auditoría de Bóvedas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => openDuoModal()}
            className="p-3 min-h-[44px] bg-neutral-900 border border-neutral-800 hover:border-electricViolet/40 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.98]"
          >
            <div>
              <span className="font-mono text-xs font-bold text-neutral-200 block">👥 Modo Dúo (Pareja)</span>
              <span className="text-[10px] text-neutral-500">Vincular cuenta para buscar tríos</span>
            </div>
            <span className="text-xs font-mono text-electricViolet-glow">Gestionar →</span>
          </button>

          <button
            type="button"
            onClick={() => openVaultAuditModal()}
            className="p-3 min-h-[44px] bg-neutral-900 border border-neutral-800 hover:border-electricViolet/40 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.98]"
          >
            <div>
              <span className="font-mono text-xs font-bold text-neutral-200 block">👁️ Auditoría de Bóvedas</span>
              <span className="text-[10px] text-neutral-500">Registro de quién vio tus fotos</span>
            </div>
            <span className="text-xs font-mono text-electricViolet-glow">Ver Logs →</span>
          </button>
        </div>
      </div>

      {/* Bandeja de Testimonios Recibidos y Moderación */}
      <PendingTestimonialsManager />
    </div>
  );
};

"use client";

import React from "react";
import {
  Flame,
  Zap,
  MessageSquare,
  CalendarPlus,
  Clock,
  Home,
  X,
  Sparkles,
} from "lucide-react";
import { ExitProtocol, VesselProfile } from "@/types/vessel";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { formatRelativePulseTime, hasHostingCapability } from "@/lib/calendar/dateLocale";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export interface PulseCardProps {
  profile: VesselProfile;
  mode: "mutual" | "received" | "sent";
  timestamp?: string;
  isRead?: boolean;
  isMutual: boolean;
  isReencounter?: boolean;
  reencounterNote?: string;
  pulseId?: string;
  language: "es" | "en";
  t: any;
  formatDist: (meters: number) => string;
  onSelectProfile: (profile: VesselProfile) => void;
  onReturnPulse: (profileId: string) => void;
  onOpenChat: (profileId: string) => void;
  onScheduleEncounter: (profileId: string) => void;
  onDismissPulse?: (pulseId: string) => void;
}

export const PulseCard: React.FC<PulseCardProps> = ({
  profile,
  mode,
  timestamp,
  isRead = true,
  isMutual,
  isReencounter = false,
  reencounterNote,
  pulseId,
  language,
  t,
  formatDist,
  onSelectProfile,
  onReturnPulse,
  onOpenChat,
  onScheduleEncounter,
  onDismissPulse,
}) => {
  const isImmediateHost = hasHostingCapability(profile.mobility);
  const relativeTime = formatRelativePulseTime(timestamp, language);

  const timeTemplate =
    mode === "sent"
      ? t.pulses?.sentAgo || (language === "es" ? "Zumbido enviado hace {time}" : "Nudge sent {time} ago")
      : t.pulses?.receivedAgo || (language === "es" ? "Te envió un zumbido hace {time}" : "Sent you a nudge {time} ago");

  const localizedTimeLabel = timeTemplate.replace("{time}", relativeTime);

  const renderExitProtocolPill = (protocol: ExitProtocol | undefined) => {
    if (!protocol) return null;
    const isFast = protocol === "fast_encounter";
    const isCuddle = protocol === "chill_cuddle";
    const icon = isFast ? "⏱️" : isCuddle ? "🫂" : "🌙";
    const label = isFast
      ? language === "es"
        ? "PUNTUAL: Sin sobremesa"
        : "FAST ENCOUNTER"
      : isCuddle
      ? language === "es"
        ? "MIMOS: Ducha y charla"
        : "SHOWER & CUDDLE"
      : language === "es"
      ? "PASAR LA NOCHE: Si hay química"
      : "SLEEPOVER";

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 font-mono text-[10px] font-black uppercase tracking-wider">
        <span className="text-xs leading-none">{icon}</span>
        <span>{label}</span>
      </span>
    );
  };

  return (
    <article
      className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 bg-obsidian-surface shadow-card-elevation ${
        !isRead && mode !== "sent"
          ? "border-electricViolet/70 bg-gradient-to-r from-electricViolet/15 via-obsidian-surface to-obsidian-surface ring-1 ring-electricViolet/40"
          : isMutual
          ? "border-emerald-500/40 hover:border-emerald-400/60"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Cabecera de Identidad + Botón de Descarte (44x44px) */}
      <div className="flex items-start gap-3 min-w-0">
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            onSelectProfile(profile);
          }}
          aria-label={`${t.pulses?.viewProfile || "Ver Perfil"}: ${profile.codename}`}
          title={t.pulses?.viewProfile || "Ver Perfil"}
          className="relative w-14 h-14 min-w-[44px] min-h-[44px] rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 border-2 border-electricViolet/50 hover:border-electricViolet transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <img
            src={profile.avatarUrl}
            alt={profile.codename}
            className={`w-full h-full object-cover ${profile.isFogMode ? "filter blur-[3px]" : ""}`}
            loading="lazy"
            decoding="async"
          />
          {!isRead && mode !== "sent" && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-bloodNeon rounded-full animate-ping border border-black" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    onSelectProfile(profile);
                  }}
                  className="text-sm font-black text-white hover:text-electricViolet-glow transition-colors truncate font-mono text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
                >
                  {profile.codename}
                </button>
                {profile.showAge && (
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {profile.age}
                  </span>
                )}
                {profile.verification?.isVerified && (
                  <VerificationBadge verification={profile.verification} size="xs" />
                )}
                {isMutual && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-black uppercase tracking-wider">
                    <Flame className="w-3 h-3 text-emerald-400 fill-current" />
                    <span>{t.pulses?.mutualBadge || "Zumbido Mutuo 🔥"}</span>
                  </span>
                )}
              </div>

              {/* Distancia y Tiempo Relativo */}
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-[11px] text-electricViolet-glow font-mono font-bold">
                  {profile.discretizedDistance?.displayLabel || formatDist(profile.distanceMeters)}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-[10px] text-neutral-300 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  {localizedTimeLabel}
                </span>
              </div>
            </div>

            {/* Acción de descarte individual con target 44x44px */}
            {pulseId && onDismissPulse && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  onDismissPulse(pulseId);
                }}
                aria-label={t.pulses?.dismissPulseLabel || "Descartar zumbido"}
                title={t.pulses?.dismissPulseLabel || "Descartar zumbido"}
                className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-1.5 -mt-1.5 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Chips de Rol, Logística y Reencuentro */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-neutral-200">
              {getRoleDisplayLabel(profile.role, language)}
            </span>

            {isImmediateHost && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono font-bold flex items-center gap-1">
                <Home className="w-3 h-3" />
                <span>{t.pulses?.hasPlaceBadge || "Tiene lugar"}</span>
              </span>
            )}

            {profile.onTheClock?.isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/80 border border-electricViolet text-electricViolet-glow font-mono text-[9.5px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                <span>⚡ YA ({profile.onTheClock.durationMinutes || 45}m)</span>
              </span>
            )}

            {isReencounter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>{reencounterNote || t.pulses?.reencounterBadge}</span>
              </span>
            )}

            {renderExitProtocolPill(profile.exitProtocol)}
          </div>
        </div>
      </div>

      {/* Botonera Ergonómica (44px Touch Targets & 5 Estados Impeccable UI) */}
      <div className="pt-2.5 mt-2.5 border-t border-white/10 grid grid-cols-2 gap-2">
        {isMutual ? (
          /* Si hay Zumbido Mutuo: Puente directo de 1 toque para Agendar Encuentro */
          <button
            type="button"
            onClick={() => {
              audioEngine.playSignalSent();
              onScheduleEncounter(profile.id);
            }}
            className="min-h-[44px] px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/50 transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40"
          >
            <CalendarPlus className="w-4 h-4 stroke-[2.4]" />
            <span className="truncate">{t.pulses?.scheduleEncounterCta || "Agendar Encuentro"}</span>
          </button>
        ) : mode === "received" ? (
          /* Si es Recibido no mutuo: Responder Zumbido */
          <button
            type="button"
            onClick={() => {
              audioEngine.playSignalSent();
              onReturnPulse(profile.id);
            }}
            className="min-h-[44px] px-3 py-2.5 rounded-xl bg-electricViolet/20 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/50 transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.96] shadow-violet-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40"
          >
            <Zap className="w-4 h-4 stroke-[2.5]" />
            <span className="truncate">{t.pulses?.returnPulse || "Responder Zumbido 🔥"}</span>
          </button>
        ) : (
          /* Si es Enviado no mutuo: Ver Ficha Completa */
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onSelectProfile(profile);
            }}
            className="min-h-[44px] px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 hover:border-white/25 transition-all text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40"
          >
            <span className="truncate">{t.pulses?.viewProfile || "Ver Perfil"}</span>
          </button>
        )}

        {/* CTA Secundario/Primario: Abrir Conversación */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            onOpenChat(profile.id);
          }}
          className="min-h-[44px] px-3 py-2.5 rounded-xl bg-electricViolet text-white hover:bg-electricViolet-glow shadow-violet-soft transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40"
        >
          <MessageSquare className="w-3.5 h-3.5 stroke-[2.4]" />
          <span className="truncate">{t.pulses?.openChat || "Abrir Conversación"}</span>
        </button>
      </div>
    </article>
  );
};

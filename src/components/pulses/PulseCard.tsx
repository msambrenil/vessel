"use client";

import React, { useState } from "react";
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
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import { TacticalBadge } from "@/components/ui/TacticalBadge";
import { TranslationType } from "@/lib/i18n/translations";

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
  t: TranslationType;
  formatDist: (meters: number) => string;
  onSelectProfile: (profile: VesselProfile) => void;
  onReturnPulse?: (profileId: string) => void;
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
  const [localReturned, setLocalReturned] = useState(false);

  const isImmediateHost = hasHostingCapability(profile.mobility);
  const relativeTime = formatRelativePulseTime(timestamp, language);
  const isEffectivelyMutual = isMutual || localReturned;

  const timeTemplate =
    mode === "sent"
      ? t.pulses?.sentAgo || (language === "es" ? "Le tiraste un toque hace {time}" : "Nudge sent {time} ago")
      : t.pulses?.receivedAgo || (language === "es" ? "Te tiró un toque hace {time}" : "Nudged you {time} ago");

  const localizedTimeLabel = timeTemplate.replace("{time}", relativeTime);

  const handleReturnPulseInPlace = () => {
    audioEngine.playSubBass(60);
    setLocalReturned(true);
    onReturnPulse?.(profile.id);
  };

  const renderExitProtocolBadge = (protocol: ExitProtocol | undefined) => {
    if (!protocol) return null;
    const isFast = protocol === "fast_encounter";
    const isCuddle = protocol === "chill_cuddle";
    const icon = isFast ? "⏱️" : isCuddle ? "🫂" : "🌙";
    const label = isFast
      ? language === "es"
        ? "Express (sin vueltas)"
        : "Fast Exit"
      : isCuddle
      ? language === "es"
        ? "Tranqui (con charla)"
        : "Cuddle & Chat"
      : language === "es"
      ? "Quedarse a dormir"
      : "Sleepover";

    return (
      <TacticalBadge variant="purple" size="xs">
        <span className="text-[10px] leading-none">{icon}</span>
        <span>{label}</span>
      </TacticalBadge>
    );
  };

  return (
    <article
      className={`relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 bg-obsidian-surface shadow-card-elevation select-none ${
        !isRead && mode !== "sent"
          ? "border-electricViolet/80 bg-gradient-to-r from-electricViolet/15 via-obsidian-surface to-obsidian-surface ring-1 ring-electricViolet/40"
          : isEffectivelyMutual
          ? "border-emerald-500/40 hover:border-emerald-400/60"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* COLUMNA IZQUIERDA: FOTO 1:1 TÁCTICA PROMINENTE */}
        <div
          onClick={() => {
            audioEngine.playPulse();
            onSelectProfile(profile);
          }}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-2xl overflow-hidden border shrink-0 cursor-pointer group shadow-card-elevation transition-all active:scale-95 ${
            isEffectivelyMutual
              ? "border-emerald-400/80 ring-2 ring-emerald-500/25"
              : !isRead && mode !== "sent"
              ? "border-electricViolet ring-2 ring-electricViolet/40"
              : "border-white/15 hover:border-white/30"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectProfile(profile);
            }
          }}
          aria-label={`${t.pulses?.viewProfile || "Ver perfil"}: ${profile.codename}`}
        >
          <img
            src={profile.avatarUrl || "/placeholder-avatar.png"}
            alt={profile.codename}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              profile.isFogMode ? "blur-[5px] scale-105" : ""
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

          {/* Badges en la foto (Onda Mutua o Nuevo) */}
          {isEffectivelyMutual ? (
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[9px] font-mono font-black flex items-center gap-0.5 shadow-xs">
              <Flame className="w-2.5 h-2.5 text-emerald-400 fill-current" />
              <span>ONDA</span>
            </span>
          ) : !isRead && mode !== "sent" ? (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-bloodNeon text-white font-mono font-black text-[8px] uppercase tracking-wider shadow-xs animate-pulse">
              NUEVO
            </span>
          ) : null}
        </div>

        {/* COLUMNA DERECHA: METADATOS TÁCTICOS Y ACCIONES */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
          {/* Fila 1: Nombre, edad, verificado, distancia y tiempo */}
          <div className="flex items-center justify-between gap-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
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
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono shrink-0 text-neutral-400">
              <span className="text-electricViolet-glow font-bold">
                {profile.discretizedDistance?.displayLabel || formatDist(profile.distanceMeters)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-neutral-500" />
                {relativeTime}
              </span>
            </div>
          </div>

          {/* Fila 2: Chips Tácticos en una sola línea horizontal */}
          <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
            <TacticalBadge variant="neutral" size="xs">
              {getRoleDisplayLabel(profile.role, language)}
            </TacticalBadge>

            <TacticalBadge
              variant={isImmediateHost ? "emerald" : "cyan"}
              size="xs"
              icon={isImmediateHost ? <Home className="w-2.5 h-2.5" /> : undefined}
            >
              {isImmediateHost
                ? (t.pulses?.hasPlaceBadge || "Tiene lugar 🏠")
                : (t.pulses?.canTravelBadge || "Tiene movilidad 🚗")}
            </TacticalBadge>

            {profile.healthStatus?.prep && (
              <TacticalBadge variant="emerald" size="xs">
                🛡️ PrEP Activa
              </TacticalBadge>
            )}

            {profile.onTheClock?.isActive && (
              <TacticalBadge variant="violet" size="xs" pulse>
                ⚡ YA ({profile.onTheClock.durationMinutes || 45}m)
              </TacticalBadge>
            )}

            {isReencounter && (
              <TacticalBadge variant="amber" size="xs" icon={<Sparkles className="w-2.5 h-2.5" />}>
                {reencounterNote || t.pulses?.reencounterBadge || "Te vi en la pista"}
              </TacticalBadge>
            )}

            {renderExitProtocolBadge(profile.exitProtocol)}
          </div>

          {/* Micro-aviso sutil cuando es Onda Mutua */}
          {isEffectivelyMutual && (
            <div className="flex items-center gap-1 text-[10.5px] font-mono text-emerald-400 font-bold truncate">
              <Flame className="w-3 h-3 text-emerald-400 fill-current shrink-0" />
              <span className="truncate">{t.pulses?.mutualSuccessNotice || "¡Pegaron onda! Chat libre desbloqueado"}</span>
            </div>
          )}

          {/* Compatibilidad si es recibido pendiente */}
          {mode === "received" && !isEffectivelyMutual && (
            <div
              data-testid="pulse-sintonia-review"
              className="flex items-center justify-between text-[9.5px] font-mono text-neutral-400 pt-0.5"
            >
              <span className="text-electricViolet-glow font-bold flex items-center gap-1">
                <span>⚡</span>
                <span>{t.pulses?.proposalTitle || "Onda & Compatibilidad"}</span>
              </span>
              <span>{t.pulses?.doubleConsentBadge || "Onda mutua previa"}</span>
            </div>
          )}

          {/* Nota o declaración si existe */}
          {profile.statement && !isEffectivelyMutual && (
            <p className="text-[10px] text-neutral-300 italic truncate font-sans">
              &ldquo;{profile.statement}&rdquo;
            </p>
          )}

          {/* Botonera Compacta Ergonómica (36px de altura táctica) */}
          <div className="pt-1.5 grid grid-cols-2 gap-1.5">
            {isEffectivelyMutual ? (
              /* Estado Mutuo: Coordinar cita o Chatear sin expulsar */
              <>
                <BrutalistButton
                  variant="mint"
                  size="sm"
                  soundEffect="pulse"
                  onClick={() => onScheduleEncounter(profile.id)}
                  aria-label={t.pulses?.scheduleEncounterCta || "Coordinar cita"}
                  className="w-full text-[11px] font-mono font-bold py-1 min-h-[36px]"
                >
                  <CalendarPlus className="w-3.5 h-3.5 mr-1 stroke-[2.2]" />
                  <span className="truncate">{t.pulses?.scheduleEncounterCta || "Pegar encuentro"}</span>
                </BrutalistButton>

                <BrutalistButton
                  variant="primary"
                  size="sm"
                  soundEffect="pulse"
                  onClick={() => onOpenChat(profile.id)}
                  aria-label={t.pulses?.openChat || "Abrir chat"}
                  className="w-full text-[11px] font-mono font-black py-1 min-h-[36px]"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1 stroke-[2.2]" />
                  <span className="truncate">{t.pulses?.openChat || "Abrir chat"}</span>
                </BrutalistButton>
              </>
            ) : mode === "received" ? (
              /* Recibido Pendiente: Paso o Devolver Toque */
              <>
                <BrutalistButton
                  variant="secondary"
                  size="sm"
                  soundEffect="pulse"
                  onClick={() => {
                    if (pulseId && onDismissPulse) {
                      onDismissPulse(pulseId);
                    }
                  }}
                  aria-label={t.intents?.declinePolite || "Paso"}
                  className="w-full text-[11px] font-mono font-bold py-1 min-h-[36px]"
                >
                  <X className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                  <span className="truncate">{t.intents?.declinePolite || "Paso"}</span>
                </BrutalistButton>

                <BrutalistButton
                  variant="primary"
                  size="sm"
                  soundEffect="subbass"
                  onClick={handleReturnPulseInPlace}
                  aria-label={t.pulses?.returnPulse || "Devolver toque ⚡"}
                  className="w-full text-[11px] font-mono font-black py-1 min-h-[36px] bg-gradient-to-r from-electricViolet to-purple-600 hover:brightness-110 shadow-violet-soft"
                >
                  <Zap className="w-3.5 h-3.5 mr-1 fill-current stroke-[2.5]" />
                  <span className="truncate">{t.pulses?.returnPulse || "Devolver toque ⚡"}</span>
                </BrutalistButton>
              </>
            ) : (
              /* Enviado: Ver Perfil o Abrir Chat directo */
              <>
                <BrutalistButton
                  variant="secondary"
                  size="sm"
                  soundEffect="pulse"
                  onClick={() => onSelectProfile(profile)}
                  className="w-full text-[11px] font-mono font-bold py-1 min-h-[36px]"
                >
                  <span className="truncate">{t.pulses?.viewProfile || "Ver perfil"}</span>
                </BrutalistButton>

                <BrutalistButton
                  variant="primary"
                  size="sm"
                  soundEffect="pulse"
                  onClick={() => onOpenChat(profile.id)}
                  className="w-full text-[11px] font-mono font-bold py-1 min-h-[36px]"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1 stroke-[2.2]" />
                  <span className="truncate">{t.pulses?.openChat || "Abrir chat"}</span>
                </BrutalistButton>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

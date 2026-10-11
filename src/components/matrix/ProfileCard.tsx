"use client";

import React from "react";
import { VesselProfile, KinkMutualMatch } from "@/types/vessel";
import {
  useRadarMatrix,
  useSettings,
} from "@/context/VesselContext";
import { Lock, Star, Zap } from "lucide-react";
import Image from "next/image";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleDisplayLabel, getRoleActionMeta } from "@/data/roleActionCatalog";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";
import { TelemetryPill } from "@/components/ui/TelemetryPill";
import { BrutalistButton, TacticalBadge, TacticalBadgeVariant } from "@/components/ui";

export interface ProfileCardProps {
  profile: VesselProfile;
  onSelect: (profile: VesselProfile) => void;
  onOpenChat?: (profileId: string) => void;
  onOpenRendezvous?: (profile: VesselProfile) => void;
  isPriority?: boolean;
  isLockedByGridLimit?: boolean;

  // Granular decoupled props (eliminates context cascades in ProfileGrid)
  isFavorite?: boolean;
  onToggleFavorite?: (profileId: string) => void;
  signalCount?: number;
  onTransmitSignal?: (profileId: string) => void;
  isAttenuated?: boolean;
  dossierRating?: number | null;
  customAlias?: string | null;
  mutualMatches?: readonly KinkMutualMatch[];
  language?: "es" | "en";
  isUnlimited?: boolean;
  openUnlimitedModal?: () => void;
}

interface PureProfileCardProps extends ProfileCardProps {
  isFavorite: boolean;
  onToggleFavorite: (profileId: string) => void;
  signalCount: number;
  onTransmitSignal: (profileId: string) => void;
  isAttenuated: boolean;
  dossierRating: number | null;
  customAlias: string | null;
  mutualMatches: readonly KinkMutualMatch[];
  language: "es" | "en";
  isUnlimited: boolean;
  openUnlimitedModal?: () => void;
}

const BLUR_PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23121212'/%3E%3C/svg%3E";

import { isOptimizableImageUrl } from "@/lib/images/imageUtils";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { hasHostingCapability, canTravel } from "@/lib/geo/mobility";
import { safeStartViewTransition } from "@/lib/ui/viewTransitions";

const PureProfileCardComponent: React.FC<PureProfileCardProps> = ({
  profile,
  onSelect,
  onOpenChat,
  onOpenRendezvous,
  isPriority = false,
  isLockedByGridLimit = false,
  isFavorite,
  onToggleFavorite,
  signalCount,
  onTransmitSignal,
  isAttenuated,
  dossierRating,
  customAlias,
  mutualMatches = [],
  language = "es",
  isUnlimited = false,
  openUnlimitedModal,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.es;

  const resolvedAvatarUrl = React.useMemo(() => {
    if (!profile.avatarUrl) return "";
    if (profile.avatarUrl.includes("googleusercontent.com") && profile.avatarUrl.includes("=s96-c")) {
      return profile.avatarUrl.replace("=s96-c", "=s400-c");
    }
    if (profile.avatarUrl.includes("images.unsplash.com")) {
      return profile.avatarUrl.replace(/w=(800|1200)/, "w=400");
    }
    return profile.avatarUrl;
  }, [profile.avatarUrl]);

  const [useDirectUrl, setUseDirectUrl] = React.useState(false);
  const [imgError, setImgError] = React.useState(!resolvedAvatarUrl);
  const [showTransportLegend, setShowTransportLegend] = React.useState(false);

  React.useEffect(() => {
    setImgError(!resolvedAvatarUrl);
    setUseDirectUrl(false);
  }, [resolvedAvatarUrl]);

  const handleImageError = React.useCallback(() => {
    if (!useDirectUrl && isOptimizableImageUrl(resolvedAvatarUrl)) {
      setUseDirectUrl(true);
    } else {
      setImgError(true);
    }
  }, [useDirectUrl, resolvedAvatarUrl]);

  React.useEffect(() => {
    if (showTransportLegend) {
      const timer = setTimeout(() => setShowTransportLegend(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTransportLegend]);

  const isPaidMember =
    profile.userPlan === "unlimited" ||
    profile.userPlan === "pro" ||
    Boolean(profile.isUnlimited) ||
    Boolean(profile.isCurrentUser && isUnlimited);

  const isDistant = !profile.isCurrentUser && profile.distanceMeters > FREE_TIER_LIMITS.maxFreeRadarDistanceMeters;
  const isLockedByDistance = isDistant && !isUnlimited;
  const isQuotaLocked = Boolean(isLockedByGridLimit && !isUnlimited && !profile.isCurrentUser);

  const roleDisplay = getRoleDisplayLabel(profile.role, language);
  const verdictMeta = dossierRating ? DOSSIER_VERDICT_CONFIG[dossierRating] : null;
  const roleAction = getRoleActionMeta(profile.role, language, profile.codename);

  // Tríada de Compatibilidad: Ficha Táctica de Hospedaje
  const hostBadge = React.useMemo(() => {
    if (profile.hostCard?.hasPlace) {
      if (profile.hostCard.livingArrangement === "solo") {
        return {
          isCar: false,
          label: language === "es" ? "Recibe Solo" : "Hosts Solo",
          icon: "🏠",
          shower: Boolean(profile.hostCard.amenities?.showerReady),
          badgeVariant: "emerald" as TacticalBadgeVariant,
          className: "bg-emerald-500/25 border-emerald-400/50 text-emerald-300",
        };
      }
      return {
        isCar: false,
        label: language === "es" ? "Con Lugar" : "Has Place",
        icon: "🏠",
        shower: Boolean(profile.hostCard.amenities?.showerReady),
        badgeVariant: "amber" as TacticalBadgeVariant,
        className: "bg-amber-500/25 border-amber-400/40 text-amber-300",
      };
    }

    if (canTravel(profile.mobility) || canTravel(profile.hosting)) {
      return {
        isCar: true,
        label: "",
        fullLabel: language === "es" ? "Tiene transporte" : "Has transport",
        icon: "🚗",
        shower: false,
        badgeVariant: "cyan" as TacticalBadgeVariant,
        className: "bg-cyan-500/25 border-cyan-400/40 text-cyan-300",
      };
    }

    if (hasHostingCapability(profile.mobility) || hasHostingCapability(profile.hosting)) {
      return {
        isCar: false,
        label: language === "es" ? "Con Lugar" : "Has Place",
        icon: "🏠",
        shower: false,
        badgeVariant: "amber" as TacticalBadgeVariant,
        className: "bg-amber-500/25 border-amber-400/40 text-amber-300",
      };
    }

    return {
      isCar: false,
      label: language === "es" ? "Busca Lugar" : "Needs Place",
      icon: "📍",
      shower: false,
      badgeVariant: "neutral" as TacticalBadgeVariant,
      className: "bg-white/10 border-white/15 text-neutral-400",
    };
  }, [profile.hostCard, profile.mobility, profile.hosting, language]);

  // Contador de Disponibilidad Inmediata (Listo YA)
  const readinessMinutes = React.useMemo(() => {
    if (!profile.onTheClock?.isActive) return null;
    if (profile.onTheClock.expiresAt) {
      const diff = Math.max(0, Math.floor((new Date(profile.onTheClock.expiresAt).getTime() - Date.now()) / (1000 * 60)));
      return diff > 0 ? diff : 60;
    }
    return 60;
  }, [profile.onTheClock]);

  const handleCardClick = () => {
    if (isQuotaLocked) {
      audioEngine.playSubBass(60);
      openUnlimitedModal?.();
      return;
    }
    safeStartViewTransition(() => {
      onSelect(profile);
    });
  };

  const distanceLabel =
    profile.discretizedDistance?.displayLabel ||
    (profile.distanceMeters < 1000
      ? `${profile.distanceMeters}m`
      : `${(profile.distanceMeters / 1000).toFixed(1)}km`);

  return (
    <article
      data-testid={`profile-card-${profile.id}`}
      onClick={handleCardClick}
      aria-label={`${profile.codename}, ${roleDisplay}${profile.showAge ? `, ${profile.age} años` : ""}${isQuotaLocked ? " (Requiere Membresía)" : ""}`}
      className={`group relative aspect-[2/3] bg-obsidian-surface rounded-2xl overflow-hidden cursor-pointer select-none border transition-all duration-300 transform active:scale-[0.98] shadow-lg ${
        isPaidMember
          ? "border-fuchsia-500/50 shadow-[0_0_25px_rgba(255,0,127,0.3)] ring-1 ring-fuchsia-500/50"
          : profile.isCurrentUser
          ? "border-electricViolet shadow-violet-glow ring-1 ring-electricViolet/60"
          : isQuotaLocked
          ? "border-purple-500/40 opacity-90 hover:border-electricViolet hover:shadow-violet-soft"
          : isAttenuated
          ? "border-purple-500/30 opacity-80 hover:opacity-100"
          : "border-white/10 hover:border-electricViolet/70 hover:shadow-violet-soft"
      }`}
    >
      {/* Botón Base de Apertura de Dossier */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
        aria-label={`${language === "es" ? "Ver perfil de" : "View profile of"} ${profile.codename}, ${roleDisplay}${profile.showAge ? `, ${profile.age}` : ""}`}
        className="absolute inset-0 z-10 w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-inset rounded-2xl bg-transparent"
      />

      {/* Borde Animado Neón Fucsia Giratorio para Miembros Pagos */}
      {isPaidMember && (
        <div
          data-testid="neon-fuchsia-border-beam"
          className="border-beam-fuchsia"
          aria-hidden="true"
        />
      )}

      {/* Badge Flotante Superior Izquierdo: Bloqueo de Cuota Gratuita (Grindr 99+ Quota) */}
      {isQuotaLocked && (
        <div
          data-testid="quota-locked-badge"
          className="absolute top-2 left-2 z-20 pointer-events-none"
        >
          <TacticalBadge
            variant="purple"
            size="xs"
            icon={<Lock className="w-2.5 h-2.5 text-electricViolet-glow" />}
            className="!px-2 !py-0.5 bg-black/85 border-purple-500/60 text-purple-300 shadow-lg backdrop-blur-md"
          >
            <span>{t.card?.gridLimitLockedBadge || (language === "es" ? "99+ MEMBRESÍA" : "99+ UNLIMITED")}</span>
          </TacticalBadge>
        </div>
      )}

      {/* Foto de Perfil Full Bleed con Fallback Seguro */}
      {!imgError && resolvedAvatarUrl ? (
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={resolvedAvatarUrl}
            alt={profile.codename}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={useDirectUrl || !isOptimizableImageUrl(resolvedAvatarUrl)}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER_DATA_URL}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleImageError}
            style={isPriority ? { viewTransitionName: `profile-avatar-${profile.id}` } : undefined}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              profile.isFogMode
                ? "filter blur-[6px] scale-105"
                : isQuotaLocked
                ? "filter blur-[4px] brightness-75 scale-105"
                : isLockedByDistance
                ? "filter blur-[8px] contrast-90 brightness-90 scale-105"
                : "group-hover:scale-105"
            } ${isAttenuated ? "grayscale-[25%]" : ""}`}
            priority={isPriority}
          />
          {/* Trama de scanlines tácticas para perfiles con señal remota fuera de rango */}
          {isLockedByDistance && !isQuotaLocked && (
            <div
              className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none"
              aria-hidden="true"
            />
          )}
          {/* Velo táctico para perfiles fuera de la cuota gratuita */}
          {isQuotaLocked && (
            <div
              data-testid="quota-locked-overlay"
              className="absolute inset-0 bg-black/45 pointer-events-none flex flex-col items-center justify-center p-2 text-center z-10"
              aria-hidden="true"
            >
              <div className="w-8 h-8 rounded-full bg-black/75 border border-electricViolet/60 flex items-center justify-center text-electricViolet-glow shadow-violet-soft backdrop-blur-xs mb-1">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-black text-purple-200 uppercase tracking-wider bg-black/90 px-2 py-0.5 rounded border border-purple-500/30">
                {t.card?.gridLimitLockedBadge || (language === "es" ? "99+ MEMBRESÍA" : "99+ UNLIMITED")}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-[#13111C] via-[#0D0B12] to-[#07060A] flex flex-col items-center justify-center relative overflow-hidden select-none border border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(#8A2BE2_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-electricViolet/15 border border-electricViolet/40 flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.25)] mb-2 backdrop-blur-xs">
              <span className="text-xl font-mono font-black text-electricViolet-glow">
                {(profile.codename || "V").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-neutral-400 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
              {profile.verification?.hasFacialPrivacy ? "FACIAL PRIVACY" : "DISCRECIÓN TOTAL"}
            </span>
          </div>
        </div>
      )}

      {/* Degradado Táctico de Legibilidad Calibrado al 46% */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black via-black/85 via-50% to-transparent pointer-events-none" />

      {/* Badge Superior Izquierdo: Solo para Usuario Actual o Listo YA */}
      {profile.isCurrentUser ? (
        <div className="absolute top-2 left-2 pointer-events-none z-10">
          <TacticalBadge
            variant="violet"
            size="xs"
            pulse
            className="!px-2 !py-0.5 shadow-violet-soft font-bold whitespace-nowrap !bg-electricViolet !text-white border-transparent"
          >
            <span className="text-[9px] font-black font-mono uppercase tracking-wider">
              {t.card?.youBadge || (language === "es" ? "⭐ VOS" : "⭐ YOU")}
            </span>
          </TacticalBadge>
        </div>
      ) : (
        profile.onTheClock?.isActive && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <TacticalBadge
              variant="amber"
              size="xs"
              pulse
              className="!px-1.5 !py-0.5 text-[8px] font-mono font-black shadow-[0_0_10px_rgba(251,191,36,0.3)] uppercase tracking-wider backdrop-blur-md"
            >
              <span className="hidden sm:inline">⚡ {language === "es" ? (readinessMinutes ? `LISTO ${readinessMinutes}m` : "LISTO YA") : (readinessMinutes ? `READY ${readinessMinutes}m` : "READY NOW")}</span>
              <span className="sm:hidden font-black">⚡ {readinessMinutes ? `${readinessMinutes}m` : (language === "es" ? "YA" : "NOW")}</span>
            </TacticalBadge>
          </div>
        )
      )}

      {/* Píldora Superior Derecha: Telemetría Unificada Usando TelemetryPill */}
      {!profile.isCurrentUser && (
        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1 pointer-events-auto">
          <div className="flex items-center gap-1">
            <BrutalistButton
              type="button"
              data-testid={`profile-favorite-toggle-${profile.id}`}
              variant="favorite"
              size="compact-icon"
              soundEffect="none"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(profile.id);
              }}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? (t.card?.favoriteActive || "Quitar de favoritos") : (t.card?.favoriteBtn || "Marcar favorito")}
              className={`relative !w-7 !h-7 sm:!w-8 sm:!h-8 !min-w-0 !min-h-0 !p-0 !rounded-full transition-all duration-300 flex items-center justify-center after:absolute after:-inset-2 after:content-[''] ${
                isFavorite
                  ? "!bg-amber-950/90 !border-amber-400 !text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                  : "!bg-black/70 !border-white/20 !text-neutral-400 hover:!text-amber-300 hover:!border-amber-400/50 opacity-0 group-hover:opacity-100 sm:opacity-80 focus:opacity-100 backdrop-blur-xs"
              }`}
            >
              <span
                className={`flex items-center justify-center w-full h-full transition-transform duration-300 ease-out active:scale-125 ${
                  isFavorite ? "scale-110" : "scale-100 group-hover:scale-105"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                    isFavorite
                      ? "fill-amber-400 text-amber-400 stroke-[2] drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                      : "stroke-[2.2] text-neutral-300 group-hover:text-amber-300"
                  }`}
                />
              </span>
            </BrutalistButton>
            <TelemetryPill
              bodyState={profile.bodyState}
              distanceLabel={distanceLabel}
              isRemote={isLockedByDistance}
              title={isLockedByDistance ? (t.card?.remoteSignal || "Señal Remota") : undefined}
            />
          </div>

          {profile.hasSafetyAlert && (
            <div className="flex items-center gap-1 bg-red-950/95 border border-red-500 text-red-300 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider shadow-sm pointer-events-none">
              <span>⚠️</span>
            </div>
          )}
        </div>
      )}

      {/* Pie de Foto Impeccable: Jerarquía Táctica */}
      <div className="absolute bottom-2 inset-x-2 z-10 flex flex-col gap-1 pointer-events-none">
        {/* Badge de Doble Avatar para Modo Dúo */}
        {profile.isDuo && profile.duoInfo?.partnerAvatarUrl && (
          <div
            data-testid={`duo-avatars-${profile.id}`}
            className="flex items-center gap-1.5 mb-0.5 pointer-events-auto"
            title={profile.duoInfo?.jointTitle || `Modo Dúo: ${profile.codename} & ${profile.duoInfo.partnerCodename}`}
          >
            <div className="flex items-center -space-x-1.5 flex-shrink-0">
              <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full border border-electricViolet overflow-hidden shadow-sm bg-black">
                <img
                  src={resolvedAvatarUrl || profile.avatarUrl}
                  alt={profile.codename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full border border-white/80 overflow-hidden shadow-sm bg-black">
                <img
                  src={profile.duoInfo.partnerAvatarUrl}
                  alt={profile.duoInfo.partnerCodename || "Pareja"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-electricViolet-glow tracking-tight truncate drop-shadow">
              {profile.duoInfo?.jointTitle || `${profile.codename} & ${profile.duoInfo.partnerCodename}`}
            </span>
          </div>
        )}

        {/* Fila 1: Nombre, Edad, Química & Dúo */}
        <div className="flex items-center gap-1.5 w-full min-w-0 pointer-events-auto">
          <h3
            title={customAlias || profile.codename}
            className={`text-xs sm:text-sm font-extrabold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate m-0 p-0 inline font-inherit ${
              customAlias ? "text-electricViolet-glow font-black" : "text-white"
            }`}
          >
            {customAlias || profile.codename}
          </h3>
          {profile.showAge && (
            <span className="text-[11px] sm:text-xs text-neutral-300 font-bold flex-shrink-0 drop-shadow-sm font-mono">
              {profile.age}
            </span>
          )}
          {verdictMeta && (
            <span
              title={`${verdictMeta.icon} ${verdictMeta.title[language]}`}
              className="text-xs flex-shrink-0 leading-none select-none"
            >
              {verdictMeta.icon}
            </span>
          )}
          {profile.isDuo && (
            <span
              title={
                profile.duoInfo?.jointTitle ||
                (language === "es"
                  ? `Modo Dúo con @${profile.duoInfo?.partnerCodename || "pareja"}`
                  : `Duo Mode with @${profile.duoInfo?.partnerCodename || "partner"}`)
              }
              className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md bg-electricViolet/30 text-electricViolet-glow border border-electricViolet/50 flex-shrink-0 leading-none select-none flex items-center gap-0.5"
            >
              <span>👥</span>
              <span>DÚO</span>
            </span>
          )}
        </div>

        {/* Fila 2: Rol Táctico + Hospedaje + Micro-chips */}
        <div className="flex items-center gap-1 w-full min-w-0 pointer-events-auto overflow-hidden">
          <span className="text-[11px] sm:text-xs text-electricViolet-glow font-black tracking-tight drop-shadow-sm truncate min-w-0 max-w-[80px] sm:max-w-none">
            {roleDisplay}
          </span>

          {hostBadge.isCar ? (
            <div className="relative inline-flex items-center flex-shrink-0">
              <TacticalBadge
                role="button"
                tabIndex={0}
                data-testid={`host-badge-${profile.id}`}
                variant="cyan"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTransportLegend((prev) => !prev);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowTransportLegend((prev) => !prev);
                  }
                }}
                title={language === "es" ? "Tiene transporte" : "Has transport"}
                aria-label={language === "es" ? "Tiene transporte" : "Has transport"}
                className={`cursor-pointer active:scale-95 transition-all flex-shrink-0 shadow-xs border ${hostBadge.className}`}
                icon={<span className="text-xs leading-none">🚗</span>}
              >
                {showTransportLegend && (
                  <span className="text-[8px] font-mono whitespace-nowrap animate-in fade-in">
                    {language === "es" ? "Tiene transporte" : "Has transport"}
                  </span>
                )}
              </TacticalBadge>
              {showTransportLegend && (
                <div
                  role="tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded-md bg-black/95 border border-cyan-400/60 text-cyan-300 text-[9px] font-mono font-bold whitespace-nowrap shadow-xl pointer-events-none z-30 animate-in fade-in zoom-in-95"
                >
                  🚗 {language === "es" ? "Tiene transporte" : "Has transport"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-black/95" />
                </div>
              )}
            </div>
          ) : (
            <TacticalBadge
              data-testid={`host-badge-${profile.id}`}
              variant={hostBadge.badgeVariant}
              size="xs"
              title={hostBadge.shower ? (language === "es" ? `${hostBadge.label} + Ducha lista` : `${hostBadge.label} + Shower ready`) : hostBadge.label}
              icon={<span>{hostBadge.icon}</span>}
              className={`flex-shrink-0 shadow-xs border ${hostBadge.className}`}
            >
              <span className="text-[8px] font-mono">{hostBadge.label}</span>
              {hostBadge.shower && <span className="text-[7.5px] ml-0.5">🚿</span>}
            </TacticalBadge>
          )}

          {mutualMatches.length > 0 ? (
            <TacticalBadge
              data-testid={`kinks-badge-${profile.id}`}
              variant="pink"
              size="xs"
              className="flex-shrink-0 truncate max-w-[65px] min-[380px]:max-w-[85px]"
              title={language === "es" ? `${mutualMatches.length} morbos mutuos` : `${mutualMatches.length} mutual kinks`}
              icon={<span>✨</span>}
            >
              <span>{mutualMatches.length} {language === "es" ? "morbos" : "mutual"}</span>
            </TacticalBadge>
          ) : profile.kinks && profile.kinks.length > 0 ? (
            <TacticalBadge
              variant="neutral"
              size="xs"
              className="hidden min-[400px]:inline-flex flex-shrink-0 truncate max-w-[75px]"
              title={profile.kinks[0]}
            >
              #{profile.kinks[0]}
            </TacticalBadge>
          ) : null}

        </div>

        {/* Fila 3: Micro-acciones Directas 1-Tap (Alternativa A) */}
        {!profile.isCurrentUser && (
          <div className="grid grid-cols-2 gap-1.5 w-full pt-1 pointer-events-auto relative z-20">
            <BrutalistButton
              type="button"
              data-testid={`quick-toque-btn-${profile.id}`}
              variant="ghost"
              soundEffect="none"
              onClick={(e) => {
                e.stopPropagation();
                if (isLockedByDistance && !isUnlimited) {
                  audioEngine.playSubBass(60);
                  openUnlimitedModal?.();
                  return;
                }
                audioEngine.playSubBass(65, 0.15);
                onTransmitSignal(profile.id);
              }}
              title={language === "es" ? "Tirar toque directo" : "Send quick tap"}
              aria-label={language === "es" ? `Tirar toque a ${profile.codename}` : `Send tap to ${profile.codename}`}
              className={`!h-8.5 sm:!h-7.5 !min-h-[34px] sm:!min-h-[30px] !px-2 !rounded-xl !gap-1.5 !text-[11px] sm:!text-[10px] font-bold transition-all duration-300 after:absolute after:-inset-1 after:content-[''] ${
                signalCount > 0
                  ? "!bg-electricViolet !text-white shadow-violet-soft !border-electricViolet-glow"
                  : "!bg-black/85 hover:!bg-electricViolet/30 !text-neutral-200 hover:!text-white !border-white/20 backdrop-blur-xs"
              }`}
            >
              <span
                className={`text-xs leading-none inline-block transition-transform duration-300 ${
                  signalCount > 0 ? "scale-115 rotate-6" : "scale-100"
                }`}
              >
                🔥
              </span>
              <span>{language === "es" ? "Toque" : "Tap"}</span>
              {signalCount > 0 && <span className="font-mono text-[9px] text-electricViolet-glow">+{signalCount}</span>}
            </BrutalistButton>

            <BrutalistButton
              type="button"
              data-testid={`quick-chat-btn-${profile.id}`}
              variant="ghost"
              soundEffect="none"
              onClick={(e) => {
                e.stopPropagation();
                if (isLockedByDistance && !isUnlimited) {
                  audioEngine.playSubBass(60);
                  openUnlimitedModal?.();
                  return;
                }
                audioEngine.playPulse();
                if (onOpenChat) {
                  onOpenChat(profile.id);
                } else {
                  onSelect(profile);
                }
              }}
              title={language === "es" ? "Abrir chat directo" : "Open direct chat"}
              aria-label={language === "es" ? `Abrir chat con ${profile.codename}` : `Open chat with ${profile.codename}`}
              className="!h-8.5 sm:!h-7.5 !min-h-[34px] sm:!min-h-[30px] !px-2 !rounded-xl !gap-1.5 !text-[11px] sm:!text-[10px] font-bold !bg-black/85 hover:!bg-white/20 !text-neutral-200 hover:!text-white !border-white/20 backdrop-blur-xs after:absolute after:-inset-1 after:content-['']"
            >
              <span className="text-xs leading-none">💬</span>
              <span>{language === "es" ? "Chat" : "Chat"}</span>
            </BrutalistButton>
          </div>
        )}
      </div>
    </article>
  );
};

const PureProfileCard = React.memo(PureProfileCardComponent, (prevProps, nextProps) => {
  if (
    prevProps.profile === nextProps.profile &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.signalCount === nextProps.signalCount &&
    prevProps.isAttenuated === nextProps.isAttenuated &&
    prevProps.isLockedByGridLimit === nextProps.isLockedByGridLimit &&
    prevProps.dossierRating === nextProps.dossierRating &&
    prevProps.customAlias === nextProps.customAlias &&
    prevProps.isPriority === nextProps.isPriority &&
    prevProps.language === nextProps.language &&
    prevProps.isUnlimited === nextProps.isUnlimited &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.onOpenChat === nextProps.onOpenChat &&
    prevProps.onOpenRendezvous === nextProps.onOpenRendezvous &&
    (prevProps.mutualMatches?.length ?? 0) === (nextProps.mutualMatches?.length ?? 0)
  ) {
    return true;
  }
  return false;
});

const ConnectedProfileCardComponent: React.FC<ProfileCardProps> = (props) => {
  const radar = useRadarMatrix();
  const settings = useSettings();
  const isFavorite = props.isFavorite ?? (radar.isFavoriteProfile ? radar.isFavoriteProfile(props.profile.id) : (radar.favoriteProfileIds?.includes(props.profile.id) ?? false));
  const onToggleFavorite = props.onToggleFavorite ?? radar.toggleFavoriteProfile ?? (() => {});
  const signalCount = props.signalCount ?? (radar.transmissions?.[props.profile.id] || 0);
  const onTransmitSignal = props.onTransmitSignal ?? radar.transmitSignal ?? (() => {});
  const isAttenuated = props.isAttenuated ?? (radar.boundaries?.[props.profile.id]?.radarVisibility === "attenuated");
  const dossier = radar.profileDossiers?.[props.profile.id];
  const customAlias = props.customAlias !== undefined
    ? props.customAlias
    : (dossier?.customAlias || null);
  const dossierRating = props.dossierRating !== undefined
    ? props.dossierRating
    : (dossier?.rating || null);
  const mutualMatches = props.mutualMatches ?? (radar.getMutualKinkMatches ? radar.getMutualKinkMatches(props.profile.kinkMatrix) : []);
  const language = props.language ?? settings.language;
  const isUnlimited = props.isUnlimited ?? settings.isUnlimited;
  const openUnlimitedModal = props.openUnlimitedModal ?? settings.openUnlimitedModal;

  return (
    <PureProfileCard
      {...props}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      signalCount={signalCount}
      onTransmitSignal={onTransmitSignal}
      isAttenuated={isAttenuated}
      dossierRating={dossierRating}
      customAlias={customAlias}
      mutualMatches={mutualMatches}
      language={language}
      isUnlimited={isUnlimited}
      openUnlimitedModal={openUnlimitedModal}
    />
  );
};

const STATIC_NOOP = () => {};
const STATIC_EMPTY_MATCHES: readonly KinkMutualMatch[] = Object.freeze([]);

const ConnectedProfileCard = React.memo(ConnectedProfileCardComponent);

export const ProfileCard: React.FC<ProfileCardProps> = React.memo((props) => {
  if (
    props.onToggleFavorite !== undefined &&
    props.isFavorite !== undefined &&
    props.language !== undefined &&
    props.isUnlimited !== undefined
  ) {
    return (
      <PureProfileCard
        {...props}
        isFavorite={props.isFavorite}
        onToggleFavorite={props.onToggleFavorite}
        signalCount={props.signalCount ?? 0}
        onTransmitSignal={props.onTransmitSignal ?? STATIC_NOOP}
        isAttenuated={props.isAttenuated ?? false}
        dossierRating={props.dossierRating ?? null}
        customAlias={props.customAlias ?? null}
        mutualMatches={props.mutualMatches ?? STATIC_EMPTY_MATCHES}
        language={props.language}
        isUnlimited={props.isUnlimited}
        openUnlimitedModal={props.openUnlimitedModal}
      />
    );
  }
  return <ConnectedProfileCard {...props} />;
});

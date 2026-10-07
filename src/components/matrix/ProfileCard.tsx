"use client";

import React from "react";
import { VesselProfile } from "@/types/vessel";
import {
  useRadarMatrix,
  useChat,
  useDiary,
  useSettings,
} from "@/context/VesselContext";
import { Lock, Star, Zap } from "lucide-react";
import Image from "next/image";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";
import { TelemetryPill } from "@/components/ui/TelemetryPill";
import { BrutalistButton, TacticalBadge, TacticalBadgeVariant } from "@/components/ui";

interface ProfileCardProps {
  profile: VesselProfile;
  onSelect: (profile: VesselProfile) => void;
  onOpenChat?: (profileId: string) => void;
  onOpenRendezvous?: (profile: VesselProfile) => void;
  isPriority?: boolean;
  isLockedByGridLimit?: boolean;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  profile,
  onSelect,
  onOpenRendezvous,
  isPriority = false,
  isLockedByGridLimit = false,
}) => {
  const {
    isFavoriteProfile: isFavProp,
    toggleFavoriteProfile: toggleFavProp,
    getMutualKinkMatches: getMatchesProp,
  } = useRadarMatrix();
  const isFavoriteProfile = isFavProp || (() => false);
  const toggleFavoriteProfile = toggleFavProp || (() => {});
  const getMutualKinkMatches = getMatchesProp || (() => []);
  const { getBoundaryForProfile } = useChat();
  const { getProfileDossier } = useDiary();
  const { t, language, isUnlimited, openUnlimitedModal } = useSettings();

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

  const [imgError, setImgError] = React.useState(!resolvedAvatarUrl);
  const [showTransportLegend, setShowTransportLegend] = React.useState(false);

  React.useEffect(() => {
    setImgError(!resolvedAvatarUrl);
  }, [resolvedAvatarUrl]);

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

  const boundary = getBoundaryForProfile(profile.id);
  const dossier = getProfileDossier(profile.id);
  const roleDisplay = getRoleDisplayLabel(profile.role, language);
  const verdictMeta = dossier?.rating ? DOSSIER_VERDICT_CONFIG[dossier.rating] : null;

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

    const mobilityStr = (profile.mobility || "") + " " + (profile.hosting || "");
    if (/viaj|muev|desplaz/i.test(mobilityStr)) {
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

    if (/casa|depto|sitio|lugar/i.test(mobilityStr)) {
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

  const mutualMatches = React.useMemo(() => {
    return getMutualKinkMatches(profile.kinkMatrix);
  }, [getMutualKinkMatches, profile.kinkMatrix]);

  // Contador de Disponibilidad Inmediata (Listo YA)
  const readinessMinutes = React.useMemo(() => {
    if (!profile.onTheClock?.isActive) return null;
    if (profile.onTheClock.expiresAt) {
      const diff = Math.max(0, Math.floor((new Date(profile.onTheClock.expiresAt).getTime() - Date.now()) / (1000 * 60)));
      return diff > 0 ? diff : 60;
    }
    return 60;
  }, [profile.onTheClock]);

  const isAttenuated = boundary?.radarVisibility === "attenuated";

  const handleCardClick = () => {
    if (isQuotaLocked) {
      audioEngine.playSubBass(60);
      openUnlimitedModal();
      return;
    }
    onSelect(profile);
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
          <div className="flex items-center gap-1 bg-black/85 border border-purple-500/60 text-purple-300 px-2 py-0.5 rounded-full shadow-lg font-mono text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
            <Lock className="w-2.5 h-2.5 text-electricViolet-glow" />
            <span>{t.card?.gridLimitLockedBadge || (language === "es" ? "99+ MEMBRESÍA" : "99+ UNLIMITED")}</span>
          </div>
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
            unoptimized
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
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
          <div className="flex items-center gap-1 bg-electricViolet text-white px-2 py-0.5 rounded-full shadow-violet-soft font-bold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
            <span className="text-[9px] font-black font-mono uppercase tracking-wider">
              {t.card?.youBadge || (language === "es" ? "⭐ VOS" : "⭐ YOU")}
            </span>
          </div>
        </div>
      ) : (
        profile.onTheClock?.isActive && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400 text-amber-300 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-black shadow-[0_0_10px_rgba(251,191,36,0.3)] uppercase tracking-wider backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
              <span className="hidden sm:inline">⚡ {language === "es" ? (readinessMinutes ? `LISTO ${readinessMinutes}m` : "LISTO YA") : (readinessMinutes ? `READY ${readinessMinutes}m` : "READY NOW")}</span>
              <span className="sm:hidden font-black">⚡ {readinessMinutes ? `${readinessMinutes}m` : (language === "es" ? "YA" : "NOW")}</span>
            </div>
          </div>
        )
      )}

      {/* Píldora Superior Derecha: Telemetría Unificada Usando TelemetryPill */}
      {!profile.isCurrentUser && (
        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1 pointer-events-auto">
          <TelemetryPill
            bodyState={profile.bodyState}
            distanceLabel={distanceLabel}
            isRemote={isLockedByDistance}
            title={isLockedByDistance ? (t.card?.remoteSignal || "Señal Remota") : undefined}
          />

          {profile.hasSafetyAlert && (
            <div className="flex items-center gap-1 bg-red-950/95 border border-red-500 text-red-300 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider shadow-sm pointer-events-none">
              <span>⚠️</span>
            </div>
          )}
        </div>
      )}

      {/* Pie de Foto Impeccable: Jerarquía Táctica */}
      <div className="absolute bottom-2 inset-x-2 z-10 flex flex-col gap-1 pointer-events-none">
        {/* Fila 1: Nombre, Edad, Química & Dúo */}
        <div className="flex items-center gap-1.5 w-full min-w-0 pointer-events-auto">
          <span
            title={dossier?.customAlias || profile.codename}
            className={`text-xs sm:text-sm font-extrabold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate ${
              dossier?.customAlias ? "text-electricViolet-glow font-black" : "text-white"
            }`}
          >
            {dossier?.customAlias || profile.codename}
          </span>
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
              title={language === "es" ? "Modo Dúo de Pareja" : "Duo Partner Mode"}
              className="text-[10px] flex-shrink-0 leading-none select-none"
            >
              👥
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
              <button
                type="button"
                data-testid={`host-badge-${profile.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTransportLegend((prev) => !prev);
                }}
                title={language === "es" ? "Tiene transporte" : "Has transport"}
                aria-label={language === "es" ? "Tiene transporte" : "Has transport"}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-bold shadow-xs border cursor-pointer active:scale-95 transition-all ${hostBadge.className}`}
              >
                <span className="text-xs leading-none">🚗</span>
                {showTransportLegend && (
                  <span className="text-[8px] font-mono whitespace-nowrap animate-in fade-in">
                    {language === "es" ? "Tiene transporte" : "Has transport"}
                  </span>
                )}
              </button>
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
              className="flex-shrink-0 truncate max-w-[60px] min-[380px]:max-w-[75px]"
              title={profile.kinks[0]}
            >
              #{profile.kinks[0]}
            </TacticalBadge>
          ) : null}
        </div>

        {/* Fila 3: Acción Primaria Táctica + Favorito */}
        {!profile.isCurrentUser && (
          <div className="flex items-center gap-1.5 w-full pt-0.5 pointer-events-auto relative z-20">
            <BrutalistButton
              variant="tactical"
              size="compact"
              soundEffect="none"
              data-testid={`profile-sintonizar-btn-${profile.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isQuotaLocked) {
                  audioEngine.playSubBass(60);
                  openUnlimitedModal();
                  return;
                }
                audioEngine.playSubBass(55);
                if (onOpenRendezvous) {
                  onOpenRendezvous(profile);
                }
              }}
              className="flex-1 min-h-[34px] sm:min-h-[36px]"
              title={language === "es" ? "Coordinar encuentro y acuerdos" : "Coordinate date & terms"}
              aria-label={`${language === "es" ? "Coordinar con" : "Coordinate with"} ${profile.codename}`}
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 flex-shrink-0" />
              <span className="truncate">{language === "es" ? "Coordinar" : "Coordinate"}</span>
            </BrutalistButton>

            <BrutalistButton
              variant="favorite"
              size="compact-icon"
              soundEffect="pulse"
              data-testid={`profile-favorite-toggle-${profile.id}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteProfile(profile.id);
              }}
              className={`transform active:scale-75 ${
                isFavoriteProfile(profile.id)
                  ? "!border-amber-400 !bg-amber-950/80 !text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                  : ""
              }`}
              title={isFavoriteProfile(profile.id) ? (t.card?.favoriteActive || "Favorito Guardado") : (t.card?.favoriteBtn || "Marcar Favorito")}
              aria-label={isFavoriteProfile(profile.id) ? (t.card?.favoriteActive || "Favorito Guardado") : (t.card?.favoriteBtn || "Marcar Favorito")}
              aria-pressed={isFavoriteProfile(profile.id)}
            >
              <Star
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2] transition-transform ${
                  isFavoriteProfile(profile.id) ? "fill-amber-400 text-amber-400 scale-110" : ""
                }`}
              />
            </BrutalistButton>
          </div>
        )}
      </div>
    </article>
  );
};

export const ProfileCard = React.memo(ProfileCardComponent);

"use client";

import React from "react";
import { VesselProfile } from "@/types/vessel";
import {
  useRadarMatrix,
  useChat,
  useDiary,
  useSettings,
} from "@/context/VesselContext";
import { Lock, MessageCircle, Star } from "lucide-react";
import Image from "next/image";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleActionMeta, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";

interface ProfileCardProps {
  profile: VesselProfile;
  onSelect: (profile: VesselProfile) => void;
  onOpenChat: (profileId: string) => void;
  isPriority?: boolean;
  isLockedByGridLimit?: boolean;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  profile,
  onSelect,
  onOpenChat,
  isPriority = false,
  isLockedByGridLimit = false,
}) => {
  const {
    transmissions,
    transmitSignal,
    hasMutualPulse,
    isFavoriteProfile: isFavProp,
    toggleFavoriteProfile: toggleFavProp,
  } = useRadarMatrix();
  const isFavoriteProfile = isFavProp || (() => false);
  const toggleFavoriteProfile = toggleFavProp || (() => {});
  const { getBoundaryForProfile } = useChat();
  const { getProfileDossier } = useDiary();
  const { t, language, isUnlimited, openUnlimitedModal } = useSettings();
  const [isPulsing, setIsPulsing] = React.useState(false);
  const [imgError, setImgError] = React.useState(!profile.avatarUrl);

  React.useEffect(() => {
    setImgError(!profile.avatarUrl);
  }, [profile.avatarUrl]);

  const isPaidMember =
    profile.userPlan === "unlimited" ||
    profile.userPlan === "pro" ||
    Boolean(profile.isUnlimited) ||
    Boolean(profile.isCurrentUser && isUnlimited);

  const isDistant = !profile.isCurrentUser && profile.distanceMeters > FREE_TIER_LIMITS.maxFreeRadarDistanceMeters;
  const isLockedByDistance = isDistant && !isUnlimited;
  const isQuotaLocked = Boolean(isLockedByGridLimit && !isUnlimited && !profile.isCurrentUser);
  const isMutualPulseActive = !profile.isCurrentUser && hasMutualPulse(profile.id);
  const canChatDirectly = !isLockedByDistance || isMutualPulseActive;

  const signalCount = transmissions[profile.id] || 0;
  const boundary = getBoundaryForProfile(profile.id);
  const dossier = getProfileDossier(profile.id);
  const roleAction = getRoleActionMeta(profile.role, language, profile.codename);
  const roleDisplay = getRoleDisplayLabel(profile.role, language);

  const verdictMeta = dossier?.rating ? DOSSIER_VERDICT_CONFIG[dossier.rating] : null;

  const isImmediateHost =
    Boolean(
      profile.mobility?.toLowerCase().includes("casa") ||
      profile.mobility === "Tengo depto / lugar" ||
      profile.mobility === "Tengo sitio" ||
      profile.mobility === "Tengo lugar y me muevo" ||
      profile.mobility === "Tengo sitio/me desplazo" ||
      profile.mobility?.toLowerCase().includes("lugar") ||
      profile.mobility?.toLowerCase().includes("depto")
    );
  const isAttenuated = boundary?.radarVisibility === "attenuated";

  const handleCardClick = () => {
    if (isQuotaLocked) {
      audioEngine.playSubBass(60);
      openUnlimitedModal();
      return;
    }
    onSelect(profile);
  };

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
      {/* Botón Base de Apertura de Dossier (Evita anidamiento inválido de <button> dentro de role="button" según WAI-ARIA 4.1.2) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
        aria-label={`${language === "es" ? "Ver perfil de" : "View profile of"} ${profile.codename}, ${roleDisplay}${profile.showAge ? `, ${profile.age}` : ""}`}
        className="absolute inset-0 z-10 w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-inset rounded-2xl bg-transparent"
      />
      {/* Borde Animado Neón Fucsia Giratorio para Miembros Pagos (Border Beam) */}
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
      {!imgError ? (
        <div className="relative w-full h-full overflow-hidden">
          <Image
            src={profile.avatarUrl}
            alt={profile.codename}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
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
          {/* Velo táctico para perfiles fuera de la cuota gratuita de 99 perfiles */}
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
        <div className="w-full h-full bg-obsidian-card flex flex-col items-center justify-center text-neutral-600 font-mono text-xs">
          <span className="text-2xl mb-1 text-electricViolet-glow">⚡</span>
          <span>{profile.codename.slice(0, 2).toUpperCase()}</span>
        </div>
      )}

      {/* Degradado Táctico de Legibilidad: 100% contraste desde la base hasta la cápsula, nítido y sin gradiente hacia arriba */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black via-black/92 via-55% to-transparent pointer-events-none" />

      {/* Badge Superior Izquierdo: Solo para el Usuario Actual o Listo YA */}
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
        /* Badge Superior Izquierdo: Listo YA (On-The-Clock) */
        profile.onTheClock?.isActive && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="flex items-center gap-1 bg-purple-950/95 border border-electricViolet text-electricViolet-glow px-1.5 py-0.5 rounded-full text-[8px] font-mono font-black shadow-violet-glow uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping flex-shrink-0" />
              <span className="hidden sm:inline">⚡ {language === "es" ? "LISTO YA" : "READY NOW"}</span>
              <span className="sm:hidden font-black">⚡ {language === "es" ? "YA" : "NOW"}</span>
            </div>
          </div>
        )
      )}

      {/* Píldora Superior Derecha: Telemetría Unificada (Estado Corporal + Distancia + Señal Remota, sin acción al presionar) */}
      {!profile.isCurrentUser && (
        <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1 pointer-events-auto">
          <div
            data-testid="distance-telemetry-pill"
            onClick={(e) => e.stopPropagation()}
            title={
              isLockedByDistance
                ? `${t.card.remoteSignal || "Señal Remota"}`
                : undefined
            }
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm font-mono text-[9px] font-bold border cursor-default select-none ${
              isLockedByDistance
                ? "bg-black/90 border-purple-500/50 text-purple-300"
                : "bg-black/90 border-white/15 text-white"
            }`}
          >
            {/* Dot indicador de Estado Corporal */}
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                profile.bodyState === "open"
                  ? "bg-mintNeon shadow-mint-glow animate-pulse"
                  : profile.bodyState === "occupied"
                  ? "bg-bloodNeon shadow-blood-glow"
                  : "bg-purple-400"
              }`}
            />
            {/* Ícono de Satélite Táctico para perfiles fuera de radio libre (>1km) */}
            {isLockedByDistance && <span className="leading-none text-[10px]">🛰️</span>}
            {/* Distancia discretizada S2 */}
            <span>
              {profile.discretizedDistance?.displayLabel ||
                (profile.distanceMeters < 1000
                  ? `${profile.distanceMeters}m`
                  : `${(profile.distanceMeters / 1000).toFixed(1)}km`)}
            </span>
            {/* Mini tag de Señal Remota unificado en la píldora */}
            {isLockedByDistance && (
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-electricViolet-glow ml-0.5">
                {language === "es" ? "REMOTO" : "REMOTE"}
              </span>
            )}
          </div>

          {/* Alerta Sentinel Preventiva Comunitaria */}
          {profile.hasSafetyAlert && (
            <div className="flex items-center gap-1 bg-red-950/95 border border-red-500 text-red-300 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider shadow-sm pointer-events-none">
              <span>⚠️</span>
            </div>
          )}
        </div>
      )}

      {/* Pie de Foto Impeccable: Jerarquía Táctica Desacoplada (Nombre 100% visible sin colisión) */}
      <div className="absolute bottom-2 inset-x-2 z-10 flex flex-col gap-1 pointer-events-none">
        {/* Fila 1: Nombre, Edad, Host Chip, Química & Dúo — 100% DEL ANCHO DE LA TARJETA */}
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
          {/* Chip de Hospedaje Inmediato en Fila de Identidad */}
          {isImmediateHost && (
            <span
              title={profile.hostCard?.amenities?.showerReady ? (language === "es" ? "Con lugar propio + Ducha lista" : "Has place + Shower ready") : (t.card?.immediateHost || "Con Lugar")}
              className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/25 border border-amber-400/40 text-[9px] font-bold text-amber-300 flex-shrink-0 shadow-xs"
            >
              <span>🏠</span>
              {profile.hostCard?.amenities?.showerReady && <span className="text-[8px]">🚿</span>}
            </span>
          )}
          {/* Ícono de Química / Veredicto Dossier */}
          {verdictMeta && (
            <span
              title={`${verdictMeta.icon} ${verdictMeta.title[language]}`}
              className="text-xs flex-shrink-0 leading-none select-none"
            >
              {verdictMeta.icon}
            </span>
          )}
          {/* Badge Dúo de Pareja */}
          {profile.isDuo && (
            <span
              title={language === "es" ? "Modo Dúo de Pareja" : "Duo Partner Mode"}
              className="text-[10px] flex-shrink-0 leading-none select-none"
            >
              👥
            </span>
          )}
        </div>

        {/* Fila 2: Rol Táctico a la Izquierda + Botones de Acción 1-Tap a la Derecha */}
        <div className="flex items-center justify-between gap-1 w-full pt-0.5">
          {/* Rol en Violeta Eléctrico (100% Despejado, Espacio Dedicado) */}
          <div className="flex items-center min-w-0 flex-1 pr-1.5 pointer-events-auto">
            <span className="text-[11px] sm:text-xs text-electricViolet-glow font-black tracking-tight drop-shadow-sm truncate">
              {roleDisplay}
            </span>
          </div>

          {/* Cluster de Acciones Tácticas Directas (Favorito 1-Tap + Chat Directo 1-Tap + Pulso de Rol 1-Tap) */}
          {!profile.isCurrentUser && (
            <div className="flex-shrink-0 flex items-center gap-1.5 pointer-events-auto relative z-20">
              {/* Botón Favorito (★) 1-Tap */}
              <button
                type="button"
                data-testid={`profile-favorite-toggle-${profile.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoriteProfile(profile.id);
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-150 transform active:scale-75 flex-shrink-0 shadow-md focus-visible:outline-none focus-visible:ring-2 cursor-pointer relative after:absolute after:-inset-1.5 after:content-[''] ${
                  isFavoriteProfile(profile.id)
                    ? "border-amber-400 bg-amber-950/80 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] focus-visible:ring-amber-400"
                    : "border-white/20 bg-black/90 text-neutral-400 hover:border-amber-400/60 hover:text-amber-300 hover:bg-black focus-visible:ring-amber-400"
                }`}
                title={isFavoriteProfile(profile.id) ? (t.card?.favoriteActive || "Favorito Guardado") : (t.card?.favoriteBtn || "Marcar Favorito")}
                aria-label={isFavoriteProfile(profile.id) ? (t.card?.favoriteActive || "Favorito Guardado") : (t.card?.favoriteBtn || "Marcar Favorito")}
                aria-pressed={isFavoriteProfile(profile.id)}
              >
                <Star
                  className={`w-3.5 h-3.5 stroke-[2.2] transition-transform ${
                    isFavoriteProfile(profile.id) ? "fill-amber-400 text-amber-400 scale-110" : ""
                  }`}
                />
              </button>

              {/* Botón 1: Chat Rápido Directo o Candado de VESSEL UNLIMITED */}
              {canChatDirectly ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioEngine.playPulse();
                    onOpenChat(profile.id);
                  }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-150 transform active:scale-75 flex-shrink-0 shadow-md focus-visible:outline-none focus-visible:ring-2 cursor-pointer relative after:absolute after:-inset-1.5 after:content-[''] ${
                    isMutualPulseActive
                      ? "border-emerald-400/80 bg-emerald-950/90 text-emerald-300 hover:bg-emerald-900 shadow-[0_0_10px_rgba(52,211,153,0.5)] focus-visible:ring-emerald-400"
                      : "border-white/20 bg-black/90 text-white hover:border-electricViolet hover:text-electricViolet-glow hover:bg-black focus-visible:ring-electricViolet"
                  }`}
                  title={
                    isMutualPulseActive
                      ? (t.card.mutualPulseChat || (language === "es" ? "Chat Sintonía Mutua" : "Mutual Pulse Chat"))
                      : (language === "es" ? "Abrir chat directo" : "Open direct chat")
                  }
                  aria-label={
                    isMutualPulseActive
                      ? (t.card.mutualPulseChat || (language === "es" ? "Chat Sintonía Mutua" : "Mutual Pulse Chat"))
                      : (language === "es" ? `Abrir chat directo con ${profile.codename}` : `Open direct chat with ${profile.codename}`)
                  }
                >
                  <MessageCircle className={`w-3.5 h-3.5 stroke-[2.2] ${isMutualPulseActive ? "text-emerald-400" : ""}`} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioEngine.playPulse();
                    openUnlimitedModal();
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-champagneGold/50 bg-black/90 text-champagneGold hover:border-champagneGold hover:bg-amber-950/60 hover:text-white flex items-center justify-center transition-all duration-150 transform active:scale-75 flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagneGold cursor-pointer relative after:absolute after:-inset-1.5 after:content-['']"
                  title={t.card.distantChatLocked || "Chatear requiere VESSEL UNLIMITED o Zumbido Mutuo"}
                  aria-label={t.card.distantChatLocked || "Chatear requiere VESSEL UNLIMITED o Zumbido Mutuo"}
                >
                  <Lock className="w-3.5 h-3.5 text-champagneGold stroke-[2.4]" />
                </button>
              )}

              {/* Botón 2: Pulso Cinético de Rol (1-Tap Kinetic Reaction con Micro-Interacción + Cola Offline) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPulsing(true);
                  transmitSignal(profile.id);
                  setTimeout(() => setIsPulsing(false), 650);
                }}
                className={`relative overflow-hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-150 transform active:scale-75 flex-shrink-0 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet cursor-pointer after:absolute after:-inset-1.5 after:content-[''] ${
                  signalCount > 0
                    ? `bg-electricViolet text-white border-electricViolet ${roleAction.glowClass} scale-105`
                    : "bg-black/90 text-white border-white/20 hover:border-electricViolet hover:scale-105 hover:bg-black"
                }`}
                title={signalCount > 0 ? roleAction.sentLabel : roleAction.tooltipTemplate}
                aria-label={roleAction.tooltipTemplate}
              >
                {isPulsing && (
                  <span className="absolute inset-0 rounded-full bg-electricViolet-glow/70 animate-pulse-wave pointer-events-none" />
                )}
                <span
                  className={`leading-none select-none text-[12px] sm:text-[13px] transition-transform duration-200 ${
                    isPulsing ? "scale-125" : ""
                  }`}
                >
                  {roleAction.icon}
                </span>
                {signalCount > 0 && typeof navigator !== "undefined" && !navigator.onLine && (
                  <span
                    title={language === "es" ? "En cola offline" : "Queued offline"}
                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-black text-[8px] font-black flex items-center justify-center"
                  >
                    ⏳
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProfileCard = React.memo(ProfileCardComponent);

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { isOptimizableImageUrl } from "@/lib/images/imageUtils";
import { VesselProfile } from "@/types/vessel";
import { useSettings, useRadarMatrix } from "@/context/VesselContext";
import {
  X,
  MessageSquare,
  Zap,
  ShieldCheck,
  ChevronRight,
  Star,
  Flame,
  Volume2,
  Lock,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { BrutalistButton, TacticalBadge, TelemetryPill } from "@/components/ui";
import { VoiceVibePlayer } from "@/components/profile/VoiceVibePlayer";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";
import { hasHostingCapability, canTravel as canTravelMobility } from "@/lib/geo/mobility";

export interface ProfileBentoQuickPeekProps {
  profile: VesselProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (profileId: string) => void;
  onOpenRendezvous: (profile: VesselProfile) => void;
  onViewFullProfile: (profile: VesselProfile) => void;
}

export const ProfileBentoQuickPeek: React.FC<ProfileBentoQuickPeekProps> = ({
  profile,
  isOpen,
  onClose,
  onOpenChat,
  onOpenRendezvous,
  onViewFullProfile,
}) => {
  const { language, t, isUnlimited, openUnlimitedModal } = useSettings();
  const {
    isFavoriteProfile,
    toggleFavoriteProfile,
    getMutualKinkMatches,
    transmitSignal,
    transmissions,
    hasMutualPulse,
  } = useRadarMatrix();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Bloqueo de scroll y tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setActivePhotoIdx(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  const photos = useMemo(() => {
    const raw = Array.isArray(profile.galleryUrls)
      ? profile.galleryUrls.filter(Boolean)
      : [];
    if (raw.length > 0) return raw;
    if (profile.avatarUrl) return [profile.avatarUrl];
    return ["/placeholder-avatar.png"];
  }, [profile.galleryUrls, profile.avatarUrl]);

  const isFav = isFavoriteProfile(profile.id);
  const signalCount = transmissions[profile.id] || 0;
  const mutualMatches = getMutualKinkMatches(profile.kinkMatrix);
  const isMutualPulseActive = hasMutualPulse(profile.id);
  const roleDisplay = getRoleDisplayLabel(profile.role, language);

  const isDistant = !profile.isCurrentUser && profile.distanceMeters > FREE_TIER_LIMITS.maxFreeRadarDistanceMeters;
  const isLockedByDistance = isDistant && !isUnlimited;
  const canChatDirectly = !isLockedByDistance || isMutualPulseActive;

  const distanceLabel =
    profile.discretizedDistance?.displayLabel ||
    (profile.distanceMeters < 1000
      ? `${profile.distanceMeters}m`
      : `${(profile.distanceMeters / 1000).toFixed(1)}km`);

  // Logística de hospedaje
  const isHost = Boolean(
    profile.hostCard?.hasPlace ||
    hasHostingCapability(profile.hosting) ||
    hasHostingCapability(profile.mobility)
  );

  const canTravel = Boolean(
    canTravelMobility(profile.hosting) ||
    canTravelMobility(profile.mobility)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa táctica de ${profile.codename}`}
      className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-obsidian-deep border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[92vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* =========================================================
            BENTO HERO HEADER (Fotos + Telemetría + Cierre)
            ========================================================= */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black overflow-hidden flex-shrink-0">
          {photos.length > 0 && (
            <Image
              src={photos[activePhotoIdx]}
              alt={profile.codename}
              fill
              sizes="(max-width: 640px) 100vw, 500px"
              unoptimized={!isOptimizableImageUrl(photos[activePhotoIdx])}
              style={{ viewTransitionName: `profile-avatar-${profile.id}` }}
              className={`object-cover transition-all duration-300 ${
                profile.isFogMode ? "filter blur-[6px] scale-105" : ""
              }`}
            />
          )}

          {/* Sombra de degradado para legibilidad */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

          {/* Barra superior flotante de la foto */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            <TelemetryPill
              bodyState={profile.bodyState}
              distanceLabel={distanceLabel}
              isRemote={isLockedByDistance}
            />

            <div className="flex items-center gap-1.5">
              <BrutalistButton
                type="button"
                variant="ghost"
                size="compact-icon"
                soundEffect="pulse"
                data-testid={`profile-favorite-toggle-${profile.id}`}
                onClick={() => toggleFavoriteProfile(profile.id)}
                aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                className={`w-9 h-9 min-h-[36px] min-w-[36px] !rounded-full backdrop-blur-md !bg-black/60 border border-white/20 text-white ${
                  isFav ? "!text-amber-400 !border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.4)]" : ""
                }`}
              >
                <Star className={`w-4 h-4 ${isFav ? "fill-amber-400" : ""}`} />
              </BrutalistButton>

              <BrutalistButton
                type="button"
                variant="ghost"
                size="compact-icon"
                soundEffect="none"
                onClick={onClose}
                aria-label="Cerrar vista previa"
                className="w-9 h-9 min-h-[36px] min-w-[36px] !rounded-full backdrop-blur-md !bg-black/60 border border-white/20 text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </BrutalistButton>
            </div>
          </div>

          {/* Indicadores de fotos múltiples */}
          {photos.length > 1 && (
            <div className="absolute top-12 left-3 flex items-center gap-1 z-10">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhotoIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    activePhotoIdx === i
                      ? "w-6 bg-electricViolet-glow shadow-violet-glow"
                      : "w-2 bg-white/40"
                  }`}
                  aria-label={`Ver foto ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Identidad en la base de la foto */}
          <div className="absolute bottom-3 inset-x-3 z-10 flex items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-mono font-black text-white uppercase tracking-tight drop-shadow-md">
                  {profile.codename}
                </h2>
                {profile.showAge && (
                  <span className="text-sm font-mono font-bold text-neutral-300 drop-shadow-md">
                    {profile.age}
                  </span>
                )}
                {profile.verification?.isVerified && (
                  <TacticalBadge variant="cyan" size="xs" className="!px-1.5 !py-0.2">
                    <ShieldCheck className="w-3 h-3 text-cyan-300" />
                    <span className="text-[9px] font-mono font-bold">3D OK</span>
                  </TacticalBadge>
                )}
              </div>
              <p className="text-xs font-mono font-bold text-electricViolet-glow uppercase tracking-wide">
                {roleDisplay}
              </p>
            </div>

            {/* Toque Cinético de 1-Tap */}
            <BrutalistButton
              type="button"
              variant="tactical"
              size="compact"
              soundEffect="pulse"
              data-testid={`profile-sintonizar-btn-${profile.id}`}
              onClick={() => {
                if (isLockedByDistance && !isUnlimited) {
                  audioEngine.playSubBass(60);
                  openUnlimitedModal();
                  return;
                }
                transmitSignal(profile.id);
              }}
              aria-label={`Tirar onda a ${profile.codename}`}
              className={`!px-3 !py-1.5 min-h-[36px] !rounded-xl backdrop-blur-md !bg-black/70 border border-white/20 text-white flex items-center gap-1.5 ${
                signalCount > 0 ? "!bg-electricViolet !border-electricViolet-glow text-white shadow-violet-soft" : ""
              }`}
            >
              <span className="text-base leading-none">🔥</span>
              <span className="text-[11px] font-mono font-bold uppercase">
                {signalCount > 0 ? `+${signalCount}` : "Toque"}
              </span>
            </BrutalistButton>
          </div>
        </div>

        {/* =========================================================
            CUERPO BENTO MODULAR (Scrollable)
            ========================================================= */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto no-scrollbar flex-1">
          {/* Módulo 1: Audio de Voz (Voice Vibe) si existe */}
          {profile.voiceVibe && (
            <div className="p-2.5 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-electricViolet/20 border border-electricViolet/40 flex items-center justify-center text-electricViolet-glow flex-shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-mono font-bold text-white block truncate">
                    {language === "es" ? "Audio de Perfil (5s)" : "Voice Note (5s)"}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-sans block truncate">
                    {language === "es" ? "Escuchá su voz antes de hablar" : "Hear their voice first"}
                  </span>
                </div>
              </div>

              <VoiceVibePlayer voice={profile.voiceVibe} compact />
            </div>
          )}

          {/* Módulo 2: Grid Bento de Logística & Cuidado */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 2.1 Hospedaje y Casa */}
            <div className="p-3 rounded-2xl bg-obsidian-surface border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">
                🏠 {language === "es" ? "Hospedaje" : "Hosting"}
              </span>
              <span className="text-xs font-mono font-black text-white block">
                {isHost
                  ? profile.hostCard?.livingArrangement === "solo"
                    ? (language === "es" ? "Recibe Solo" : "Hosts Solo")
                    : (language === "es" ? "Tiene Lugar" : "Has Place")
                  : canTravel
                  ? (language === "es" ? "Se Mueve / Va" : "Can Travel")
                  : (language === "es" ? "Busca Lugar" : "Needs Place")}
              </span>
              {profile.hostCard?.amenities?.showerReady && (
                <span className="text-[10px] text-emerald-400 font-mono block">
                  ✓ {language === "es" ? "Ducha lista" : "Shower ready"}
                </span>
              )}
            </div>

            {/* 2.2 Química / Morbos Mutuos */}
            <div className="p-3 rounded-2xl bg-obsidian-surface border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">
                ✨ {language === "es" ? "Química" : "Chemistry"}
              </span>
              <span className="text-xs font-mono font-black text-bloodNeon block">
                {mutualMatches.length > 0
                  ? `${mutualMatches.length} ${language === "es" ? "morbos en común" : "mutual kinks"}`
                  : (language === "es" ? "Por descubrir" : "To explore")}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono block">
                {language === "es" ? `Nivel ${profile.intensity || 2} picante` : `Level ${profile.intensity || 2}`}
              </span>
            </div>
          </div>

          {/* Módulo 3: Bio / Qué onda rápida */}
          {profile.statement && (
            <div className="p-3 rounded-2xl bg-obsidian-surface border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">
                💬 {language === "es" ? "Qué onda" : "About"}
              </span>
              <p className="text-xs text-neutral-200 font-sans leading-relaxed line-clamp-2">
                {profile.statement}
              </p>
            </div>
          )}

          {/* Acceso a la Ficha Completa */}
          <BrutalistButton
            type="button"
            variant="ghost"
            size="compact"
            soundEffect="none"
            onClick={() => {
              onClose();
              onViewFullProfile(profile);
            }}
            className="w-full !py-2 min-h-[38px] !rounded-xl !bg-white/5 hover:!bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between"
          >
            <span>{language === "es" ? "Ver Ficha Completa & Dossier" : "View Full Profile"}</span>
            <ChevronRight className="w-4 h-4" />
          </BrutalistButton>
        </div>

        {/* =========================================================
            ACTION DOCK FIJO (Chatear & Coordinar Cita)
            ========================================================= */}
        <div className="p-3 sm:p-4 bg-obsidian-surface border-t border-white/10 flex items-center gap-2.5 flex-shrink-0">
          {canChatDirectly ? (
            <BrutalistButton
              type="button"
              variant="secondary"
              size="lg"
              soundEffect="none"
              onClick={() => {
                onClose();
                onOpenChat(profile.id);
              }}
              className="flex-1 min-h-[48px] !rounded-2xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-electricViolet" />
              <span>{language === "es" ? "Chatear" : "Chat"}</span>
            </BrutalistButton>
          ) : (
            <BrutalistButton
              type="button"
              variant="outline"
              size="lg"
              soundEffect="pulse"
              onClick={() => openUnlimitedModal()}
              className="flex-1 min-h-[48px] !rounded-2xl text-xs font-mono font-bold uppercase !border-purple-500/40 text-purple-300 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{language === "es" ? "Desbloquear" : "Unlock"}</span>
            </BrutalistButton>
          )}

          <BrutalistButton
            type="button"
            variant="primary"
            size="lg"
            soundEffect="pulse"
            onClick={() => {
              onClose();
              onOpenRendezvous(profile);
            }}
            className="flex-1 min-h-[48px] !rounded-2xl text-xs font-mono font-black uppercase tracking-wider shadow-violet-soft flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>{language === "es" ? "Coordinar Cita" : "Meet Up"}</span>
          </BrutalistButton>
        </div>
      </div>
    </div>
  );
};

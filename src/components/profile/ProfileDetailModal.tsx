"use client";

import React, { useState } from "react";
import { VesselProfile } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import { INTENSITY_LABELS } from "@/data/kinkCatalog";
import { FillMeter } from "@/components/matrix/FillMeter";
import { PrivateVault } from "./PrivateVault";
import { TestimonialsSection } from "./TestimonialsSection";
import {
  X,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  Play,
  Pause,
  MessageSquare,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Car,
  Home,
  UserCheck,
  Activity,
  Fingerprint,
  EyeOff,
  CheckCircle2,
  User,
  BookOpen,
  Sliders,
  Edit3,
  Flame,
  Zap,
  Music,
} from "lucide-react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { ENERGY_VIBE_CATALOG, KINK_ITEMS_CATALOG } from "@/data/energyCatalog";
import { BoundaryManagerModal } from "@/components/chat/BoundaryManagerModal";
import { EditMockProfileModal } from "./EditMockProfileModal";
import { getRoleDisplayLabel, getRoleActionMeta } from "@/data/roleActionCatalog";
import { SteganographicWatermark } from "@/components/security/SteganographicWatermark";
import { ProfileDossierSection } from "./ProfileDossierSection";
import { RANKING_TIER_CONFIG, DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { HostCardBadge } from "@/components/logistics/HostCardBadge";
import { VoiceVibePlayer } from "@/components/profile/VoiceVibePlayer";
import { ExitProtocolBadge } from "@/components/profile/ExitProtocolBadge";
import { SubstanceAtmosphereBadge } from "@/components/profile/SubstanceAtmosphereBadge";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";

interface ProfileDetailModalProps {
  profile: VesselProfile;
  onClose: () => void;
  onOpenChat: (profileId: string) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  onClose,
  onOpenChat,
}) => {
  const {
    transmitSignal,
    sendRendezvousPin,
    transmissions,
    openCreateDiaryModal,
    getBoundaryForProfile,
    getProfileDossier,
    setActiveView,
    openHostCardModal,
    openPreFlightModal,
    openEnRouteModal,
    openLivenessModal,
    openVoiceRecorder,
    getMutualKinkMatches,
    playAmbientTonePreview,
    stopAmbientTonePreview,
    isPlayingAmbientTone,
    t,
    language,
    isUnlimited,
    openUnlimitedModal,
    hasMutualPulse,
  } = useVessel();

  const [currentProfile, setCurrentProfile] = useState<VesselProfile>(profile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBoundaryModalOpen, setIsBoundaryModalOpen] = useState(false);

  const isDistant = !currentProfile.isCurrentUser && currentProfile.distanceMeters > FREE_TIER_LIMITS.maxFreeRadarDistanceMeters;
  const isLockedByDistance = isDistant && !isUnlimited;
  const isMutualPulseActive = !currentProfile.isCurrentUser && hasMutualPulse(currentProfile.id);
  const canChatDirectly = !isLockedByDistance || isMutualPulseActive;

  const mutualKinks = !profile.isCurrentUser ? getMutualKinkMatches(profile.kinkMatrix) : [];

  React.useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  const isSignalSent = (transmissions[currentProfile.id] || 0) > 0;
  const signalCount = transmissions[currentProfile.id] || 0;
  const photos = currentProfile.galleryUrls.length > 0 ? currentProfile.galleryUrls : [currentProfile.avatarUrl];
  const boundary = getBoundaryForProfile(currentProfile.id);
  const dossier = getProfileDossier(currentProfile.id);
  const roleAction = getRoleActionMeta(currentProfile.role, language, currentProfile.codename);

  const isImmediateHost =
    currentProfile.mobility === "Tengo depto / lugar" ||
    currentProfile.mobility === "Tengo sitio" ||
    currentProfile.mobility === "Tengo lugar y me muevo" ||
    currentProfile.mobility === "Tengo sitio/me desplazo";

  const getProtocolMeta = (protocol?: string | null) => {
    if (!protocol) return null;
    switch (protocol) {
      case "fast_encounter":
        return {
          icon: "⏱️",
          label: language === "es" ? "PUNTUAL" : "FAST",
          sub: language === "es" ? "Sin sobremesa" : "No lingering",
          desc: language === "es" ? "Protocolo: Encuentro puntual (sin sobremesa prolongada)" : "Protocol: Fast encounter (no lingering)",
        };
      case "chill_cuddle":
        return {
          icon: "🫂",
          label: language === "es" ? "MIMOS" : "CUDDLE",
          sub: language === "es" ? "Ducha & mimos" : "Shower & cuddle",
          desc: language === "es" ? "Protocolo: Ducha y mimos de 20-30 min" : "Protocol: Shower and cuddle (20-30 min)",
        };
      case "sleepover":
        return {
          icon: "🌙",
          label: language === "es" ? "DORMIR" : "SLEEPOVER",
          sub: language === "es" ? "Pasar la noche" : "Stay over",
          desc: language === "es" ? "Protocolo: Quedarse a dormir si hay química mutua" : "Protocol: Sleepover if mutual vibe",
        };
      default:
        return {
          icon: "⏱️",
          label: protocol.toUpperCase(),
          sub: language === "es" ? "Acuerdo directo" : "Direct agreement",
          desc: `Protocolo: ${protocol}`,
        };
    }
  };

  const protocolMeta = getProtocolMeta(currentProfile.exitProtocol);

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const nextPhoto = () => {
    setSelectedPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setSelectedPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle del perfil de ${profile.codename}`}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex justify-center items-center p-0 sm:p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-full md:h-[90vh] md:max-h-[920px] bg-obsidian-deep md:border md:border-white/10 md:rounded-3xl flex flex-col relative overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)]">
        
        {/* =========================================================
            HEADER APP-BAR (Fijo y con fondo sólido difuminado - Sin Colisiones)
            ========================================================= */}
        <header className="flex-shrink-0 z-30 bg-obsidian-deep/90 backdrop-blur-xl border-b border-white/10 px-3.5 md:px-6 py-2.5 md:py-3 flex items-center justify-between shadow-md">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalles del perfil"
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Identidad Central */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-center">
            <div className="text-center min-w-0">
              <div className="flex items-center justify-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    profile.bodyState === "open"
                      ? "bg-mintNeon shadow-mint-glow animate-pulse"
                      : profile.bodyState === "occupied"
                      ? "bg-bloodNeon shadow-blood-glow"
                      : "bg-electricViolet shadow-violet-soft"
                  }`}
                />
                <h2 className="text-xs font-extrabold text-white uppercase tracking-wider truncate font-mono flex items-center gap-1 justify-center">
                  {dossier?.customAlias ? (
                    <>
                      <span className="text-electricViolet-glow font-bold truncate">{dossier.customAlias}</span>
                      <span className="text-neutral-500 font-normal text-[10px] hidden sm:inline">({profile.codename})</span>
                    </>
                  ) : (
                    profile.codename
                  )}
                </h2>
              </div>
              <div className="text-[10px] text-electricViolet-glow font-mono truncate">
                {profile.discretizedDistance?.displayLabel ||
                  (profile.distanceMeters < 1000
                    ? `${profile.distanceMeters} ${language === "es" ? "m de ti" : "m from you"}`
                    : `${(profile.distanceMeters / 1000).toFixed(1)} km`)}
              </div>
            </div>
          </div>

          {/* Acciones de la Derecha del Header */}
          <div className="flex items-center gap-1.5">
            {/* Botón de Edición del Perfil de Prueba */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Editar este perfil de prueba"
              title="Editar nombre y datos de este perfil (Dev / Preset)"
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-electricViolet/15 hover:bg-electricViolet text-electricViolet-glow hover:text-white transition-all border border-electricViolet/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-violet-soft"
            >
              <Edit3 className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => setIsBoundaryModalOpen(true)}
              aria-label="Gestionar límites y acuerdos de este perfil"
              className={`p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-95 ${
                boundary
                  ? "bg-purple-900/50 border-purple-500/70 text-purple-300 shadow-sm"
                  : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/15"
              }`}
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ventana"
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* =========================================================
            CUERPO RESPONSIVO (Móvil: scroll vertical único | Desktop: 2 columnas independientes)
            ========================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain relative scroll-smooth no-scrollbar flex flex-col md:flex-row md:overflow-hidden">
          
          {/* =========================================================
              COLUMNA IZQUIERDA: HERO VISUAL + IDENTIDAD + HUD + AUDIO + FILLMETER
              ========================================================= */}
          <div className="w-full md:w-[46%] lg:w-[42%] md:h-full md:overflow-y-auto p-0 md:p-5 md:border-r md:border-white/10 space-y-4 no-scrollbar">
            {/* Carrusel de Fotos Hero */}
            <div className="relative aspect-[4/5] sm:aspect-[4/4.5] md:aspect-[4/5] bg-black overflow-hidden group md:rounded-2xl md:border md:border-white/10 shadow-lg">
            <img
              src={photos[selectedPhotoIdx]}
              alt={profile.codename}
              className={`w-full h-full object-cover transition-all duration-300 ${
                profile.isFogMode && (selectedPhotoIdx === 0 || photos[selectedPhotoIdx] === profile.avatarUrl)
                  ? "filter blur-[7px] scale-105"
                  : isLockedByDistance
                  ? "filter blur-[8px] contrast-90 brightness-90 scale-105"
                  : ""
              }`}
              loading="eager"
            />

            {/* Trama de scanlines para perfiles lejanos sin membresía */}
            {isLockedByDistance && (
              <div
                className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-60 pointer-events-none z-10"
                aria-hidden="true"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-deep via-transparent to-black/20 pointer-events-none" />

            {/* Escudo Forense Esteganográfico Sutil */}
            <SteganographicWatermark
              ownerCodename={profile.codename}
              variant="subtle"
              showBadge={false}
            />

            {/* Paginación de Fotos Superior */}
            {photos.length > 1 && (
              <div className="absolute top-3 left-4 right-4 flex gap-1.5 z-20">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIdx(idx)}
                    aria-label={`Ver foto ${idx + 1}`}
                    className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                      selectedPhotoIdx === idx ? "bg-electricViolet shadow-violet-soft" : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Zonas de Toque Izquierda/Derecha para Navegar Fotos */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  aria-label="Foto anterior"
                  className="absolute top-0 bottom-0 left-0 w-1/3 z-10 focus:outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={nextPhoto}
                  aria-label="Siguiente foto"
                  className="absolute top-0 bottom-0 right-0 w-1/3 z-10 focus:outline-none cursor-pointer"
                />

                {/* Botones Flotantes de Navegación en Desktop */}
                <button
                  type="button"
                  onClick={prevPhoto}
                  aria-label="Foto anterior"
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  aria-label="Siguiente foto"
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </>
            )}

            {/* Información Superpuesta en la Base de la Foto */}
            <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    profile.bodyState === "open"
                      ? "bg-mintNeon shadow-mint-glow animate-pulse"
                      : profile.bodyState === "occupied"
                      ? "bg-bloodNeon shadow-blood-glow"
                      : "bg-electricViolet shadow-violet-soft"
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 font-mono">
                  {profile.bodyState === "open" && `${t.bodyState.open} • ${t.bodyState.openSub}`}
                  {profile.bodyState === "occupied" && `${t.bodyState.occupied} • ${t.bodyState.occupiedSub}`}
                  {profile.bodyState === "dormant" && `${t.bodyState.dormant} • ${t.bodyState.dormantSub}`}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md flex items-center gap-2 flex-wrap">
                    {dossier?.customAlias ? (
                      <>
                        <span>{dossier.customAlias}</span>
                        <span className="text-sm sm:text-base text-neutral-400 font-mono font-normal">
                          ({profile.codename})
                        </span>
                      </>
                    ) : (
                      profile.codename
                    )}
                  </h1>
                  {profile.showAge && (
                    <span className="text-xl text-neutral-300 font-medium">{profile.age}</span>
                  )}
                </div>
                {dossier?.rating && DOSSIER_VERDICT_CONFIG[dossier.rating] && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-black border uppercase shadow-sm flex items-center gap-1.5 ${DOSSIER_VERDICT_CONFIG[dossier.rating].badgeColor} ${DOSSIER_VERDICT_CONFIG[dossier.rating].borderColor}`}
                    title={DOSSIER_VERDICT_CONFIG[dossier.rating].title[language]}
                  >
                    <span>{DOSSIER_VERDICT_CONFIG[dossier.rating].icon}</span>
                    <span>{DOSSIER_VERDICT_CONFIG[dossier.rating].title[language]}</span>
                  </span>
                )}
                {profile.verification?.isVerified && (
                  <VerificationBadge verification={profile.verification} size="sm" showLabel />
                )}
                {profile.isAntiGhost && (
                  <AntiGhostBadge
                    respectScore={profile.respectScore}
                    responseRateMinutes={profile.responseRateMinutes}
                    size="sm"
                    showLabel
                  />
                )}
              </div>

              {/* Género, Pronombres y Modo Niebla */}
              <div className="flex items-center gap-2 flex-wrap">
                {profile.isFogMode && (
                  <div
                    className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-xs text-neutral-200 font-mono font-bold shadow-sm"
                    title="Modo Niebla: Rostro protegido por difuminado facial"
                  >
                    <span>{t.card.fogDetailBadge}</span>
                  </div>
                )}

                {(profile.genderIdentity || profile.pronouns) && (
                  <div className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-xs text-neutral-200 font-medium">
                    {profile.genderIdentity && <span>{profile.genderIdentity}</span>}
                    {profile.genderIdentity && profile.pronouns && <span>•</span>}
                    {profile.pronouns && <span className="text-electricViolet-glow font-semibold">{profile.pronouns}</span>}
                  </div>
                )}
              </div>

              {profile.tagline && (
                <p className="text-xs sm:text-sm text-neutral-300 italic font-sans leading-relaxed drop-shadow-sm">
                  &ldquo;{profile.tagline}&rdquo;
                </p>
              )}
            </div>
          </div>

            {/* Tira de Miniaturas de Fotos en Desktop */}
            {photos.length > 1 && (
              <div className="hidden md:flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
                {photos.map((photoUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIdx(idx)}
                    aria-label={`Ver foto ${idx + 1}`}
                    className={`relative w-12 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      selectedPhotoIdx === idx
                        ? "border-electricViolet ring-2 ring-electricViolet/50 scale-105"
                        : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                    }`}
                  >
                    <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Contenedor con Padding para Bloques de la Columna Izquierda */}
            <div className="px-4 md:px-0 space-y-4">

            {/* =========================================================
                HUD TÁCTICO DE 1-VISTAZO (0 TAPS / 0 SCROLLS)
                Las 4 variables operativas de cruising/encuentros al frente
                ========================================================= */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Pilar 1: Rol / Posición de Encuentro */}
                <div className="bg-obsidian-surface rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 shadow-card-elevation">
                  <span className="text-xl leading-none select-none flex-shrink-0">
                    {roleAction.icon}
                  </span>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-mono text-neutral-400 block font-bold tracking-wider">
                      {language === "es" ? "Rol / Posición" : "Role / Position"}
                    </span>
                    <span className="text-xs font-mono font-black text-electricViolet-glow uppercase truncate block mt-0.5">
                      {getRoleDisplayLabel(profile.role, language)}
                    </span>
                  </div>
                </div>

                {/* Pilar 2: Protocolo de Salida (Píldora Táctica Destacada - 100% Libre de Colisión) */}
                <div
                  className="bg-obsidian-surface rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 shadow-card-elevation cursor-pointer hover:border-electricViolet/40 transition-all"
                  onClick={() => setIsBoundaryModalOpen(true)}
                  title="Toca para ver o acordar protocolo de salida"
                >
                  <span className="text-xl leading-none select-none flex-shrink-0">
                    {protocolMeta?.icon || "⏱️"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block font-bold tracking-wider truncate">
                        {language === "es" ? "Salida / Bye" : "Exit Protocol"}
                      </span>
                      <span className="text-[9px] text-neutral-400">ℹ️</span>
                    </div>
                    <span className="text-xs font-mono font-black truncate block mt-0.5 text-electricViolet-glow">
                      {protocolMeta?.label || (language === "es" ? "PUNTUAL" : "FAST")}
                    </span>
                  </div>
                </div>

                {/* Pilar 3: Alojamiento & Movilidad */}
                <button
                  type="button"
                  onClick={() => openHostCardModal(currentProfile.isCurrentUser ? undefined : currentProfile)}
                  className="bg-obsidian-surface rounded-2xl p-3 border border-white/10 hover:border-electricViolet/40 flex items-center gap-2.5 shadow-card-elevation text-left cursor-pointer transition-all active:scale-98"
                  title="Tocar para ver Ficha Completa de Hospedaje"
                >
                  <span className="text-xl leading-none select-none flex-shrink-0">
                    {isImmediateHost ? "🏠" : "🚗"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-mono text-neutral-400 block font-bold tracking-wider">
                      {language === "es" ? "Hospedaje // Host" : "Hosting // Place"}
                    </span>
                    <span className="text-xs font-mono font-black text-white truncate block mt-0.5">
                      {isImmediateHost
                        ? (profile.hostCard?.amenities?.showerReady ? "Lugar + Ducha 🚿" : "Tiene Lugar 🏠")
                        : (language === "es" ? "Se Desplaza 🚗" : "Travels 🚗")}
                    </span>
                  </div>
                </button>

                {/* Pilar 4: Sintonía Kink Secreta o Distancia */}
                {mutualKinks.length > 0 ? (
                  <div className="bg-purple-950/30 rounded-2xl p-3 border border-purple-500/40 flex items-center gap-2.5 shadow-card-elevation">
                    <span className="text-xl leading-none select-none flex-shrink-0">
                      🔗
                    </span>
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-mono text-purple-300 block font-bold tracking-wider">
                        Kink Match
                      </span>
                      <span className="text-xs font-mono font-black text-white truncate block mt-0.5">
                        {mutualKinks.length} {language === "es" ? "Deseos Mutuos 🔥" : "Mutual Desires 🔥"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-obsidian-surface rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 shadow-card-elevation">
                    <Navigation className="w-5 h-5 text-electricViolet-glow flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block font-bold tracking-wider">
                        {language === "es" ? "Distancia Táctica" : "Tactical Distance"}
                      </span>
                      <span className="text-xs font-mono font-black text-neutral-200 truncate block mt-0.5">
                        {profile.discretizedDistance?.displayLabel ||
                          (profile.distanceMeters < 1000
                            ? `${profile.distanceMeters}m`
                            : `${(profile.distanceMeters / 1000).toFixed(1)}km`)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Barra Despejada de Confianza, Encuentros y Redes */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                {profile.totalEncountersVerified > 0 && (
                  <div
                    className="inline-flex items-center gap-1.5 bg-mintNeon/10 border border-mintNeon/30 px-2.5 py-1 rounded-full text-xs text-mintNeon font-bold shadow-mint-glow"
                    title={`${profile.totalEncountersVerified} Encuentros físicos reales validados por Doble Consentimiento`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{profile.totalEncountersVerified} {language === "es" ? "Encuentros Validados" : "Verified Encounters"}</span>
                  </div>
                )}

                {profile.twitterHandle && (
                  <a
                    href={`https://x.com/${profile.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/15 text-xs text-neutral-300 hover:text-white hover:border-electricViolet/40 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-white text-xs">𝕏</span>
                    <span>@{profile.twitterHandle}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500" />
                  </a>
                )}
              </div>
            </div>

              {/* Experiencia Sensorial: Audio Note, Voice Vibe y Clima Sonoro */}
              {(currentProfile.voiceVibe || profile.audioNote || currentProfile.ambientVibe || currentProfile.isCurrentUser) && (
                <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-3 shadow-card-elevation">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-electricViolet-glow flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      <span>Experiencia Sonora // Audio</span>
                    </span>
                  </div>

                  {/* Voice Vibe (Audio de 5 segundos) */}
                  {currentProfile.voiceVibe ? (
                    <VoiceVibePlayer voice={currentProfile.voiceVibe} />
                  ) : currentProfile.isCurrentUser ? (
                    <button
                      type="button"
                      onClick={() => openVoiceRecorder()}
                      className="w-full p-2.5 rounded-xl border border-dashed border-electricViolet/40 bg-electricViolet/10 hover:bg-electricViolet/20 text-electricViolet-glow text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>🎙️</span>
                      <span>Grabar Voice Vibe de 5 segundos para tu perfil</span>
                    </button>
                  ) : null}

                  {/* Nota de Audio si existe */}
                  {profile.audioNote && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={toggleAudio}
                          aria-label={isPlayingAudio ? "Pausar nota de voz" : "Reproducir nota de voz"}
                          className="w-10 h-10 rounded-full bg-electricViolet text-white flex items-center justify-center font-bold hover:bg-electricViolet-glow shadow-violet-soft transition-all cursor-pointer active:scale-95 flex-shrink-0"
                        >
                          {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div>
                          <div className="text-xs font-bold text-white">
                            Nota de Voz // Instrucciones
                          </div>
                          <div className="text-[11px] text-electricViolet-glow font-mono">
                            {isPlayingAudio ? "Reproduciendo..." : `Duración: ${profile.audioNote.duration}`}
                          </div>
                        </div>
                      </div>
                      <Volume2 className="w-4 h-4 text-neutral-500" />
                    </div>
                  )}

                  {/* Soundtrack de Hospedaje & Clima Sonoro */}
                  {currentProfile.ambientVibe && (
                    <div className="p-3 rounded-xl bg-neutral-950/80 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-electricViolet-glow">
                          <Music className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-mono font-bold text-white uppercase truncate">
                            Clima Sonoro: {currentProfile.ambientVibe.replace("_", " ")}
                          </div>
                          <p className="text-[10px] text-neutral-400 font-mono truncate">
                            Frecuencia analógica para el espacio
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isPlayingAmbientTone) {
                            stopAmbientTonePreview();
                          } else {
                            playAmbientTonePreview(currentProfile.ambientVibe!);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
                          isPlayingAmbientTone
                            ? "bg-bloodNeon text-white shadow-blood-glow animate-pulse"
                            : "bg-white/10 hover:bg-white/20 text-neutral-200 border border-white/15"
                        }`}
                      >
                        {isPlayingAmbientTone ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlayingAmbientTone ? "Detener" : "Escuchar"}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Micro-interacción: Hold-to-Fill / Transmit Signal */}
              <div className="bg-obsidian-surface rounded-2xl p-3.5 border border-white/10 space-y-2 shadow-card-elevation">
                <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                  <span className="font-semibold uppercase tracking-wider text-[10px] font-mono">
                    {language === "es" ? "Interés Carnal Directo" : "Direct Carnal Signal"}
                  </span>
                  <span className="text-electricViolet-glow font-medium text-[11px] font-mono">
                    {language === "es" ? "Cede el espacio" : "Yield the space"}
                  </span>
                </div>
                <FillMeter
                  profileId={profile.id}
                  targetCodename={profile.codename}
                  role={profile.role}
                  onSignalSent={() => transmitSignal(profile.id)}
                  isAlreadySent={isSignalSent}
                />
              </div>
            </div>
          </div>

          {/* =========================================================
              COLUMNA DERECHA: BANNERS + SUITE + DOSSIER + STATS + VIBES + BIO + VAULT
              ========================================================= */}
          <div className="w-full md:w-[54%] lg:w-[58%] md:h-full md:overflow-y-auto p-4 md:p-6 space-y-4 pb-52 md:pb-8 no-scrollbar">
            {/* Banner Táctico de Señal Remota / Sintonía Mutua */}
            {isLockedByDistance && (
              <div
                className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
                  isMutualPulseActive
                    ? "bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-purple-950/30 border-purple-500/40 shadow-violet-soft"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{isMutualPulseActive ? "🔥" : "🛰️"}</span>
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-white">
                      {isMutualPulseActive
                        ? (t.card.mutualPulseBanner || "🔥 SINTONÍA MUTUA // ¡Pulsos recíprocos! Chat libre desbloqueado.")
                        : (t.card.distantSignalBanner || "SEÑAL FUERA DE RANGO LOCAL (> 1.0 KM)")}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-purple-300">
                    {profile.discretizedDistance?.displayLabel || `${(profile.distanceMeters / 1000).toFixed(1)} km`}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                  {isMutualPulseActive
                    ? (language === "es"
                        ? "Ambos se enviaron un pulso. La barrera de distancia queda desactivada para chatear gratis."
                        : "Both sent a pulse. The distance barrier is bypassed for free chatting.")
                    : (t.card.distantSignalDesc || "Transmití un pulso para activar sintonía mutua o desbloqueá chat inmediato con VESSEL UNLIMITED.")}
                </p>
                {!isMutualPulseActive && (
                  <button
                    type="button"
                    onClick={() => openUnlimitedModal()}
                    className="self-start mt-0.5 px-3 py-1.5 bg-electricViolet text-white hover:bg-electricViolet-glow text-[10.5px] font-mono font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-violet-soft active:scale-95"
                  >
                    {language === "es" ? "Desbloquear con VESSEL UNLIMITED ⚡" : "Unlock with VESSEL UNLIMITED ⚡"}
                  </button>
                )}
              </div>
            )}

            {/* =========================================================
                SUITE TÁCTICA: LOGÍSTICA, SINTONÍA Y POST-ENCUENTRO
                ========================================================= */}
            <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-3.5 shadow-card-elevation">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Suite Táctica del Encuentro</span>
                </span>
                {currentProfile.isLivenessVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                    <span>✓</span> Liveness 3D
                  </span>
                ) : currentProfile.isCurrentUser ? (
                  <button
                    type="button"
                    onClick={() => openLivenessModal()}
                    className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 hover:bg-amber-500/30 transition-colors"
                  >
                    Verificar Rostro 3D 📷
                  </button>
                ) : null}
              </div>

              {/* Banner On-The-Clock (Listo YA) */}
              {currentProfile.onTheClock?.isActive && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400 text-amber-300 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400 fill-current" />
                    <div>
                      <div className="text-xs font-mono font-black uppercase">
                        ⚡ RADAR ON-THE-CLOCK: LISTO YA
                      </div>
                      {currentProfile.onTheClock.statusNote && (
                        <div className="text-[11px] text-neutral-300 font-mono">
                          &ldquo;{currentProfile.onTheClock.statusNote}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 font-bold">
                    ACTIVO AHORA
                  </div>
                </div>
              )}

              {/* Sintonía Secreta Kink Matrix (Coincidencias Privadas) */}
              {mutualKinks.length > 0 && (
                <div className="bg-neutral-950/80 rounded-2xl p-3.5 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-bloodNeon fill-current animate-pulse" />
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Sintonía Secreta ({mutualKinks.length} Deseos Ocultos)
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                      KINK MATRIX MATCH
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
                    Ambos marcaron estos fetiches en privado. Ningún otro usuario puede ver esta información.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mutualKinks.map((k) => {
                      const kinkDef = KINK_ITEMS_CATALOG.find((x) => x.id === k.kinkId);
                      return (
                        <span
                          key={k.kinkId}
                          className="px-2.5 py-1 rounded-xl bg-bloodNeon/15 border border-bloodNeon/40 text-bloodNeon font-mono text-xs font-bold flex items-center gap-1.5 shadow-blood-glow"
                        >
                          <span>🔥</span>
                          <span>{kinkDef?.name || k.kinkId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ficha de Hospedaje */}
              <div>
                <HostCardBadge
                  hostCard={currentProfile.hostCard}
                  onClick={() => openHostCardModal(currentProfile.isCurrentUser ? undefined : currentProfile)}
                />
              </div>

              {/* Expectativa de Salida */}
              {currentProfile.exitProtocol && (
                <ExitProtocolBadge protocol={currentProfile.exitProtocol} variant="tactical" />
              )}

              {/* Atmósfera de Sustancias */}
              {currentProfile.substanceAtmosphere && (
                <SubstanceAtmosphereBadge vibe={currentProfile.substanceAtmosphere} />
              )}

              {/* Acciones directas de encuentro (para otros perfiles) */}
              {!currentProfile.isCurrentUser && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openPreFlightModal(currentProfile);
                    }}
                    className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-electricViolet/40 text-electricViolet-glow rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span>📋</span>
                    <span>Sintonía Pre-Flight</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openEnRouteModal(currentProfile);
                    }}
                    className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span>🚗</span>
                    <span>Voy en Camino</span>
                  </button>
                </div>
              )}
            </div>

            {/* SECCIÓN DE DOSSIER PRIVADO (NOTAS, ALIAS, RANKING & RED FLAGS) */}
            {!profile.isCurrentUser && (
              <ProfileDossierSection
                profileId={profile.id}
                profileCodename={profile.codename}
              />
            )}

            {/* TARJETA DE ENERGÍA DESEADA (VIBES) */}
            {profile.energyVibes && profile.energyVibes.length > 0 && (
              <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <span className="text-electricViolet-glow text-xs">⚡</span>
                  <span>{language === "es" ? "Energía Deseada // Vibes" : "Desired Energy // Vibes"}</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.energyVibes.map((vibeId) => {
                    const vibeItem = ENERGY_VIBE_CATALOG.find((v) => v.id === vibeId);
                    if (!vibeItem) return null;
                    return (
                      <div
                        key={vibeId}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${vibeItem.tagColor}`}
                      >
                        <span>{vibeItem.emoji}</span>
                        <span>{vibeItem.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Estadísticas y Ficha Física */}
            <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-3 shadow-card-elevation">
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-white/5 pb-2 font-mono">
                {language === "es" ? "Identidad y Estadísticas" : "Identity & Stats"}
              </h2>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Yo Soy */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">
                    {language === "es" ? "Yo Soy" : "I Am"}
                  </span>
                  <span className="text-electricViolet-glow font-bold text-sm mt-0.5 block font-mono">
                    {profile.yoSoy}
                  </span>
                </div>

                {/* Rol / Posición */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">
                    {language === "es" ? "Rol / Posición" : "Role / Position"}
                  </span>
                  <span className="text-white font-bold text-sm mt-0.5 block">
                    {getRoleDisplayLabel(profile.role, language)}
                  </span>
                </div>

                {/* Movilidad */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">
                    Movilidad
                  </span>
                  <span className="text-white font-bold text-sm mt-0.5 block flex items-center gap-1.5">
                    {profile.mobility === "Tengo depto / lugar" ||
                    profile.mobility === "Tengo sitio" ||
                    profile.mobility === "Tengo lugar y me muevo" ||
                    profile.mobility === "Tengo sitio/me desplazo" ? (
                      <Home className="w-3.5 h-3.5 text-electricViolet-glow" />
                    ) : (
                      <Car className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                    <span>{profile.mobility}</span>
                  </span>
                </div>

                {/* Estatura / Peso */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">
                    Estatura / Peso
                  </span>
                  <span className="text-white font-bold text-sm mt-0.5 block font-mono">
                    {profile.heightCm} cm • {profile.weightKg} kg
                  </span>
                </div>

                {/* Intensidad */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 col-span-2">
                  <span className="text-neutral-400 block text-[10px] uppercase font-medium">
                    Nivel de Intensidad
                  </span>
                  <span className="text-bloodNeon font-bold text-sm mt-0.5 block font-mono">
                    Nivel {profile.intensity} ({INTENSITY_LABELS[profile.intensity].label})
                  </span>
                </div>
              </div>

              {/* Estado VIH */}
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex items-center justify-between mt-2">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-electricViolet-glow flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase font-medium">
                      Estado VIH
                    </span>
                    <div className="text-xs font-bold text-white">
                      {profile.hivStatus}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold font-mono bg-white/10 text-neutral-300 px-2.5 py-1 rounded-full uppercase">
                  {profile.healthStatus.testedDate}
                </span>
              </div>

              {/* Certificado de Identidad Digital Verificada */}
              {profile.verification?.isVerified && (
                <div className="bg-purple-950/20 border border-electricViolet/30 p-3.5 rounded-xl flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-electricViolet text-white shadow-violet-soft">
                      <ShieldCheck className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{profile.verification.badgeLabel}</span>
                        {profile.verification.hasFacialPrivacy && (
                          <span title="Protección Facial Activa">
                            <EyeOff className="w-3.5 h-3.5 text-neutral-300" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-electricViolet-glow font-mono mt-0.5">
                        100% Humano Real • Zero-Fake Certificado ({profile.verification.certificateHash})
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-purple-950/40 text-electricViolet-glow border border-electricViolet/40 px-2 py-0.5 rounded-full uppercase font-mono">
                    {profile.verification.trustScore}% Score
                  </span>
                </div>
              )}

              {/* Sello de Cultura del Respeto & Anti-Ghosteo */}
              {profile.isAntiGhost && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-mintNeon text-obsidian-deep font-black shadow-mint-glow">
                      <ShieldCheck className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>PROTOCOLO ANTI-GHOSTEO</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">✓ ACTIVO</span>
                      </div>
                      <div className="text-[10px] text-neutral-300 font-sans mt-0.5">
                        Respuestas rápidas (~{profile.responseRateMinutes || 3} min) y salidas amables garantizadas.
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase font-mono">
                    {profile.respectScore || 98}% Respeto
                  </span>
                </div>
              )}
            </div>

            {/* DESEOS & FANTASÍAS */}
            {profile.desires && profile.desires.length > 0 && (
              <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <span className="text-electricViolet-glow text-xs">✨</span>
                  <span>Deseos & Búsqueda</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.desires.map((desire) => (
                    <span
                      key={desire}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200 text-xs font-medium"
                    >
                      {desire}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* INTENCIONES CLARAS */}
            {profile.intentions && profile.intentions.length > 0 && (
              <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <span className="text-electricViolet-glow text-xs">🎯</span>
                  <span>Intenciones</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.intentions.map((intention) => (
                    <span
                      key={intention}
                      className="px-3 py-1.5 rounded-xl bg-electricViolet/10 border border-electricViolet/30 text-electricViolet-glow text-xs font-semibold"
                    >
                      {intention}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* LÍMITES & CONSENTIMIENTO */}
            {profile.boundaries && profile.boundaries.length > 0 && (
              <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-bloodNeon stroke-[2.5]" />
                  <span>Límites & Respeto</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.boundaries.map((boundary) => (
                    <span
                      key={boundary}
                      className="px-3 py-1.5 rounded-xl bg-bloodNeon/10 border border-bloodNeon/30 text-bloodNeon text-xs font-semibold flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{boundary}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}



            {/* Declaración / Bio */}
            {profile.statement && (
              <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2 shadow-card-elevation">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    {t.card.aboutMe}
                  </h2>
                  {isLockedByDistance && (
                    <span className="text-[8.5px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                      🔒 CLASIFICADO (+1.0 KM)
                    </span>
                  )}
                </div>
                {isLockedByDistance ? (
                  <div className="space-y-1.5 py-1">
                    <p className="text-xs text-neutral-500 leading-relaxed font-mono select-none tracking-widest blur-[1px]">
                      ████████████████████ █████████████ ███████████████████████████
                    </p>
                    <p className="text-[11px] text-amber-300/80 font-mono">
                      {language === "es"
                        ? "Biografía y detalles clasificados para perfiles a más de 1.0 km. Desbloqueá con VESSEL UNLIMITED."
                        : "Bio and details classified for profiles beyond 1.0 km. Unlock with VESSEL UNLIMITED."}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                    {profile.statement}
                  </p>
                )}
              </div>
            )}

            {/* Catálogo Kink & Tribus */}
            {profile.kinks && profile.kinks.length > 0 && (
              <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  {t.card.kinksDynamics}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.kinks.map((kink) => (
                    <span
                      key={kink}
                      className="px-3 py-1.5 rounded-full bg-bloodNeon/10 border border-bloodNeon/30 text-bloodNeon text-xs font-semibold capitalize"
                    >
                      {kink.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN DE TESTIMONIOS DE ENCUENTRO */}
            <TestimonialsSection profile={profile} />

            {/* Bóveda Privada */}
            <PrivateVault
              items={profile.privateVault}
              profileCodename={profile.codename}
              isOwner={!!profile.isCurrentUser}
            />
          </div>
        </div>

        {/* =========================================================
            BOTTOM ACTION DOCK (Fijo en el pie del modal, sin pisar contenido)
            ========================================================= */}
        <footer className="flex-shrink-0 bg-obsidian-surface/95 backdrop-blur-xl border-t border-white/10 p-3 md:px-6 md:py-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:pb-3.5 flex items-center gap-2 md:gap-3 z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.9)]">
          {profile.isCurrentUser ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveView("account");
              }}
              className="flex-1 min-h-[48px] py-3 px-4 bg-electricViolet text-white text-xs font-extrabold rounded-2xl hover:bg-electricViolet-glow shadow-violet-soft flex items-center justify-center gap-2 transition-all uppercase tracking-wider font-mono cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
            >
              <User className="w-4 h-4" />
              <span>Editar Mi Perfil & Modo Niebla</span>
            </button>
          ) : (
            <>
              {/* Botón 1: Pulso Cinético de Rol (1-Tap Kinetic Reaction con Audio Sub-Bass) */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  transmitSignal(currentProfile.id);
                }}
                aria-label={`Enviar pulso a ${currentProfile.codename}`}
                title={signalCount > 0 ? roleAction.sentLabel : roleAction.tooltipTemplate}
                className={`p-3 min-h-[48px] min-w-[48px] rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-75 shadow-md flex-shrink-0 ${
                  signalCount > 0
                    ? `bg-electricViolet text-white border-electricViolet ${roleAction.glowClass} scale-105`
                    : "bg-white/5 border-white/10 hover:border-electricViolet/50 hover:bg-white/10 text-white"
                }`}
              >
                <span className="text-lg leading-none select-none">
                  {roleAction.icon}
                </span>
                {signalCount > 0 && (
                  <span className="text-[10px] font-mono font-black ml-0.5">
                    +{signalCount}
                  </span>
                )}
              </button>

              {/* Botón 2: Enviar Ubicación y Rendezvous PIN */}
              <button
                type="button"
                onClick={() => {
                  if (!canChatDirectly) {
                    audioEngine.playPulse();
                    openUnlimitedModal();
                    return;
                  }
                  sendRendezvousPin(currentProfile.id);
                  onClose();
                  onOpenChat(currentProfile.id);
                }}
                aria-label={canChatDirectly ? "Enviar Ubicación y Abrir Chat" : (t.card.distantChatLocked || "Requiere VESSEL UNLIMITED o Pulso")}
                className={`p-3 min-h-[48px] min-w-[48px] border rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-sm flex-shrink-0 ${
                  canChatDirectly
                    ? "bg-white/5 border-white/10 hover:border-electricViolet/50 hover:bg-white/10 text-white"
                    : "bg-white/5 border-purple-500/30 text-electricViolet-glow hover:border-purple-400"
                }`}
                title={canChatDirectly ? "Enviar Ubicación y Abrir Chat" : (t.card.distantChatLocked || "Requiere VESSEL UNLIMITED o Pulso")}
              >
                {canChatDirectly ? (
                  <Navigation className="w-4 h-4 text-electricViolet" />
                ) : (
                  <Lock className="w-4 h-4 text-electricViolet" />
                )}
                <span className="hidden md:inline font-mono text-[11px]">{t.card.rendezvousBtn}</span>
              </button>

              {/* Botón 3: Diario de Encuentros */}
              <button
                type="button"
                onClick={() => openCreateDiaryModal(currentProfile.id)}
                aria-label="Documentar o agendar encuentro en el Diario"
                className="p-3 min-h-[48px] min-w-[48px] bg-white/5 border border-white/10 hover:border-electricViolet/50 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-sm flex-shrink-0"
                title="Documentar o agendar encuentro con este perfil en el Diario"
              >
                <BookOpen className="w-4 h-4 text-electricViolet" />
                <span className="hidden md:inline font-mono text-[11px]">{t.card.diaryBtn}</span>
              </button>

              {/* Botón 4: Principal Abrir Chat Darkroom o Desbloqueo Unlimited */}
              {canChatDirectly ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat(currentProfile.id);
                  }}
                  aria-label="Abrir chat efímero"
                  className={`flex-1 min-h-[48px] py-3 px-4 text-xs font-extrabold rounded-2xl shadow-violet-soft flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98 ${
                    isMutualPulseActive
                      ? "bg-mintNeon hover:bg-emerald-400 text-obsidian-deep font-black shadow-mint-glow focus-visible:ring-emerald-400"
                      : "bg-electricViolet text-white hover:bg-electricViolet-glow focus-visible:ring-electricViolet"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>{isMutualPulseActive ? (t.card.mutualPulseChat || "Chat Sintonía Mutua") : t.card.openChat}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    openUnlimitedModal();
                  }}
                  aria-label="Desbloquear chat inmediato con VESSEL UNLIMITED"
                  className="flex-1 min-h-[48px] py-3 px-3.5 bg-gradient-to-r from-electricViolet to-purple-600 text-white text-xs font-extrabold rounded-2xl hover:brightness-110 shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
                >
                  <Lock className="w-4 h-4 text-white stroke-[2.5]" />
                  <span>{t.card.openUnlimitedChatBtn || "Desbloquear Chat (VESSEL UNLIMITED)"}</span>
                </button>
              )}
            </>
          )}
        </footer>

        {/* Modal de Gestión de Límites si está activo */}
        {isBoundaryModalOpen && (
          <BoundaryManagerModal
            profileId={currentProfile.id}
            onClose={() => setIsBoundaryModalOpen(false)}
          />
        )}

        {/* Modal de Edición de Perfil de Prueba */}
        {isEditModalOpen && (
          <EditMockProfileModal
            profile={currentProfile}
            onClose={() => setIsEditModalOpen(false)}
            onSaved={(updated) => setCurrentProfile(updated)}
          />
        )}
      </div>
    </div>
  );
};

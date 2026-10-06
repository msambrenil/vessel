"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { VesselProfile } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";

const RendezvousSheet = dynamic(
  () => import("@/components/chat/RendezvousSheet").then((m) => m.RendezvousSheet),
  { ssr: false }
);
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
  ChevronLeft,
  ChevronRight,
  Car,
  Home,
  EyeOff,
  CheckCircle2,
  User,
  BookOpen,
  Edit3,
  Flame,
  Zap,
  Camera,
  Star,
} from "lucide-react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { ENERGY_VIBE_CATALOG } from "@/data/energyCatalog";
import { BoundaryManagerModal } from "@/components/chat/BoundaryManagerModal";
import { EditMockProfileModal } from "./EditMockProfileModal";
import { getRoleDisplayLabel, getRoleActionMeta } from "@/data/roleActionCatalog";
import { ProfileDossierSection } from "./ProfileDossierSection";
import { ProfileGlanceHero } from "./ProfileGlanceHero";
import { HostCardBadge } from "@/components/logistics/HostCardBadge";
import { VoiceVibePlayer } from "@/components/profile/VoiceVibePlayer";
import { ExitProtocolBadge } from "@/components/profile/ExitProtocolBadge";
import { SubstanceAtmosphereBadge } from "@/components/profile/SubstanceAtmosphereBadge";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";

import {
  getAllKinks,
  getKinkLocalizedLabel,
  getYoSoyLocalizedLabel,
} from "@/lib/kinks/kinkAdminService";

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
    openLivenessModal,
    openVoiceRecorder,
    getMutualKinkMatches,
    t,
    language,
    isUnlimited,
    openUnlimitedModal,
    hasMutualPulse,
    isFavoriteProfile: isFavProp,
    toggleFavoriteProfile: toggleFavProp,
  } = useVessel();

  const isFavoriteProfile = isFavProp || (() => false);
  const toggleFavoriteProfile = toggleFavProp || (() => {});

  const [currentProfile, setCurrentProfile] = useState<VesselProfile>(profile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isBoundaryModalOpen, setIsBoundaryModalOpen] = useState(false);
  const [isRendezvousOpen, setIsRendezvousOpen] = useState(false);
  type DetailTab = "profile" | "chemistry" | "trust";
  const [activeTab, setActiveTab] = useState<DetailTab>("profile");

  const isDistant = !currentProfile.isCurrentUser && currentProfile.distanceMeters > FREE_TIER_LIMITS.maxFreeRadarDistanceMeters;
  const isLockedByDistance = isDistant && !isUnlimited;
  const isMutualPulseActive = !currentProfile.isCurrentUser && hasMutualPulse(currentProfile.id);
  const canChatDirectly = !isLockedByDistance || isMutualPulseActive;

  const mutualKinks = !profile.isCurrentUser ? getMutualKinkMatches(profile.kinkMatrix) : [];

  React.useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  const signalCount = transmissions[currentProfile.id] || 0;
  const rawGallery = Array.isArray(currentProfile.galleryUrls)
    ? currentProfile.galleryUrls.filter(Boolean)
    : [];
  const photos =
    rawGallery.length > 0
      ? rawGallery
      : [currentProfile.avatarUrl || "/placeholder-avatar.png"];
  const boundary = getBoundaryForProfile(currentProfile.id);
  const dossier = getProfileDossier(currentProfile.id);
  const roleAction = getRoleActionMeta(currentProfile.role, language, currentProfile.codename);

  const isImmediateHost =
    Boolean(
      currentProfile.mobility?.toLowerCase().includes("casa") ||
      currentProfile.mobility === "Tengo depto / lugar" ||
      currentProfile.mobility === "Tengo sitio" ||
      currentProfile.mobility === "Tengo lugar y me muevo" ||
      currentProfile.mobility === "Tengo sitio/me desplazo" ||
      currentProfile.mobility?.toLowerCase().includes("lugar") ||
      currentProfile.mobility?.toLowerCase().includes("depto")
    );

  const nextPhoto = () => {
    setSelectedPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setSelectedPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div
      role="region"
      aria-label={`Detalle del perfil de ${profile.codename}`}
      className="fixed inset-0 z-40 bg-obsidian-deep flex flex-col w-full h-[100dvh] overflow-hidden select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-5xl mx-auto h-full bg-obsidian-deep md:border-x md:border-white/10 flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* =========================================================
            HEADER APP-BAR (Fijo y con fondo sólido difuminado)
            ========================================================= */}
        <header className="flex-shrink-0 z-30 bg-obsidian-deep/95 backdrop-blur-xl border-b border-white/10 px-3.5 md:px-6 py-2.5 md:py-3 flex items-center justify-between shadow-md">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalles del perfil"
            className="p-2 min-w-[44px] min-h-[44px] flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline">
              {language === "es" ? "Radar" : "Back"}
            </span>
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
                    ? `${profile.distanceMeters} ${language === "es" ? "m de vos" : "m from you"}`
                    : `${(profile.distanceMeters / 1000).toFixed(1)} km`)}
              </div>
            </div>
          </div>

          {/* Acciones de la Derecha del Header */}
          <div className="flex items-center gap-1.5">
            {/* Botón Favorito (★) */}
            {!currentProfile.isCurrentUser && (
              <button
                type="button"
                data-testid={`detail-modal-favorite-toggle-${currentProfile.id}`}
                onClick={() => toggleFavoriteProfile(currentProfile.id)}
                aria-label={isFavoriteProfile(currentProfile.id) ? (t.card?.favoriteActive || "Favorito Guardado") : (t.card?.favoriteBtn || "Marcar Favorito")}
                aria-pressed={isFavoriteProfile(currentProfile.id)}
                className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 ${
                  isFavoriteProfile(currentProfile.id)
                    ? "bg-amber-950/80 border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-amber-300 hover:bg-white/15"
                }`}
                title={isFavoriteProfile(currentProfile.id) ? (t.card?.favoriteActive || "Favorito Guardado") : (t.card?.favoriteBtn || "Marcar Favorito")}
              >
                <Star
                  className={`w-4 h-4 stroke-[2.5] transition-transform ${
                    isFavoriteProfile(currentProfile.id) ? "fill-amber-400 text-amber-400 scale-110" : ""
                  }`}
                />
              </button>
            )}

            {/* Botón Agenda / Libreta Íntima */}
            {!currentProfile.isCurrentUser && (
              <button
                type="button"
                onClick={() => openCreateDiaryModal(currentProfile.id)}
                aria-label="Documentar o agendar encuentro en la Agenda"
                title="Documentar o agendar encuentro en la Agenda"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-electricViolet stroke-[2.2]" />
              </button>
            )}

            {/* Botón de Edición del Perfil de Prueba (Solo Dev) */}
            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                aria-label="Editar este perfil de prueba"
                title="Editar datos de este perfil (Dev / Preset)"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-electricViolet/15 hover:bg-electricViolet text-electricViolet-glow hover:text-white transition-all border border-electricViolet/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-violet-soft"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBoundaryModalOpen(true)}
              aria-label="Gestionar límites y acuerdos de este perfil"
              className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-95 ${
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
              className="hidden md:flex p-2 min-w-[40px] min-h-[40px] items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all border border-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* =========================================================
            CUERPO RESPONSIVO (Móvil: scroll vertical | Desktop: 2 columnas)
            ========================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain relative scroll-smooth no-scrollbar flex flex-col md:flex-row md:overflow-hidden">
          
          {/* =========================================================
              COLUMNA IZQUIERDA: HERO VISUAL MODULARIZADO (<3s)
              ========================================================= */}
          <ProfileGlanceHero
            profile={profile}
            photos={photos}
            selectedPhotoIdx={selectedPhotoIdx}
            setSelectedPhotoIdx={setSelectedPhotoIdx}
            prevPhoto={prevPhoto}
            nextPhoto={nextPhoto}
            dossier={dossier}
            language={language}
            t={t}
          />

          {/* =========================================================
              COLUMNA DERECHA: SELECTOR DE 3 PESTAÑAS + CONTENIDO DINÁMICO
              ========================================================= */}
          <div className="w-full md:w-[54%] lg:w-[58%] md:h-full md:overflow-y-auto p-4 md:p-6 space-y-4 pb-52 md:pb-8 no-scrollbar">
            
            {/* Banner Táctico de Distancia / Sintonía Mutua */}
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
                        ? (t.card.mutualPulseBanner || (language === "es" ? "🔥 SINTONÍA MUTUA - ¡Toques recíprocos! Chat libre desbloqueado." : "🔥 MUTUAL VIBE - Reciprocal taps! Free chat unlocked."))
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
                        ? "Ambos se tiraron un toque. La barrera de distancia queda desactivada para chatear gratis."
                        : "Both sent a pulse. The distance barrier is bypassed for free chatting.")
                    : (t.card.distantSignalDesc || "Mandá un toque para activar onda mutua o chateá ya con VESSEL UNLIMITED.")}
                </p>
                {!isMutualPulseActive && (
                  <button
                    type="button"
                    onClick={() => openUnlimitedModal()}
                    className="self-start mt-0.5 px-3 py-1.5 bg-electricViolet text-white hover:bg-electricViolet-glow text-[10.5px] font-mono font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-violet-soft active:scale-95"
                  >
                    {t.card.openUnlimitedChatBtn || (language === "es" ? "Desbloquear Conversación Inmediata ⚡" : "Unlock Instant Chat ⚡")}
                  </button>
                )}
              </div>
            )}

            {/* =========================================================
                SELECTOR DE 3 PESTAÑAS TÁCTICAS (≥44px TOUCH-FIRST)
                ========================================================= */}
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-obsidian-surface rounded-2xl border border-white/10 shadow-inner sticky top-0 z-20 backdrop-blur-md">
              <button
                type="button"
                role="tab"
                data-testid="tab-profile-trigger"
                aria-selected={activeTab === "profile"}
                onClick={() => {
                  audioEngine.playSubBass(70);
                  setActiveTab("profile");
                }}
                className={`flex-1 min-w-0 min-h-[44px] py-2 px-1.5 sm:px-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                  activeTab === "profile"
                    ? "bg-electricViolet text-white shadow-violet-soft"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{t.card?.tabProfile || "Perfil"}</span>
              </button>

              <button
                type="button"
                role="tab"
                data-testid="tab-chemistry-trigger"
                aria-selected={activeTab === "chemistry"}
                onClick={() => {
                  audioEngine.playSubBass(70);
                  setActiveTab("chemistry");
                }}
                className={`flex-1 min-w-0 min-h-[44px] py-2 px-1.5 sm:px-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet relative active:scale-95 ${
                  activeTab === "chemistry"
                    ? "bg-electricViolet text-white shadow-violet-soft"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Flame className={`w-4 h-4 flex-shrink-0 ${mutualKinks.length > 0 ? "text-bloodNeon fill-current animate-pulse" : ""}`} />
                <span className="truncate sm:hidden">{language === "es" ? "Química" : "Chemistry"}</span>
                <span className="truncate hidden sm:inline">{t.card?.tabChemistry || (language === "es" ? "Química & Morbo" : "Chemistry & Kinks")}</span>
                {mutualKinks.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-bloodNeon shadow-blood-glow flex-shrink-0 animate-ping" />
                )}
              </button>

              <button
                type="button"
                role="tab"
                data-testid="tab-trust-trigger"
                aria-selected={activeTab === "trust"}
                onClick={() => {
                  audioEngine.playSubBass(70);
                  setActiveTab("trust");
                }}
                className={`flex-1 min-w-0 min-h-[44px] py-2 px-1.5 sm:px-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                  activeTab === "trust"
                    ? "bg-electricViolet text-white shadow-violet-soft"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-mintNeon" />
                <span className="truncate sm:hidden">{language === "es" ? "Confianza" : "Trust"}</span>
                <span className="truncate hidden sm:inline">{t.card?.tabTrust || (language === "es" ? "Confianza & Salud" : "Trust")}</span>
              </button>
            </div>

            {/* =========================================================
                CONTENIDO DINÁMICO DE PESTAÑAS (SEGMENTED DECK)
                ========================================================= */}
            <div className="space-y-4 pt-1">
              {/* -----------------------------------------------------
                  PESTAÑA 1: PERFIL (LO ESENCIAL)
                  ----------------------------------------------------- */}
              {activeTab === "profile" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* HUD Táctico: Rol, Hospedaje/Movilidad, Identidad & Físico */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Rol / Posición */}
                    <div className="bg-obsidian-surface rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 shadow-card-elevation">
                      <span className="text-xl leading-none select-none flex-shrink-0">
                        {roleAction.icon}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono text-neutral-400 block font-bold tracking-wider">
                          {language === "es" ? "Rol Corporal" : "Role / Position"}
                        </span>
                        <span className="text-xs font-mono font-black text-electricViolet-glow uppercase truncate block mt-0.5">
                          {getRoleDisplayLabel(profile.role, language)}
                        </span>
                      </div>
                    </div>

                    {/* Modalidad / Hospedaje */}
                    <div className="bg-obsidian-surface rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 shadow-card-elevation">
                      <span className="text-xl leading-none select-none flex-shrink-0">
                        {isImmediateHost ? "🏠" : "🚗"}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono text-neutral-400 block font-bold tracking-wider">
                          {language === "es" ? "Lugar" : "Hosting"}
                        </span>
                        <span className="text-xs font-mono font-black text-white uppercase truncate block mt-0.5">
                          {isImmediateHost
                            ? (language === "es" ? "Tiene lugar" : "Has place")
                            : (language === "es" ? "Se mueve" : "Travels")}
                        </span>
                      </div>
                    </div>

                    {/* Yo Soy */}
                    <div className="bg-obsidian-surface rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 shadow-card-elevation">
                      <span className="text-xl leading-none select-none flex-shrink-0">
                        👤
                      </span>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono text-neutral-400 block font-bold tracking-wider">
                          {language === "es" ? "Yo Soy" : "I Am"}
                        </span>
                        <span className="text-xs font-mono font-black text-white uppercase truncate block mt-0.5">
                          {getYoSoyLocalizedLabel(profile.yoSoy, t)}
                        </span>
                      </div>
                    </div>

                    {/* Estatura / Peso */}
                    <div className="bg-obsidian-surface rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 shadow-card-elevation">
                      <span className="text-xl leading-none select-none flex-shrink-0">
                        📏
                      </span>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono text-neutral-400 block font-bold tracking-wider">
                          {language === "es" ? "Físico" : "Body"}
                        </span>
                        <span className="text-xs font-mono font-black text-white truncate block mt-0.5">
                          {profile.heightCm} cm • {profile.weightKg} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Declaración / Bio */}
                  {profile.statement && (
                    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2 shadow-card-elevation">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                          {t.card?.aboutMe || (language === "es" ? "Bio / Qué onda" : "Bio")}
                        </h3>
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

                  {/* Nota de Voz del Perfil */}
                  {(currentProfile.voiceVibe || currentProfile.isCurrentUser) && (
                    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-3 shadow-card-elevation">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-electricViolet-glow flex items-center gap-1.5">
                          <span>🎙️</span>
                          <span>{language === "es" ? "Nota de Voz del Perfil" : "Voice Note"}</span>
                        </span>
                      </div>

                      {currentProfile.voiceVibe ? (
                        <VoiceVibePlayer voice={currentProfile.voiceVibe} />
                      ) : currentProfile.isCurrentUser ? (
                        <button
                          type="button"
                          onClick={() => openVoiceRecorder()}
                          className="w-full p-2.5 rounded-xl border border-dashed border-electricViolet/40 bg-electricViolet/10 hover:bg-electricViolet/20 text-electricViolet-glow text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <span>🎙️</span>
                          <span>{language === "es" ? "Grabar nota de voz de saludo para tu perfil" : "Record a voice greeting for your profile"}</span>
                        </button>
                      ) : null}
                    </div>
                  )}

                  {/* Banner On-The-Clock (Pinta YA) */}
                  {currentProfile.onTheClock?.isActive && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400 text-amber-300 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <Zap className="w-5 h-5 text-amber-400 fill-current flex-shrink-0" />
                        <div>
                          <div className="text-xs font-mono font-black uppercase">
                            {t.geo?.radarAvailableNow || "⚡ RADAR DISPONIBLE: PINTA YA"}
                          </div>
                          {currentProfile.onTheClock.statusNote && (
                            <div className="text-[11px] text-neutral-300 font-mono">
                              &ldquo;{currentProfile.onTheClock.statusNote}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 font-bold flex-shrink-0">
                        ACTIVO
                      </div>
                    </div>
                  )}

                  {/* Insignias Compactas de Autenticidad en Perfil */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {profile.verification?.isVerified ? (
                      <div className="bg-purple-950/20 border border-electricViolet/30 p-3 rounded-2xl flex items-center justify-between shadow-card-elevation">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-xl bg-electricViolet text-white shadow-violet-soft flex-shrink-0">
                            <ShieldCheck className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {profile.verification.badgeLabel}
                            </span>
                            <span className="text-[9.5px] text-electricViolet-glow font-mono truncate block">
                              {profile.verification.certificateHash}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold bg-purple-950/40 text-electricViolet-glow border border-electricViolet/40 px-2 py-0.5 rounded-full uppercase font-mono flex-shrink-0">
                          {profile.verification.trustScore}%
                        </span>
                      </div>
                    ) : profile.isCurrentUser ? (
                      <div className="bg-electricViolet/10 border border-electricViolet/30 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-card-elevation">
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          {language === "es" ? "Verificación 3D" : "3D Face Verification"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            openLivenessModal();
                          }}
                          className="px-2.5 py-1 bg-electricViolet text-white font-mono text-[10px] font-bold uppercase rounded-xl hover:bg-electricViolet-glow shadow-violet-soft cursor-pointer transition-all active:scale-95"
                        >
                          {language === "es" ? "Verificar" : "Verify"}
                        </button>
                      </div>
                    ) : null}

                    {profile.isAntiGhost && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between shadow-card-elevation">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-xl bg-mintNeon text-obsidian-deep font-black shadow-mint-glow flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {language === "es" ? "Cero Plantones" : "Anti-Ghost"}
                            </span>
                            <span className="text-[9.5px] text-emerald-400 font-mono truncate block">
                              ~{profile.responseRateMinutes || 3} min resp.
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase font-mono flex-shrink-0">
                          {profile.respectScore || 98}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* -----------------------------------------------------
                  PESTAÑA 2: QUÍMICA & MORBO
                  ----------------------------------------------------- */}
              {activeTab === "chemistry" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Morbos Mutuos Destacados con Fuego */}
                  {mutualKinks.length > 0 && (
                    <div className="bg-neutral-950/80 rounded-2xl p-3.5 border border-amber-500/40 space-y-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-bloodNeon fill-current animate-pulse" />
                          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                            {language === "es" ? `Morbos Mutuos (${mutualKinks.length})` : `Mutual Kinks (${mutualKinks.length})`}
                          </h4>
                        </div>
                        <span className="text-[9px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                          MORBO MUTUO 🔥
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
                        {language === "es"
                          ? "Ambos marcaron estos morbos en privado. Nadie más puede ver esta coincidencia."
                          : "Both marked these kinks privately. Invisible to other users."}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {mutualKinks.map((k) => {
                          const kinkDef = getAllKinks().find((x) => x.id === k.kinkId);
                          const localizedLabel = getKinkLocalizedLabel(k.kinkId, t, kinkDef?.name);
                          return (
                            <span
                              key={k.kinkId}
                              className="px-2.5 py-1 rounded-xl bg-bloodNeon/15 border border-bloodNeon/40 text-bloodNeon font-mono text-xs font-bold flex items-center gap-1.5 shadow-blood-glow"
                            >
                              <span>🔥</span>
                              <span>{localizedLabel}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* La onda que busca / Clima & Energía Deseada */}
                  {profile.energyVibes && profile.energyVibes.length > 0 && (
                    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <span className="text-electricViolet-glow text-xs">⚡</span>
                        <span>{t.card?.energyLabel || (language === "es" ? "La onda que busca" : "Desired Vibe & Energy")}</span>
                      </h3>
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

                  {/* Intenciones Claras */}
                  {profile.intentions && profile.intentions.length > 0 && (
                    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <span className="text-electricViolet-glow text-xs">🎯</span>
                        <span>{language === "es" ? "Intenciones" : "Intentions"}</span>
                      </h3>
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

                  {/* Después de vernos / Dinámica de Salida */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono text-neutral-400 block font-bold tracking-wider px-1">
                      {t.card?.exitProtocolHeader || (language === "es" ? "Después de vernos" : "After we meet")}
                    </span>
                    <ExitProtocolBadge
                      protocol={currentProfile.exitProtocol}
                      variant="tactical"
                      onClick={() => setIsBoundaryModalOpen(true)}
                    />
                  </div>

                  {/* Límites & Consentimiento */}
                  {profile.boundaries && profile.boundaries.length > 0 && (
                    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-bloodNeon stroke-[2.5]" />
                        <span>{language === "es" ? "Límites & Respeto" : "Boundaries & Respect"}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.boundaries.map((b) => (
                          <span
                            key={b}
                            className="px-3 py-1.5 rounded-xl bg-bloodNeon/10 border border-bloodNeon/30 text-bloodNeon text-xs font-semibold flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{b}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catálogo Kink & Morbos Públicos */}
                  {profile.kinks && profile.kinks.length > 0 && (
                    <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-2.5 shadow-card-elevation">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                        {t.card?.kinksDynamics || (language === "es" ? "Morbos y Fetiches" : "Kinks & Desires")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.kinks.map((kink) => (
                          <span
                            key={kink}
                            className="px-3 py-1.5 rounded-full bg-bloodNeon/10 border border-bloodNeon/30 text-bloodNeon text-xs font-semibold"
                          >
                            {getKinkLocalizedLabel(kink, t)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Atmósfera de Sustancias */}
                  {currentProfile.substanceAtmosphere && (
                    <SubstanceAtmosphereBadge vibe={currentProfile.substanceAtmosphere} />
                  )}
                </div>
              )}

              {/* -----------------------------------------------------
                  PESTAÑA 3: CONFIANZA & LUGAR
                  ----------------------------------------------------- */}
              {activeTab === "trust" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Ficha Completa de Hospedaje */}
                  <div className="bg-obsidian-surface rounded-2xl p-4 border border-white/10 space-y-3 shadow-card-elevation">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <span>🏠</span>
                        <span>{language === "es" ? "Disponibilidad de Casa" : "Place & Hosting"}</span>
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-electricViolet-glow px-2 py-0.5 rounded bg-electricViolet/10 border border-electricViolet/30">
                        {isImmediateHost
                          ? (language === "es" ? "TIENE CASA 🏠" : "HAS PLACE 🏠")
                          : (language === "es" ? "VIAJA 🚗" : "TRAVELS 🚗")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-neutral-400 block text-[10px] uppercase font-medium">
                          {language === "es" ? "Modalidad" : "Mobility"}
                        </span>
                        <span className="text-white font-bold text-sm mt-0.5 block flex items-center gap-1.5 truncate">
                          {isImmediateHost ? (
                            <Home className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                          ) : (
                            <Car className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          )}
                          <span className="truncate">{profile.mobility}</span>
                        </span>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-neutral-400 block text-[10px] uppercase font-medium">
                          {language === "es" ? "Distancia Táctica" : "Tactical Distance"}
                        </span>
                        <span className="text-electricViolet-glow font-bold text-sm mt-0.5 block font-mono">
                          {profile.discretizedDistance?.displayLabel ||
                            (profile.distanceMeters < 1000
                              ? `${profile.distanceMeters} m`
                              : `${(profile.distanceMeters / 1000).toFixed(1)} km`)}
                        </span>
                      </div>
                    </div>

                    <HostCardBadge
                      hostCard={currentProfile.hostCard}
                      onClick={() => openHostCardModal(currentProfile.isCurrentUser ? undefined : currentProfile)}
                    />
                  </div>

                  {/* Salud Preventiva y Estado VIH */}
                  <div className="bg-obsidian-surface border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-card-elevation">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-electricViolet-glow flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase font-medium">
                          {language === "es" ? "Salud Preventiva • VIH" : "Preventive Health • HIV"}
                        </span>
                        <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>{profile.hivStatus}</span>
                          {/indetectable|I=I/i.test(profile.hivStatus || "") && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 font-bold">
                              {language === "es" ? "I=I • Cero riesgo de transmisión" : "U=U • Zero transmission risk"}
                            </span>
                          )}
                          {/prep/i.test(profile.hivStatus || "") && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold">
                              {language === "es" ? "Protegido con PrEP" : "Protected with PrEP"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold font-mono bg-white/10 text-neutral-300 px-2.5 py-1 rounded-full uppercase flex-shrink-0">
                      {profile.healthStatus?.testedDate || (language === "es" ? "AL DÍA" : "UP TO DATE")}
                    </span>
                  </div>

                  {/* SECCIÓN DE DOSSIER PRIVADO (NOTAS, ALIAS, RANKING & RED FLAGS) */}
                  {!profile.isCurrentUser && (
                    <ProfileDossierSection
                      profileId={profile.id}
                      profileCodename={profile.codename}
                    />
                  )}

                  {/* Referencias de Encuentros Reales (antes Testimonios) */}
                  <TestimonialsSection profile={profile} />

                  {/* Álbum de Nudes / Fotos Privadas */}
                  <PrivateVault
                    items={profile.privateVault || []}
                    profileCodename={profile.codename}
                    isOwner={!!profile.isCurrentUser}
                  />
                </div>
              )}
            </div>
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
              {/* Botón 1: Toque Cinético de Rol (1-Tap Kinetic Reaction Instantáneo) */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  transmitSignal(currentProfile.id);
                }}
                aria-label={`Enviar toque a ${currentProfile.codename}`}
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

              {/* Botón 2: Acción Primaria Contextual (Chat Directo / Coordinar Cita / Desbloqueo Unlimited) */}
              {canChatDirectly ? (
                isMutualPulseActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChat(currentProfile.id);
                    }}
                    aria-label="Abrir chat efímero"
                    className="flex-1 min-h-[48px] py-3 px-4 text-xs font-black rounded-2xl bg-mintNeon hover:bg-emerald-400 text-obsidian-deep shadow-mint-glow flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>{t.card.mutualPulseChat || "Chatear · Onda Mutua 🔥"}</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        audioEngine.playSubBass(60);
                        setIsRendezvousOpen(true);
                      }}
                      aria-label={language === "es" ? "Coordinar Cita" : "Coordinate Date"}
                      className="flex-1 min-h-[48px] py-3 px-3.5 bg-electricViolet text-white hover:bg-electricViolet-glow shadow-violet-soft text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-98"
                    >
                      <Zap className="w-4 h-4 fill-current text-white flex-shrink-0" />
                      <span className="truncate">{language === "es" ? "Coordinar Cita ⚡" : "Coordinate Date ⚡"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenChat(currentProfile.id);
                      }}
                      aria-label="Abrir chat efímero"
                      title={t.card.openChat || "Abrir chat efímero"}
                      className="p-3 min-h-[48px] min-w-[48px] bg-white/5 border border-white/10 hover:border-electricViolet/50 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-sm flex-shrink-0"
                    >
                      <MessageSquare className="w-4 h-4 text-electricViolet" />
                    </button>
                  </div>
                )
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

        {/* Modal de Sintonía Pre-Flight (Action-First) */}
        {isRendezvousOpen && (
          <RendezvousSheet
            isOpen={isRendezvousOpen}
            onClose={() => setIsRendezvousOpen(false)}
            targetProfile={currentProfile}
          />
        )}
      </div>
    </div>
  );
};

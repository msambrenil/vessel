"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { VoiceVibePlayer } from "@/components/profile/VoiceVibePlayer";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { ALL_ROLE_TYPES } from "@/data/roleActionCatalog";
import { MOBILITY_OPTIONS } from "@/data/mockProfiles";
import { INTENTION_OPTIONS } from "@/data/energyCatalog";
import { RoleType, MobilityType } from "@/types/vessel";
import {
  User,
  Camera,
  EyeOff,
  FolderLock,
  Flame,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Mic,
  Trash2,
  X,
  Check,
  Sparkles,
  Zap,
  Home,
  Car,
  Compass,
} from "lucide-react";

interface EasyProfileCardViewProps {
  onOpenCoverSelector: () => void;
  onOpenAdvancedTab: (tab: "public" | "vaults" | "logistics" | "security") => void;
}

type QuickEditTarget = "role" | "mobility" | "intention" | null;

export const EasyProfileCardView: React.FC<EasyProfileCardViewProps> = ({
  onOpenCoverSelector,
  onOpenAdvancedTab,
}) => {
  const {
    myProfile,
    myBodyState,
    updateMyProfile,
    toggleFogMode,
    myVoiceVibe,
    openVoiceRecorder,
    deleteMyVoiceVibe,
    userAlbums,
    boundaries: connectionBoundaries,
    myFullProfile,
    setSelectedProfile,
    language,
    t,
  } = useVessel();

  const [activeQuickEdit, setActiveQuickEdit] = useState<QuickEditTarget>(null);

  // Rol actual display
  const currentRoleLabel = getRoleDisplayLabel(myProfile.role, language, t);

  // Lugar actual display
  const isHosting =
    myProfile.mobility?.toLowerCase().includes("casa") ||
    myProfile.mobility?.toLowerCase().includes("lugar") ||
    myProfile.mobility?.toLowerCase().includes("depto");

  const mobilityDisplay = myProfile.mobility || (language === "es" ? "A coordinar" : "TBD");

  // Qué pinta hoy display
  const primaryIntention =
    myProfile.intentions && myProfile.intentions.length > 0
      ? myProfile.intentions[0]
      : language === "es"
      ? "Lo que pinte"
      : "Open to whatever";

  // Handlers para actualizar los chips interactivos
  const handleSelectRole = (newRole: RoleType) => {
    audioEngine.playSignalSent();
    updateMyProfile({ role: newRole });
    setActiveQuickEdit(null);
  };

  const handleSelectMobility = (newMobility: MobilityType) => {
    audioEngine.playSignalSent();
    updateMyProfile({ mobility: newMobility });
    setActiveQuickEdit(null);
  };

  const handleSelectIntention = (intention: string) => {
    audioEngine.playSignalSent();
    const existing = myProfile.intentions || [];
    // Ponemos la intención elegida al frente
    const updated = [intention, ...existing.filter((i) => i !== intention)];
    updateMyProfile({ intentions: updated });
    setActiveQuickEdit(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* =========================================================================
          TARJETA VIVA WYSIWYG (CÓMO TE VEN DIRECTAMENTE)
          ========================================================================= */}
      <div className="bg-obsidian-surface rounded-3xl border border-white/15 overflow-hidden shadow-2xl relative">
        {/* Cabecera / Foto de Portada con Filtro Brutalista */}
        <div className="relative aspect-[4/4.8] sm:aspect-[16/11] w-full bg-neutral-900 overflow-hidden">
          {myProfile.avatarUrl ? (
            <img
              src={myProfile.avatarUrl}
              alt="Avatar de Usuario"
              className={`w-full h-full object-cover select-none transition-all duration-500 ${
                myProfile.isFogMode ? "blur-[7px] scale-105" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-500 gap-2">
              <User className="w-16 h-16 stroke-1 text-neutral-600" />
              <span className="text-xs font-mono text-neutral-400">
                {language === "es" ? "Sin Foto de Portada" : "No Cover Photo"}
              </span>
            </div>
          )}

          {/* Gradiente cinemático de contraste para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent pointer-events-none" />

          {/* Badge superior de Niebla si está activa */}
          {myProfile.isFogMode && (
            <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-electricViolet/50 text-[11px] font-mono font-bold text-electricViolet-glow flex items-center gap-1.5 shadow-lg">
              <span>🌫️</span>
              <span>{t.account?.fogOn || "Modo Niebla"}</span>
            </div>
          )}

          {/* Botón flotante para cambiar foto */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onOpenCoverSelector();
            }}
            className="absolute top-3 right-3 px-3 py-2 min-h-[44px] rounded-xl bg-black/75 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Camera className="w-4 h-4 text-electricViolet-glow" />
            <span>{t.account?.changeCoverBtn || (language === "es" ? "Cambiar Foto" : "Change Photo")}</span>
          </button>

          {/* Overlay Inferior en la Foto: Nombre, Edad, Transmisión y Audio */}
          <div className="absolute bottom-3 left-3 right-3 space-y-2 z-10">
            {/* Alias y Edad */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight drop-shadow-md">
                  @{myProfile.codename || "VESSEL_USER"}
                </h2>
                {myProfile.showAge && myProfile.age ? (
                  <span className="text-sm font-mono font-bold text-neutral-300 drop-shadow">
                    • {myProfile.age} {language === "es" ? "años" : "yo"}
                  </span>
                ) : null}
              </div>

              {/* Estado de Transmisión */}
              <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-mono font-bold text-white">
                <span
                  className={`w-2 h-2 rounded-full ${
                    myBodyState === "open"
                      ? "bg-electricViolet animate-pulse shadow-violet-soft"
                      : "bg-neutral-500"
                  }`}
                />
                <span>
                  {myBodyState === "open"
                    ? (language === "es" ? "Disponible Ya" : "Available Now")
                    : (language === "es" ? "En Sigilo" : "Stealth")}
                </span>
              </div>
            </div>

            {/* Badges de Verificación & Anti-Ghost */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {myProfile.verification?.isVerified && (
                <VerificationBadge verification={myProfile.verification} size="xs" showLabel />
              )}
              <AntiGhostBadge
                respectScore={myProfile.respectScore || 98}
                responseRateMinutes={3}
                size="xs"
                showLabel
              />
              {myProfile.totalEncountersVerified > 0 && (
                <span className="text-[10px] font-mono font-bold text-mintNeon bg-mintNeon/20 backdrop-blur-md border border-mintNeon/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>
                    {myProfile.totalEncountersVerified} {language === "es" ? "Verificados" : "Verified"}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            BARRA DE ACCIONES INMEDIATAS: SWITCH NIEBLA + AUDIO 5S
            ========================================================================= */}
        <div className="p-3 sm:p-4 bg-obsidian-deep/80 border-t border-white/10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Control Rápido: Modo Niebla */}
            <div className="bg-black/60 border border-white/10 rounded-2xl px-3 py-2 flex items-center justify-between gap-2.5 min-h-[52px]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">🌫️</span>
                <div className="min-w-0">
                  <span className="text-xs font-mono font-bold text-white block truncate">
                    {t.account?.fogModeTitle || "Modo Niebla"}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 block truncate">
                    {myProfile.isFogMode
                      ? language === "es"
                        ? "Rostro difuminado"
                        : "Face blurred"
                      : language === "es"
                        ? "Foto nítida"
                        : "Clear photo"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={myProfile.isFogMode}
                onClick={() => {
                  toggleFogMode();
                  audioEngine.playSubBass(60);
                }}
                className={`w-12 h-7 rounded-full transition-colors relative p-1 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                  myProfile.isFogMode ? "bg-electricViolet shadow-violet-soft" : "bg-neutral-800"
                }`}
                aria-label={t.account?.fogModeTitle || "Modo Niebla"}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    myProfile.isFogMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Control Rápido: Audio de Perfil (5s) */}
            <div className="bg-black/60 border border-white/10 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 min-h-[52px]">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow flex-shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                {myVoiceVibe ? (
                  <div className="flex-1 min-w-0">
                    <VoiceVibePlayer voice={myVoiceVibe} compact />
                  </div>
                ) : (
                  <div className="min-w-0">
                    <span className="text-xs font-mono font-bold text-white block truncate">
                      {language === "es" ? "Audio de Voz (5s)" : "Voice Note (5s)"}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 block truncate">
                      {language === "es" ? "Sin audio grabado" : "No audio recorded"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    openVoiceRecorder();
                  }}
                  className="px-3 py-2 min-h-[44px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-[11px] font-bold shadow-violet-soft transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>
                    {myVoiceVibe
                      ? language === "es"
                        ? "Regrabar"
                        : "Re-record"
                      : language === "es"
                      ? "Grabar"
                      : "Record"}
                  </span>
                </button>
                {myVoiceVibe && (
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playError();
                      deleteMyVoiceVibe();
                    }}
                    className="p-2 min-h-[44px] min-w-[44px] rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                    title={language === "es" ? "Eliminar nota de voz" : "Delete voice note"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              CHIPS INTERACTIVOS DE 1 TOQUE: ROL, LUGAR Y QUÉ PINTA HOY
              ========================================================================= */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
              {language === "es" ? "DATOS RÁPIDOS DE TU TARJETA (TOCÁ PARA EDITAR)" : "QUICK PROFILE CHIPS (TAP TO EDIT)"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Chip 1: Rol */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setActiveQuickEdit("role");
                }}
                className="p-3 min-h-[50px] rounded-2xl bg-black/60 border border-white/15 hover:border-electricViolet/60 text-left flex items-center justify-between gap-2 transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase text-neutral-400 block">
                    {t.account?.roleLabel || "Rol"}
                  </span>
                  <span className="text-xs font-mono font-bold text-white truncate block group-hover:text-electricViolet-glow">
                    {currentRoleLabel || (language === "es" ? "Definir Rol" : "Set Role")}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-white transition-colors">✏️</span>
              </button>

              {/* Chip 2: Lugar / Movilidad */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setActiveQuickEdit("mobility");
                }}
                className="p-3 min-h-[50px] rounded-2xl bg-black/60 border border-white/15 hover:border-amber-500/60 text-left flex items-center justify-between gap-2 transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase text-neutral-400 block">
                    {t.account?.mobilityLabel || "Lugar"}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 truncate block">
                    {isHosting ? "🏠 " : "🚗 "}
                    {mobilityDisplay}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-white transition-colors">✏️</span>
              </button>

              {/* Chip 3: Qué pinta hoy */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setActiveQuickEdit("intention");
                }}
                className="p-3 min-h-[50px] rounded-2xl bg-black/60 border border-white/15 hover:border-bloodNeon/60 text-left flex items-center justify-between gap-2 transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase text-neutral-400 block">
                    {t.account?.intentionsLabel || "Qué pinta hoy"}
                  </span>
                  <span className="text-xs font-mono font-bold text-bloodNeon truncate block">
                    ⚡ {primaryIntention}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-white transition-colors">✏️</span>
              </button>
            </div>
          </div>

          {/* Botones de Acción Inmediata: Previsualizar y Compartir QR */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setSelectedProfile(myFullProfile);
              }}
              className="py-2.5 px-3 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span>👁️</span>
              <span>{t.account?.previewMyProfileBtn || (language === "es" ? "Cómo me ven" : "Preview Card")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioEngine.playSubBass(65);
                window.dispatchEvent(new CustomEvent("vessel:open-qr-share"));
              }}
              className="py-2.5 px-3 min-h-[44px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-violet-soft"
            >
              <span>📱</span>
              <span>{t.qrShare?.triggerBtn || "Mi QR"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACCESOS TÁCTICOS AL PIE: 3 BANDEJAS CLAVE DE VESSEL
          ========================================================================= */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block px-1">
          {language === "es" ? "SECCIONES TÁCTICAS" : "TACTICAL SECTIONS"}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Tarjeta 1: Bóvedas & Fotos */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onOpenAdvancedTab("vaults");
            }}
            className="p-3.5 min-h-[64px] rounded-2xl bg-obsidian-surface/90 hover:bg-obsidian-surface border border-white/10 hover:border-electricViolet/50 transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] group shadow-sm text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow flex-shrink-0 group-hover:scale-105 transition-transform">
                <FolderLock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-mono font-bold text-white truncate">
                    {t.account?.easyModeVaultsBtn || "Fotos & Bóvedas"}
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-neutral-300">
                    {userAlbums.length}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  {t.account?.easyModeVaultsSub || "Álbumes públicos y con llave"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
          </button>

          {/* Tarjeta 2: Mi Lugar & Morbos */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onOpenAdvancedTab("logistics");
            }}
            className="p-3.5 min-h-[64px] rounded-2xl bg-obsidian-surface/90 hover:bg-obsidian-surface border border-white/10 hover:border-bloodNeon/50 transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] group shadow-sm text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-bloodNeon/15 border border-bloodNeon/30 flex items-center justify-center text-bloodNeon flex-shrink-0 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-mono font-bold text-white truncate">
                  {t.account?.easyModeLogisticsBtn || "Mi Lugar & Morbos"}
                </h3>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  {t.account?.easyModeLogisticsSub || "Depto y fetiches ciegos"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
          </button>

          {/* Tarjeta 3: Seguridad & Privacidad */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              onOpenAdvancedTab("security");
            }}
            className="p-3.5 min-h-[64px] rounded-2xl bg-obsidian-surface/90 hover:bg-obsidian-surface border border-white/10 hover:border-purple-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] group shadow-sm text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 flex-shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-mono font-bold text-white truncate">
                  {t.account?.easyModeSafetyBtn || "Seguridad & Privacidad"}
                </h3>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  {t.account?.easyModeSafetySub || "Guardián SOS, PIN señuelo y camuflaje"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE EDICIÓN RÁPIDA (ROL, LUGAR, QUÉ PINTA HOY)
          ========================================================================= */}
      {activeQuickEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 animate-fade-in">
          <div className="bg-obsidian-surface border border-white/20 rounded-3xl p-4 sm:p-5 w-full max-w-md space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-electricViolet-glow" />
                <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  {activeQuickEdit === "role" && (t.account?.quickRoleLabel || "Elegí tu Rol")}
                  {activeQuickEdit === "mobility" && (t.account?.quickMobilityLabel || "Lugar y Movilidad")}
                  {activeQuickEdit === "intention" && (t.account?.quickIntentionLabel || "¿Qué pinta hoy?")}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setActiveQuickEdit(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opciones para ROL */}
            {activeQuickEdit === "role" && (
              <div className="space-y-2">
                {ALL_ROLE_TYPES.map((r) => {
                  const label = getRoleDisplayLabel(r, language, t);
                  const isSelected = myProfile.role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer min-h-[48px] active:scale-[0.98] ${
                        isSelected
                          ? "bg-electricViolet/20 border-electricViolet text-white font-bold ring-1 ring-electricViolet shadow-violet-soft"
                          : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">{label}</span>
                      {isSelected && <Check className="w-4 h-4 text-electricViolet-glow" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Opciones para LUGAR / MOVILIDAD */}
            {activeQuickEdit === "mobility" && (
              <div className="space-y-2">
                {MOBILITY_OPTIONS.map((m) => {
                  const isSelected = myProfile.mobility === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMobility(m as MobilityType)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer min-h-[48px] active:scale-[0.98] ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold ring-1 ring-amber-500/50 shadow-sm"
                          : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">{m}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Opciones para QUÉ PINTA HOY */}
            {activeQuickEdit === "intention" && (
              <div className="space-y-2">
                {INTENTION_OPTIONS.map((item) => {
                  const isSelected = myProfile.intentions?.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSelectIntention(item)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer min-h-[48px] active:scale-[0.98] ${
                        isSelected
                          ? "bg-bloodNeon/20 border-bloodNeon text-white font-bold ring-1 ring-bloodNeon shadow-blood-glow"
                          : "bg-black/50 border-white/10 text-neutral-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">{item}</span>
                      {isSelected && <Check className="w-4 h-4 text-bloodNeon" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

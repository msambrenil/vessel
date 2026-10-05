"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { CoverPhotoSelectorModal } from "./CoverPhotoSelectorModal";
import {
  BioTab,
  AlbumsTab,
  KinksTab,
  ReputationTab,
  BoundariesTab,
  LogisticsTab,
} from "./tabs";
import { EasyProfileCardView } from "./EasyProfileCardView";
import { TacticalBadge, BrutalistButton, SectionHeroHeader } from "@/components/ui";
import {
  checkCodenameAvailability,
  claimCodename,
  releaseCodename,
} from "@/lib/firebase/identityDeduplicationService";
import {
  Check,
  User,
  Camera,
  X,
  EyeOff,
  CheckCircle2,
  SlidersHorizontal,
  FolderLock,
  Sliders,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Mic,
  Trash2,
  Sparkles,
} from "lucide-react";
import { VoiceVibePlayer } from "@/components/profile/VoiceVibePlayer";

type ProtocolMacroTab = "public" | "vaults" | "logistics" | "security";
type ProfileViewMode = "easy" | "advanced";

export const ProtocolView: React.FC = () => {
  const {
    myBodyState,
    myProfile,
    currentUserUid,
    updateMyProfile,
    toggleFogMode,
    myVoiceVibe,
    openVoiceRecorder,
    deleteMyVoiceVibe,
    userAlbums,
    myReceivedTestimonials,
    boundaries: connectionBoundaries,
    openAppSettingsModal,
    setSelectedProfile,
    myFullProfile,
    isCloudConnected,
    isSyncingCloud,
    language,
    t,
  } = useVessel();

  const [activeMacroTab, setActiveMacroTab] = useState<ProtocolMacroTab>("public");
  const [isCoverSelectorOpen, setIsCoverSelectorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ProfileViewMode>("easy");

  // Recuperar modo preferido de localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vessel_profile_view_mode");
      if (saved === "easy" || saved === "advanced") {
        setViewMode(saved as ProfileViewMode);
      }
    } catch {
      // Ignorar fallback
    }
  }, []);

  const handleSwitchViewMode = (mode: ProfileViewMode) => {
    setViewMode(mode);
    audioEngine.playPulse();
    try {
      localStorage.setItem("vessel_profile_view_mode", mode);
    } catch {
      // Ignorar fallback
    }
  };

  // Estados locales para edición inline de nombre en Hero Banner
  const [isEditingName, setIsEditingName] = useState(false);
  const [inlineName, setInlineName] = useState<string>(myProfile.codename || "VESSEL_USER");
  const [inlineNameError, setInlineNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Sincronizar codename si cambia externamente
  useEffect(() => {
    if (myProfile.codename) {
      setInlineName(myProfile.codename);
    }
  }, [myProfile.codename]);

  // Permitir que BioTab dispare la edición validada de alias en el Hero
  useEffect(() => {
    const onFocusCodename = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsEditingName(true);
      setInlineName(myProfile.codename || "VESSEL_USER");
      setTimeout(() => nameInputRef.current?.focus(), 120);
    };
    window.addEventListener("vessel:edit-codename", onFocusCodename);
    return () => window.removeEventListener("vessel:edit-codename", onFocusCodename);
  }, [myProfile.codename]);

  const handleSaveInlineName = async () => {
    setInlineNameError(null);
    const cleanName = inlineName.trim().toUpperCase();

    if (!cleanName) {
      setInlineNameError(language === "es" ? "El alias no puede estar vacío." : "Alias cannot be empty.");
      return;
    }

    if (cleanName === myProfile.codename) {
      setIsEditingName(false);
      return;
    }

    setIsCheckingName(true);
    const check = await checkCodenameAvailability(cleanName, currentUserUid);
    setIsCheckingName(false);

    if (!check.isAvailable) {
      setInlineNameError(
        check.message || (language === "es" ? "El alias ya se encuentra registrado." : "This alias is already taken.")
      );
      audioEngine.playSubBass(35, 0.4);
      return;
    }

    if (currentUserUid && currentUserUid !== "local-user") {
      if (myProfile.codename) {
        await releaseCodename(myProfile.codename, currentUserUid);
      }
      await claimCodename(cleanName, currentUserUid);
    }

    updateMyProfile({ codename: cleanName });
    setIsEditingName(false);
    audioEngine.playSignalSent();
  };

  const pendingTestimonialsCount = myReceivedTestimonials.filter((item) => item.status === "pending").length;
  const activeBoundariesCount = Object.keys(connectionBoundaries).length;

  return (
    <div className="flex flex-col flex-1 p-3 sm:p-4 pb-28 sm:pb-32 space-y-3.5 select-none bg-obsidian-deep">
      {/* CABECERA HERO SUPERIOR DE PROTOCOLO CON ESTADO DE PERSISTENCIA */}
      <SectionHeroHeader
        title={t.account?.myProfileTitle || (language === "es" ? "MI PERFIL" : "MY PROFILE")}
        tag={
          isSyncingCloud
            ? language === "es"
              ? "SINCRONIZANDO..."
              : "SYNCING..."
            : isCloudConnected
            ? language === "es"
              ? "☁️ NUBE ACTIVA"
              : "☁️ CLOUD SYNCED"
            : language === "es"
            ? "💾 GUARDADO LOCAL"
            : "💾 LOCAL SAVED"
        }
        subtitle={
          language === "es"
            ? "Identidad táctica, acuerdos de conexión, fotos y bóvedas cifradas."
            : "Tactical identity, connection boundaries, photos, and encrypted vaults."
        }
        variant="violet"
        icon={<User className="w-4 h-4 text-electricViolet-glow" />}
        actions={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                audioEngine.playSubBass(65);
                window.dispatchEvent(new CustomEvent("vessel:open-qr-share"));
              }}
              title={
                t.qrShare?.triggerTooltip ||
                "Mostrar código QR gigante para compartir tu perfil en segundos"
              }
              aria-label={t.qrShare?.triggerBtn || "Mi QR"}
              className="px-3 py-2 min-h-[44px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white border border-electricViolet/60 transition-all text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-violet-soft"
            >
              <span>📱</span>
              <span>{t.qrShare?.triggerBtn || "Mi QR"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setSelectedProfile(myFullProfile);
              }}
              title={
                language === "es"
                  ? "Previsualizar cómo ven tu tarjeta los demás usuarios"
                  : "Preview how other users see your public card"
              }
              className="px-3 py-2 min-h-[44px] rounded-xl bg-electricViolet/15 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/40 transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <span>👁️</span>
              <span>{t.account?.previewMyProfileBtn || (language === "es" ? "Cómo me ven" : "Preview Card")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openAppSettingsModal();
              }}
              aria-label={t.settings.title}
              className="px-3 py-2 min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-electricViolet hover:text-white border border-white/15 text-neutral-200 transition-all text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <Sliders className="w-4 h-4 text-electricViolet-glow" />
              <span className="hidden sm:inline">{t.settings.title}</span>
            </button>
          </div>
        }
      />

      {/* =========================================================================
          CONMUTADOR ERGONÓMICO DE VISTA: MODO FÁCIL (TARJETA VIVA) VS MODO AVANZADO
          ========================================================================= */}
      <div className="bg-obsidian-surface/90 p-1.5 rounded-2xl border border-white/15 backdrop-blur-xl shadow-card-elevation flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => handleSwitchViewMode("easy")}
          className={`flex-1 py-2 px-3 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
            viewMode === "easy"
              ? "bg-electricViolet text-white shadow-violet-soft font-black"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{t.account?.viewModeEasy || "✨ Mi Tarjeta"}</span>
        </button>
        <button
          type="button"
          onClick={() => handleSwitchViewMode("advanced")}
          className={`flex-1 py-2 px-3 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
            viewMode === "advanced"
              ? "bg-electricViolet text-white shadow-violet-soft font-black"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t.account?.viewModeAdvanced || "⚙️ Modo Avanzado"}</span>
        </button>
      </div>

      {/* =========================================================================
          RENDERIZADO CONDICIONAL SEGÚN EL MODO ACTIVO
          ========================================================================= */}
      {viewMode === "easy" ? (
        <EasyProfileCardView
          onOpenCoverSelector={() => setIsCoverSelectorOpen(true)}
          onOpenAdvancedTab={(tab) => {
            handleSwitchViewMode("advanced");
            setActiveMacroTab(tab);
          }}
        />
      ) : (
        <div className="space-y-3.5 animate-fade-in">
          {/* =========================================================================
              1. COMPACT TACTICAL HERO BANNER (<180px ALTO + 3 PÍLDORAS RÁPIDAS 44px)
              ========================================================================= */}
          <div className="bg-obsidian-surface/90 rounded-3xl p-3.5 sm:p-4 border border-white/10 space-y-3 shadow-card-elevation relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-electricViolet/10 rounded-full blur-3xl pointer-events-none" />

            {/* Fila superior: Foto + Identidad + Badges */}
            <div className="flex gap-3.5 items-start relative z-10">
              {/* Foto de Perfil con Marco Brutalista */}
              <div className="relative flex-shrink-0">
                <div
                  onClick={() => {
                    setIsCoverSelectorOpen(true);
                    audioEngine.playPulse();
                  }}
                  className="w-24 h-32 sm:w-32 sm:h-40 rounded-2xl bg-neutral-900 overflow-hidden border-2 border-electricViolet/60 hover:border-electricViolet shadow-2xl relative group cursor-pointer"
                  title={language === "es" ? "Hacé clic para cambiar tu Foto de Portada" : "Click to change your Cover Photo"}
                >
                  {myProfile.avatarUrl ? (
                    <img
                      src={myProfile.avatarUrl}
                      alt="Avatar de Usuario"
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        myProfile.isFogMode ? "filter blur-[4px] scale-105" : "group-hover:scale-105"
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                  {myProfile.isFogMode && (
                    <div className="absolute top-1.5 left-1.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-electricViolet/40 text-[9px] font-mono font-bold text-electricViolet-glow flex items-center gap-1 shadow-md">
                      <span>🌫️</span>
                      <span>{t.account?.fogOn || "Niebla Activa"}</span>
                    </div>
                  )}

                  {myProfile.isStylizedAvatar && !myProfile.isFogMode && (
                    <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] font-mono font-bold text-white flex items-center gap-1">
                      <EyeOff className="w-3 h-3 text-electricViolet-glow" />
                      <span>{language === "es" ? "Estilizado" : "Stylized"}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCoverSelectorOpen(true);
                      audioEngine.playPulse();
                    }}
                    className="absolute bottom-1.5 right-1.5 p-2 bg-electricViolet text-white rounded-xl shadow-violet-soft hover:bg-electricViolet-glow transition-all active:scale-95 flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] z-10"
                    title={language === "es" ? "Cambiar Foto de Portada Principal" : "Change Cover Photo"}
                    aria-label={language === "es" ? "Cambiar Foto de Portada Principal" : "Change Cover Photo"}
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Información de Identidad, Codename y Badges */}
              <div className="flex-1 min-w-0 space-y-1.5 pr-1">
                <div>
                  {isEditingName ? (
                    <div className="space-y-1.5 py-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={inlineName}
                          onChange={(e) => {
                            setInlineName(e.target.value);
                            if (inlineNameError) setInlineNameError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveInlineName();
                            if (e.key === "Escape") {
                              setInlineName(myProfile.codename || "VESSEL_USER");
                              setInlineNameError(null);
                              setIsEditingName(false);
                            }
                          }}
                          placeholder={t.account.codenamePlaceholder}
                          className={`px-2.5 py-1.5 min-h-[44px] rounded-xl bg-black border text-white font-mono font-bold text-base sm:text-lg focus:outline-none transition-all w-full max-w-[220px] ${
                            inlineNameError
                              ? "border-bloodNeon text-bloodNeon"
                              : "border-electricViolet shadow-violet-soft"
                          }`}
                          maxLength={18}
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={isCheckingName}
                          onClick={handleSaveInlineName}
                          className="px-3 py-2 min-h-[44px] bg-electricViolet text-white rounded-xl hover:bg-electricViolet-glow transition-all active:scale-95 cursor-pointer font-bold text-xs flex items-center gap-1 shadow-violet-soft disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{isCheckingName ? (language === "es" ? "Validando..." : "Checking...") : (language === "es" ? "Listo" : "Done")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInlineName(myProfile.codename || "VESSEL_USER");
                            setInlineNameError(null);
                            setIsEditingName(false);
                          }}
                          className="p-2 min-h-[44px] min-w-[44px] bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                          aria-label={language === "es" ? "Cancelar" : "Cancel"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {inlineNameError && (
                        <p className="text-[10px] text-bloodNeon font-mono font-bold">
                          ✕ {inlineNameError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg sm:text-2xl font-mono font-black text-white tracking-tight">
                        {myProfile.codename || "VESSEL_USER"}
                      </h1>
                      <span className="text-xs sm:text-sm font-mono font-bold text-neutral-400">
                        {myProfile.showAge ? `${myProfile.age} ${language === "es" ? "años" : "yo"}` : (language === "es" ? "Edad Oculta" : "Age Hidden")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingName(true);
                          setInlineName(myProfile.codename || "VESSEL_USER");
                          audioEngine.playPulse();
                        }}
                        className="px-2.5 py-1.5 min-h-[44px] rounded-xl bg-electricViolet/15 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/40 text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                        title={t.account.codenameLabel}
                        aria-label={t.account.codenameLabel}
                      >
                        <span>✏️</span>
                        <span>{language === "es" ? "Alias" : "Edit Alias"}</span>
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-electricViolet-glow font-mono font-bold mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-electricViolet animate-pulse shadow-violet-soft" />
                    <span>
                      {myBodyState === "open"
                        ? t.geo?.transmissionActive || (language === "es" ? "Transmisión Activa (Disponible Ya)" : "Active Transmission (Available Now)")
                        : t.geo?.stealthMode || (language === "es" ? "Modo Sigilo (Oculto)" : "Stealth Mode (Hidden)")}
                    </span>
                  </div>
                </div>

                {/* Badges de Verificación, Lugar y Respeto */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {myProfile.mobility?.toLowerCase().includes("casa") ||
                  myProfile.mobility?.toLowerCase().includes("lugar") ||
                  myProfile.mobility?.toLowerCase().includes("depto") ||
                  myProfile.mobility?.toLowerCase().includes("sitio") ? (
                    <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      🏠 {language === "es" ? "Pongo Casa" : "Can Host"}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-neutral-300 bg-white/5 border border-white/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                      🚗 {language === "es" ? "Me muevo" : "Mobile"}
                    </span>
                  )}
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
                    <span
                      className="text-[10px] font-mono font-bold text-mintNeon bg-mintNeon/15 border border-mintNeon/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                      title={`${myProfile.totalEncountersVerified} Encuentros físicos validados`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        {myProfile.totalEncountersVerified} {language === "es" ? "Verificados" : "Verified"}
                      </span>
                    </span>
                  )}
                </div>

                {/* Ficha sintética del usuario */}
                <div className="text-[11px] text-neutral-300 font-mono space-y-0.5 pt-1 border-t border-white/10">
                  <div className="truncate text-neutral-200 font-bold">
                    {myProfile.genderIdentity || "Hombre Cis"} • {myProfile.pronouns || (t.account?.pronounsFallback || (language === "es" ? "Él" : "He"))}
                  </div>
                  <div className="text-neutral-400 truncate">
                    {getRoleDisplayLabel(myProfile.role, language, t)} • {myProfile.heightCm} cm • {myProfile.weightKg} kg • {myProfile.yoSoy}
                  </div>
                </div>
              </div>
            </div>

            {/* BARRA TÁCTICA COMPACTA DE CONTROLES RÁPIDOS (MODO NIEBLA + NOTA DE VOZ 5S) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
              {/* Píldora 1: Modo Niebla (Switch Accesible 44px) */}
              <div className="bg-black/60 border border-white/10 rounded-2xl px-3 py-2 flex items-center justify-between gap-2.5 min-h-[52px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">🌫️</span>
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <span className="truncate">{t.account.fogModeTitle}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 block truncate">
                      {myProfile.isFogMode
                        ? t.account.fogModeNearbyWarning
                        : language === "es"
                        ? "Foto nítida (Máxima visibilidad)"
                        : "Clear photo (Max visibility)"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={myProfile.isFogMode}
                  onClick={() => {
                    toggleFogMode();
                    audioEngine.playPulse();
                  }}
                  className={`w-12 h-7 rounded-full transition-colors relative p-1 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                    myProfile.isFogMode ? "bg-electricViolet shadow-violet-soft" : "bg-neutral-800"
                  }`}
                  title={t.account.fogModeTitle}
                  aria-label={t.account.fogModeTitle}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      myProfile.isFogMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Píldora 2: Audio de Perfil 5s */}
              <div className="bg-black/60 border border-white/10 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 min-h-[52px]">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow flex-shrink-0">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  {myVoiceVibe ? (
                    <div className="flex-1 min-w-0">
                      <VoiceVibePlayer voice={myVoiceVibe} compact />
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-bold text-white block truncate">
                        {t.account?.voiceVibeSection || "AUDIO DE PERFIL (5s)"}
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
                        ? "Grabar 5s"
                        : "Record 5s"}
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
                      aria-label={language === "es" ? "Eliminar nota de voz" : "Delete voice note"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Aviso compacto de 1 línea si Modo Niebla está activo */}
            {myProfile.isFogMode && (
              <div className="px-3 py-2 rounded-xl bg-electricViolet/10 border border-electricViolet/30 flex items-center gap-2 text-[11px] font-mono text-neutral-200 animate-fade-in">
                <AlertTriangle className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                <span className="truncate">{t.account.fogModeRankNotice}</span>
              </div>
            )}
          </div>

          {/* =========================================================================
              2. CONMUTADOR SEGMENTADO STICKY (4 SOLAPAS TÁCTICAS)
              ========================================================================= */}
          <div className="sticky top-2 z-30 bg-obsidian-surface/95 p-1.5 rounded-2xl border border-white/15 backdrop-blur-xl shadow-card-elevation">
            <div
              role="tablist"
              aria-label={language === "es" ? "Secciones de Mi Perfil" : "My Profile Sections"}
              className="grid grid-cols-4 gap-1.5"
            >
              {/* Pestaña 1: Mi Ficha */}
              <button
                type="button"
                role="tab"
                aria-selected={activeMacroTab === "public"}
                onClick={() => {
                  setActiveMacroTab("public");
                  audioEngine.playPulse();
                }}
                className={`py-2 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                  activeMacroTab === "public"
                    ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate hidden sm:inline">{language === "es" ? "Mi Ficha" : "Profile"}</span>
                <span className="truncate sm:hidden">{language === "es" ? "Ficha" : "Bio"}</span>
              </button>

              {/* Pestaña 2: Bóvedas Íntimas / Álbumes */}
              <button
                type="button"
                role="tab"
                aria-selected={activeMacroTab === "vaults"}
                onClick={() => {
                  setActiveMacroTab("vaults");
                  audioEngine.playPulse();
                }}
                className={`py-2 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                  activeMacroTab === "vaults"
                    ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FolderLock className="w-4 h-4 flex-shrink-0" />
                <span className="truncate hidden sm:inline">{language === "es" ? "Bóvedas" : "Vaults"}</span>
                <span className="truncate sm:hidden">{language === "es" ? "Fotos" : "Vaults"}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeMacroTab === "vaults"
                      ? "bg-white/20 text-white font-extrabold"
                      : "bg-white/10 text-neutral-300"
                  }`}
                >
                  {userAlbums.length}
                </span>
              </button>

              {/* Pestaña 3: Logística & Morbos */}
              <button
                type="button"
                role="tab"
                aria-selected={activeMacroTab === "logistics"}
                onClick={() => {
                  setActiveMacroTab("logistics");
                  audioEngine.playPulse();
                }}
                className={`py-2 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 ${
                  activeMacroTab === "logistics"
                    ? "bg-bloodNeon text-white shadow-blood-glow font-extrabold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Flame className="w-4 h-4 flex-shrink-0" />
                <span className="truncate hidden sm:inline">{language === "es" ? "Logística" : "Logistics"}</span>
                <span className="truncate sm:hidden">{language === "es" ? "Morbos" : "Kinks"}</span>
              </button>

              {/* Pestaña 4: Seguridad & Privacidad */}
              <button
                type="button"
                role="tab"
                aria-selected={activeMacroTab === "security"}
                onClick={() => {
                  setActiveMacroTab("security");
                  audioEngine.playPulse();
                }}
                className={`py-2 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-95 ${
                  activeMacroTab === "security"
                    ? "bg-purple-600 text-white shadow-sm font-extrabold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="truncate hidden sm:inline">{language === "es" ? "Seguridad" : "Security"}</span>
                <span className="truncate sm:hidden">{language === "es" ? "Seguridad" : "Safety"}</span>
                {pendingTestimonialsCount > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-bloodNeon shadow-blood-glow animate-pulse" />
                ) : activeBoundariesCount > 0 ? (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeMacroTab === "security"
                        ? "bg-white/20 text-white font-extrabold"
                        : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {activeBoundariesCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {/* =========================================================================
              3. CONTENIDO MODULAR POR MACRO-PANELES
              ========================================================================= */}
          {activeMacroTab === "public" && (
            <div className="space-y-4 animate-fade-in">
              <BioTab />
            </div>
          )}

          {activeMacroTab === "vaults" && <AlbumsTab />}

          {activeMacroTab === "logistics" && <LogisticsTab />}

          {activeMacroTab === "security" && (
            <div className="space-y-4 animate-fade-in">
              <BoundariesTab />
              <div className="pt-2 border-t border-white/10">
                <ReputationTab />
              </div>
            </div>
          )}
        </div>
      )}


      {/* Modal de Selección / Subida de Foto de Portada */}
      {isCoverSelectorOpen && (
        <CoverPhotoSelectorModal
          onClose={() => setIsCoverSelectorOpen(false)}
          onGoToAlbums={() => {
            setActiveMacroTab("vaults");
            audioEngine.playPulse();
          }}
        />
      )}
    </div>
  );
};

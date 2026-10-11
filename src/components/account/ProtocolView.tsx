"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useAuth,
  useLogistics,
  useDiary,
  useRadarMatrix,
  useChat,
  useSettings,
} from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { hasHostingCapability } from "@/lib/geo/mobility";
import { CoverPhotoSelectorModal } from "./CoverPhotoSelectorModal";
import {
  PhotosSheet,
  VibePhysicalSheet,
  LogisticsSheet,
  KinksSheet,
  SafetySheet,
} from "./sheets";
import {
  SectionHeroHeader,
  BrutalistSwitch,
  TacticalBadge,
  BrutalistButton,
} from "@/components/ui";
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
  FolderLock,
  ShieldCheck,
  Flame,
  AlertTriangle,
  Mic,
  Trash2,
  Pencil,
  Sliders,
  Zap,
  Home,
  ChevronRight,
  Eye,
  Sparkles,
} from "lucide-react";
import { VoiceVibePlayer } from "@/components/profile/VoiceVibePlayer";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";

export type ProtocolMacroTab = "public" | "vaults" | "logistics" | "security";
export type ProfileActiveSheet = "photos" | "vibe_physical" | "logistics" | "kinks" | "safety" | null;

export const ProtocolView: React.FC = () => {
  const {
    myBodyState,
    myProfile,
    currentUserUid,
    updateMyProfile,
    toggleFogMode,
    isCloudConnected,
  } = useAuth();
  const {
    myHostCard,
    updateMyHostCard,
    myVoiceVibe,
    openVoiceRecorder,
    deleteMyVoiceVibe,
    openDuoModal,
    myDuoLink,
  } = useLogistics();
  const { myReceivedTestimonials } = useDiary();
  const {
    setSelectedProfile,
    myFullProfile,
    myKinkMatrix,
  } = useRadarMatrix();
  const { boundaries: connectionBoundaries } = useChat();
  const {
    userAlbums,
    isSyncingCloud,
    language,
    t,
    openAppSettingsModal,
  } = useSettings();

  // Estado del Sheet/Drawer activo (Alternativa B: WYSIWYG Bento Hub)
  const [activeSheet, setActiveSheet] = useState<ProfileActiveSheet>(null);
  const [activeMacroTab, setActiveMacroTab] = useState<ProtocolMacroTab>("public");
  const [isCoverSelectorOpen, setIsCoverSelectorOpen] = useState(false);

  // Estados locales para edición inline de alias en Hero Banner
  const [isEditingName, setIsEditingName] = useState(false);
  const [inlineName, setInlineName] = useState<string>(myProfile.codename || "VESSEL_USER");
  const [inlineNameError, setInlineNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Nivel de completitud del perfil (0-100%)
  const profileCompleteness = useMemo(() => {
    let score = 25;
    if (myProfile.avatarUrl) score += 25;
    if (myProfile.role) score += 15;
    if (myHostCard?.hasPlace || myProfile.mobility) score += 15;
    if (myVoiceVibe) score += 10;
    if (
      (myProfile.desires && myProfile.desires.length > 0) ||
      (myProfile.intentions && myProfile.intentions.length > 0)
    ) {
      score += 10;
    }
    return Math.min(score, 100);
  }, [myProfile, myHostCard, myVoiceVibe]);

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

  // Métricas para los Bento Cards
  const publicAlbumsCount = userAlbums.filter((a) => a.privacy === "public").length;
  const privateAlbumsCount = userAlbums.filter((a) => a.privacy === "private").length;
  const totalPhotosCount = userAlbums.reduce((sum, a) => sum + (a.photos?.length || 0), 0);
  const photoPreviews = userAlbums.flatMap((a) => a.photos || []).map((p) => p.url).slice(0, 3);

  const activeKinksCount = Object.values(myKinkMatrix || {}).filter((v) => v !== "pass").length;
  const activeBoundariesCount = Object.keys(connectionBoundaries || {}).length;

  const livingArrangementLabel = useMemo(() => {
    switch (myHostCard?.livingArrangement) {
      case "solo":
        return language === "es" ? "Solo" : "Alone";
      case "roommates":
        return language === "es" ? "Con amigos" : "Roommates";
      case "partner_aware":
        return language === "es" ? "En pareja" : "Partner";
      case "hotel":
        return language === "es" ? "Hotel" : "Hotel";
      default:
        return language === "es" ? "Por coordinar" : "TBD";
    }
  }, [myHostCard?.livingArrangement, language]);

  const amenitiesCount = Object.values(myHostCard?.amenities || {}).filter(Boolean).length;
  const suppliesCount = Object.values(myHostCard?.supplies || {}).filter(Boolean).length;

  return (
    <div className="flex flex-col flex-1 p-3 sm:p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-28 space-y-3.5 select-none bg-obsidian-deep min-h-[100dvh]">
      {/* =========================================================================
          CABECERA HERO SUPERIOR CON ACCIONES RÁPIDAS
          ========================================================================= */}
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
            ? "Tu tarjeta viva, fotos, acuerdos de encuentro y blindaje."
            : "Live tactical identity, photos, connection boundaries, and privacy shield."
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
              title={
                language === "es"
                  ? "Configuración de la App (Audio, nube, backups, cuenta)"
                  : "App Settings (Audio, cloud, backups, account)"
              }
              aria-label={language === "es" ? "Configuración de la App" : "App Settings"}
              className="px-2.5 sm:px-3 py-2 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/15 transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-300" />
              <span className="hidden min-[480px]:inline">{language === "es" ? "Ajustes" : "Settings"}</span>
            </button>
          </div>
        }
      />

      {/* =========================================================================
          1. COMPACT TACTICAL HERO CARD (TARJETA VIVA WYSIWYG)
          ========================================================================= */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-3.5 sm:p-4 border border-white/10 space-y-3 shadow-card-elevation relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-electricViolet/10 rounded-full blur-3xl pointer-events-none" />

        {/* Fila superior: Foto + Identidad + Badges de Confianza */}
        <div className="flex gap-3.5 items-start relative z-10">
          {/* Foto de Perfil con Marco Brutalista */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setIsCoverSelectorOpen(true);
                audioEngine.playPulse();
              }}
              className="w-20 h-28 sm:w-24 sm:h-32 rounded-2xl bg-neutral-900 overflow-hidden border-2 border-electricViolet/60 hover:border-electricViolet shadow-2xl relative group cursor-pointer"
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
                  <span>{t.account?.fogOn || "Niebla"}</span>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCoverSelectorOpen(true);
                  audioEngine.playPulse();
                }}
                className="absolute bottom-1.5 right-1.5 p-1.5 bg-black/75 hover:bg-electricViolet text-white/90 hover:text-white rounded-lg border border-white/20 backdrop-blur-md transition-all active:scale-95 flex items-center justify-center cursor-pointer min-w-[36px] min-h-[36px] z-10 shadow-md"
                title={language === "es" ? "Cambiar Foto de Portada" : "Change Cover Photo"}
                aria-label={language === "es" ? "Cambiar Foto de Portada" : "Change Cover Photo"}
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Información de Identidad */}
          <div className="flex-1 min-w-0 space-y-2 pr-1">
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
                  <h1 className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight flex items-center gap-1.5">
                    <span>{myProfile.codename || "VESSEL_USER"}</span>
                    {myProfile.showAge && (
                      <span className="text-sm sm:text-base font-mono font-bold text-neutral-400">
                        , {myProfile.age} {language === "es" ? "años" : "yo"}
                      </span>
                    )}
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(true);
                      setInlineName(myProfile.codename || "VESSEL_USER");
                      audioEngine.playPulse();
                    }}
                    className="p-1.5 min-h-[36px] min-w-[36px] rounded-lg text-neutral-400 hover:text-electricViolet-glow hover:bg-electricViolet/15 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                    title={t.account.codenameLabel}
                    aria-label={t.account.codenameLabel}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Medidor de Completitud Táctica */}
              <div className="space-y-1 py-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-neutral-400">
                    {language === "es" ? "Completitud del Perfil" : "Profile Setup"}
                  </span>
                  <span className="text-electricViolet-glow font-bold">
                    {profileCompleteness}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-electricViolet to-mintNeon rounded-full transition-all duration-500"
                    style={{ width: `${profileCompleteness}%` }}
                  />
                </div>
              </div>

              {/* Punto de Estado táctico & Acceso Rápido a Modo Dúo */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                <div className="text-xs text-electricViolet-glow font-mono font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${myBodyState === "open" ? "bg-mintNeon shadow-mint" : "bg-electricViolet"} animate-pulse`} />
                  <span>
                    {myBodyState === "open"
                      ? (language === "es" ? "En línea y con ganas" : "Active Transmission")
                      : (language === "es" ? "Modo Sigilo (Oculto)" : "Stealth Mode (Hidden)")}
                  </span>
                </div>

                {/* Badge Táctico de Modo Dúo de Acceso Directo */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    openDuoModal();
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 ${
                    myDuoLink?.isLinked
                      ? "bg-electricViolet/25 border-electricViolet text-white shadow-violet-soft"
                      : "bg-white/5 border-white/15 text-neutral-300 hover:border-electricViolet/50 hover:text-white"
                  }`}
                  title={myDuoLink?.isLinked ? `Modo Dúo activo con @${myDuoLink.partnerCodename}` : "Vincular pareja en Modo Dúo"}
                >
                  <span>👥</span>
                  <span>
                    {myDuoLink?.isLinked
                      ? `DÚO: @${myDuoLink.partnerCodename}`
                      : (language === "es" ? "+ MODO DÚO" : "+ DUO MODE")}
                  </span>
                  {myDuoLink?.isLinked && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>
              </div>
            </div>

            {/* Badges de Confianza */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {myHostCard?.hasPlace || hasHostingCapability(myProfile.mobility) ? (
                <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap">
                  🏠 {language === "es" ? "Pongo Casa" : "Can Host"}
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-neutral-300 bg-white/5 border border-white/15 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
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
                  className="text-[10px] font-mono font-bold text-mintNeon bg-mintNeon/15 border border-mintNeon/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap"
                  title={`${myProfile.totalEncountersVerified} Encuentros físicos validados`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>
                    {myProfile.totalEncountersVerified} {language === "es" ? "Verificados" : "Verified"}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BARRA DE CONTROL RÁPIDO UNIFICADA (MODO NIEBLA + AUDIO 5S) */}
        <div className="bg-black/50 border border-white/10 rounded-2xl divide-y sm:divide-y-0 sm:divide-x divide-white/10 flex flex-col sm:flex-row items-stretch">
          {/* Píldora 1: Modo Niebla */}
          <div className="flex-1 px-3 py-2 flex items-center justify-between gap-2.5 min-h-[48px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base flex-shrink-0">🌫️</span>
              <div className="min-w-0">
                <div className="text-xs font-mono font-bold text-white truncate">
                  {t.account.fogModeTitle}
                </div>
                <span className="text-[10px] font-mono text-neutral-400 block truncate">
                  {myProfile.isFogMode
                    ? t.account.fogModeNearbyWarning
                    : language === "es"
                    ? "Foto nítida (Público)"
                    : "Clear photo (Public)"}
                </span>
              </div>
            </div>

            <BrutalistSwitch
              checked={Boolean(myProfile.isFogMode)}
              onChange={() => {
                toggleFogMode();
              }}
              variant="violet"
              size="sm"
              aria-label={t.account?.fogModeTitle || "Modo Niebla"}
            />
          </div>

          {/* Píldora 2: Audio de Perfil 5s */}
          <div className="flex-1 px-3 py-2 flex items-center justify-between gap-2 min-h-[48px]">
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
                    {t.account?.voiceVibeSection || "Audio de Perfil (5s)"}
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
                className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-[10px] font-bold shadow-violet-soft transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Mic className="w-3 h-3" />
                <span>
                  {myVoiceVibe
                    ? language === "es"
                      ? "Cambiar"
                      : "Re-record"
                    : language === "es"
                    ? "Grabar"
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
                  className="p-1.5 min-h-[36px] min-w-[36px] rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                  title={language === "es" ? "Eliminar nota de voz" : "Delete voice note"}
                  aria-label={language === "es" ? "Eliminar nota de voz" : "Delete voice note"}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Aviso de Modo Niebla Activo */}
        {myProfile.isFogMode && (
          <div className="px-3 py-2 rounded-xl bg-electricViolet/10 border border-electricViolet/30 flex items-center gap-2 text-[11px] font-mono text-neutral-200 animate-fade-in">
            <AlertTriangle className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
            <span className="truncate">{t.account.fogModeRankNotice}</span>
          </div>
        )}

        {/* =========================================================================
            BARRA DE ESTADO RÁPIDO // QUICK-STATUS (1-TAP HOY)
            ========================================================================= */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3 space-y-2.5">
          {/* Fila 1: Pongo Casa vs Me Muevo (1-Tap Toggle) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
              <span>🏠</span>
              <span>{language === "es" ? "¿LUGAR HOY?" : "HOSTING TODAY?"}</span>
            </span>
            <div className="flex items-center bg-white/5 p-0.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (!myHostCard?.hasPlace) {
                    audioEngine.playPulse();
                    updateMyHostCard?.({ hasPlace: true });
                    updateMyProfile({ mobility: "Pongo casa 🏠" });
                  }
                }}
                className={`px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                  myHostCard?.hasPlace
                    ? "bg-amber-400 text-black shadow-sm font-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>🏠</span>
                <span>{language === "es" ? "Pongo Casa" : "Can Host"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (myHostCard?.hasPlace) {
                    audioEngine.playPulse();
                    updateMyHostCard?.({ hasPlace: false });
                    updateMyProfile({ mobility: "Voy a la tuya / Viajo 🚗" });
                  }
                }}
                className={`px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                  !myHostCard?.hasPlace
                    ? "bg-electricViolet text-white shadow-violet-soft font-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>🚗</span>
                <span>{language === "es" ? "Voy Yo" : "Mobile"}</span>
              </button>
            </div>
          </div>

          {/* Fila 2: ¿Qué pinta hoy? (Chips 1-Tap) */}
          <div className="space-y-1.5 pt-1.5 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 font-bold flex items-center gap-1.5">
                <span>⚡</span>
                <span>{language === "es" ? "¿QUÉ PINTA HOY?" : "WHAT ARE YOU DOWN FOR?"}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveSheet("vibe_physical");
                  audioEngine.playPulse();
                }}
                className="text-[10px] font-mono text-electricViolet-glow hover:underline cursor-pointer min-h-[32px] px-1 flex items-center"
              >
                {language === "es" ? "+ Ver todas" : "+ View all"}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "Ahora mismo (Inmediato)", label: language === "es" ? "🔥 Telo / Ya" : "🔥 Now" },
                { id: "Pinta previa / Birra", label: language === "es" ? "🍻 Previa / Bar" : "🍻 Drinks" },
                { id: "Chill en casa", label: language === "es" ? "🛋️ Chill en casa" : "🛋️ Chill" },
                { id: "Sin vueltas", label: language === "es" ? "⚡ Sin vueltas" : "⚡ Direct" },
                { id: "Morbo y fetiche", label: language === "es" ? "😈 Morbo" : "😈 Kink" },
              ].map((pill) => {
                const isSelected = myProfile.intentions?.includes(pill.id);
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      const current = myProfile.intentions || [];
                      const next = current.includes(pill.id)
                        ? current.filter((i) => i !== pill.id)
                        : [...current, pill.id];
                      updateMyProfile({ intentions: next });
                    }}
                    className={`px-2.5 py-1.5 min-h-[36px] rounded-xl text-[11px] font-mono transition-all border cursor-pointer active:scale-95 select-none ${
                      isSelected
                        ? "bg-bloodNeon/25 border-bloodNeon text-white font-black shadow-blood-glow ring-1 ring-bloodNeon/50"
                        : "bg-black/40 border-white/10 text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. BENTO GRID HUB DE 5 MÓDULOS TÁCTICOS (ALTERNATIVA A: 1-TAP EDIT)
          ========================================================================= */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
            {language === "es" ? "Módulos de tu Perfil (Tap para editar)" : "Profile Modules (Tap to edit)"}
          </span>
          <span className="text-[10px] font-mono text-electricViolet-glow font-bold">
            1-TAP DRAWERS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Bento Card 1: Fotos & Álbumes */}
          <button
            type="button"
            role="tab"
            aria-label={language === "es" ? "Álbumes & Bóvedas" : "Albums & Vaults"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveSheet("photos");
              setActiveMacroTab("vaults");
            }}
            className="col-span-1 sm:col-span-2 p-4 rounded-3xl bg-obsidian-surface/90 border border-white/10 hover:border-electricViolet/60 transition-all text-left flex items-center justify-between gap-3 shadow-card-elevation group cursor-pointer active:scale-[0.99] backdrop-blur-md"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FolderLock className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide uppercase group-hover:text-electricViolet-glow transition-colors truncate">
                    {language === "es" ? "Fotos & Bóvedas con Llave" : "Photos & Vaults"}
                  </h3>
                  <TacticalBadge variant="violet" size="sm">
                    {totalPhotosCount} {language === "es" ? "fotos" : "photos"}
                  </TacticalBadge>
                </div>
                <p className="text-[11px] font-mono text-neutral-400 truncate">
                  {publicAlbumsCount} {language === "es" ? "Públicas" : "Public"} • {privateAlbumsCount} {language === "es" ? "Con Llave" : "Locked"}
                </p>
                {/* Miniaturas de Fotos */}
                {photoPreviews.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {photoPreviews.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Preview"
                        className="w-7 h-7 rounded-lg object-cover border border-white/15"
                      />
                    ))}
                    <span className="text-[10px] font-mono text-neutral-500 pl-1">
                      {language === "es" ? "+ gestionar galería" : "+ manage gallery"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-electricViolet-glow group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Bento Card 2: La Onda, Rol & Físico */}
          <button
            type="button"
            role="tab"
            aria-label={language === "es" ? "Ficha & Onda" : "Bio & Vibe"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveSheet("vibe_physical");
              setActiveMacroTab("public");
            }}
            className="p-4 rounded-3xl bg-obsidian-surface/90 border border-white/10 hover:border-electricViolet/60 transition-all text-left flex items-center justify-between gap-3 shadow-card-elevation group cursor-pointer active:scale-[0.99] backdrop-blur-md"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide uppercase group-hover:text-electricViolet-glow transition-colors truncate">
                    {language === "es" ? "La Onda, Rol & Físico" : "Role & Vibe"}
                  </h3>
                </div>
                <p className="text-[11px] font-mono text-white font-bold truncate">
                  {myProfile.role ? getRoleDisplayLabel(myProfile.role, language, t) : (language === "es" ? "Definí tu rol" : "Set role")}
                  {myProfile.intentions?.[0] ? ` • ${myProfile.intentions[0]}` : ""}
                </p>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  {myProfile.age} {language === "es" ? "años" : "yo"}
                  {myProfile.heightCm ? ` • ${myProfile.heightCm}cm` : ""}
                  {myProfile.yoSoy ? ` • ${myProfile.yoSoy}` : ""}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-electricViolet-glow group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Bento Card 3: Tu Casa & Logística */}
          <button
            type="button"
            role="tab"
            aria-label={language === "es" ? "Logística & Casa" : "Logistics & House"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveSheet("logistics");
              setActiveMacroTab("logistics");
            }}
            className="p-4 rounded-3xl bg-obsidian-surface/90 border border-white/10 hover:border-amber-400/60 transition-all text-left flex items-center justify-between gap-3 shadow-card-elevation group cursor-pointer active:scale-[0.99] backdrop-blur-md"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide uppercase group-hover:text-amber-300 transition-colors truncate">
                    {language === "es" ? "Tu Casa & Logística" : "Place & Hosting"}
                  </h3>
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {myHostCard?.hasPlace ? (language === "es" ? "Pongo Casa" : "Host") : (language === "es" ? "Voy Yo" : "Mobile")}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-white font-bold truncate">
                  {livingArrangementLabel} • {amenitiesCount} {language === "es" ? "comodidades" : "amenities"}
                </p>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  {language === "es" ? "Insumos, salida pactada y clima de consumo" : "Supplies, exit protocol & atmosphere"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Bento Card 4: Morbos y Fetiches */}
          <button
            type="button"
            role="tab"
            aria-label={language === "es" ? "Morbos y Fetiches" : "Kinks & Desires"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveSheet("kinks");
              setActiveMacroTab("logistics");
            }}
            className="p-4 rounded-3xl bg-obsidian-surface/90 border border-white/10 hover:border-bloodNeon/60 transition-all text-left flex items-center justify-between gap-3 shadow-card-elevation group cursor-pointer active:scale-[0.99] backdrop-blur-md"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide uppercase group-hover:text-bloodNeon transition-colors truncate">
                    {language === "es" ? "Tus Morbos y Fetiches" : "Kinks & Desires"}
                  </h3>
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40">
                    {activeKinksCount} {language === "es" ? "activos" : "active"}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-white font-bold truncate">
                  {language === "es" ? "Coincidencia mutua a ciegas 🔥" : "Blind mutual matching 🔥"}
                </p>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  {language === "es" ? "Fetiches y gustos con coincidencia ciega" : "Blind mutual kink matching"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-bloodNeon group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Bento Card 5: Blindaje & Cuidado */}
          <button
            type="button"
            role="tab"
            aria-label={language === "es" ? "Blindaje & Seguridad" : "Safety & Boundaries"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveSheet("safety");
              setActiveMacroTab("security");
            }}
            className="p-4 rounded-3xl bg-obsidian-surface/90 border border-white/10 hover:border-mintNeon/60 transition-all text-left flex items-center justify-between gap-3 shadow-card-elevation group cursor-pointer active:scale-[0.99] backdrop-blur-md"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-mintNeon/15 text-mintNeon border border-mintNeon/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide uppercase group-hover:text-mintNeon transition-colors truncate">
                    {language === "es" ? "Blindaje & Seguridad" : "Safety & Care"}
                  </h3>
                  {myProfile.verification?.isVerified && (
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full bg-mintNeon/20 text-mintNeon border border-mintNeon/40">
                      ✓ ID
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-white font-bold truncate">
                  {myProfile.respectScore || 98}% {language === "es" ? "Karma Anti-Ghost" : "Karma"} • {activeBoundariesCount} {language === "es" ? "límites" : "boundaries"}
                </p>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  {language === "es" ? "Salud sexual (PrEP), GPS & Señuelo SOS" : "Sexual health, GPS & SOS"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-mintNeon group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. BOTÓN DESTACADO DE PREVISUALIZACIÓN DE TARJETA
          ========================================================================= */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            setSelectedProfile(myFullProfile);
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-electricViolet/20 via-electricViolet/30 to-purple-600/20 hover:from-electricViolet/30 hover:to-purple-600/30 text-white border border-electricViolet/50 transition-all font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-violet-soft cursor-pointer active:scale-95"
        >
          <Eye className="w-4 h-4 text-electricViolet-glow" />
          <span>{language === "es" ? "Previsualizar cómo ven tu tarjeta los demás" : "Preview your public profile card"}</span>
        </button>
      </div>

      {/* =========================================================================
          4. BOTTOM SHEETS MODULARES TÁCTICOS
          ========================================================================= */}
      <PhotosSheet
        isOpen={activeSheet === "photos"}
        onClose={() => setActiveSheet(null)}
      />

      <VibePhysicalSheet
        isOpen={activeSheet === "vibe_physical"}
        onClose={() => setActiveSheet(null)}
      />

      <LogisticsSheet
        isOpen={activeSheet === "logistics"}
        onClose={() => setActiveSheet(null)}
      />

      <KinksSheet
        isOpen={activeSheet === "kinks"}
        onClose={() => setActiveSheet(null)}
      />

      <SafetySheet
        isOpen={activeSheet === "safety"}
        onClose={() => setActiveSheet(null)}
      />

      {/* Modal de Selección / Subida de Foto de Portada */}
      {isCoverSelectorOpen && (
        <CoverPhotoSelectorModal
          onClose={() => setIsCoverSelectorOpen(false)}
          onGoToAlbums={() => {
            setIsCoverSelectorOpen(false);
            setActiveSheet("photos");
            audioEngine.playPulse();
          }}
        />
      )}
    </div>
  );
};

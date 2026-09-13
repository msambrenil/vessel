"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { CoverPhotoSelectorModal } from "./CoverPhotoSelectorModal";
import {
  BioTab,
  AlbumsTab,
  KinksTab,
  ReputationTab,
  BoundariesTab,
} from "./tabs";
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
} from "lucide-react";
import { VoiceVibePlayer } from "@/components/profile/VoiceVibePlayer";

type ProfileSubTab = "bio" | "albums" | "kinks" | "reputation" | "boundaries";

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
    language,
    t,
  } = useVessel();

  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>("bio");
  const [isCoverSelectorOpen, setIsCoverSelectorOpen] = useState(false);

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

  const handleSaveInlineName = async () => {
    setInlineNameError(null);
    const cleanName = inlineName.trim().toUpperCase();

    if (!cleanName) {
      setInlineNameError("El alias no puede estar vacío.");
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
      setInlineNameError(check.message || "El alias ya se encuentra registrado.");
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

  const pendingTestimonialsCount = myReceivedTestimonials.filter((t) => t.status === "pending").length;
  const activeBoundariesCount = Object.keys(connectionBoundaries).length;

  return (
    <div className="flex flex-col flex-1 p-3 sm:p-4 pb-40 sm:pb-44 space-y-4 select-none bg-obsidian-deep">
      {/* CABECERA HERO SUPERIOR DE PROTOCOLO */}
      <SectionHeroHeader
        title={language === "es" ? "PROTOCOLO // MI PERFIL" : "PROTOCOL // MY PROFILE"}
        tag={myProfile.codename || "VESSEL"}
        subtitle={
          language === "es"
            ? "Identidad táctica, límites de conexión, media vault y soberanía de datos."
            : "Tactical identity, connection boundaries, media vault, and data sovereignty."
        }
        variant="violet"
        icon={<User className="w-4 h-4 text-electricViolet-glow" />}
        actions={
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              openAppSettingsModal();
            }}
            aria-label={t.settings.title}
            className="px-3 py-1.5 min-h-[38px] rounded-xl bg-white/10 hover:bg-electricViolet hover:text-white border border-white/15 text-neutral-200 transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-electricViolet-glow" />
            <span className="hidden sm:inline">{t.settings.title}</span>
          </button>
        }
      />

      {/* =========================================================================
          1. HERO BANNER: IDENTIDAD VISUAL, FOTO EDITORIAL & BADGES DE REPUTACIÓN
          ========================================================================= */}
      <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation relative overflow-hidden backdrop-blur-md">
        {/* Glow sutil de fondo */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-electricViolet/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón táctico de Configuración del Sistema */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            openAppSettingsModal();
          }}
          aria-label={t.settings.title}
          className="absolute top-3.5 right-3.5 z-20 px-3 py-1.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-electricViolet/60 text-neutral-300 hover:text-white transition-all text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-sm"
          title={t.settings.title}
        >
          <Sliders className="w-3.5 h-3.5 text-electricViolet-glow" />
          <span className="hidden sm:inline">{t.settings.title}</span>
        </button>

        {/* Fila superior: Foto Grande + Datos Principales */}
        <div className="flex gap-4 items-start relative z-10">
          {/* Foto de Perfil de Gran Tamaño con Marco Brutalista */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => {
                setIsCoverSelectorOpen(true);
                audioEngine.playPulse();
              }}
              className="w-28 h-36 sm:w-36 sm:h-44 rounded-2xl bg-neutral-900 overflow-hidden border-2 border-electricViolet/60 hover:border-electricViolet shadow-2xl relative group cursor-pointer"
              title="Hacé clic para cambiar tu Foto de Portada"
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
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-500">
                  <User className="w-12 h-12" />
                </div>
              )}

              {/* Degradado inferior */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

              {/* Badge flotante de Niebla en la foto */}
              {myProfile.isFogMode && (
                <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-electricViolet/40 text-[9px] font-mono font-bold text-electricViolet-glow flex items-center gap-1 shadow-md">
                  <span>🌫️</span>
                  <span>Niebla ON</span>
                </div>
              )}

              {/* Badge si usa Avatar Estilizado */}
              {myProfile.isStylizedAvatar && !myProfile.isFogMode && (
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] font-mono font-bold text-white flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-electricViolet-glow" />
                  <span>Estilizado</span>
                </div>
              )}

              {/* Botón flotante para cambiar foto / avatar */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCoverSelectorOpen(true);
                  audioEngine.playPulse();
                }}
                className="absolute bottom-2 right-2 p-2.5 bg-electricViolet text-white rounded-xl shadow-violet-soft hover:bg-electricViolet-glow transition-all active:scale-95 flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] z-10"
                title="Cambiar Foto de Portada Principal"
                aria-label="Cambiar Foto de Portada Principal"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Información de Identidad, Codename y Badges */}
          <div className="flex-1 min-w-0 space-y-2 pr-12 sm:pr-28">
            <div>
              {isEditingName ? (
                <div className="space-y-1.5 py-1">
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
                      placeholder="Tu nombre / alias..."
                      className={`px-2.5 py-1.5 min-h-[44px] rounded-xl bg-black border text-white font-mono font-bold text-base sm:text-lg focus:outline-none transition-all w-full max-w-[240px] ${
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
                      title="Guardar nombre"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{isCheckingName ? "Validando..." : "Listo"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInlineName(myProfile.codename || "VESSEL_USER");
                        setInlineNameError(null);
                        setIsEditingName(false);
                      }}
                      className="p-2 min-h-[44px] min-w-[44px] bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      title="Cancelar"
                      aria-label="Cancelar"
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
                  <h1
                    onClick={() => {
                      setIsEditingName(true);
                      setInlineName(myProfile.codename || "VESSEL_USER");
                      audioEngine.playPulse();
                    }}
                    className="text-xl sm:text-2xl font-mono font-black text-white tracking-tight cursor-pointer hover:text-electricViolet-glow transition-colors flex items-center gap-1.5 group"
                    title="Hacé clic para cambiar tu nombre"
                  >
                    <span>{myProfile.codename || "VESSEL_USER"}</span>
                    <span className="text-xs opacity-60 group-hover:opacity-100 text-electricViolet-glow transition-opacity">✏️</span>
                  </h1>
                  <span className="text-sm font-mono font-bold text-neutral-400">
                    {myProfile.showAge ? `${myProfile.age} años` : "Edad Oculta"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(true);
                      setInlineName(myProfile.codename || "VESSEL_USER");
                      audioEngine.playPulse();
                    }}
                    className="px-2.5 py-1 min-h-[36px] rounded-lg bg-electricViolet/15 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/40 text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                    title="Editar Nombre de Usuario"
                    aria-label="Editar Nombre de Usuario"
                  >
                    <span>✏️</span>
                    <span>Editar</span>
                  </button>
                </div>
              )}

              <div className="text-xs text-electricViolet-glow font-mono font-bold mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-electricViolet animate-pulse shadow-violet-soft" />
                <span>{myBodyState === "open" ? "Transmisión Activa // Open Now" : "Modo Stealth // Oculto"}</span>
              </div>
            </div>

            {/* Badges de Verificación y Respeto */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
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
                  <span>{myProfile.totalEncountersVerified} Verificados</span>
                </span>
              )}
            </div>

            {/* Ficha sintética del usuario */}
            <div className="text-[11px] text-neutral-300 font-mono space-y-0.5 pt-1.5 border-t border-white/10">
              <div className="truncate text-neutral-200 font-bold">
                {myProfile.genderIdentity || "Hombre Cis"} • {myProfile.pronouns || "Él / He / Him"}
              </div>
              <div className="text-neutral-400 truncate">
                {myProfile.role} • {myProfile.heightCm} cm • {myProfile.weightKg} kg • {myProfile.yoSoy}
              </div>
              {myProfile.twitterHandle && (
                <div className="text-electricViolet-glow font-mono text-[10px] truncate">
                  @{myProfile.twitterHandle}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INTERRUPTOR DE MODO NIEBLA (DIFUMINADO FACIAL INTEGRADO) */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 space-y-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                🌫️
              </div>
              <div className="min-w-0">
                <div className="text-xs font-mono font-extrabold text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                  <span>{t.account.fogModeTitle}</span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                      myProfile.isFogMode
                        ? "bg-electricViolet/20 text-electricViolet-glow border-electricViolet/40 font-bold shadow-violet-soft"
                        : "bg-white/5 text-neutral-400 border-white/10 font-normal"
                    }`}
                  >
                    {myProfile.isFogMode ? t.account.fogModeActive : t.account.fogModeNormal}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                  {myProfile.isFogMode
                    ? "Tu foto se muestra difuminada con discreción en el radar y cuadrícula."
                    : "Tu foto se muestra nítida y visible para todos los perfiles."}
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={() => {
                toggleFogMode();
                audioEngine.playPulse();
              }}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
                myProfile.isFogMode ? "bg-electricViolet shadow-violet-soft" : "bg-neutral-800"
              }`}
              title="Conmutar Modo Niebla"
              aria-label="Conmutar Modo Niebla"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  myProfile.isFogMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* AVISO IMPORTANTE DE VISIBILIDAD CUANDO EL MODO NIEBLA ESTÁ ACTIVO */}
          {myProfile.isFogMode && (
            <div className="bg-electricViolet/10 border border-electricViolet/30 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5 shadow-sm animate-fade-in">
              <div className="p-1 rounded-lg bg-electricViolet/20 text-electricViolet-glow mt-0.5 flex-shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 text-[11px] font-mono leading-relaxed min-w-0">
                <span className="font-bold text-electricViolet-glow block uppercase text-[10px] tracking-wider">
                  ⚠️ Impacto de Visibilidad // Modo Niebla Activo
                </span>
                <p className="text-neutral-300">
                  • <strong>Vista Cerca:</strong> Tu perfil tendrá <strong>menor visibilidad en el ranking</strong>.
                  <br />
                  • <strong>Vista Radar:</strong> Tu perfil <strong>no será visible en el radar</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="text-[10px] text-neutral-400 font-mono italic border-t border-white/5 pt-2 flex items-center justify-between">
            <span>ℹ️ {t.account.fogModeNotice}</span>
          </div>
        </div>

        {/* NOTA DE VOZ // VOICE VIBE DEL PERFIL */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3.5 space-y-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-sm flex-shrink-0 text-electricViolet-glow shadow-sm">
                <Mic className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-mono font-extrabold text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                  <span>{language === "es" ? "Nota de Voz // Voice Vibe" : "Voice Note // Voice Vibe"}</span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                      myVoiceVibe
                        ? "bg-mintNeon/15 text-mintNeon border-mintNeon/30 font-bold"
                        : "bg-white/5 text-neutral-400 border-white/10"
                    }`}
                  >
                    {myVoiceVibe
                      ? language === "es"
                        ? "ACTIVA (5s)"
                        : "ACTIVE (5s)"
                      : language === "es"
                      ? "SIN AUDIO"
                      : "NO AUDIO"}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                  {myVoiceVibe
                    ? language === "es"
                      ? "Tu voz se escucha al inspeccionar tu perfil en la matriz."
                      : "Your voice plays when users inspect your profile on the grid."
                    : language === "es"
                    ? "Grabá un audio de 5s para transmitir tono y presencia real."
                    : "Record a 5s clip to convey tone and real presence."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openVoiceRecorder();
              }}
              className="px-3 py-1.5 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-[11px] font-bold shadow-violet-soft transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>
                {myVoiceVibe
                  ? language === "es"
                    ? "Cambiar"
                    : "Change"
                  : language === "es"
                  ? "Grabar"
                  : "Record"}
              </span>
            </button>
          </div>

          {/* Si tiene nota de voz activa, mostrar reproductor con waveform real y botón de borrar */}
          {myVoiceVibe && (
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="w-full flex-1">
                <VoiceVibePlayer voice={myVoiceVibe} compact />
              </div>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playError();
                  deleteMyVoiceVibe();
                }}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 py-1 px-2 rounded-lg bg-red-950/30 border border-red-500/20 transition-colors self-end sm:self-center cursor-pointer"
                title="Eliminar nota de voz"
              >
                <Trash2 className="w-3 h-3" />
                <span>{language === "es" ? "Eliminar" : "Delete"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. CONMUTADOR SEGMENTADO TÁCTIL (5 SUB-PESTAÑAS ESTANDARIZADAS)
          ========================================================================= */}
      <div className="bg-obsidian-surface/90 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-card-elevation">
        <div className="grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("bio");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeSubTab === "bio"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sliders className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Bio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab("albums");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeSubTab === "albums"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FolderLock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Álbumes</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSubTab === "albums"
                  ? "bg-white/20 text-white font-extrabold"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {userAlbums.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab("kinks");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeSubTab === "kinks"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Kinks</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab("reputation");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeSubTab === "reputation"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Seguridad</span>
            {pendingTestimonialsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-bloodNeon shadow-blood-glow animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab("boundaries");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeSubTab === "boundaries"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Límites</span>
            {activeBoundariesCount > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeSubTab === "boundaries"
                    ? "bg-white/20 text-white font-extrabold"
                    : "bg-purple-500/20 text-purple-300"
                }`}
              >
                {activeBoundariesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. CONTENIDO MODULAR POR SUB-PESTAÑAS
          ========================================================================= */}
      {activeSubTab === "bio" && <BioTab />}
      {activeSubTab === "albums" && <AlbumsTab />}
      {activeSubTab === "kinks" && <KinksTab />}
      {activeSubTab === "reputation" && <ReputationTab />}
      {activeSubTab === "boundaries" && <BoundariesTab />}

      {/* Banner al pie para Configuración del Sistema */}
      <div className="bg-obsidian-surface/90 rounded-2xl p-3.5 border border-white/10 flex items-center justify-between gap-3 backdrop-blur-md shadow-card-elevation">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30 flex-shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-mono font-bold text-white uppercase block truncate">
              {t.settings.title}
            </span>
            <span className="text-[10px] text-neutral-400 block font-mono truncate">
              {t.settings.subtitle}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            audioEngine.playPulse();
            openAppSettingsModal();
          }}
          className="px-3.5 py-2 min-h-[44px] bg-white/10 hover:bg-electricViolet hover:text-white text-white font-mono font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0"
        >
          <span>{language === "es" ? "Configurar" : "Settings"}</span>
        </button>
      </div>

      {/* Modal de Selección / Subida de Foto de Portada */}
      {isCoverSelectorOpen && (
        <CoverPhotoSelectorModal
          onClose={() => setIsCoverSelectorOpen(false)}
          onGoToAlbums={() => {
            setActiveSubTab("albums");
            audioEngine.playPulse();
          }}
        />
      )}
    </div>
  );
};

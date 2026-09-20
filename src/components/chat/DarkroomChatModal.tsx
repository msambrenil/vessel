"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import {
  X,
  Send,
  Flame,
  Navigation,
  ChevronLeft,
  Clock,
  Lock,
  MessageSquareHeart,
  ShieldCheck,
  CheckCircle2,
  Ghost,
  Sparkles,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  Zap,
  Radio,
  Share2,
  EyeOff,
  FlameKindling,
  Image as ImageIcon,
  FolderLock,
  FolderOpen,
  Film,
  Eye,
  Maximize2,
  Save,
  Trash2,
  ShieldAlert,
  ShieldOff,
  RefreshCw,
  MapPin,
  MoreVertical,
  Mic,
  Plus,
} from "lucide-react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { WriteTestimonialModal } from "@/components/profile/WriteTestimonialModal";
import { BoundaryManagerModal } from "./BoundaryManagerModal";
import { SendMediaModal } from "./SendMediaModal";
import { ChatMediaViewerModal } from "./ChatMediaViewerModal";
import { ChatVoiceMessageBubble } from "./ChatVoiceMessageBubble";
import { ChatVoiceRecorderInline } from "./ChatVoiceRecorderInline";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { KIND_CLOSURE_MESSAGES } from "@/data/energyCatalog";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { ChatMediaAttachment, ExitProtocol } from "@/types/vessel";
import { PreFlightCard } from "./PreFlightCard";
import { RendezvousSheet } from "./RendezvousSheet";

interface DarkroomChatModalProps {
  profileId: string;
  onClose: () => void;
}

export const DarkroomChatModal: React.FC<DarkroomChatModalProps> = ({
  profileId,
  onClose,
}) => {
  const {
    myProfile,
    profiles,
    chatMessages,
    markMessagesAsRead,
    sendChatMessage,
    sendVoiceMessage,
    sendKindClosureMessage,
    sendRendezvousPin,
    activeRendezvous,
    cancelRendezvousPin,
    sendSecureWaypoint,
    unlockPhase2Waypoint,
    cancelSecureWaypoint,
    burnMessage,
    revokeAlbumAccessInChat,
    unrevokeAlbumAccessInChat,
    validatedEncounters,
    validateEncounter,
    openCreateDiaryModal,
    getBoundaryForProfile,
    getChatRetentionForProfile,
    getProfileDossier,
    toggleChatRetention,
    clearChatHistory,
    openPreFlightModal,
    openEnRouteModal,
    openHostCardModal,
    openSafetyBeaconModal,
    safetyBeacon,
    t,
    language,
    formatDist,
    setSelectedProfile,
  } = useVessel();

  const [inputMessage, setInputMessage] = useState("");
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isBurnMode, setIsBurnMode] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isTogglingRetention, setIsTogglingRetention] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isKindClosureOpen, setIsKindClosureOpen] = useState(false);
  const [isBoundaryModalOpen, setIsBoundaryModalOpen] = useState(false);
  const [showRespectToast, setShowRespectToast] = useState(false);
  const [isTacticalMenuOpen, setIsTacticalMenuOpen] = useState(false);
  const [isRendezvousSheetOpen, setIsRendezvousSheetOpen] = useState(false);
  const [quickBarMode, setQuickBarMode] = useState<"quick" | "antiGhost">("quick");
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);

  // Estado de Waypoint Seguro en 2 Fases
  const [isWaypointModalOpen, setIsWaypointModalOpen] = useState(false);
  const [phase1Corner, setPhase1Corner] = useState("");
  const [phase2Address, setPhase2Address] = useState("");
  const [phase2Notes, setPhase2Notes] = useState("");

  // Estados de Multimedia y Álbumes
  const [isSendMediaModalOpen, setIsSendMediaModalOpen] = useState<boolean>(false);
  const [activeViewerMedia, setActiveViewerMedia] = useState<{
    media: ChatMediaAttachment;
    messageId: string;
    senderCodename: string;
  } | null>(null);
  const [revealedBlurredMediaIds, setRevealedBlurredMediaIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const tacticalMenuRef = useRef<HTMLDivElement | null>(null);

  // Cerrar menú táctico al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tacticalMenuRef.current && !tacticalMenuRef.current.contains(e.target as Node)) {
        setIsTacticalMenuOpen(false);
      }
    };
    if (isTacticalMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTacticalMenuOpen]);

  const isEncounterValidated = !!validatedEncounters[profileId];
  const activeBoundary = getBoundaryForProfile(profileId);
  const dossier = getProfileDossier(profileId);

  const profile = profiles.find((p) => p.id === profileId);
  const currentRetention = profile ? getChatRetentionForProfile(profile.id) : "persistent";
  const messages = chatMessages[profileId] || [];

  // Marcar mensajes como leídos
  useEffect(() => {
    markMessagesAsRead(profileId);
  }, [profileId, messages.length, markMessagesAsRead]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!profile) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || activeBoundary?.chatStatus === "readonly" || activeBoundary?.chatStatus === "disconnected") return;

    setIsSendingMessage(true);
    audioEngine.playPulse();
    sendChatMessage(profileId, inputMessage.trim(), isBurnMode);
    setInputMessage("");
    setTimeout(() => {
      setIsSendingMessage(false);
    }, 450);
  };

  const handleQuickReply = (text: string) => {
    if (activeBoundary?.chatStatus === "readonly" || activeBoundary?.chatStatus === "disconnected") return;
    audioEngine.playPulse();
    sendChatMessage(profileId, text, isBurnMode);
    setIsBurnMode(false);
  };

  const handleSendVoiceMessage = (audioDataUri: string, durationSeconds: number, waveform: number[]) => {
    sendVoiceMessage(profileId, audioDataUri, durationSeconds, waveform, isBurnMode);
    setIsVoiceRecording(false);
    setIsBurnMode(false);
  };

  const handleSendKindClosure = (text: string) => {
    audioEngine.playSuccess();
    sendKindClosureMessage(profileId, text);
    setIsKindClosureOpen(false);
    setShowRespectToast(true);
    setTimeout(() => setShowRespectToast(false), 4000);
  };

  const handleSendPin = () => {
    audioEngine.playSuccess();
    sendRendezvousPin(profileId);
  };

  const handleBurn = (messageId: string) => {
    audioEngine.playError();
    burnMessage(profileId, messageId);
  };

  const quickReplies = [
    t.chat.quickReplyDale,
    t.chat.quickReplyPin,
    t.chat.quickReplyNear,
    t.chat.quickReplyHost,
    t.chat.quickReplyBeer,
    t.chat.quickReplyLooking,
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chat Darkroom con ${profile.codename}`}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex justify-center items-center p-0 md:p-4 select-none animate-in fade-in [overscroll-behavior:contain]"
    >
      <div className="w-full max-w-lg md:max-w-4xl lg:max-w-5xl bg-obsidian-deep h-full md:h-[92vh] md:max-h-[920px] flex flex-row relative border-x md:border border-white/10 md:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden [overscroll-behavior:contain]">
        {/* COLUMNA PRINCIPAL DE MENSAJES Y FLUJO DE CHAT */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          {/* CABECERA TÁCTICA CON JERARQUÍA ELEGANTE Y ACCIONES PRIORIZADAS */}
          <div className="p-2 sm:p-2.5 border-b border-white/10 bg-[#09090B] flex items-center justify-between sticky top-0 z-20 gap-2 select-none shadow-md">
            {/* IDENTIDAD DEL USUARIO (AVATAR + 2 LÍNEAS LIMPIAS CON ACCESO AL PERFIL) */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  onClose();
                }}
                aria-label={t.chat.backToList}
                className="p-1.5 -ml-1 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet cursor-pointer active:scale-95 transition-all flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* AVATAR CON ANILLO DE ESTADO Y TAP PARA VER PERFIL */}
              <div
                onClick={() => {
                  audioEngine.playPulse();
                  setSelectedProfile(profile);
                }}
                className="relative flex-shrink-0 cursor-pointer group"
                title={`Ver perfil de ${profile.codename}`}
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 flex-shrink-0 bg-obsidian-card shadow-sm transition-transform group-hover:scale-105 ${
                    profile.bodyState === "open"
                      ? "border-electricViolet shadow-violet-soft"
                      : profile.bodyState === "occupied"
                      ? "border-bloodNeon shadow-blood-glow"
                      : "border-purple-400/60"
                  }`}
                >
                  <img
                    src={profile.avatarUrl}
                    alt={profile.codename}
                    className={`w-full h-full object-cover ${
                      profile.isFogMode ? "filter blur-[3px] scale-105" : ""
                    }`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {profile.bodyState === "open" && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-mintNeon rounded-full border-2 border-black z-10 animate-pulse" />
                )}
                {profile.bodyState === "occupied" && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-bloodNeon rounded-full border-2 border-black z-10" />
                )}
              </div>

              {/* INFORMACIÓN JERÁRQUICA: 2 LÍNEAS LIMPIAS (CERO COLISIONES) */}
              <div
                onClick={() => {
                  audioEngine.playPulse();
                  setSelectedProfile(profile);
                }}
                className="min-w-0 flex-1 flex flex-col justify-center cursor-pointer group"
                title={`Ver perfil de ${profile.codename}`}
              >
                {/* LÍNEA 1: Identidad Principal, Edad y Verificación */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm sm:text-base font-black text-white tracking-tight leading-tight truncate group-hover:text-electricViolet-glow transition-colors">
                    {dossier?.customAlias || profile.codename}
                  </span>
                  {profile.showAge && (
                    <span className="text-xs text-neutral-400 font-mono font-medium leading-tight flex-shrink-0">
                      · {profile.age}
                    </span>
                  )}
                  {/* Badge de Verificación compacto */}
                  {profile.verification?.isVerified && (
                    <span
                      title="Perfil Verificado 3D Anti-Bot"
                      className="inline-flex items-center flex-shrink-0 text-mintNeon"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 fill-mintNeon/20" />
                    </span>
                  )}
                  {/* Badge Anti-Ghost compacto */}
                  {profile.isAntiGhost && (
                    <span
                      title={`Anti-Ghost // ${profile.respectScore || 98}% Respect Karma`}
                      className="inline-flex items-center flex-shrink-0 text-emerald-400"
                    >
                      <Ghost className="w-3 h-3 stroke-[2.4]" />
                    </span>
                  )}
                </div>

                {/* LÍNEA 2: Logística Inmediata (Rol • Distancia • Hospedaje) */}
                <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5 min-w-0 truncate leading-tight pt-0.5">
                  <span className="text-neutral-200 font-bold truncate">
                    {getRoleDisplayLabel(profile.role, language)}
                  </span>
                  <span className="text-white/20 flex-shrink-0">•</span>
                  <span className="font-mono text-neutral-300 flex-shrink-0">
                    {profile.discretizedDistance?.displayLabel || formatDist(profile.distanceMeters)}
                  </span>
                  <span className="text-white/20 flex-shrink-0">•</span>
                  <span className="text-neutral-300 truncate">
                    {profile.hosting}
                  </span>
                  {profile.onTheClock?.isActive && (
                    <>
                      <span className="text-white/20 flex-shrink-0">•</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow font-mono text-[9px] font-bold flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                        ⚡ YA
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

          {/* CINTA DE ACCIONES TÁCTICAS (Primaria PIN + Menú Flotante) */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 relative" ref={tacticalMenuRef}>
            {/* 0. Botón Unificado Coordinar Cita (RendezvousSheet) */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setIsRendezvousSheetOpen(true);
              }}
              aria-label="Coordinar cita segura"
              className="px-2.5 py-1.5 min-h-[36px] sm:min-h-[38px] flex items-center gap-1.5 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-sm bg-electricViolet text-white hover:bg-electricViolet/90 font-mono text-xs font-bold"
              title="Asistente Integral de Encuentros (Sintonía + Lugar + Guardián SOS)"
            >
              <span className="text-sm leading-none">⚡</span>
              <span className="hidden xs:inline sm:inline">Cita</span>
            </button>

            {/* 1. Botón Rendezvous PIN / Punto de Encuentro (Acción Rápida) */}
            <button
              type="button"
              onClick={handleSendPin}
              aria-label={t.chat.pinTooltip}
              className={`p-1.5 sm:p-2 min-w-[36px] min-h-[36px] sm:min-w-[38px] sm:min-h-[38px] flex items-center justify-center rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-sm ${
                activeRendezvous?.profileId === profile.id
                  ? "bg-bloodNeon/20 border border-bloodNeon/60 text-bloodNeon shadow-[0_0_12px_rgba(230,25,55,0.35)] animate-pulse"
                  : "bg-electricViolet/15 border border-electricViolet/40 text-electricViolet-glow hover:bg-electricViolet hover:text-white"
              }`}
              title={activeRendezvous?.profileId === profile.id ? "Punto de Encuentro Activo // Toca para ver instrucciones" : t.chat.pinTooltip}
            >
              <Navigation className="w-4 h-4 fill-current" />
            </button>

            {/* 2. Botón Menú Táctico Más Acciones [ ⋯ ] */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setIsTacticalMenuOpen(!isTacticalMenuOpen);
              }}
              aria-label="Más herramientas tácticas"
              aria-expanded={isTacticalMenuOpen}
              className={`p-1.5 sm:p-2 min-w-[36px] min-h-[36px] sm:min-w-[38px] sm:min-h-[38px] flex items-center justify-center rounded-full border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 relative ${
                isTacticalMenuOpen
                  ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                  : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
              title="Herramientas tácticas (Pre-Flight, ETA, Guardián, Diario, Límites)"
            >
              <MoreVertical className="w-4 h-4" />
              {safetyBeacon?.isActive && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-bloodNeon rounded-full border border-black animate-ping" />
              )}
            </button>

            {/* POPUP DROPDOWN TÁCTICO FLOTANTE (100% OPACO CON BACKDROP) */}
            {isTacticalMenuOpen && (
              <>
                {/* BACKDROP SCRIM */}
                <div
                  className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
                  onClick={() => setIsTacticalMenuOpen(false)}
                  aria-hidden="true"
                />

                {/* MENÚ FLOTANTE 100% OPACO (#0E0E12) */}
                <div
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 border-2 border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.98)] p-2 space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none text-left"
                  style={{ backgroundColor: "#0E0E12", opacity: 1 }}
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* Encabezado del Menú Táctico */}
                  <div className="px-2.5 py-1 flex items-center justify-between border-b border-white/10 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    <span>Herramientas Tácticas</span>
                    <span className="text-electricViolet-glow font-bold">VESSEL</span>
                  </div>

                  {/* HERO FASE 2: Coordinar Cita (3 en 1) */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsTacticalMenuOpen(false);
                      setIsRendezvousSheetOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-electricViolet/30 to-bloodNeon/20 hover:from-electricViolet/40 hover:to-bloodNeon/30 border border-electricViolet/50 transition-all group cursor-pointer text-left shadow-violet-soft"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-electricViolet text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                        ⚡
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block leading-tight">Coordinar Cita (3 en 1)</span>
                        <span className="text-[10px] text-neutral-300 block leading-tight">Sintonía + Lugar/PIN + Blindaje SOS</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-electricViolet-glow px-1.5 py-0.5 rounded bg-black/40 border border-electricViolet/40 flex-shrink-0">WIZARD</span>
                  </button>

                  {/* 0. Pre-Flight Checklist (Sintonía) */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsTacticalMenuOpen(false);
                      openPreFlightModal(profile);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-electricViolet/10 hover:bg-electricViolet/20 border border-electricViolet/30 hover:border-electricViolet transition-all group cursor-pointer text-left"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow flex items-center justify-center text-sm flex-shrink-0">
                        📋
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block leading-tight">Pre-Flight Checklist</span>
                        <span className="text-[10px] text-neutral-300 block leading-tight">Comprobar sintonía sexual antes de coordinar</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-electricViolet-glow px-1.5 py-0.5 rounded bg-electricViolet/20 border border-electricViolet/40 flex-shrink-0">TEST</span>
                  </button>

                  {/* 1. Guardián Silencioso */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsTacticalMenuOpen(false);
                      openSafetyBeaconModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all group cursor-pointer text-left"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${safetyBeacon?.isActive ? "bg-bloodNeon/30 text-bloodNeon border border-bloodNeon shadow-blood-glow" : "bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/30"}`}>
                        <ShieldCheck className={`w-4 h-4 ${safetyBeacon?.isActive ? "animate-pulse" : ""}`} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block leading-tight">Guardián Silencioso</span>
                        <span className="text-[10px] text-neutral-400 block leading-tight">Dead-Man Switch para citas</span>
                      </div>
                    </div>
                    {safetyBeacon?.isActive ? (
                      <span className="text-[9px] font-mono font-bold text-bloodNeon px-2 py-0.5 rounded bg-bloodNeon/25 border border-bloodNeon/50 flex-shrink-0">ACTIVO</span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-mono flex-shrink-0">Timer</span>
                    )}
                  </button>

                  {/* 2. Voy en Camino (ETA) */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsTacticalMenuOpen(false);
                      openEnRouteModal(profile);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all group cursor-pointer text-left"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center text-sm flex-shrink-0">
                        🚗
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block leading-tight">Avisar "Voy en camino"</span>
                        <span className="text-[10px] text-neutral-400 block leading-tight">Compartir tiempo de llegada estimado</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono flex-shrink-0">ETA</span>
                  </button>

                  {/* 3. Salida Amable No-Ghost */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsTacticalMenuOpen(false);
                      setIsKindClosureOpen(!isKindClosureOpen);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-500/50 transition-all group cursor-pointer text-left"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Ghost className="w-4 h-4 stroke-[2.3]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-emerald-300 block leading-tight">Salida Amable No-Ghost</span>
                        <span className="text-[10px] text-neutral-300 block leading-tight">Despedida con onda sin clavar visto</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/25 border border-emerald-500/40 flex-shrink-0">+5 Karma</span>
                  </button>

                  {/* 4. Documentar en Diario */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsTacticalMenuOpen(false);
                      openCreateDiaryModal(profile.id);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all group cursor-pointer text-left"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-white/10 text-neutral-200 flex items-center justify-center text-sm flex-shrink-0">
                        📓
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block leading-tight">Anotar en Mi Diario</span>
                        <span className="text-[10px] text-neutral-400 block leading-tight">Registro privado y seguro de citas</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono flex-shrink-0">Privado</span>
                  </button>

                  {/* 5. Gestión de Límites */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsTacticalMenuOpen(false);
                      setIsBoundaryModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-950/60 border border-purple-500/30 hover:border-purple-500/50 transition-all group cursor-pointer text-left"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 stroke-[2.3]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-purple-300 block leading-tight">Límites & Desconexión</span>
                        <span className="text-[10px] text-neutral-300 block leading-tight">Silenciar o desconectar contacto</span>
                      </div>
                    </div>
                    {activeBoundary && (
                      <span className="text-[9px] font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/25 border border-purple-500/40 flex-shrink-0">
                        {activeBoundary.chatStatus}
                      </span>
                    )}
                  </button>

                  <div className="border-t border-white/10 my-1" />

                  {/* 6. Validar / Testimonio */}
                  {isEncounterValidated ? (
                    <button
                      type="button"
                      onClick={() => {
                        audioEngine.playPulse();
                        setIsTacticalMenuOpen(false);
                        setIsWriteModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-electricViolet/15 hover:bg-electricViolet/25 border border-electricViolet/30 transition-all cursor-pointer text-left"
                      role="menuitem"
                    >
                      <div className="w-8 h-8 rounded-lg bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow flex items-center justify-center flex-shrink-0">
                        <MessageSquareHeart className="w-4 h-4 text-electricViolet-glow" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-electricViolet-glow block leading-tight">Dejar Testimonio & Reseña</span>
                        <span className="text-[10px] text-neutral-300 block leading-tight">Compartir feedback recíproco</span>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        audioEngine.playSuccess();
                        setIsTacticalMenuOpen(false);
                        validateEncounter(profile.id, "chat_agreement");
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all cursor-pointer text-left"
                      role="menuitem"
                    >
                      <div className="w-8 h-8 rounded-lg bg-mintNeon/20 border border-mintNeon/40 text-mintNeon flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-mintNeon" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block leading-tight">Validar Encuentro Mutuo</span>
                        <span className="text-[10px] text-neutral-400 block leading-tight">Confirmar encuentro presencial</span>
                      </div>
                    </button>
                  )}

                  {/* 7. Limpiar Historial */}
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTacticalMenuOpen(false);
                        if (window.confirm(t.chat.clearHistoryConfirm)) {
                          clearChatHistory(profile.id);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-bloodNeon/10 hover:bg-bloodNeon/20 border border-bloodNeon/25 transition-all cursor-pointer text-left"
                      role="menuitem"
                    >
                      <div className="w-8 h-8 rounded-lg bg-bloodNeon/20 border border-bloodNeon/40 text-bloodNeon flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-4 h-4 text-bloodNeon" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-bloodNeon block leading-tight">{t.chat.clearHistoryBtn || "Limpiar Chat"}</span>
                        <span className="text-[10px] text-bloodNeon/70 block leading-tight">Purgar todos los mensajes</span>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* TOAST DE RECOMPENSA DE RESPETO */}
        {showRespectToast && (
          <div className="absolute top-16 left-3 right-3 z-30 bg-mintNeon text-obsidian-deep px-4 py-3 rounded-2xl shadow-mint-glow flex items-center justify-between animate-in slide-in-from-top duration-300 border border-mintNeon">
            <div className="flex items-center gap-2.5">
              <Ghost className="w-5 h-5 stroke-[2.5]" />
              <div>
                <span className="text-xs font-black block leading-tight tracking-wide uppercase">
                  {t.chat.karmaToast}
                </span>
                <span className="text-[10px] font-semibold opacity-90 block">
                  Tu puntuación de Karma y visibilidad en el radar aumentaron.
                </span>
              </div>
            </div>
            <Zap className="w-4 h-4 fill-obsidian-deep" />
          </div>
        )}

        {/* BANNER DE SALIDAS AMABLES & SEXY (ANTI-GHOST) */}
        {isKindClosureOpen && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 p-3.5 space-y-2.5 animate-in slide-in-from-top-2 z-10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wide">
                <Ghost className="w-4 h-4 stroke-[2.5]" />
                <span>Salida Amable & Sexy // Modo Anti-Ghost</span>
              </div>
              <button
                type="button"
                onClick={() => setIsKindClosureOpen(false)}
                className="p-1 rounded-full text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-300 leading-relaxed">
              ¿No hay chispa o seguís de largo? Elegí una salida con onda en 1 toque. Sumás <strong>+5 Respect Karma</strong> y mantenés la cultura del respeto.
            </p>

            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {KIND_CLOSURE_MESSAGES.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleSendKindClosure(msg.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-black/60 hover:bg-emerald-500/20 border border-emerald-500/30 text-white text-xs flex items-start gap-2.5 transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-[0.98]"
                >
                  <span className="text-base flex-shrink-0">{msg.emoji}</span>
                  <div className="min-w-0">
                    <span className="font-bold text-emerald-300 block text-[11px]">
                      {msg.title}
                    </span>
                    <span className="text-neutral-200 text-[11px] leading-tight block group-hover:text-white">
                      "{msg.text}"
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BANNER DE PUNTO DE ENCUENTRO ACTIVO CON ACCIÓN DE ANULAR */}
        {activeRendezvous?.profileId === profile.id && (
          <div className="bg-bloodNeon/15 border-b border-bloodNeon/50 p-3.5 space-y-2.5 animate-in slide-in-from-top-2 z-10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-bloodNeon font-black text-xs uppercase tracking-wide">
                <Navigation className="w-4 h-4 animate-pulse" />
                <span>Punto de Encuentro Activo</span>
                <span className="w-2 h-2 rounded-full bg-bloodNeon animate-ping" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Estás seguro de anular este Punto de Encuentro?")) {
                    cancelRendezvousPin(profile.id);
                  }
                }}
                className="px-3 py-1 bg-bloodNeon hover:bg-bloodNeon/80 text-white rounded-xl text-[11px] font-mono font-bold uppercase transition-all shadow-blood-glow flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>Anular Encuentro</span>
              </button>
            </div>

            <div className="bg-black/60 p-2.5 rounded-xl border border-bloodNeon/30 text-xs font-mono flex items-center justify-between">
              <span className="text-neutral-200 truncate pr-2">
                📍 {activeRendezvous.instructions}
              </span>
              <span className="text-white font-mono font-bold flex-shrink-0">
                ~{activeRendezvous.distanceMeters} m
              </span>
            </div>
          </div>
        )}

        {/* BARRA REFINADA: CANAL CIFRADO EFÍMERO / PERSISTENTE CON MICRO-INTERACCIÓN */}
        <div className="px-3.5 py-1.5 border-b border-white/10 bg-[#0B0B0E] backdrop-blur-md z-10 flex-shrink-0 flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1 rounded-lg border ${
              currentRetention === "persistent"
                ? "bg-mintNeon/10 border-mintNeon/30 text-mintNeon"
                : "bg-electricViolet/10 border-electricViolet/30 text-electricViolet-glow"
            }`}>
              {currentRetention === "persistent" ? (
                <Save className={`w-3.5 h-3.5 ${isTogglingRetention ? "animate-lock-rotate" : ""}`} />
              ) : (
                <Lock className={`w-3.5 h-3.5 ${isTogglingRetention ? "animate-lock-rotate" : ""}`} />
              )}
            </div>
            <div className="text-[11px] font-mono truncate">
              <span className={currentRetention === "persistent" ? "text-mintNeon font-bold" : "text-white font-bold"}>
                {currentRetention === "persistent" ? t.chat.persistentChannel : t.chat.ephemeralChannel}
              </span>
              <span className="text-neutral-400 text-[10px] hidden sm:inline ml-1.5">
                · {currentRetention === "persistent" ? t.chat.persistentNotice : t.chat.ephemeralNotice}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsTogglingRetention(true);
              audioEngine.playVaultUnlock();
              toggleChatRetention(profile.id);
              setTimeout(() => setIsTogglingRetention(false), 450);
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 flex-shrink-0 border shadow-sm ${
              currentRetention === "persistent"
                ? "bg-mintNeon/15 border-mintNeon/40 text-mintNeon hover:bg-mintNeon/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                : "bg-electricViolet/15 border-electricViolet/40 text-electricViolet-glow hover:bg-electricViolet/25 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
            }`}
          >
            {isTogglingRetention ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>MODO...</span>
              </span>
            ) : (
              <span>{currentRetention === "persistent" ? "EFÍMERO" : "GUARDAR"}</span>
            )}
          </button>
        </div>

        {/* ZONA DE MENSAJES SENSORIAL */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-obsidian-deep via-[#070709] to-obsidian-deep overscroll-contain">
          {messages.map((msg) => {
            const isMe = msg.senderId === "me";
            const isSystem = msg.senderId === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="w-full my-2">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-300 font-mono font-bold block">
                      {msg.text}
                    </span>
                  </div>
                </div>
              );
            }

            {/* TARJETA TÁCTICA PRE-FLIGHT CHECKLIST */}
            if (msg.isPreFlightChecklist && msg.preFlightData) {
              return (
                <div key={msg.id} className={`w-full my-3 flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <PreFlightCard data={msg.preFlightData} isCurrentUser={isMe} />
                </div>
              );
            }

            {/* TARJETA TÁCTICA DE PUNTO DE ENCUENTRO */}
            if (msg.isRendezvousPin && msg.rendezvousData) {
              const isCancelled =
                msg.isCancelledRendezvous ||
                !activeRendezvous ||
                activeRendezvous.id !== msg.rendezvousData.id;

              return (
                <div key={msg.id} className="w-full my-3">
                  <div
                    className={`rounded-2xl border-2 p-4 space-y-2.5 relative overflow-hidden transition-all ${
                      isCancelled
                        ? "bg-obsidian border-white/10 opacity-70"
                        : "bg-obsidian-surface border-bloodNeon/60 shadow-[0_0_25px_rgba(230,25,55,0.2)]"
                    }`}
                  >
                    {!isCancelled && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-bloodNeon/10 rounded-full blur-2xl pointer-events-none" />
                    )}
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div
                        className={`flex items-center gap-2 font-black text-xs uppercase tracking-wider ${
                          isCancelled ? "text-neutral-400" : "text-bloodNeon"
                        }`}
                      >
                        <Navigation className={`w-4 h-4 ${!isCancelled ? "animate-pulse" : ""}`} />
                        <span>
                          {isCancelled
                            ? "Punto de Encuentro Anulado"
                            : t.chat.rendezvousTitle}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] flex items-center gap-1 font-mono font-bold ${
                          isCancelled ? "text-neutral-500" : "text-bloodNeon"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{isCancelled ? "Anulado" : t.chat.expiresIn15}</span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed font-sans ${isCancelled ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                      {msg.rendezvousData.instructions}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[11px] font-mono font-bold ${isCancelled ? "text-neutral-500" : "text-electricViolet-glow"}`}>
                        {t.chat.estimatedDist}: {msg.rendezvousData.distanceMeters} m
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                          isCancelled
                            ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                            : "bg-bloodNeon/20 text-bloodNeon border-bloodNeon/40"
                        }`}
                      >
                        {isCancelled ? "ANULADO" : "DOBLE CONSENTIMIENTO"}
                      </span>
                    </div>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("¿Deseas anular este Punto de Encuentro?")) {
                            cancelRendezvousPin(profile.id);
                          }
                        }}
                        className="w-full mt-2 py-2 px-3 bg-bloodNeon/15 hover:bg-bloodNeon hover:text-white text-bloodNeon border border-bloodNeon/40 rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Anular Punto de Encuentro</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            {/* TARJETA DE WAYPOINT SEGURO EN 2 FASES */}
            if (msg.isSecureWaypoint && msg.waypointData) {
              const waypoint = msg.waypointData;
              const isReceiver = !isMe;

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} my-2 w-full`}>
                  <div className="w-full max-w-sm rounded-2xl bg-obsidian-surface border-2 border-electricViolet/50 p-4 space-y-3 shadow-violet-soft">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2 text-electricViolet-glow font-mono font-bold text-xs uppercase">
                        <MapPin className="w-4 h-4 text-electricViolet animate-pulse" />
                        <span>Waypoint Seguro // 2 Fases</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          waypoint.isPhase2Unlocked
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-purple-950/50 text-electricViolet-glow border border-electricViolet/40"
                        }`}
                      >
                        {waypoint.isPhase2Unlocked ? "🔓 FASE 2 LIBERADA" : "🔒 FASE 1 ACTIVA"}
                      </span>
                    </div>

                    {/* FASE 1: Esquina de Aproximación Pública */}
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1">
                      <div className="text-[10px] font-mono text-electricViolet-glow font-bold uppercase flex items-center gap-1">
                        <span>📍 FASE 1: PUNTO DE ENCUENTRO PÚBLICO</span>
                      </div>
                      <p className="text-xs font-mono text-white">
                        {waypoint.phase1PublicCorner}
                      </p>
                    </div>

                    {/* FASE 2: Domicilio Exacto */}
                    <div
                      className={`p-2.5 rounded-xl border transition-all ${
                        waypoint.isPhase2Unlocked
                          ? "bg-emerald-950/40 border-emerald-500/40 space-y-1 text-emerald-200"
                          : "bg-neutral-900/60 border-dashed border-white/20 text-neutral-400"
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
                        {waypoint.isPhase2Unlocked ? (
                          <>
                            <span className="text-emerald-400">🔓</span>
                            <span className="text-emerald-300">FASE 2: PISO, DEPTO & TIMBRE</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>FASE 2: DOMICILIO EXACTO (BLOQUEADO)</span>
                          </>
                        )}
                      </div>

                      {waypoint.isPhase2Unlocked ? (
                        <div className="space-y-1">
                          <p className="text-xs font-mono font-bold text-white">
                            {waypoint.phase2ExactAddress}
                          </p>
                          {waypoint.phase2AccessNotes && (
                            <p className="text-[11px] text-neutral-300 font-mono">
                              Nota: {waypoint.phase2AccessNotes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {isReceiver
                            ? "El piso y timbre se desbloquearán cuando confirmes que estás en la esquina."
                            : "Tu dirección exacta se revelará cuando la otra persona arribe a la esquina."}
                        </p>
                      )}
                    </div>

                    {/* Acción para el receptor si no está desbloqueado */}
                    {isReceiver && !waypoint.isPhase2Unlocked && (
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          unlockPhase2Waypoint(waypoint.id, profile.id);
                        }}
                        className="w-full py-2 px-3 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-extrabold text-xs rounded-xl transition-all shadow-violet-glow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>YA ESTOY EN LA ESQUINA (VER PISO)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            {/* ALERTA DE EXPOSICIÓN A ITS ANÓNIMA */}
            if (msg.isItsExposureAlert && msg.itsExposureData) {
              const alert = msg.itsExposureData;

              return (
                <div key={msg.id} className="w-full my-2 flex justify-center">
                  <div className="w-full max-w-sm rounded-2xl bg-red-950/70 border-2 border-red-500/70 p-4 space-y-2.5 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <div className="flex items-center gap-2 text-red-300 font-mono font-bold text-xs uppercase border-b border-red-500/30 pb-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                      <span>Alerta Médica Preventiva // 100% Anónima</span>
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed font-mono">
                      Un contacto reciente de tu historial reportó un diagnóstico clínico de:{" "}
                      <strong className="text-red-300 uppercase">{alert.conditionLabel}</strong> ({alert.diagnosedDate}).
                    </p>

                    <div className="p-2.5 rounded-xl bg-black/60 border border-red-500/30 text-[10px] text-neutral-300 font-mono">
                      Recomendamos realizarte un chequeo serológico o consultar con un centro de salud. Tu identidad y la del remitente están totalmente protegidas.
                    </div>
                  </div>
                </div>
              );
            }

            {/* TARJETA DE MENSAJE DE VOZ */}
            if (msg.isVoiceMessage) {
              const safeVoiceData = msg.voiceData || {
                audioUrl: msg.mediaUrl || "",
                durationSeconds: 5,
                waveform: [30, 50, 70, 40, 60, 80, 50, 40, 30, 60, 45, 35],
              };
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} my-2`}>
                  <ChatVoiceMessageBubble
                    messageId={msg.id}
                    voiceData={safeVoiceData}
                    isMine={isMe}
                    isBurnOnView={msg.isBurnOnView}
                    isBurned={msg.isBurned}
                    timestamp={msg.timestamp}
                    onBurn={handleBurn}
                  />
                </div>
              );
            }

            {/* TARJETA DE MENSAJE O ARCHIVO ADJUNTO */}
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs transition-all relative ${
                    isMe
                      ? msg.isKindClosure
                        ? "bg-emerald-500/20 border border-emerald-500/50 text-white rounded-br-none shadow-sm"
                        : msg.isBurnOnView
                        ? "bg-bloodNeon/20 border-2 border-bloodNeon/70 text-white rounded-br-none shadow-[0_0_15px_rgba(230,25,55,0.25)]"
                        : msg.mediaAttachment
                        ? "bg-obsidian-surface border border-electricViolet/40 text-white rounded-br-none shadow-violet-soft"
                        : "bg-electricViolet text-white font-medium rounded-br-none shadow-violet-soft"
                      : msg.isKindClosure
                      ? "bg-emerald-950/60 border border-emerald-500/40 text-white rounded-bl-none"
                      : msg.isBurnOnView
                      ? "bg-bloodNeon/15 border-2 border-bloodNeon/60 text-white rounded-bl-none shadow-[0_0_15px_rgba(230,25,55,0.2)]"
                      : "bg-obsidian-surface border border-white/10 text-white rounded-bl-none shadow-sm"
                  }`}
                >
                  {/* HEADER PARA SALIDAS AMABLES */}
                  {msg.isKindClosure && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-black mb-1 uppercase tracking-wide">
                      <Ghost className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t.chat.kindClosureTooltip}</span>
                    </div>
                  )}

                  {/* HEADER PARA MENSAJES BURN-ON-VIEW */}
                  {msg.isBurnOnView && (
                    <div className="flex items-center justify-between gap-2 text-[10px] text-bloodNeon font-black mb-1.5 uppercase tracking-wide border-b border-bloodNeon/30 pb-1">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 animate-pulse" />
                        {t.chat.burnTitle}
                      </span>
                      <span className="font-mono text-[9px] text-neutral-300">
                        {t.chat.burnNotice}
                      </span>
                    </div>
                  )}

                  {/* 1. RENDERIZADO DE ÁLBUM COMPARTIDO */}
                  {msg.mediaAttachment?.sharedAlbumId ? (() => {
                    const isRevoked = Boolean(msg.isRevoked || msg.mediaAttachment.isRevoked);
                    const albumId = msg.mediaAttachment.sharedAlbumId;

                    return (
                      <div className="space-y-2.5 my-1">
                        {/* Cabecera del Álbum */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                          <div className="flex items-center gap-1.5 text-electricViolet-glow font-mono text-[11px] font-bold min-w-0 truncate">
                            {isRevoked ? (
                              <FolderLock className="w-3.5 h-3.5 text-bloodNeon flex-shrink-0" />
                            ) : msg.mediaAttachment.albumPrivacy === "private" ? (
                              <FolderLock className="w-3.5 h-3.5 flex-shrink-0" />
                            ) : (
                              <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            <span className={`uppercase truncate ${isRevoked ? "line-through text-neutral-400" : ""}`}>
                              {msg.mediaAttachment.albumTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isRevoked ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 font-bold uppercase">
                                {t.chat.albumRevokedBadge || "REVOCADO"}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40 font-bold">
                                {msg.mediaAttachment.albumPhotoCount} {t.chat.photosCount}
                              </span>
                            )}

                            {/* Botón de Dejar de Compartir en este chat para el propietario */}
                            {isMe && !isRevoked && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  revokeAlbumAccessInChat(profile.id, albumId, msg.id);
                                }}
                                className="px-2 py-0.5 rounded-lg bg-bloodNeon/15 hover:bg-bloodNeon/30 text-bloodNeon border border-bloodNeon/40 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm"
                                title={t.chat.revokeSharingInChat || "Dejar de compartir este álbum en esta conversación"}
                              >
                                <ShieldOff className="w-3 h-3" />
                                <span>{t.chat.revokeSharing || "Dejar de compartir"}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {isRevoked ? (
                          /* Tarjeta de Estado Revocado */
                          <div className="p-3.5 rounded-xl bg-black/60 border border-bloodNeon/30 flex flex-col items-center justify-center text-center space-y-2.5">
                            <div className="p-2 rounded-xl bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/30">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-mono font-bold text-neutral-200 block uppercase tracking-wider">
                                {isMe
                                  ? (t.chat.albumRevokedSenderNotice || "Dejaste de compartir este álbum en este chat")
                                  : (t.chat.albumRevokedReceiverNotice || "Acceso Revocado por el Remitente")}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-500 block">
                                {isMe
                                  ? "El destinatario ya no puede ver las fotos ni videos."
                                  : "Esta galería ya no está disponible para su visualización."}
                              </span>
                            </div>

                            {/* Acción para re-compartir si es el dueño */}
                            {isMe ? (
                              <button
                                type="button"
                                onClick={() => unrevokeAlbumAccessInChat(profile.id, albumId, msg.id)}
                                className="px-3 py-1.5 rounded-lg bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-violet-soft"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>{t.chat.reshareAlbumInChat || "Volver a compartir"}</span>
                              </button>
                            ) : (
                              <div className="w-full py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-neutral-500 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed">
                                <Lock className="w-3 h-3" />
                                <span>{t.chat.accessRevoked || "Acceso no disponible"}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Renderizado Activo Normal con Preview Grid y Botón */
                          <>
                            <div
                              onClick={() => {
                                audioEngine.playVaultUnlock();
                                setActiveViewerMedia({
                                  media: msg.mediaAttachment!,
                                  messageId: msg.id,
                                  senderCodename: isMe ? "Vos" : profile.codename,
                                });
                              }}
                              className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden cursor-pointer group relative border border-white/10 bg-black/40 hover:border-electricViolet/60 transition-all"
                            >
                              {(msg.mediaAttachment.albumPhotosPreview || [msg.mediaAttachment.url]).slice(0, 4).map((url, pIdx) => (
                                <div key={pIdx} className="aspect-square bg-obsidian-deep overflow-hidden relative">
                                  <img
                                    src={url}
                                    alt="Álbum"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                </div>
                              ))}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white font-mono text-xs font-bold transition-opacity backdrop-blur-[2px]">
                                <Maximize2 className="w-4 h-4 text-electricViolet-glow" />
                                <span>{t.chat.viewFullAlbum}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                audioEngine.playVaultUnlock();
                                setActiveViewerMedia({
                                  media: msg.mediaAttachment!,
                                  messageId: msg.id,
                                  senderCodename: isMe ? "Vos" : profile.codename,
                                });
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-violet-soft active:scale-98"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              {t.chat.viewFullAlbum}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })() : msg.mediaAttachment ? (
                    /* 2. RENDERIZADO DE FOTO / VIDEO INDIVIDUAL SEGÚN MODO */
                    <div className="space-y-2 my-1">
                      {msg.mediaAttachment.mode === "view_once" ? (
                        /* VISTA ÚNICA (VIEW-ONCE) */
                        msg.isBurned ? (
                          <div className="py-2 px-3 rounded-xl bg-bloodNeon/10 border border-bloodNeon/40 text-bloodNeon-300 font-mono text-[11px] flex items-center gap-2">
                            <Flame className="w-4 h-4 text-bloodNeon" />
                            <span>{t.chat.viewOnceBurned}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playPulse();
                              setActiveViewerMedia({
                                media: msg.mediaAttachment!,
                                messageId: msg.id,
                                senderCodename: isMe ? "Vos" : profile.codename,
                              });
                            }}
                            className="w-full py-3 px-4 rounded-xl bg-bloodNeon/20 hover:bg-bloodNeon/30 border-2 border-bloodNeon/70 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(230,25,55,0.3)] animate-pulse"
                          >
                            <Flame className="w-4 h-4 text-bloodNeon" />
                            <span>{t.chat.viewOnceNotice}</span>
                          </button>
                        )
                      ) : msg.mediaAttachment.mode === "privacy_blur" ? (
                        /* PRIVACY BLUR (DESENFOCADO) */
                        <div className="relative rounded-xl overflow-hidden border border-purple-500/40 bg-black group">
                          {revealedBlurredMediaIds[msg.id] ? (
                            <img
                              src={msg.mediaAttachment.url}
                              alt="Contenido"
                              onClick={() =>
                                setActiveViewerMedia({
                                  media: msg.mediaAttachment!,
                                  messageId: msg.id,
                                  senderCodename: isMe ? "Vos" : profile.codename,
                                })
                              }
                              className="w-full max-h-56 object-cover cursor-pointer hover:scale-105 transition-transform"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              onClick={() => {
                                audioEngine.playPulse();
                                setRevealedBlurredMediaIds((prev) => ({
                                  ...prev,
                                  [msg.id]: true,
                                }));
                              }}
                              className="relative cursor-pointer"
                            >
                              <img
                                src={msg.mediaAttachment.url}
                                alt="Contenido protegido"
                                className="w-full max-h-56 object-cover filter blur-2xl scale-110"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="absolute inset-0 bg-obsidian-950/70 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                                <EyeOff className="w-6 h-6 text-purple-400 animate-pulse" />
                                <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                                  {t.chat.tapToReveal}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* PERMANENTE O EXPIRACIÓN */
                        <div
                          onClick={() => {
                            audioEngine.playPulse();
                            setActiveViewerMedia({
                              media: msg.mediaAttachment!,
                              messageId: msg.id,
                              senderCodename: isMe ? "Vos" : profile.codename,
                            });
                          }}
                          className="relative rounded-xl overflow-hidden border border-white/15 bg-black cursor-pointer group"
                        >
                          {msg.mediaAttachment.mediaType === "video" ? (
                            <div className="relative">
                              <video
                                src={msg.mediaAttachment.url}
                                className="w-full max-h-56 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                <Film className="w-8 h-8 text-electricViolet-glow" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={msg.mediaAttachment.url}
                              alt="Foto adjunta"
                              className="w-full max-h-56 object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          <div className="absolute bottom-2 right-2 p-1 rounded bg-obsidian-950/80 text-electricViolet-glow border border-electricViolet/40">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* TEXTO DEL MENSAJE O EPÍGRAFE */}
                  {msg.text && (
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                  )}

                  {/* BOTÓN DESTRUCTOR PARA MENSAJES BURN-ON-VIEW RECIBIDOS */}
                  {msg.isBurnOnView && !msg.isBurned && !isMe && (
                    <div className="mt-2.5 pt-2 border-t border-bloodNeon/30 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleBurn(msg.id)}
                        className="py-1 px-3 bg-bloodNeon hover:bg-bloodNeon-glow text-white text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-blood-glow transition-all active:scale-95 cursor-pointer"
                      >
                        <Flame className="w-3 h-3" />
                        <span>{t.chat.destroyNow}</span>
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-neutral-500 mt-1 px-1 font-mono font-medium">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* BARRA TÁCTICA UNIFICADA (RESPUESTAS RÁPIDAS + SALIDAS ANTI-GHOST) */}
        {activeBoundary?.chatStatus !== "readonly" && activeBoundary?.chatStatus !== "disconnected" && (
          <div className="px-2.5 py-1.5 bg-obsidian-surface/90 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none">
            {quickBarMode === "quick" ? (
              <>
                {/* Switcher a modo Anti-Ghost (+5 Karma) */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setQuickBarMode("antiGhost");
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95 shadow-sm"
                  title="Cambiar a Salidas Respetuosas Anti-Ghost (+5 Karma)"
                >
                  <Ghost className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>NO-GHOST (+5)</span>
                </button>

                <span className="w-[1px] h-3.5 bg-white/15 flex-shrink-0" />

                {/* Chips de Respuesta Relámpago */}
                {quickReplies.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickReply(chip)}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-electricViolet/15 border border-white/10 hover:border-electricViolet/50 text-[10px] font-mono text-neutral-300 hover:text-electricViolet-glow whitespace-nowrap transition-all active:scale-95 cursor-pointer flex-shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </>
            ) : (
              <>
                {/* Switcher para volver a Respuestas Rápidas */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setQuickBarMode("quick");
                  }}
                  className="px-2.5 py-1 rounded-full bg-electricViolet/20 hover:bg-electricViolet/30 border border-electricViolet/40 hover:border-electricViolet text-electricViolet-glow text-[10px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95 shadow-sm"
                  title="Volver a Respuestas Rápidas Relámpago"
                >
                  <Zap className="w-3 h-3 text-electricViolet-glow fill-current flex-shrink-0" />
                  <span>RÁPIDAS</span>
                </button>

                <span className="w-[1px] h-3.5 bg-white/15 flex-shrink-0" />

                {/* Chips de Salida Elegante Anti-Ghost (+5 Respect Karma) */}
                {KIND_CLOSURE_MESSAGES.map((km) => (
                  <button
                    key={km.id}
                    type="button"
                    onClick={() => handleSendKindClosure(km.text)}
                    className="px-2.5 py-1 rounded-full bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-500/60 text-[10px] text-neutral-200 hover:text-emerald-300 font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 flex-shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                    title={`Enviar: "${km.text}" (+5 Respect Karma)`}
                  >
                    <span className="text-xs">{km.emoji}</span>
                    <span>{km.title}</span>
                  </button>
                ))}

                {/* Botón para abrir el panel explicativo completo */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setIsKindClosureOpen(!isKindClosureOpen);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-neutral-400 hover:text-white whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
                  title="Ver detalles y guía de salida respetuosa"
                >
                  + Info
                </button>
              </>
            )}
          </div>
        )}

        {/* CONTROL DE INPUT BAR SEGÚN PROTOCOLO DE LÍMITES */}
        {activeBoundary?.chatStatus === "readonly" ? (
          <div className="flex-shrink-0 sticky bottom-0 z-20 p-3.5 border-t border-purple-500/30 bg-purple-950/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>{t.chat.readonlyTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBoundaryModalOpen(true)}
                className="text-[10px] text-electricViolet-glow hover:underline font-bold"
              >
                {t.chat.manageLimits}
              </button>
            </div>
            <p className="text-[11px] text-neutral-300 leading-tight">
              {t.chat.readonlyDesc}
            </p>
          </div>
        ) : activeBoundary?.chatStatus === "disconnected" ? (
          <div className="flex-shrink-0 sticky bottom-0 z-20 p-3.5 border-t border-bloodNeon/30 bg-bloodNeon/10 space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-bloodNeon">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.chat.disconnectedTitle}</span>
            </div>
            <p className="text-[10px] text-neutral-400">
              {t.chat.disconnectedDesc}
            </p>
            <button
              type="button"
              onClick={() => setIsBoundaryModalOpen(true)}
              className="text-[10px] text-neutral-300 hover:text-white underline font-semibold mt-1"
            >
              {t.chat.restoreConnection}
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 sticky bottom-0 z-20 flex flex-col border-t border-white/10 bg-obsidian-surface">
            {isVoiceRecording ? (
              <div className="pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] w-full">
                <ChatVoiceRecorderInline
                  onSend={handleSendVoiceMessage}
                  onCancel={() => setIsVoiceRecording(false)}
                  isBurnMode={isBurnMode}
                />
              </div>
            ) : (
            <div className="flex flex-col">
              {/* Drawer Táctico Desplegable del Botón + */}
              {isPlusMenuOpen && (
                <div className="p-2.5 sm:p-3 bg-[#0c0c10] border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in slide-in-from-bottom-2 duration-150">
                  {/* 1. Coordinar Cita Segura */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsPlusMenuOpen(false);
                      setIsRendezvousSheetOpen(true);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-electricViolet/15 border border-electricViolet/30 text-white hover:bg-electricViolet/25 transition-all text-left cursor-pointer active:scale-95"
                  >
                    <div className="p-1.5 rounded-lg bg-electricViolet/20 text-electricViolet-glow flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-mono font-bold uppercase truncate text-white">Coordinar Cita</span>
                      <span className="text-[9px] text-neutral-400 truncate">Punto seguro & Yendo</span>
                    </div>
                  </button>

                  {/* 2. Mensaje Efímero (Burn-on-View) */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playStateSwitch("occupied");
                      setIsBurnMode(!isBurnMode);
                      setIsPlusMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left cursor-pointer active:scale-95 ${
                      isBurnMode
                        ? "bg-bloodNeon/25 border-bloodNeon text-bloodNeon shadow-blood-glow"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${isBurnMode ? "bg-bloodNeon/30 text-white" : "bg-white/5 text-bloodNeon"}`}>
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-mono font-bold uppercase truncate">
                        {isBurnMode ? "Efímero: ON" : "Modo Efímero"}
                      </span>
                      <span className="text-[9px] text-neutral-400 truncate">1 sola vista</span>
                    </div>
                  </button>

                  {/* 3. Pre-Flight Checklist (Sintonía) */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsPlusMenuOpen(false);
                      openPreFlightModal(profile);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-left cursor-pointer active:scale-95"
                  >
                    <div className="p-1.5 rounded-lg bg-white/5 text-amber-300 flex-shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-mono font-bold uppercase truncate">Pre-Flight</span>
                      <span className="text-[9px] text-neutral-400 truncate">Sintonía erótica</span>
                    </div>
                  </button>

                  {/* 4. Guardián Silencioso */}
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsPlusMenuOpen(false);
                      openSafetyBeaconModal();
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 hover:bg-red-950/40 transition-all text-left cursor-pointer active:scale-95"
                  >
                    <div className="p-1.5 rounded-lg bg-red-950/40 text-bloodNeon flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-mono font-bold uppercase truncate">Guardián SOS</span>
                      <span className="text-[9px] text-neutral-400 truncate">Dead-man switch</span>
                    </div>
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSend}
                className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
              >
                {/* BOTÓN + (MENÚ TÁCTICO) */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setIsPlusMenuOpen(!isPlusMenuOpen);
                  }}
                  aria-label="Menú de herramientas tácticas"
                  aria-expanded={isPlusMenuOpen}
                  className={`p-2 min-w-[38px] sm:min-w-[42px] min-h-[38px] sm:min-h-[42px] flex items-center justify-center rounded-2xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0 ${
                    isPlusMenuOpen
                      ? "bg-electricViolet text-white border-electricViolet shadow-violet-glow"
                      : isBurnMode
                      ? "bg-bloodNeon/20 border-bloodNeon text-bloodNeon shadow-blood-glow"
                      : "border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10"
                  }`}
                  title="Herramientas tácticas (+)"
                >
                  <Plus className={`w-4 h-4 transition-transform duration-200 ${isPlusMenuOpen ? "rotate-45" : ""}`} />
                </button>

                {/* BOTÓN ADJUNTAR FOTO / VIDEO / ÁLBUM */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setIsSendMediaModalOpen(true);
                  }}
                  aria-label={t.chat.attachMediaTooltip}
                  className="p-2 min-w-[38px] sm:min-w-[42px] min-h-[38px] sm:min-h-[42px] flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:text-electricViolet-glow hover:border-electricViolet/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0"
                  title={t.chat.attachMediaTooltip}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* INPUT DE TEXTO BRUTALISTA AMPLIO */}
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    aria-label="Escribir mensaje"
                    placeholder={
                      activeBoundary?.chatStatus === "muted"
                        ? t.chat.mutedPlaceholder
                        : isBurnMode
                        ? t.chat.burnModeActive
                        : t.chat.normalPlaceholder || "Escribí algo piola..."
                    }
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className={`w-full bg-black/50 border rounded-2xl text-white text-xs px-3.5 py-2.5 sm:py-3 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 transition-all ${
                      isBurnMode
                        ? "border-bloodNeon/60 focus:border-bloodNeon focus-visible:ring-bloodNeon/60 pr-8"
                        : "border-white/10 focus:border-electricViolet focus-visible:ring-electricViolet/60"
                    }`}
                  />
                  {isBurnMode && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none" title="Modo efímero activo">
                      🔥
                    </span>
                  )}
                </div>

                {/* BOTÓN REACTIVO: SI HAY TEXTO -> ENVIAR; SI ESTÁ VACÍO -> MICRÓFONO */}
                {inputMessage.trim() ? (
                  <button
                    type="submit"
                    disabled={isSendingMessage}
                    aria-label="Enviar mensaje"
                    className="p-2 min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center rounded-2xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-90 bg-electricViolet hover:bg-electricViolet-glow text-white shadow-[0_0_18px_rgba(139,92,246,0.5)] flex-shrink-0"
                  >
                    <Send
                      className={`w-4 h-4 fill-current transition-transform ${
                        isSendingMessage ? "animate-plane-launch" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setIsVoiceRecording(true);
                    }}
                    aria-label={t.chat.voiceTapToRecord}
                    className="p-2 min-w-[38px] sm:min-w-[42px] min-h-[38px] sm:min-h-[42px] flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:text-mintNeon hover:border-mintNeon/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mintNeon active:scale-95 flex-shrink-0"
                    title={t.chat.voiceTapToRecord}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
            )}
          </div>
        )}

        {/* MODAL ADJUNTAR MULTIMEDIA & ÁLBUMES */}
        <SendMediaModal
          isOpen={isSendMediaModalOpen}
          onClose={() => setIsSendMediaModalOpen(false)}
          targetProfileId={profile.id}
          targetCodename={profile.codename}
        />

        {/* VISOR MULTIMEDIA & ÁLBUMES FULLSCREEN */}
        {activeViewerMedia && (
          <ChatMediaViewerModal
            isOpen={!!activeViewerMedia}
            onClose={() => setActiveViewerMedia(null)}
            media={activeViewerMedia.media}
            messageId={activeViewerMedia.messageId}
            senderCodename={activeViewerMedia.senderCodename}
            targetProfileId={profile.id}
          />
        )}

        {/* MODALES ADJUNTOS */}
        {isWriteModalOpen && (
          <WriteTestimonialModal
            profileId={profile.id}
            profileCodename={profile.codename}
            onClose={() => setIsWriteModalOpen(false)}
          />
        )}

        {isBoundaryModalOpen && (
          <BoundaryManagerModal
            profileId={profile.id}
            onClose={() => setIsBoundaryModalOpen(false)}
          />
        )}

        {/* MODAL CREAR WAYPOINT SEGURO (2 FASES) */}
        {isWaypointModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
            <div className="w-full max-w-md bg-obsidian-surface rounded-2xl border border-electricViolet/40 p-5 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/30">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Waypoint Seguro // 2 Fases
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Tu domicilio solo se revela al confirmar arribo a la esquina
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWaypointModalOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-electricViolet-glow block uppercase mb-1">
                    📍 Fase 1: Esquina o Punto Público de Encuentro
                  </label>
                  <input
                    type="text"
                    required
                    value={phase1Corner}
                    onChange={(e) => setPhase1Corner(e.target.value)}
                    placeholder="Ej: Av. Santa Fe y Callao (Frente al café)"
                    className="w-full bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 focus:outline-none focus:border-electricViolet"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-electricViolet-glow block uppercase mb-1">
                    🔒 Fase 2: Domicilio Exacto, Piso y Timbre (Cifrado)
                  </label>
                  <input
                    type="text"
                    required
                    value={phase2Address}
                    onChange={(e) => setPhase2Address(e.target.value)}
                    placeholder="Ej: Piso 4 Depto B // Timbre 12"
                    className="w-full bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 focus:outline-none focus:border-electricViolet"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-neutral-400 block uppercase mb-1">
                    📝 Notas de Acceso (Opcional)
                  </label>
                  <input
                    type="text"
                    value={phase2Notes}
                    onChange={(e) => setPhase2Notes(e.target.value)}
                    placeholder="Ej: Portón negro, ascensor a la izquierda"
                    className="w-full bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono px-3.5 py-2.5 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-purple-950/20 border border-electricViolet/20 text-[10px] text-neutral-300 font-mono leading-relaxed">
                  🛡️ <strong>Protocolo Anti-Emboscada:</strong> La otra persona solo verá la esquina. Cuando confirme que llegó físicamente a la esquina, se le desbloqueará tu piso y timbre.
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsWaypointModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!phase1Corner.trim() || !phase2Address.trim()}
                    onClick={() => {
                      audioEngine.playPulse();
                      sendSecureWaypoint(profile.id, phase1Corner.trim(), phase2Address.trim(), phase2Notes.trim() || undefined);
                      setPhase1Corner("");
                      setPhase2Address("");
                      setPhase2Notes("");
                      setIsWaypointModalOpen(false);
                    }}
                    className="flex-1 py-2.5 bg-electricViolet hover:bg-electricViolet-glow disabled:opacity-30 text-white font-mono font-extrabold text-xs rounded-xl transition-all shadow-violet-glow cursor-pointer"
                  >
                    ENVIAR WAYPOINT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* =========================================================
            PANEL TÁCTICO COMPLEMENTARIO (SOLO DESKTOP lg: / xl:)
            ========================================================= */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-white/10 bg-obsidian-surface/70 backdrop-blur-md h-full overflow-y-auto shrink-0 select-none p-4 space-y-4">
          {/* Header del Panel */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-electricViolet animate-pulse shadow-violet-soft" />
              <span className="font-mono text-[11px] font-black uppercase tracking-wider text-white">
                Ficha Táctica
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-2 py-0.5 rounded-full">
              LIVE
            </span>
          </div>

          {/* Foto Principal y Clic para Ver Perfil */}
          <div
            onClick={() => {
              audioEngine.playPulse();
              setSelectedProfile(profile);
            }}
            className="relative rounded-2xl overflow-hidden aspect-[4/5] border-2 border-white/10 hover:border-electricViolet transition-all cursor-pointer group shadow-card-elevation"
            title="Hacé clic para ver el perfil completo y fotos"
          >
            <img
              src={profile.avatarUrl}
              alt={profile.codename}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                profile.isFogMode ? "filter blur-[4px] scale-105" : ""
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

            <div className="absolute bottom-3 inset-x-3 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base font-black text-white leading-tight">
                  {dossier?.customAlias || profile.codename}
                </span>
                {profile.showAge && (
                  <span className="text-xs font-mono text-neutral-300">
                    · {profile.age}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-mono text-electricViolet-glow font-bold pt-0.5">
                {getRoleDisplayLabel(profile.role, language)} · {formatDist(profile.distanceMeters)}
              </div>
            </div>

            <div className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white border border-white/10 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              🔍
            </div>
          </div>

          {/* Badges de Confianza y Respeto */}
          <div className="bg-black/40 rounded-2xl p-3 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-mono text-[10px] uppercase">
                Respect Karma
              </span>
              <span className="font-mono font-bold text-mintNeon">
                {profile.respectScore || 98}%
              </span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-mintNeon h-full rounded-full transition-all"
                style={{ width: `${profile.respectScore || 98}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {profile.verification?.isVerified && (
                <VerificationBadge verification={profile.verification} size="xs" showLabel />
              )}
              {profile.isAntiGhost && (
                <AntiGhostBadge
                  respectScore={profile.respectScore}
                  responseRateMinutes={profile.responseRateMinutes}
                  size="xs"
                  showLabel
                />
              )}
              {dossier?.rating && DOSSIER_VERDICT_CONFIG[dossier.rating] && (
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border shadow-xs ${DOSSIER_VERDICT_CONFIG[dossier.rating].badgeColor}`}>
                  <span>{DOSSIER_VERDICT_CONFIG[dossier.rating].icon}</span>
                  <span>{DOSSIER_VERDICT_CONFIG[dossier.rating].shortTag[language]}</span>
                </span>
              )}
            </div>
          </div>

          {/* Suite de Herramientas Tácticas 1-Tap */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block px-1">
              Herramientas de Cita
            </span>

            {/* Pre-Flight */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openPreFlightModal(profile);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-electricViolet/10 hover:bg-electricViolet/20 border border-electricViolet/30 text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-98 text-left"
            >
              <div className="flex items-center gap-2">
                <span>📋</span>
                <span className="text-[11px]">Pre-Flight Test</span>
              </div>
              <span className="text-[9px] text-electricViolet-glow">COMPATIBLE</span>
            </button>

            {/* Voy en Camino (ETA) */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openEnRouteModal(profile);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-mono font-bold transition-all cursor-pointer active:scale-98 text-left"
            >
              <div className="flex items-center gap-2">
                <span>🚗</span>
                <span className="text-[11px]">Voy en Camino (ETA)</span>
              </div>
              <span className="text-[9px] text-neutral-400">COMPARTIR</span>
            </button>

            {/* Guardián Silencioso */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openSafetyBeaconModal();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono font-bold transition-all cursor-pointer active:scale-98 text-left"
            >
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span className="text-[11px]">Guardián Silencioso</span>
              </div>
              <span className="text-[9px] text-bloodNeon">DEAD-MAN</span>
            </button>

            {/* Anotar en Diario */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openCreateDiaryModal(profile.id);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-mono font-bold transition-all cursor-pointer active:scale-98 text-left"
            >
              <div className="flex items-center gap-2">
                <span>📓</span>
                <span className="text-[11px]">Anotar en Mi Diario</span>
              </div>
              <span className="text-[9px] text-neutral-400">PRIVADO</span>
            </button>

            {/* Ver Perfil Completo */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setSelectedProfile(profile);
              }}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-[11px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 mt-2"
            >
              <span>Ver Perfil Completo</span>
              <span>→</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ASISTENTE UNIFICADO DE ENCUENTROS (FASE 2) */}
      <RendezvousSheet
        isOpen={isRendezvousSheetOpen}
        onClose={() => setIsRendezvousSheetOpen(false)}
        targetProfile={profile}
      />
    </div>
  );
};


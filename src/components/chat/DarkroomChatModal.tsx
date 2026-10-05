"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Calendar,
  Home,
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
import { formatDiaryDateDisplay } from "@/lib/calendar/dateLocale";
import { ChatMediaAttachment, ExitProtocol } from "@/types/vessel";
import { PreFlightCard } from "./PreFlightCard";
import { RendezvousSheet } from "./RendezvousSheet";
import { EncounterContextBar } from "./EncounterContextBar";
import { ChatProfileDrawer } from "./ChatProfileDrawer";

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
    openEnRouteModal,
    openHostCardModal,
    openSafetyBeaconModal,
    safetyBeacon,
    t,
    language,
    formatDist,
    setSelectedProfile,
    archivePhotosToDossier,
    openLoverDossierModal,
    updateEncounterTicketStatus,
    confirmH2Ticket,
    hasMutualPulse,
  } = useVessel();

  const [archivedMediaIds, setArchivedMediaIds] = useState<Record<string, boolean>>({});
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
  const [isDossierDrawerOpen, setIsDossierDrawerOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [confirmingCancelPin, setConfirmingCancelPin] = useState(false);

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
  const isMutual = profile ? hasMutualPulse(profile.id) : false;

  const tempoLabels: Record<string, string> = {
    fast_carnal: language === "es" ? "⚡ Rápido & Carnal" : "⚡ Fast & Carnal",
    sensual_slow: language === "es" ? "🔥 Sensual & Pausado" : "🔥 Sensual & Slow",
    rough_dom: language === "es" ? "⛓️ Dominación & Fuerte" : "⛓️ Dom & Intense",
    chill: language === "es" ? "🫂 Tranqui / Mimos" : "🫂 Chill / Cuddle",
  };

  const protectionLabels: Record<string, string> = {
    bareback_prep: language === "es" ? "PrEP e I=I" : "PrEP + U=U",
    prep_doxypep: language === "es" ? "PrEP + Doxy-PEP" : "PrEP + Doxy-PEP",
    condoms: language === "es" ? "Preservativo estricto" : "Strict Condoms",
    discuss: language === "es" ? "Conversar en persona" : "Discuss in person",
  };

  const pinnedPreFlight = useMemo(() => {
    const latestPreFlightMsg = [...messages].reverse().find((m) => m.isPreFlightChecklist && m.preFlightData);
    if (latestPreFlightMsg?.preFlightData) {
      return {
        source: "explicit" as const,
        tempo: latestPreFlightMsg.preFlightData.tempo,
        protection: latestPreFlightMsg.preFlightData.protection,
        dynamics: latestPreFlightMsg.preFlightData.dynamics || [],
        vibe: latestPreFlightMsg.preFlightData.vibe,
        hosting: profile?.hosting || profile?.mobility,
        exitProtocol: profile?.exitProtocol,
      };
    }

    if (isMutual && profile) {
      return {
        source: "mutual" as const,
        tempo: profile.onTheClock?.isActive ? "fast_carnal" : "sensual_slow",
        protection: profile.healthStatus?.prep ? "bareback_prep" : "condoms",
        dynamics: profile.kinks || [],
        hosting: profile.hosting || profile.mobility,
        exitProtocol: profile.exitProtocol,
      };
    }

    return null;
  }, [messages, isMutual, profile]);

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
    sendChatMessage(profileId, inputMessage.trim(), isBurnMode);
    setInputMessage("");
    setTimeout(() => {
      setIsSendingMessage(false);
    }, 450);
  };

  const handleQuickReply = (text: string) => {
    if (activeBoundary?.chatStatus === "readonly" || activeBoundary?.chatStatus === "disconnected") return;
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
      role="region"
      aria-label={language === "es" ? `Chat seguro con ${profile.codename}` : `Secure chat with ${profile.codename}`}
      className="fixed inset-0 z-40 bg-obsidian-deep flex flex-col w-full h-[100dvh] overflow-hidden select-none animate-in fade-in duration-200 [overscroll-behavior:contain]"
    >
      <div className="w-full max-w-4xl mx-auto bg-obsidian-deep h-full flex flex-col relative md:border-x border-white/10 shadow-2xl overflow-hidden [overscroll-behavior:contain]">
        {/* COLUMNA PRINCIPAL DE MENSAJES Y FLUJO DE CHAT */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          {/* CABECERA TÁCTICA CON JERARQUÍA ELEGANTE Y ACCIONES PRIORIZADAS */}
          <div className={`p-2 sm:p-2.5 border-b border-white/10 bg-[#09090B] flex items-center justify-between sticky top-0 ${isTacticalMenuOpen ? "z-[90]" : "z-20"} gap-2 select-none shadow-md`}>
            {/* IDENTIDAD DEL USUARIO (AVATAR + 2 LÍNEAS LIMPIAS CON ACCESO A FICHA) */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  onClose();
                }}
                aria-label={t.chat.backToList || (language === "es" ? "Volver a mensajes" : "Back to chats")}
                className="p-2 -ml-1 min-w-[44px] min-h-[44px] flex items-center gap-1 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet cursor-pointer active:scale-95 transition-all flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline">
                  {language === "es" ? "Chats" : "Back"}
                </span>
              </button>

              {/* AVATAR CON ANILLO DE ESTADO Y TAP PARA ABRIR FICHA */}
              <div
                onClick={() => {
                  audioEngine.playPulse();
                  setIsDossierDrawerOpen(true);
                }}
                className="relative flex-shrink-0 cursor-pointer group"
                title={language === "es" ? `Ver ficha de ${profile.codename}` : `View bio of ${profile.codename}`}
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
                  setIsDossierDrawerOpen(true);
                }}
                className="min-w-0 flex-1 flex flex-col justify-center cursor-pointer group"
                title={language === "es" ? `Ver ficha de ${profile.codename}` : `View bio of ${profile.codename}`}
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
                      title={language === "es" ? `Protocolo Cero Plantones • ${profile.respectScore || 98}% Respeto` : `Anti-Ghost Protocol • ${profile.respectScore || 98}% Respect`}
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
                  {profile.hosting && (
                    <>
                      <span className="text-white/20 flex-shrink-0">•</span>
                      <span className="text-neutral-300 truncate">
                        {profile.hosting}
                      </span>
                    </>
                  )}
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

            {/* CINTA DE ACCIONES RÁPIDAS (RETENCIÓN + FICHA + COORDINAR + MENÚ) */}
            <div className="flex items-center gap-1.5 flex-shrink-0 relative" ref={tacticalMenuRef}>
              {/* 1. Pill Discreto de Retención / Modo Efímero */}
              <button
                type="button"
                onClick={() => {
                  setIsTogglingRetention(true);
                  audioEngine.playVaultUnlock();
                  toggleChatRetention(profile.id);
                  setTimeout(() => setIsTogglingRetention(false), 450);
                }}
                className={`px-2 py-1 min-h-[36px] rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border active:scale-95 ${
                  currentRetention === "persistent"
                    ? "bg-mintNeon/10 border-mintNeon/40 text-mintNeon hover:bg-mintNeon/20"
                    : "bg-electricViolet/10 border-electricViolet/40 text-electricViolet-glow hover:bg-electricViolet/20"
                }`}
                title={currentRetention === "persistent" ? (language === "es" ? "Historial guardado en el celu (tocá para efímero)" : "History saved") : (language === "es" ? "Chat efímero (se borra al salir)" : "Ephemeral mode")}
              >
                {currentRetention === "persistent" ? (
                  <Save className={`w-3.5 h-3.5 ${isTogglingRetention ? "animate-spin" : ""}`} />
                ) : (
                  <Lock className={`w-3.5 h-3.5 ${isTogglingRetention ? "animate-spin" : ""}`} />
                )}
                <span className="hidden sm:inline">{currentRetention === "persistent" ? (language === "es" ? "Guardado" : "Saved") : (language === "es" ? "Efímero" : "Burn")}</span>
              </button>

              {/* 2. Botón Ficha del Chongo */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsDossierDrawerOpen(true);
                }}
                aria-label={language === "es" ? "Ver ficha y datos" : "View bio"}
                className="px-2.5 py-1 min-h-[36px] rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-neutral-200 hover:text-white font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title={language === "es" ? "Ficha del chongo (perfil, notas y respeto)" : "Profile dossier"}
              >
                <span>👤</span>
                <span className="hidden xs:inline">{language === "es" ? "Ficha" : "Bio"}</span>
              </button>

              {/* 3. Botón Unificado Coordinar Cita */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsRendezvousSheetOpen(true);
                }}
                aria-label="Coordinar cita segura"
                className={`px-3 py-1 min-h-[36px] flex items-center gap-1.5 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-sm font-mono text-xs font-bold ${
                  activeRendezvous?.profileId === profile.id
                    ? "bg-bloodNeon/20 border border-bloodNeon/60 text-bloodNeon shadow-[0_0_12px_rgba(230,25,55,0.35)] animate-pulse"
                    : "bg-electricViolet text-white hover:bg-electricViolet/90 shadow-violet-soft"
                }`}
                title="Asistente Integral de Encuentros (Sintonía + Lugar + Guardián SOS)"
              >
                <span className="text-xs leading-none">⚡</span>
                <span>{activeRendezvous?.profileId === profile.id ? (language === "es" ? "PIN Activo" : "Active PIN") : (language === "es" ? "Coordinar" : "Meetup")}</span>
              </button>

              {/* 4. Botón Menú Táctico Más Acciones [ ⋯ ] */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsTacticalMenuOpen(!isTacticalMenuOpen);
                }}
                aria-label="Más herramientas tácticas"
                aria-expanded={isTacticalMenuOpen}
                className={`p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 relative ${
                  isTacticalMenuOpen
                    ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
                }`}
                title={language === "es" ? "Más opciones" : "More options"}
              >
                <MoreVertical className="w-4 h-4" />
                {safetyBeacon?.isActive && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-bloodNeon rounded-full border border-black animate-ping" />
                )}
              </button>

              {/* MODAL TÁCTICO CENTRADO / BOTTOM-SAFE (CERO RECORTE CON BARRA DE MENSAJES) */}
              {isTacticalMenuOpen && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsTacticalMenuOpen(false);
                  }
                }}
                role="dialog"
                aria-modal="true"
                aria-label={
                  language === "es"
                    ? `Opciones del chat con ${profile.codename}`
                    : `Chat options with ${profile.codename}`
                }
              >
                <div
                  className="w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col border border-white/20 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.98)] overflow-hidden select-none text-left animate-in zoom-in-95 duration-150"
                  style={{ backgroundColor: "#0E0E12" }}
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* Encabezado Amigable con Botón de Cierre 44x44px */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-[#13131A] flex-shrink-0">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white tracking-tight truncate">
                          {language === "es"
                            ? `Opciones con ${dossier?.customAlias || profile.codename}`
                            : `Options with ${dossier?.customAlias || profile.codename}`}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-electricViolet-glow px-1.5 py-0.5 rounded bg-electricViolet/15 border border-electricViolet/30 flex-shrink-0">
                          VESSEL
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                        {language === "es"
                          ? "Coordiná para verse, cuidá tu seguridad o manejá este chat"
                          : "Plan a meetup, stay safe, or manage this conversation"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTacticalMenuOpen(false)}
                      aria-label={language === "es" ? "Cerrar menú de opciones" : "Close options menu"}
                      className="min-w-[44px] min-h-[44px] -mr-1 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cuerpo con Scroll Independiente (Garantiza Cero Corte en Cualquier Pantalla) */}
                  <div className="p-3.5 space-y-3.5 overflow-y-auto overscroll-contain flex-1">
                    {/* GRUPO 1: PARA VERNOS HOY */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-electricViolet-glow uppercase tracking-wider block px-1">
                        📍 {language === "es" ? "Para Vernos Hoy" : "Meet Up Today"}
                      </span>

                      {/* Acción Principal Destacada: Armar Encuentro Paso a Paso */}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setIsTacticalMenuOpen(false);
                          setIsRendezvousSheetOpen(true);
                        }}
                        className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-electricViolet/30 via-electricViolet/20 to-bloodNeon/20 hover:from-electricViolet/40 hover:to-bloodNeon/30 border border-electricViolet/50 transition-all group cursor-pointer text-left shadow-violet-soft"
                        role="menuitem"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-electricViolet text-white flex items-center justify-center text-base font-bold flex-shrink-0 shadow-sm mt-0.5">
                            ⚡
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-black text-white leading-tight">
                                {language === "es"
                                  ? "Armar Encuentro Paso a Paso"
                                  : "Plan Meetup Step by Step"}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-electricViolet-glow px-1.5 py-0.5 rounded bg-black/50 border border-electricViolet/40">
                                {language === "es" ? "Todo en 1" : "All-in-1"}
                              </span>
                            </div>
                            <span className="text-[11px] text-neutral-200 block leading-snug mt-1">
                              {language === "es"
                                ? "Elegí qué buscan hacer, quién pone el lugar, la hora y activá tu alerta SOS en 1 minuto."
                                : "Agree on dynamics, who hosts, time, and activate your SOS timer in 1 minute."}
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Grilla 2 Columnas: Mostrar Mi Lugar + Avisar que Ya Salí */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Mostrar Cómo es Mi Lugar */}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setIsTacticalMenuOpen(false);
                            openHostCardModal();
                          }}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 hover:border-emerald-500/40 transition-all group cursor-pointer text-left"
                          role="menuitem"
                        >
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Home className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-white block leading-tight">
                              {language === "es" ? "Cómo es Mi Lugar" : "My Place Details"}
                            </span>
                            <span className="text-[10px] text-neutral-300 block leading-snug mt-0.5">
                              {language === "es"
                                ? "Mostrá si vivís solo, tenés ducha o privacidad (sin dar dirección)."
                                : "Share privacy, shower & house vibe without exposing your address."}
                            </span>
                          </div>
                        </button>

                        {/* Avisar que Ya Salí (En Camino) */}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setIsTacticalMenuOpen(false);
                            openEnRouteModal(profile);
                          }}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 hover:border-electricViolet/40 transition-all group cursor-pointer text-left"
                          role="menuitem"
                        >
                          <div className="w-9 h-9 rounded-xl bg-electricViolet/20 border border-electricViolet/30 text-electricViolet-glow flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Navigation className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-white block leading-tight">
                              {language === "es" ? "Avisar que Ya Salí" : "I'm On My Way"}
                            </span>
                            <span className="text-[10px] text-neutral-300 block leading-snug mt-0.5">
                              {language === "es"
                                ? "Mandale en cuántos minutos llegás para que te espere listo."
                                : "Send your estimated arrival time in minutes."}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* GRUPO 2: TU CUIDADO Y TUS TIEMPOS */}
                    <div className="space-y-2 pt-1 border-t border-white/10">
                      <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wider block px-1">
                        🛡️ {language === "es" ? "Tu Cuidado y Tus Tiempos" : "Your Safety & Boundaries"}
                      </span>

                      {/* Alerta SOS para tu Cita (Guardián Silencioso explicado claro) */}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setIsTacticalMenuOpen(false);
                          openSafetyBeaconModal();
                        }}
                        className="w-full flex items-start justify-between gap-2.5 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 hover:border-bloodNeon/40 transition-all group cursor-pointer text-left"
                        role="menuitem"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              safetyBeacon?.isActive
                                ? "bg-bloodNeon/30 text-bloodNeon border border-bloodNeon shadow-blood-glow"
                                : "bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/30"
                            }`}
                          >
                            <ShieldCheck className={`w-4 h-4 ${safetyBeacon?.isActive ? "animate-pulse" : ""}`} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block leading-tight">
                              {language === "es"
                                ? "Alerta SOS por si Algo Sale Mal"
                                : "Safety SOS Timer for Your Date"}
                            </span>
                            <span className="text-[10px] text-neutral-300 block leading-snug mt-0.5">
                              {language === "es"
                                ? "Poné un reloj (ej. 1 hora). Si no avisás que estás bien, alerta a un amigo tuyo."
                                : "Set a timer. If you don't check in safe, it alerts your trusted contact."}
                            </span>
                          </div>
                        </div>
                        {safetyBeacon?.isActive ? (
                          <span className="text-[9px] font-mono font-bold text-bloodNeon px-2 py-0.5 rounded-full bg-bloodNeon/25 border border-bloodNeon/50 flex-shrink-0">
                            {t.system?.active || "ACTIVO"}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-neutral-300 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 flex-shrink-0">
                            {language === "es" ? "Reloj SOS" : "SOS Timer"}
                          </span>
                        )}
                      </button>

                      {/* Cortar con Buena Onda (Salida Amable No-Ghost) */}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setIsTacticalMenuOpen(false);
                          setIsKindClosureOpen(!isKindClosureOpen);
                        }}
                        className="w-full flex items-start justify-between gap-2.5 p-2.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/30 hover:border-emerald-500/50 transition-all group cursor-pointer text-left"
                        role="menuitem"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <HeartHandshake className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-emerald-300 block leading-tight">
                              {language === "es"
                                ? "Despedirse con Buena Onda"
                                : "Say Goodbye Politely"}
                            </span>
                            <span className="text-[10px] text-neutral-300 block leading-snug mt-0.5">
                              {language === "es"
                                ? "Elegí un mensaje amable ya escrito para decir que hoy no pinta, sin clavar visto."
                                : "Pick a ready-made kind message to pass politely without ghosting."}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-500/40 flex-shrink-0">
                          +5 Respeto
                        </span>
                      </button>

                      {/* Silenciar, Pausar o Bloquear */}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setIsTacticalMenuOpen(false);
                          setIsBoundaryModalOpen(true);
                        }}
                        className="w-full flex items-start justify-between gap-2.5 p-2.5 rounded-2xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/25 hover:border-purple-500/45 transition-all group cursor-pointer text-left"
                        role="menuitem"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-purple-200 block leading-tight">
                              {language === "es"
                                ? "Silenciar, Pausar o Bloquear"
                                : "Mute, Pause or Block"}
                            </span>
                            <span className="text-[10px] text-neutral-300 block leading-snug mt-0.5">
                              {language === "es"
                                ? "Poné la charla en pausa, ocultate de su radar o cortá el contacto."
                                : "Mute notifications, pause this chat, or hide from their radar."}
                            </span>
                          </div>
                        </div>
                        {activeBoundary && (
                          <span className="text-[9px] font-mono font-bold text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/25 border border-purple-500/40 flex-shrink-0">
                            {activeBoundary.chatStatus === "readonly"
                              ? (t.system?.chatReadonly || "Solo lectura")
                              : activeBoundary.chatStatus === "disconnected"
                              ? (t.system?.chatDisconnected || "Desconectado")
                              : (t.system?.chatMuted || activeBoundary.chatStatus)}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* GRUPO 3: PERFIL, NOTAS PRIVADAS & HISTORIAL (GRILLA COMPACTA 2x2) */}
                    <div className="space-y-2 pt-1 border-t border-white/10">
                      <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wider block px-1">
                        👤 {language === "es" ? `Sobre ${dossier?.customAlias || profile.codename}` : `About ${dossier?.customAlias || profile.codename}`}
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Ver Fotos y Perfil */}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setIsTacticalMenuOpen(false);
                            setSelectedProfile(profile);
                          }}
                          className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 hover:border-white/25 transition-all cursor-pointer text-left flex items-start gap-2"
                          role="menuitem"
                        >
                          <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center text-sm flex-shrink-0">
                            👤
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block leading-tight">
                              {language === "es" ? "Ver Perfil y Fotos" : "View Full Profile"}
                            </span>
                            <span className="text-[10px] text-neutral-400 block leading-tight mt-0.5">
                              {language === "es" ? "Bio, morbos y reputación" : "Bio, kinks & reputation"}
                            </span>
                          </div>
                        </button>

                        {/* Guardar Nota Privada */}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setIsTacticalMenuOpen(false);
                            openCreateDiaryModal(profile.id);
                          }}
                          className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 hover:border-white/25 transition-all cursor-pointer text-left flex items-start gap-2"
                          role="menuitem"
                        >
                          <span className="w-8 h-8 rounded-xl bg-neutral-800 border border-white/15 text-neutral-200 flex items-center justify-center text-sm flex-shrink-0">
                            📓
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block leading-tight">
                              {language === "es" ? "Guardar Nota Privada" : "Save Private Note"}
                            </span>
                            <span className="text-[10px] text-neutral-400 block leading-tight mt-0.5">
                              {language === "es" ? "Agendar o anotar (solo vos)" : "Private personal log"}
                            </span>
                          </div>
                        </button>

                        {/* Confirmar que nos vimos / Dejar Reseña */}
                        {isEncounterValidated ? (
                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playPulse();
                              setIsTacticalMenuOpen(false);
                              setIsWriteModalOpen(true);
                            }}
                            className="p-2.5 rounded-2xl bg-electricViolet/15 hover:bg-electricViolet/25 border border-electricViolet/30 transition-all cursor-pointer text-left flex items-start gap-2"
                            role="menuitem"
                          >
                            <div className="w-8 h-8 rounded-xl bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow flex items-center justify-center flex-shrink-0">
                              <MessageSquareHeart className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-electricViolet-glow block leading-tight">
                                {language === "es" ? "Dejar Reseña" : "Leave Review"}
                              </span>
                              <span className="text-[10px] text-neutral-300 block leading-tight mt-0.5">
                                {language === "es" ? "Contar qué tal estuvo" : "Share verified review"}
                              </span>
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
                            className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 hover:border-mintNeon/40 transition-all cursor-pointer text-left flex items-start gap-2"
                            role="menuitem"
                          >
                            <div className="w-8 h-8 rounded-xl bg-mintNeon/20 border border-mintNeon/40 text-mintNeon flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block leading-tight">
                                {language === "es" ? "Confirmar que nos Vimos" : "Confirm We Met"}
                              </span>
                              <span className="text-[10px] text-neutral-400 block leading-tight mt-0.5">
                                {language === "es" ? "Habilita reseña mutua" : "Unlocks mutual review"}
                              </span>
                            </div>
                          </button>
                        )}

                        {/* Borrar Mensajes */}
                        {messages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsTacticalMenuOpen(false);
                              setIsClearConfirmOpen(true);
                            }}
                            className="p-2.5 rounded-2xl bg-bloodNeon/10 hover:bg-bloodNeon/20 border border-bloodNeon/25 transition-all cursor-pointer text-left flex items-start gap-2"
                            role="menuitem"
                          >
                            <div className="w-8 h-8 rounded-xl bg-bloodNeon/20 border border-bloodNeon/40 text-bloodNeon flex items-center justify-center flex-shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-bloodNeon block leading-tight">
                                {language === "es" ? "Borrar Mensajes" : "Clear Messages"}
                              </span>
                              <span className="text-[10px] text-bloodNeon/80 block leading-tight mt-0.5">
                                {language === "es" ? "Vaciar este chat" : "Empty this chat"}
                              </span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BARRA CONTEXTUAL DINÁMICA DE ENCUENTRO (FASE 2 Y FASE 3) */}
        <EncounterContextBar
          profile={profile}
          onOpenRendezvousSheet={() => setIsRendezvousSheetOpen(true)}
          onOpenEnRoute={() => openEnRouteModal(profile)}
          onOpenSafetyBeacon={() => openSafetyBeaconModal()}
          onCancelRendezvousPin={activeRendezvous?.profileId === profile.id ? () => cancelRendezvousPin(profile.id) : undefined}
          onOpenDossier={() => setIsDossierDrawerOpen(true)}
        />

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
                <span>{language === "es" ? "Salida Amable & Sincera • Cero Plantones" : "Kind & Polite Exit • Anti-Ghost Mode"}</span>
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
              {language === "es"
                ? "¿No hay chispa o seguís de largo? Elegí una salida con onda en 1 toque. Sumás +5 Puntos de Respeto y mantenés la cultura de cero plantones."
                : "No mutual spark? Choose a kind sign-off in 1 tap. Earn +5 Respect Karma and build a ghost-free community."}
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



        {/* BANNER DE DINÁMICAS Y SINTONÍA ACORDADA FIJADA (PRE-FLIGHT PINNED) */}
        {pinnedPreFlight && (
          <div
            data-testid="pinned-preflight-banner"
            className="px-3.5 py-2.5 bg-gradient-to-r from-purple-950/70 via-obsidian-surface to-electricViolet/15 border-b border-electricViolet/40 flex items-center justify-between gap-3 text-xs z-10 shadow-sm flex-shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base flex-shrink-0">⚡</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-electricViolet-glow">
                    {t.intents?.title || (language === "es" ? "Sintonía Acordada" : "Agreed Pre-Flight")}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-electricViolet/25 border border-electricViolet/40 text-purple-200">
                    {pinnedPreFlight.source === "explicit"
                      ? (language === "es" ? "Pacto Confirmado" : "Confirmed Accord")
                      : (language === "es" ? "Sintonía Mutua" : "Mutual Intent")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-300 truncate mt-0.5">
                  <span>{tempoLabels[pinnedPreFlight.tempo] || pinnedPreFlight.tempo}</span>
                  <span>•</span>
                  <span>{protectionLabels[pinnedPreFlight.protection] || pinnedPreFlight.protection}</span>
                  {pinnedPreFlight.exitProtocol && (
                    <>
                      <span>•</span>
                      <span className="text-purple-300">
                        {pinnedPreFlight.exitProtocol === "fast_encounter"
                          ? (language === "es" ? "⏱️ Sin sobremesa" : "⏱️ Fast exit")
                          : pinnedPreFlight.exitProtocol === "chill_cuddle"
                          ? (language === "es" ? "🫂 Ducha & charla" : "🫂 Cuddle")
                          : (language === "es" ? "🌙 Pasar la noche" : "🌙 Sleepover")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                audioEngine.playSubBass(60);
                setIsRendezvousSheetOpen(true);
              }}
              aria-label="Ajustar sintonía"
              title="Ajustar sintonía o coordinar encuentro"
              className="px-2.5 py-1.5 rounded-xl bg-electricViolet/20 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/40 transition-all font-mono text-[10px] font-black uppercase tracking-wider flex-shrink-0 cursor-pointer active:scale-95"
            >
              {language === "es" ? "Ajustar ⚡" : "Adjust ⚡"}
            </button>
          </div>
        )}

        {/* ZONA DE MENSAJES SENSORIAL */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-obsidian-deep via-[#070709] to-obsidian-deep overscroll-contain">
          {/* ESTADO VACÍO TÁCTICO DE APERTURA DE CANAL (SIN PANTALLA EN BLANCO) */}
          {messages.length === 0 && (
            <div className="my-6 mx-auto max-w-sm rounded-3xl border border-white/10 bg-obsidian-surface/80 p-5 text-center space-y-3.5 shadow-card-elevation">
              <div className="w-12 h-12 rounded-2xl bg-electricViolet/15 border border-electricViolet/40 text-electricViolet-glow flex items-center justify-center mx-auto shadow-violet-soft">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-white">
                  {language === "es"
                    ? `Canal Cifrado con ${profile.codename}`
                    : `Encrypted Channel with ${profile.codename}`}
                </h3>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {language === "es"
                    ? `${getRoleDisplayLabel(profile.role, language)} • ${profile.hosting}. Rompé el hielo en 1 toque o coordiná cita directa.`
                    : `${getRoleDisplayLabel(profile.role, language)} • ${profile.hosting}. Break the ice in 1 tap or schedule a date.`}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {quickReplies.slice(0, 3).map((icebreaker, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickReply(icebreaker)}
                    className="px-3 py-1.5 min-h-[38px] rounded-xl bg-electricViolet/15 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/40 text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
                  >
                    {icebreaker}
                  </button>
                ))}
              </div>
            </div>
          )}

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

            {/* TARJETA TÁCTICA MAESTRA DE TICKET DE ENCUENTRO */}
            if (msg.isEncounterTicket && msg.encounterTicketData) {
              const ticket = msg.encounterTicketData;
              const isConfirmed = ticket.status === "confirmed";
              const isDeclined = ticket.status === "declined" || ticket.status === "cancelled";
              const formattedDate = formatDiaryDateDisplay(ticket.scheduledDate, language);
              const myH2Confirmed = ticket.h2ConfirmedByUser;
              const theirH2Confirmed = ticket.h2ConfirmedByPartner;

              return (
                <div key={msg.id} className="w-full my-3">
                  <div
                    className={`rounded-3xl border-2 p-4 sm:p-5 space-y-3 relative overflow-hidden transition-all ${
                      isConfirmed
                        ? "bg-obsidian-surface border-electricViolet/70 shadow-violet-soft"
                        : isDeclined
                        ? "bg-obsidian border-white/10 opacity-60"
                        : "bg-obsidian-surface border-champagneGold/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2 font-mono font-black text-xs uppercase tracking-wider text-white">
                        <Calendar className="w-4 h-4 text-electricViolet-glow" />
                        <span>{t.diary?.encounterTicketTitle || (language === "es" ? "Ticket de Encuentro" : "Encounter Ticket")}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isConfirmed
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : isDeclined
                            ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                        }`}
                      >
                        {isConfirmed
                          ? (t.diary?.encounterTicketAccepted || (language === "es" ? "Confirmada" : "Confirmed"))
                          : isDeclined
                          ? (t.diary?.encounterTicketDeclined || (language === "es" ? "Cancelada" : "Declined"))
                          : (language === "es" ? "Pendiente" : "Pending")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
                        <span className="text-[10px] text-neutral-400 block uppercase">
                          {language === "es" ? "Fecha & Hora" : "Date & Time"}
                        </span>
                        <span className="font-bold text-white block">
                          📅 {formattedDate} · {ticket.scheduledTime} hs
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-0.5">
                        <span className="text-[10px] text-neutral-400 block uppercase">
                          {language === "es" ? "Lugar" : "Location"}
                        </span>
                        <span className="font-bold text-electricViolet-glow block truncate">
                          📍 {ticket.locationName}
                        </span>
                      </div>
                    </div>

                    {ticket.exitProtocol && (
                      <div className="text-[11px] font-mono text-neutral-300 flex items-center gap-1.5 pt-0.5">
                        <span className="text-neutral-500">{language === "es" ? "Salida:" : "Exit:"}</span>
                        <span className="font-bold text-white">
                          {ticket.exitProtocol === "fast_encounter"
                            ? (language === "es" ? "⏱️ Puntual (Sin sobremesa)" : "⏱️ Fast Encounter")
                            : ticket.exitProtocol === "chill_cuddle"
                            ? (language === "es" ? "🫂 Mimos (Ducha y charla)" : "🫂 Shower & Cuddle")
                            : (language === "es" ? "🌙 Pasar la noche" : "🌙 Sleepover")}
                        </span>
                      </div>
                    )}

                    {ticket.notes && (
                      <p className="text-xs font-sans text-neutral-200 pl-2.5 border-l-2 border-electricViolet/60 leading-relaxed">
                        {ticket.notes}
                      </p>
                    )}

                    {/* Botonera de acciones para el receptor (Aceptar / Declinar) o para el emisor (Reprogramar / Cancelar) */}
                    {ticket.status === "proposed" && !isMe && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playSubBass(70);
                            updateEncounterTicketStatus(ticket.id, "confirmed");
                          }}
                          className="min-h-[44px] py-2.5 px-3 rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-violet-soft"
                        >
                          {t.diary?.encounterTicketAccept || (language === "es" ? "Aceptar Cita" : "Accept Date")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            updateEncounterTicketStatus(ticket.id, "declined");
                          }}
                          className="min-h-[44px] py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 font-mono text-xs font-bold transition-all cursor-pointer"
                        >
                          {t.diary?.encounterTicketDecline || (language === "es" ? "Declinar" : "Decline")}
                        </button>
                      </div>
                    )}

                    {ticket.status === "proposed" && isMe && (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setIsRendezvousSheetOpen(true);
                          }}
                          className="flex-1 min-h-[40px] py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 font-mono text-[11px] font-bold transition-all cursor-pointer"
                        >
                          {language === "es" ? "Reprogramar Hora" : "Reschedule"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            updateEncounterTicketStatus(ticket.id, "declined");
                          }}
                          className="min-h-[40px] py-2 px-3 rounded-xl bg-bloodNeon/15 hover:bg-bloodNeon/25 border border-bloodNeon/40 text-bloodNeon font-mono text-[11px] font-bold transition-all cursor-pointer"
                        >
                          {language === "es" ? "Cancelar Propuesta" : "Cancel"}
                        </button>
                      </div>
                    )}

                    {isConfirmed && (
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        {/* Estado bilateral de confirmación H-2 */}
                        <div className="flex items-center justify-between text-[10px] font-mono px-1">
                          <span className={myH2Confirmed ? "text-emerald-400 font-bold" : "text-neutral-400"}>
                            {language === "es" ? "Vos:" : "You:"} {myH2Confirmed ? "✓ Confirmado" : "Pendiente"}
                          </span>
                          <span className={theirH2Confirmed ? "text-emerald-400 font-bold" : "text-neutral-400"}>
                            {profile.codename}: {theirH2Confirmed ? "✓ Confirmado" : "Pendiente"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playSuccess();
                              confirmH2Ticket(ticket.id, isMe);
                            }}
                            disabled={Boolean(myH2Confirmed)}
                            className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              myH2Confirmed
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-default"
                                : "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300 cursor-pointer"
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {myH2Confirmed
                                ? (language === "es" ? "Asistencia Confirmada ✓" : "Arrival Confirmed ✓")
                                : (language === "es" ? "Confirmar que voy (H-2)" : "Confirm arrival (H-2)")}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playPulse();
                              updateEncounterTicketStatus(ticket.id, "declined");
                            }}
                            className="min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-bloodNeon/20 border border-white/10 hover:border-bloodNeon/40 text-neutral-400 hover:text-bloodNeon font-mono text-[11px] font-bold transition-all cursor-pointer"
                            title={language === "es" ? "Cancelar cita" : "Cancel date"}
                          >
                            {language === "es" ? "Cancelar" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}
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
                            ? (language === "es" ? "Punto de Encuentro Anulado" : "Meeting Point Cancelled")
                            : t.chat.rendezvousTitle}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] flex items-center gap-1 font-mono font-bold ${
                          isCancelled ? "text-neutral-500" : "text-bloodNeon"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{isCancelled ? (language === "es" ? "Anulado" : "Cancelled") : t.chat.expiresIn15}</span>
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
                        {isCancelled ? (language === "es" ? "ANULADO" : "CANCELLED") : (language === "es" ? "DOBLE CONSENTIMIENTO" : "DOUBLE CONSENT")}
                      </span>
                    </div>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => cancelRendezvousPin(profile.id)}
                        className="w-full min-h-[44px] mt-2 py-2 px-3 bg-bloodNeon/15 hover:bg-bloodNeon hover:text-white text-bloodNeon border border-bloodNeon/40 rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{language === "es" ? "Anular Punto de Encuentro" : "Cancel Meeting Point"}</span>
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
                        <span>Punto de Encuentro Seguro • 2 Fases</span>
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
                      <span>Alerta Médica Preventiva • 100% Anónima</span>
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
                          /* Pastilla compacta de Estado Revocado */
                          <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs my-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <Lock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                              <span className="text-[11px] font-mono text-neutral-300 truncate">
                                {isMe
                                  ? (t.chat.albumRevokedSenderNotice || "Dejaste de compartir tu álbum acá")
                                  : (t.chat.albumRevokedReceiverNotice || "El usuario pausó este álbum")}
                              </span>
                            </div>
                            {isMe ? (
                              <button
                                type="button"
                                onClick={() => unrevokeAlbumAccessInChat(profile.id, albumId, msg.id)}
                                className="text-[10px] font-mono font-bold text-electricViolet-glow hover:text-white flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>{t.chat.reshareAlbumInChat || "Compartir de nuevo"}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-neutral-500 flex-shrink-0">
                                {t.chat.accessRevoked || "Pausado"}
                              </span>
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
                          {/* Botón de Archivar en la Ficha del Amante (The Black Vault) */}
                          {!isMe && msg.mediaAttachment.url && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                archivePhotosToDossier(profile.id, [msg.mediaAttachment!.url]);
                                setArchivedMediaIds((prev) => ({ ...prev, [msg.id]: true }));
                                audioEngine.playPulse();
                              }}
                              className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-white border border-white/20 hover:border-electricViolet text-[9.5px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md z-10 cursor-pointer active:scale-95"
                              title={t.diary?.archivePhotosFromChat || "Archivar en Ficha"}
                              aria-label={t.diary?.archivePhotosFromChat || "Archivar en Ficha"}
                            >
                              <Lock className="w-3 h-3 text-electricViolet-glow" />
                              <span className={archivedMediaIds[msg.id] ? "text-emerald-400" : "text-white"}>
                                {archivedMediaIds[msg.id] ? "✓ Archivada" : (t.diary?.archivePhotosFromChat || "Archivar en Ficha")}
                              </span>
                            </button>
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
                  title={language === "es" ? "Cambiar a Salidas Respetuosas Cero Plantones (+5 Karma)" : "Switch to Anti-Ghost Exits (+5 Karma)"}
                >
                  <Ghost className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>{language === "es" ? "CERO-PLANTONES (+5)" : "NO-GHOST (+5)"}</span>
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
              <form
                onSubmit={handleSend}
                className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
              >
                {/* BOTÓN DIRECTO MODO EFÍMERO (BURN-ON-VIEW 🔥 44x44px) */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playStateSwitch("occupied");
                    setIsBurnMode(!isBurnMode);
                  }}
                  aria-label={isBurnMode ? (language === "es" ? "Desactivar modo efímero" : "Disable burn mode") : (language === "es" ? "Activar modo efímero de 1 vista" : "Enable burn mode")}
                  aria-pressed={isBurnMode}
                  className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 flex-shrink-0 ${
                    isBurnMode
                      ? "bg-bloodNeon/25 border-bloodNeon text-bloodNeon shadow-blood-glow"
                      : "border-white/10 bg-white/5 text-neutral-400 hover:text-bloodNeon hover:border-bloodNeon/50"
                  }`}
                  title={isBurnMode ? (language === "es" ? "Modo Efímero Activo (1 sola lectura)" : "Burn Mode ON") : (language === "es" ? "Activar Modo Efímero (🔥)" : "Toggle Burn Mode (🔥)")}
                >
                  <Flame className={`w-4 h-4 ${isBurnMode ? "animate-pulse fill-bloodNeon/30" : ""}`} />
                </button>

                {/* BOTÓN ADJUNTAR FOTO / VIDEO / ÁLBUM (44x44px) */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setIsSendMediaModalOpen(true);
                  }}
                  aria-label={t.chat.attachMediaTooltip}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:text-electricViolet-glow hover:border-electricViolet/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0"
                  title={t.chat.attachMediaTooltip}
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* INPUT DE TEXTO BRUTALISTA AMPLIO */}
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    aria-label={language === "es" ? "Escribir mensaje" : "Write a message"}
                    placeholder={
                      activeBoundary?.chatStatus === "muted"
                        ? t.chat.mutedPlaceholder
                        : isBurnMode
                        ? t.chat.burnModeActive
                        : t.chat.normalPlaceholder || (language === "es" ? "Escribí un mensaje..." : "Write a message...")
                    }
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className={`w-full min-h-[44px] bg-black/50 border rounded-2xl text-white text-xs px-3.5 py-2.5 sm:py-3 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 transition-all ${
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

                {/* BOTÓN REACTIVO: SI HAY TEXTO -> ENVIAR; SI ESTÁ VACÍO -> MICRÓFONO (44x44px) */}
                {inputMessage.trim() ? (
                  <button
                    type="submit"
                    disabled={isSendingMessage}
                    aria-label={language === "es" ? "Enviar mensaje" : "Send message"}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-90 bg-electricViolet hover:bg-electricViolet-glow text-white shadow-[0_0_18px_rgba(139,92,246,0.5)] flex-shrink-0"
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
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:text-mintNeon hover:border-mintNeon/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mintNeon active:scale-95 flex-shrink-0"
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
        </div>

      </div>

      {/* DRAWER FLOTANTE DE FICHA TÁCTICA / PERFIL (ACCESIBLE EN MOBILE Y DESKTOP) */}
      <ChatProfileDrawer
        isOpen={isDossierDrawerOpen}
        onClose={() => setIsDossierDrawerOpen(false)}
        profile={profile}
        onOpenRendezvousSheet={() => setIsRendezvousSheetOpen(true)}
      />

      {/* ASISTENTE UNIFICADO DE ENCUENTROS (FASE 2) */}
      <RendezvousSheet
        isOpen={isRendezvousSheetOpen}
        onClose={() => setIsRendezvousSheetOpen(false)}
        targetProfile={profile}
      />

      {/* MODAL BRUTALISTA DE CONFIRMACIÓN PARA LIMPIAR CHAT */}
      {isClearConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="w-full max-w-sm bg-obsidian-deep border border-bloodNeon/50 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-bloodNeon/20 border border-bloodNeon/40 text-bloodNeon flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                {language === "es" ? "¿Limpiar todo el historial?" : "Clear chat history?"}
              </h3>
              <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                {t.chat.clearHistoryConfirm || (language === "es" ? "Se borrarán todos los mensajes de esta conversación en tu dispositivo." : "All messages in this chat will be deleted from your device.")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
              >
                {language === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playSubBass(55);
                  clearChatHistory(profile.id);
                  setIsClearConfirmOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-bloodNeon hover:bg-red-600 text-white font-black transition-all cursor-pointer shadow-blood-glow"
              >
                {language === "es" ? "Confirmar" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


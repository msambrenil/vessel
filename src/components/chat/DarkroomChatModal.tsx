"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  useChat,
  useRadarMatrix,
  useDiary,
  useLogistics,
  useSettings,
  createFallbackProfile,
} from "@/context/VesselContext";
import {
  Ghost,
  Zap,
  Trash2,
  X,
  MapPin,
  Flame,
  Shield,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { WriteTestimonialModal } from "@/components/profile/WriteTestimonialModal";
import { BoundaryManagerModal } from "./BoundaryManagerModal";
import { SendMediaModal } from "./SendMediaModal";
import { ChatMediaViewerModal } from "./ChatMediaViewerModal";
import { KIND_CLOSURE_MESSAGES } from "@/data/energyCatalog";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { ChatMediaAttachment } from "@/types/vessel";
import { RendezvousSheet } from "./RendezvousSheet";
import { EncounterContextBar } from "./EncounterContextBar";
import { ChatProfileDrawer } from "./ChatProfileDrawer";
import { ChatHeader } from "./ChatHeader";
import { ChatTacticalMenu } from "./ChatTacticalMenu";
import { ChatMessageStream } from "./ChatMessageStream";
import { ChatQuickActionBar } from "./ChatQuickActionBar";
import { ChatInputBar } from "./ChatInputBar";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

interface DarkroomChatModalProps {
  profileId: string;
  onClose: () => void;
}

export const DarkroomChatModal: React.FC<DarkroomChatModalProps> = ({
  profileId,
  onClose,
}) => {
  const {
    chatMessages,
    markMessagesAsRead,
    sendChatMessage,
    retryChatMessage,
    sendVoiceMessage,
    sendKindClosureMessage,
    activeRendezvous,
    cancelRendezvousPin,
    unlockPhase2Waypoint,
    burnMessage,
    revokeAlbumAccessInChat,
    unrevokeAlbumAccessInChat,
    getBoundaryForProfile,
    getChatRetentionForProfile,
    toggleChatRetention,
    clearChatHistory,
  } = useChat();
  const {
    profiles,
    getProfileById,
    setSelectedProfile,
    hasMutualPulse,
  } = useRadarMatrix();
  const {
    validatedEncounters,
    validateEncounter,
    openCreateDiaryModal,
    getProfileDossier,
    archivePhotosToDossier,
    updateEncounterTicketStatus,
    confirmH2Ticket,
  } = useDiary();
  const { openEnRouteModal } = useLogistics();
  const { t, language } = useSettings();

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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isActionHubOpen, setIsActionHubOpen] = useState(false);

  // Estados de Multimedia y Álbumes
  const [isSendMediaModalOpen, setIsSendMediaModalOpen] = useState<boolean>(false);
  const [activeViewerMedia, setActiveViewerMedia] = useState<{
    media: ChatMediaAttachment;
    messageId: string;
    senderCodename: string;
  } | null>(null);
  const [revealedBlurredMediaIds, setRevealedBlurredMediaIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isEncounterValidated = !!validatedEncounters[profileId];
  const activeBoundary = getBoundaryForProfile(profileId);
  const dossier = getProfileDossier(profileId);

  const profile = (getProfileById ? getProfileById(profileId) : undefined) || profiles.find((p) => p.id === profileId) || createFallbackProfile(profileId);
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

  const handleQuickReply = React.useCallback((text: string) => {
    if (activeBoundary?.chatStatus === "readonly" || activeBoundary?.chatStatus === "disconnected") return;
    sendChatMessage(profileId, text, isBurnMode);
    setIsBurnMode(false);
  }, [activeBoundary?.chatStatus, sendChatMessage, profileId, isBurnMode]);

  const handleSendVoiceMessage = React.useCallback((audioDataUri: string, durationSeconds: number, waveform: number[]) => {
    sendVoiceMessage(profileId, audioDataUri, durationSeconds, waveform, isBurnMode);
    setIsVoiceRecording(false);
    setIsBurnMode(false);
  }, [sendVoiceMessage, profileId, isBurnMode]);

  const handleSendKindClosure = React.useCallback((text: string) => {
    audioEngine.playSuccess();
    sendKindClosureMessage(profileId, text);
    setIsKindClosureOpen(false);
    setShowRespectToast(true);
    setTimeout(() => setShowRespectToast(false), 4000);
  }, [sendKindClosureMessage, profileId]);

  const handleBurn = React.useCallback((messageId: string) => {
    audioEngine.playError();
    burnMessage(profileId, messageId);
  }, [burnMessage, profileId]);

  const handleRevealBlurredMedia = React.useCallback((msgId: string) => {
    setRevealedBlurredMediaIds((prev) => ({
      ...prev,
      [msgId]: true,
    }));
  }, []);

  const handleOpenViewerMedia = React.useCallback((media: ChatMediaAttachment, messageId: string, senderCodename: string) => {
    setActiveViewerMedia({ media, messageId, senderCodename });
  }, []);

  const handleArchivePhoto = React.useCallback((url: string, msgId: string) => {
    archivePhotosToDossier(profile.id, [url]);
    setArchivedMediaIds((prev) => ({ ...prev, [msgId]: true }));
  }, [archivePhotosToDossier, profile.id]);

  const handleRevokeAlbumAccess = React.useCallback((albumId: string, msgId: string) => {
    revokeAlbumAccessInChat(profile.id, albumId, msgId);
  }, [revokeAlbumAccessInChat, profile.id]);

  const handleUnrevokeAlbumAccess = React.useCallback((albumId: string, msgId: string) => {
    unrevokeAlbumAccessInChat(profile.id, albumId, msgId);
  }, [unrevokeAlbumAccessInChat, profile.id]);

  const handleUpdateEncounterTicketStatus = React.useCallback((ticketId: string, status: "confirmed" | "declined") => {
    updateEncounterTicketStatus(ticketId, status);
  }, [updateEncounterTicketStatus]);

  const handleConfirmH2Ticket = React.useCallback((ticketId: string, isMeSender: boolean) => {
    confirmH2Ticket(ticketId, isMeSender);
  }, [confirmH2Ticket]);

  const handleOpenRendezvousSheet = React.useCallback(() => {
    setIsRendezvousSheetOpen(true);
  }, []);

  const handleCancelRendezvousPin = React.useCallback((pId: string) => {
    cancelRendezvousPin(pId);
  }, [cancelRendezvousPin]);

  const handleUnlockPhase2Waypoint = React.useCallback((wpId: string) => {
    unlockPhase2Waypoint(wpId, profile.id);
  }, [unlockPhase2Waypoint, profile.id]);

  const handleToggleRetention = React.useCallback(() => {
    setIsTogglingRetention(true);
    audioEngine.playVaultUnlock();
    toggleChatRetention(profile.id);
    setTimeout(() => setIsTogglingRetention(false), 450);
  }, [toggleChatRetention, profile.id]);

  const quickReplies = useMemo(
    () => [
      t.chat.quickReplyDale,
      t.chat.quickReplyPin,
      t.chat.quickReplyNear,
      t.chat.quickReplyHost,
      t.chat.quickReplyBeer,
      t.chat.quickReplyLooking,
    ],
    [
      t.chat.quickReplyBeer,
      t.chat.quickReplyDale,
      t.chat.quickReplyHost,
      t.chat.quickReplyLooking,
      t.chat.quickReplyNear,
      t.chat.quickReplyPin,
    ]
  );
  const handleRetryMessage = React.useCallback(
    (msgId: string) => {
      retryChatMessage(profileId, msgId);
    },
    [retryChatMessage, profileId]
  );

  // Gesto Mobile-First: Swipe táctico desde el borde izquierdo para volver atrás
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch && touch.clientX <= 48) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    } else {
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    if (touch) {
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      if (deltaX > 75 && deltaY < 60) {
        audioEngine.playSubBass(55, 0.1);
        onClose();
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div
      role="region"
      aria-label={language === "es" ? `Chat seguro con ${profile.codename}` : `Secure chat with ${profile.codename}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[60] bg-obsidian-deep flex flex-col w-full h-[100dvh] overflow-hidden select-none animate-in fade-in duration-200 [overscroll-behavior:contain]"
    >
      <div className="w-full max-w-4xl mx-auto bg-obsidian-deep h-full flex flex-col relative md:border-x border-white/10 shadow-2xl overflow-hidden [overscroll-behavior:contain]">
        {/* COLUMNA PRINCIPAL DE MENSAJES Y FLUJO DE CHAT */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          {/* 1. CABECERA MODULAR */}
          <ChatHeader
            profile={profile}
            dossierAlias={dossier?.customAlias}
            language={language}
            currentRetention={currentRetention}
            isTogglingRetention={isTogglingRetention}
            onToggleRetention={handleToggleRetention}
            onClose={onClose}
            onOpenDossier={() => setIsDossierDrawerOpen(true)}
            onOpenRendezvous={() => setIsRendezvousSheetOpen(true)}
            onToggleTacticalMenu={() => setIsTacticalMenuOpen(!isTacticalMenuOpen)}
            isTacticalMenuOpen={isTacticalMenuOpen}
            hasActiveRendezvous={activeRendezvous?.profileId === profile.id}
          />

          {/* 2. MENÚ TÁCTICO FLOTANTE INTEGRAL */}
          <ChatTacticalMenu
            isOpen={isTacticalMenuOpen}
            onClose={() => setIsTacticalMenuOpen(false)}
            profile={profile}
            dossierAlias={dossier?.customAlias}
            language={language}
            onOpenKindClosure={() => setIsKindClosureOpen(true)}
            onOpenBoundaryModal={() => setIsBoundaryModalOpen(true)}
            activeBoundary={activeBoundary}
            currentRetention={currentRetention}
            onToggleRetention={handleToggleRetention}
            onOpenDossier={() => setIsDossierDrawerOpen(true)}
            onOpenFullProfile={() => setSelectedProfile(profile)}
            onOpenCreateDiary={() => openCreateDiaryModal(profile.id)}
            isEncounterValidated={isEncounterValidated}
            onOpenTestimonial={() => setIsWriteModalOpen(true)}
            onValidateEncounter={() => validateEncounter(profile.id, "chat_agreement")}
            hasMessages={messages.length > 0}
            onClearMessages={() => setIsClearConfirmOpen(true)}
          />

          {/* 3. BARRA CONTEXTUAL DINÁMICA DE ENCUENTRO */}
          <EncounterContextBar
            profile={profile}
            onOpenRendezvousSheet={() => setIsRendezvousSheetOpen(true)}
            onOpenEnRoute={() => openEnRouteModal(profile)}
            onCancelRendezvousPin={activeRendezvous?.profileId === profile.id ? () => cancelRendezvousPin(profile.id) : undefined}
            onOpenDossier={() => setIsDossierDrawerOpen(true)}
          />

          {/* 4. TOAST DE RECOMPENSA DE RESPETO */}
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

          {/* 5. MODAL OVERLAY DE SALIDAS CON ONDA ANTI-GHOST (NO EMPUJA EL CHAT) */}
          {isKindClosureOpen && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsKindClosureOpen(false);
              }}
            >
              <div className="w-full max-w-md bg-obsidian-deep border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-3 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wide">
                    <Ghost className="w-4 h-4 stroke-[2.5]" />
                    <span>{language === "es" ? "Salida con Onda • Cero Ghosting" : "Kind Exit • Anti-Ghost"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsKindClosureOpen(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {language === "es"
                    ? "¿No hay chispa o seguís de largo? Elegí una salida con la mejor onda en 1 toque. Sumás +5 Puntos de Respeto y cuidás la cultura de la comunidad."
                    : "No mutual spark? Choose a kind sign-off in 1 tap. Earn +5 Respect Karma and build a ghost-free community."}
                </p>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {KIND_CLOSURE_MESSAGES.map((msg) => (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => handleSendKindClosure(msg.text)}
                      className="w-full text-left p-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 border border-emerald-500/30 text-white text-xs flex items-start gap-2.5 transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-[0.98]"
                    >
                      <span className="text-base flex-shrink-0">{msg.emoji}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-emerald-300 block text-[11px]">
                          {msg.title}
                        </span>
                        <span className="text-neutral-200 text-[11px] leading-tight block group-hover:text-white">
                          &quot;{msg.text}&quot;
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. CINTA ULTRA-COMPACTA DE PACTO / PRE-FLIGHT (SOLO SI NO HAY ENCUENTRO EN CURSO) */}
          {pinnedPreFlight && !activeRendezvous && (
            <div
              data-testid="pinned-preflight-banner"
              className="px-3 py-1.5 bg-gradient-to-r from-purple-950/70 via-obsidian-surface to-electricViolet/15 border-b border-electricViolet/40 flex items-center justify-between gap-2 text-xs z-10 shadow-sm flex-shrink-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs flex-shrink-0">⚡</span>
                <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] font-mono text-neutral-300 truncate">
                  <span className="font-bold text-electricViolet-glow uppercase">
                    {pinnedPreFlight.source === "explicit"
                      ? (language === "es" ? "Pacto Confirmado" : "Confirmed")
                      : (language === "es" ? "Sintonía Mutua" : "Mutual Vibe")}
                  </span>
                  <span>•</span>
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

              <BrutalistButton
                variant="outline"
                size="sm"
                soundEffect="none"
                onClick={() => {
                  audioEngine.playSubBass(60);
                  setIsRendezvousSheetOpen(true);
                }}
                aria-label="Ajustar sintonía"
                className="!px-2 !py-0.5 !text-[9px] !rounded-lg !border-electricViolet/40 text-electricViolet-glow hover:text-white"
              >
                {language === "es" ? "Ajustar ⚡" : "Adjust ⚡"}
              </BrutalistButton>
            </div>
          )}

          {/* 7. STREAM MODULAR DE MENSAJES */}
          <ChatMessageStream
            messages={messages}
            profile={profile}
            language={language}
            t={t}
            quickReplies={quickReplies}
            activeRendezvous={activeRendezvous}
            revealedBlurredMediaIds={revealedBlurredMediaIds}
            archivedMediaIds={archivedMediaIds}
            messagesEndRef={messagesEndRef}
            onQuickReply={handleQuickReply}
            onBurn={handleBurn}
            onRevealBlurredMedia={handleRevealBlurredMedia}
            onOpenViewerMedia={handleOpenViewerMedia}
            onArchivePhoto={handleArchivePhoto}
            onRevokeAlbumAccess={handleRevokeAlbumAccess}
            onUnrevokeAlbumAccess={handleUnrevokeAlbumAccess}
            onUpdateEncounterTicketStatus={handleUpdateEncounterTicketStatus}
            onConfirmH2Ticket={handleConfirmH2Ticket}
            onOpenRendezvousSheet={handleOpenRendezvousSheet}
            onCancelRendezvousPin={handleCancelRendezvousPin}
            onUnlockPhase2Waypoint={handleUnlockPhase2Waypoint}
            onRetryMessage={handleRetryMessage}
          />

          {/* 8. BARRA TÁCTICA DE RESPUESTAS RÁPIDAS Y ANTI-GHOST */}
          {activeBoundary?.chatStatus !== "readonly" && activeBoundary?.chatStatus !== "disconnected" && (
            <ChatQuickActionBar
              quickBarMode={quickBarMode}
              onChangeQuickBarMode={setQuickBarMode}
              quickReplies={quickReplies}
              kindClosureMessages={KIND_CLOSURE_MESSAGES}
              isInputFocused={isInputFocused}
              language={language}
              onQuickReply={handleQuickReply}
              onSendKindClosure={handleSendKindClosure}
              onOpenKindClosureInfo={() => setIsKindClosureOpen(!isKindClosureOpen)}
            />
          )}

          {/* 9. BARRA MODULAR DE INPUT DE TEXTO, AUDIO Y MULTIMEDIA */}
          <ChatInputBar
            activeBoundary={activeBoundary}
            isVoiceRecording={isVoiceRecording}
            setIsVoiceRecording={setIsVoiceRecording}
            isBurnMode={isBurnMode}
            setIsBurnMode={setIsBurnMode}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isInputFocused={isInputFocused}
            setIsInputFocused={setIsInputFocused}
            isSendingMessage={isSendingMessage}
            language={language}
            t={t}
            onSend={handleSend}
            onSendVoiceMessage={handleSendVoiceMessage}
            onOpenSendMedia={() => setIsSendMediaModalOpen(true)}
            onOpenBoundaryModal={() => setIsBoundaryModalOpen(true)}
            onOpenActionHub={() => setIsActionHubOpen(true)}
          />

          {/* 10. MODALES ADJUNTOS */}
          <SendMediaModal
            isOpen={isSendMediaModalOpen}
            onClose={() => setIsSendMediaModalOpen(false)}
            targetProfileId={profile.id}
            targetCodename={profile.codename}
          />

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

      {/* DRAWER FLOTANTE DE FICHA TÁCTICA */}
      <ChatProfileDrawer
        isOpen={isDossierDrawerOpen}
        onClose={() => setIsDossierDrawerOpen(false)}
        profile={profile}
        onOpenRendezvousSheet={() => setIsRendezvousSheetOpen(true)}
      />

      {/* ASISTENTE UNIFICADO DE ENCUENTROS */}
      <RendezvousSheet
        isOpen={isRendezvousSheetOpen}
        onClose={() => setIsRendezvousSheetOpen(false)}
        targetProfile={profile}
      />

      {/* MODAL BRUTALISTA DE CONFIRMACIÓN PARA LIMPIAR CHAT (CON BRUTALIST BUTTON) */}
      {isClearConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
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
                {t.chat.clearHistoryConfirm || (language === "es" ? "Se van a borrar todos los mensajes de esta charla en tu celu." : "All messages in this chat will be deleted from your device.")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <BrutalistButton
                variant="outline"
                size="default"
                onClick={() => setIsClearConfirmOpen(false)}
                aria-label={language === "es" ? "Cancelar" : "Cancel"}
              >
                {language === "es" ? "Cancelar" : "Cancel"}
              </BrutalistButton>
              <BrutalistButton
                variant="danger"
                size="default"
                onClick={() => {
                  audioEngine.playSubBass(55);
                  clearChatHistory(profile.id);
                  setIsClearConfirmOpen(false);
                }}
                aria-label={language === "es" ? "Confirmar" : "Confirm"}
              >
                {language === "es" ? "Confirmar" : "Confirm"}
              </BrutalistButton>
            </div>
          </div>
        </div>
      )}

      {/* ACTION HUB TÁCTICO DEL PULGAR (BOTTOM SHEET MODAL) */}
      {isActionHubOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.chat.actionHubTitle || (language === "es" ? "Acciones Rápidas del Pulgar" : "Thumb Action Hub")}
          className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsActionHubOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-obsidian-deep border-t sm:border border-electricViolet/40 rounded-t-[2.5rem] sm:rounded-3xl p-5 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] space-y-4 animate-in slide-in-from-bottom duration-200 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle táctil para mobile */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            {/* Cabecera del Hub */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-electricViolet/20 border border-electricViolet/40 flex items-center justify-center text-electricViolet-glow">
                  <Zap className="w-4 h-4 fill-electricViolet/30" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {t.chat.actionHubTitle || (language === "es" ? "Acciones Rápidas" : "Quick Actions")}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {t.chat.actionHubSubtitle || (language === "es" ? "Herramientas de encuentro y seguridad" : "Encounter & safety tools")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsActionHubOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
                aria-label={t.chat.actionHubClose || (language === "es" ? "Cerrar menú" : "Close menu")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grilla 2x3 de acciones tácticas */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Pactar Cita Express */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playSubBass(60);
                  setIsActionHubOpen(false);
                  setIsRendezvousSheetOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-electricViolet/20 border border-electricViolet/30 hover:border-electricViolet text-left transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex flex-col justify-between min-h-[80px]"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-xl bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-3.5 h-3.5 fill-electricViolet/30" />
                  </div>
                  <span className="text-[9px] font-mono text-electricViolet-glow uppercase font-black">
                    {language === "es" ? "EXPRESS" : "FAST"}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-electricViolet-glow transition-colors">
                    {t.chat.actionHubPactar || (language === "es" ? "Pactar Cita Express" : "Schedule Express Date")}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono leading-tight block">
                    {t.chat.actionHubPactarDesc || (language === "es" ? "Esquina, lugar o PIN" : "Corner, place or PIN")}
                  </span>
                </div>
              </button>

              {/* 2. Mandar Esquina Fase 1 */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playSubBass(55);
                  setIsActionHubOpen(false);
                  setIsRendezvousSheetOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-left transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 flex flex-col justify-between min-h-[80px]"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-black">
                    ~150M
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition-colors">
                    {t.chat.actionHubEsquina || (language === "es" ? "Mandar Esquina (Fase 1)" : "Send Corner (Phase 1)")}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono leading-tight block">
                    {t.chat.actionHubEsquinaDesc || (language === "es" ? "Waypoint seguro (~150m)" : "Safe waypoint (~150m)")}
                  </span>
                </div>
              </button>

              {/* 3. Foto de 1 Vista (Modo Efímero) */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsBurnMode(true);
                  setIsActionHubOpen(false);
                  setIsSendMediaModalOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-bloodNeon/20 border border-bloodNeon/30 hover:border-bloodNeon text-left transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 flex flex-col justify-between min-h-[80px]"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-xl bg-bloodNeon/20 border border-bloodNeon/40 text-bloodNeon flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame className="w-3.5 h-3.5 fill-bloodNeon/30" />
                  </div>
                  <span className="text-[9px] font-mono text-bloodNeon uppercase font-black">
                    1 VISTA
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-bloodNeon transition-colors">
                    {t.chat.actionHubBurnPhoto || (language === "es" ? "Foto de 1 Vista" : "1-View Photo")}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono leading-tight block">
                    {t.chat.actionHubBurnPhotoDesc || (language === "es" ? "Se autodestruye al abrir" : "Self-destructs on open")}
                  </span>
                </div>
              </button>

              {/* 4. Salida con Onda (+5 Respeto) */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playSubBass(65);
                  setIsActionHubOpen(false);
                  setIsKindClosureOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95 flex flex-col justify-between min-h-[80px]"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase font-black">
                    +5 KARMA
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-cyan-300 transition-colors">
                    {t.chat.actionHubKindClosure || (language === "es" ? "Salida con Onda (+5)" : "Kind Exit (+5)")}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono leading-tight block">
                    {t.chat.actionHubKindClosureDesc || (language === "es" ? "Avisar con respeto si no pinta" : "Polite closure if no spark")}
                  </span>
                </div>
              </button>

              {/* 6. Ficha & Notas Privadas */}
              <button
                type="button"
                onClick={() => {
                  audioEngine.playSubBass(70);
                  setIsActionHubOpen(false);
                  setIsDossierDrawerOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400 text-left transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-95 flex flex-col justify-between min-h-[80px]"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-mono text-purple-400 uppercase font-black">
                    DOSSIER
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-purple-300 transition-colors">
                    {t.chat.actionHubDossier || (language === "es" ? "Ficha & Notas" : "Dossier & Notes")}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono leading-tight block">
                    {t.chat.actionHubDossierDesc || (language === "es" ? "Kinks, límites y notas" : "Kinks, boundaries and notes")}
                  </span>
                </div>
              </button>
            </div>

            {/* Botón de cierre ergonómico */}
            <div className="pt-1">
              <BrutalistButton
                variant="outline"
                size="default"
                className="w-full"
                onClick={() => setIsActionHubOpen(false)}
                aria-label={t.chat.actionHubClose || (language === "es" ? "Cerrar menú" : "Close menu")}
              >
                {t.chat.actionHubClose || (language === "es" ? "Cerrar menú" : "Close menu")}
              </BrutalistButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

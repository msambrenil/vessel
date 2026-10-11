"use client";

import React from "react";
import {
  Flame,
  Mic,
  Zap,
  Calendar,
  Clock,
  Navigation,
  MapPin,
  Lock,
  CheckCircle2,
  ShieldAlert,
  FolderLock,
  FolderOpen,
  ShieldOff,
  RefreshCw,
  Maximize2,
  EyeOff,
  Film,
  Ghost,
  X,
} from "lucide-react";
import { ChatMessage, ChatMediaAttachment, VesselProfile, RendezvousPin } from "@/types/vessel";
import { TranslationType } from "@/lib/i18n/translations";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { formatDiaryDateDisplay } from "@/lib/calendar/dateLocale";
import { PreFlightCard } from "./PreFlightCard";
import { ChatVoiceMessageBubble } from "./ChatVoiceMessageBubble";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

export interface ChatMessageItemProps {
  msg: ChatMessage;
  profile: VesselProfile;
  language: "es" | "en";
  t: TranslationType;
  activeRendezvous: RendezvousPin | null;
  revealedBlurredMediaIds: Record<string, boolean>;
  archivedMediaIds: Record<string, boolean>;
  onBurn: (msgId: string) => void;
  onRevealBlurredMedia: (msgId: string) => void;
  onOpenViewerMedia: (media: ChatMediaAttachment, messageId: string, senderCodename: string) => void;
  onArchivePhoto: (url: string, msgId: string) => void;
  onRevokeAlbumAccess: (albumId: string, msgId: string) => void;
  onUnrevokeAlbumAccess: (albumId: string, msgId: string) => void;
  onUpdateEncounterTicketStatus: (ticketId: string, status: "confirmed" | "declined") => void;
  onConfirmH2Ticket: (ticketId: string, isMe: boolean) => void;
  onOpenRendezvousSheet: () => void;
  onCancelRendezvousPin: (profileId: string) => void;
  onUnlockPhase2Waypoint: (waypointId: string) => void;
  onRetryMessage?: (msgId: string) => void;
}

const ChatMessageItemComponent: React.FC<ChatMessageItemProps> = ({
  msg,
  profile,
  language,
  t,
  activeRendezvous,
  revealedBlurredMediaIds,
  archivedMediaIds,
  onBurn,
  onRevealBlurredMedia,
  onOpenViewerMedia,
  onArchivePhoto,
  onRevokeAlbumAccess,
  onUnrevokeAlbumAccess,
  onUpdateEncounterTicketStatus,
  onConfirmH2Ticket,
  onOpenRendezvousSheet,
  onCancelRendezvousPin,
  onUnlockPhase2Waypoint,
  onRetryMessage,
}) => {
  const isMe = msg.senderId === "me";
  const isSystem = msg.senderId === "system";

  if (isSystem) {
    return (
      <div className="w-full my-2">
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
      <div className="w-full my-3">
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

          {ticket.status === "proposed" && !isMe && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <BrutalistButton
                variant="primary"
                size="sm"
                soundEffect="none"
                onClick={() => {
                  audioEngine.playSubBass(70);
                  onUpdateEncounterTicketStatus(ticket.id, "confirmed");
                }}
                className="w-full text-xs font-mono font-bold"
              >
                {t.diary?.encounterTicketAccept || (language === "es" ? "Aceptar Cita" : "Accept Date")}
              </BrutalistButton>
              <BrutalistButton
                variant="secondary"
                size="sm"
                soundEffect="pulse"
                onClick={() => {
                  onUpdateEncounterTicketStatus(ticket.id, "declined");
                }}
                className="w-full text-xs font-mono font-bold"
              >
                {t.diary?.encounterTicketDecline || (language === "es" ? "Declinar" : "Decline")}
              </BrutalistButton>
            </div>
          )}

          {ticket.status === "proposed" && isMe && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <BrutalistButton
                variant="secondary"
                size="compact"
                soundEffect="pulse"
                onClick={() => {
                  onOpenRendezvousSheet();
                }}
                className="flex-1 text-[11px] font-mono font-bold"
              >
                {language === "es" ? "Reprogramar Hora" : "Reschedule"}
              </BrutalistButton>
              <BrutalistButton
                variant="danger"
                size="compact"
                soundEffect="pulse"
                onClick={() => {
                  onUpdateEncounterTicketStatus(ticket.id, "declined");
                }}
                className="text-[11px] font-mono font-bold"
              >
                {language === "es" ? "Cancelar Propuesta" : "Cancel"}
              </BrutalistButton>
            </div>
          )}

          {isConfirmed && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-[10px] font-mono px-1">
                <span className={myH2Confirmed ? "text-emerald-400 font-bold" : "text-neutral-400"}>
                  {language === "es" ? "Vos:" : "You:"} {myH2Confirmed ? "✓ Confirmado" : "Pendiente"}
                </span>
                <span className={theirH2Confirmed ? "text-emerald-400 font-bold" : "text-neutral-400"}>
                  {profile.codename}: {theirH2Confirmed ? "✓ Confirmado" : "Pendiente"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <BrutalistButton
                  variant="mint"
                  size="sm"
                  soundEffect="none"
                  onClick={() => {
                    audioEngine.playSuccess();
                    onConfirmH2Ticket(ticket.id, isMe);
                  }}
                  disabled={Boolean(myH2Confirmed)}
                  className="flex-1 text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {myH2Confirmed
                      ? (language === "es" ? "Asistencia Confirmada ✓" : "Arrival Confirmed ✓")
                      : (language === "es" ? "Confirmar que voy (H-2)" : "Confirm arrival (H-2)")}
                  </span>
                </BrutalistButton>

                <BrutalistButton
                  variant="outline"
                  size="sm"
                  soundEffect="pulse"
                  onClick={() => {
                    onUpdateEncounterTicketStatus(ticket.id, "declined");
                  }}
                  className="text-[11px] font-mono font-bold hover:text-bloodNeon hover:border-bloodNeon/40"
                  title={language === "es" ? "Cancelar cita" : "Cancel date"}
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </BrutalistButton>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  {/* PRE-FLIGHT CHECKLIST */}
  if (msg.isPreFlightChecklist && msg.preFlightData) {
    return (
      <div className={`w-full my-3 flex ${isMe ? "justify-end" : "justify-start"}`}>
        <PreFlightCard data={msg.preFlightData} isCurrentUser={isMe} />
      </div>
    );
  }

  {/* PUNTO DE ENCUENTRO RENDEZVOUS */}
  if (msg.isRendezvousPin && msg.rendezvousData) {
    const isCancelled =
      msg.isCancelledRendezvous ||
      !activeRendezvous ||
      activeRendezvous.id !== msg.rendezvousData.id;

    return (
      <div className="w-full my-3">
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
            <BrutalistButton
              variant="danger"
              size="sm"
              soundEffect="pulse"
              onClick={() => onCancelRendezvousPin(profile.id)}
              className="w-full mt-2 text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>{language === "es" ? "Anular Punto de Encuentro" : "Cancel Meeting Point"}</span>
            </BrutalistButton>
          )}
        </div>
      </div>
    );
  }

  {/* WAYPOINT SEGURO EN 2 FASES */}
  if (msg.isSecureWaypoint && msg.waypointData) {
    const waypoint = msg.waypointData;
    const isReceiver = !isMe;

    return (
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} my-2 w-full`}>
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

          {isReceiver && !waypoint.isPhase2Unlocked && (
            <BrutalistButton
              variant="primary"
              size="default"
              soundEffect="pulse"
              onClick={() => {
                onUnlockPhase2Waypoint(waypoint.id);
              }}
              className="w-full font-mono font-extrabold text-xs shadow-violet-glow flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>YA ESTOY EN LA ESQUINA (VER PISO)</span>
            </BrutalistButton>
          )}
        </div>
      </div>
    );
  }

  {/* ALERTA DE EXPOSICIÓN A ITS */}
  if (msg.isItsExposureAlert && msg.itsExposureData) {
    const alert = msg.itsExposureData;
    return (
      <div className="w-full my-2 flex justify-center">
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

  {/* MENSAJE DE VOZ */}
  if (msg.isVoiceMessage) {
    const safeVoiceData = msg.voiceData || {
      audioUrl: msg.mediaUrl || "",
      durationSeconds: 5,
      waveform: [30, 50, 70, 40, 60, 80, 50, 40, 30, 60, 45, 35],
    };
    return (
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} my-2`}>
        <ChatVoiceMessageBubble
          messageId={msg.id}
          voiceData={safeVoiceData}
          isMine={isMe}
          isBurnOnView={msg.isBurnOnView}
          isBurned={msg.isBurned}
          timestamp={msg.timestamp}
          onBurn={onBurn}
        />
      </div>
    );
  }

  {/* MENSAJE O ARCHIVO ADJUNTO ESTÁNDAR */}
  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
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
        {/* HEADER SALIDA AMABLE */}
        {msg.isKindClosure && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-black mb-1 uppercase tracking-wide">
            <Ghost className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.chat.kindClosureTooltip}</span>
          </div>
        )}

        {/* HEADER BURN-ON-VIEW */}
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

        {/* ÁLBUM COMPARTIDO */}
        {msg.mediaAttachment?.sharedAlbumId ? (() => {
          const isRevoked = Boolean(msg.isRevoked || msg.mediaAttachment.isRevoked);
          const albumId = msg.mediaAttachment.sharedAlbumId;

          return (
            <div className="space-y-2.5 my-1">
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

                  {isMe && !isRevoked && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRevokeAlbumAccess(albumId, msg.id);
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
                      onClick={() => onUnrevokeAlbumAccess(albumId, msg.id)}
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
                <>
                  <div
                    onClick={() => {
                      audioEngine.playVaultUnlock();
                      onOpenViewerMedia(msg.mediaAttachment!, msg.id, isMe ? "Vos" : profile.codename);
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

                  <BrutalistButton
                    variant="primary"
                    size="sm"
                    soundEffect="vault"
                    onClick={() => {
                      onOpenViewerMedia(msg.mediaAttachment!, msg.id, isMe ? "Vos" : profile.codename);
                    }}
                    className="w-full text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-violet-soft"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    {t.chat.viewFullAlbum}
                  </BrutalistButton>
                </>
              )}
            </div>
          );
        })() : msg.mediaAttachment ? (
          /* FOTO / VIDEO INDIVIDUAL */
          <div className="space-y-2 my-1">
            {msg.mediaAttachment.mode === "view_once" ? (
              msg.isBurned ? (
                <div className="py-2 px-3 rounded-xl bg-bloodNeon/10 border border-bloodNeon/40 text-bloodNeon-300 font-mono text-[11px] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-bloodNeon" />
                  <span>{t.chat.viewOnceBurned}</span>
                </div>
              ) : (
                <BrutalistButton
                  variant="danger"
                  size="default"
                  soundEffect="pulse"
                  onClick={() => {
                    onOpenViewerMedia(msg.mediaAttachment!, msg.id, isMe ? "Vos" : profile.codename);
                  }}
                  className="w-full text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(230,25,55,0.3)] animate-pulse"
                >
                  <Flame className="w-4 h-4 text-bloodNeon" />
                  <span>{t.chat.viewOnceNotice}</span>
                </BrutalistButton>
              )
            ) : msg.mediaAttachment.mode === "privacy_blur" ? (
              /* PRIVACY BLUR */
              <div className="relative rounded-xl overflow-hidden border border-purple-500/40 bg-black group">
                {revealedBlurredMediaIds[msg.id] ? (
                  <img
                    src={msg.mediaAttachment.url}
                    alt="Contenido"
                    onClick={() =>
                      onOpenViewerMedia(msg.mediaAttachment!, msg.id, isMe ? "Vos" : profile.codename)
                    }
                    className="w-full max-h-56 object-cover cursor-pointer hover:scale-105 transition-transform"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    onClick={() => {
                      audioEngine.playPulse();
                      onRevealBlurredMedia(msg.id);
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
                  onOpenViewerMedia(msg.mediaAttachment!, msg.id, isMe ? "Vos" : profile.codename);
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

                {!isMe && msg.mediaAttachment.url && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchivePhoto(msg.mediaAttachment!.url, msg.id);
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

        {/* TEXTO DEL MENSAJE */}
        {msg.text && (
          <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
        )}

        {/* BOTÓN BORRAR YA PARA BURN-ON-VIEW RECIBIDO */}
        {msg.isBurnOnView && !msg.isBurned && !isMe && (
          <div className="mt-2.5 pt-2 border-t border-bloodNeon/30 flex justify-end">
            <BrutalistButton
              variant="danger"
              size="sm"
              onClick={() => onBurn(msg.id)}
              soundEffect="none"
              className="!py-1 !px-3 !text-[10px] !rounded-full"
            >
              <Flame className="w-3 h-3" />
              <span>{t.chat.destroyNow || "Borrar ya"}</span>
            </BrutalistButton>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-1 px-1">
        {msg.isFailed ? (
          <button
            type="button"
            onClick={() => {
              audioEngine.playSubBass(60, 0.1);
              onRetryMessage?.(msg.id);
            }}
            className="flex items-center gap-1 text-[10px] font-mono text-bloodNeon hover:text-white font-bold bg-bloodNeon/15 hover:bg-bloodNeon/30 border border-bloodNeon/50 px-2 py-0.5 rounded-full cursor-pointer transition-colors active:scale-95 shadow-sm"
            title={language === "es" ? "Error de conexión. Tocá para reintentar" : "Connection error. Tap to retry"}
            aria-label={language === "es" ? "Error de conexión. Tocá para reintentar" : "Connection error. Tap to retry"}
          >
            <RefreshCw className="w-3 h-3 text-bloodNeon" />
            <span>{language === "es" ? "Error • Reintentar" : "Failed • Retry"}</span>
          </button>
        ) : (
          <>
            <span className="text-[9px] text-neutral-400 font-mono font-medium">
              {msg.timestamp}
            </span>
            {isMe && (
              <span
                className={`text-[10px] font-mono ${msg.isRead ? "text-electricViolet-glow font-bold" : "text-neutral-400"}`}
                title={msg.isRead ? (language === "es" ? "Leído" : "Read") : (language === "es" ? "Enviado" : "Sent")}
              >
                {msg.isRead ? "✓✓" : "✓"}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const ChatMessageItem = React.memo(
  ChatMessageItemComponent,
  (prev, next) => {
    return (
      prev.msg === next.msg &&
      prev.language === next.language &&
      prev.profile.id === next.profile.id &&
      Boolean(prev.revealedBlurredMediaIds?.[prev.msg.id]) === Boolean(next.revealedBlurredMediaIds?.[next.msg.id]) &&
      Boolean(prev.archivedMediaIds?.[prev.msg.id]) === Boolean(next.archivedMediaIds?.[next.msg.id]) &&
      prev.activeRendezvous === next.activeRendezvous
    );
  }
);

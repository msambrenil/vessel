"use client";

import React, { RefObject } from "react";
import { Sparkles } from "lucide-react";
import { ChatMessage, ChatMediaAttachment, VesselProfile, RendezvousPin } from "@/types/vessel";
import { TranslationType } from "@/lib/i18n/translations";
import { ChatMessageItem } from "./ChatMessageItem";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

interface ChatMessageStreamProps {
  messages: ChatMessage[];
  profile: VesselProfile;
  language: "es" | "en";
  t: TranslationType;
  quickReplies: string[];
  activeRendezvous: RendezvousPin | null;
  revealedBlurredMediaIds: Record<string, boolean>;
  archivedMediaIds: Record<string, boolean>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onQuickReply: (text: string) => void;
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

export const ChatMessageStream: React.FC<ChatMessageStreamProps> = ({
  messages,
  profile,
  language,
  t,
  quickReplies,
  activeRendezvous,
  revealedBlurredMediaIds,
  archivedMediaIds,
  messagesEndRef,
  onQuickReply,
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
  const getRoleDisplayLabel = (role?: string) => {
    if (!role) return "Versátil";
    switch (role) {
      case "active":
        return language === "es" ? "Activo" : "Top";
      case "passive":
        return language === "es" ? "Pasivo" : "Bottom";
      case "versatile":
        return language === "es" ? "Versátil" : "Vers";
      case "side":
        return "Side";
      default:
        return role;
    }
  };

  return (
    <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-obsidian-deep via-[#070709] to-obsidian-deep overscroll-contain">
      {/* ESTADO VACÍO TÁCTICO DE APERTURA DE CANAL */}
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
                ? `${getRoleDisplayLabel(profile.role)} • ${profile.hosting || "Sin lugar"}. Rompé el hielo en 1 toque o coordiná cita directa.`
                : `${getRoleDisplayLabel(profile.role)} • ${profile.hosting || "No host"}. Break the ice in 1 tap or schedule a date.`}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {quickReplies.slice(0, 3).map((icebreaker, idx) => (
              <BrutalistButton
                key={idx}
                variant="secondary"
                size="sm"
                soundEffect="pulse"
                onClick={() => onQuickReply(icebreaker)}
                className="!text-[11px] !py-1.5 !px-3 !rounded-xl normal-case"
              >
                {icebreaker}
              </BrutalistButton>
            ))}
          </div>
        </div>
      )}

      {/* LISTA DE MENSAJES CON CONTENCIÓN DE RENDERIZADO NATIVA */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          data-testid="chat-message-item-wrapper"
          className="[content-visibility:auto] [contain-intrinsic-size:0_72px]"
        >
          <ChatMessageItem
            msg={msg}
            profile={profile}
            language={language}
            t={t}
            activeRendezvous={activeRendezvous}
            revealedBlurredMediaIds={revealedBlurredMediaIds}
            archivedMediaIds={archivedMediaIds}
            onBurn={onBurn}
            onRevealBlurredMedia={onRevealBlurredMedia}
            onOpenViewerMedia={onOpenViewerMedia}
            onArchivePhoto={onArchivePhoto}
            onRevokeAlbumAccess={onRevokeAlbumAccess}
            onUnrevokeAlbumAccess={onUnrevokeAlbumAccess}
            onUpdateEncounterTicketStatus={onUpdateEncounterTicketStatus}
            onConfirmH2Ticket={onConfirmH2Ticket}
            onOpenRendezvousSheet={onOpenRendezvousSheet}
            onCancelRendezvousPin={onCancelRendezvousPin}
            onUnlockPhase2Waypoint={onUnlockPhase2Waypoint}
            onRetryMessage={onRetryMessage}
          />
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

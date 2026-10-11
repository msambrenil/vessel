"use client";

import React, { useState } from "react";
import { useDiary, useChat } from "@/context/VesselContext";
import {
  DiaryEntry,
  ExitProtocol,
  VesselProfile,
  DiarySatisfaction,
  DiaryWouldRepeat,
} from "@/types/vessel";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { TranslationType } from "@/lib/i18n/translations";
import { formatDiaryDateDisplay, getLocalDaysOffsetIso, hasHostingCapability } from "@/lib/calendar/dateLocale";
import {
  BrutalistButton,
  TacticalBadge,
  TacticalAvatar,
} from "@/components/ui";
import {
  Calendar,
  Clock,
  Star,
  Flame,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  MessageCircle,
  CheckCircle2,
  ShieldAlert,
  HeartHandshake,
  Zap,
  MoreHorizontal,
} from "lucide-react";

export interface DiaryEntryCardProps {
  entry: DiaryEntry;
  linkedProfile?: VesselProfile;
  isRevealed: boolean;
  onToggleReveal: (id: string) => void;
  onInspectExternal: (person: DiaryEntry["person"]) => void;
  onOpenDossier: (profileId: string) => void;
  onSelectProfile: (profile: VesselProfile) => void;
  onOpenChat: (profileId: string) => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  onCompleteDate?: (entry: DiaryEntry) => void;
  onQuickReview?: (entry: DiaryEntry, satisfaction: DiarySatisfaction) => void;
  onStartDoxyPep?: (entry: DiaryEntry) => void;
  onSendRevancha?: (lover: { profileId: string; codename: string }) => void;
  language: "es" | "en";
  t: TranslationType;
  photosCount?: number;
  intimateBadges?: string[];
  encounterCount?: number;
  primaryPhotoUrl?: string;
}

export const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({
  entry,
  linkedProfile,
  isRevealed,
  onToggleReveal,
  onInspectExternal,
  onOpenDossier,
  onSelectProfile,
  onOpenChat,
  onEdit,
  onDelete,
  onCompleteDate,
  onQuickReview,
  onStartDoxyPep,
  onSendRevancha,
  language,
  t,
  photosCount = 0,
  intimateBadges = [],
  encounterCount = 0,
  primaryPhotoUrl,
}) => {
  const { updateDiaryEntry } = useDiary();
  const { sendChatMessage } = useChat();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rescheduleToast, setRescheduleToast] = useState<string | null>(null);
  const [revanchaSent, setRevanchaSent] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  const effectiveRole = entry.person.role || linkedProfile?.role || "Versatile";
  const effectiveProfileId =
    entry.person.profileId || `ext-${entry.person.codename.toLowerCase()}`;

  const heroPhotoSrc =
    primaryPhotoUrl ||
    entry.person.avatarUrl ||
    linkedProfile?.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80";

  const mergedBadges = Array.from(
    new Set([...intimateBadges, ...(entry.person.badges || [])])
  );

  const handleQuickReschedule = (deltaMinutes?: number, setTomorrow?: boolean) => {
    audioEngine.playPulse();
    let nextDate = entry.date;
    let nextTime = entry.time || "22:00";

    if (setTomorrow) {
      nextDate = getLocalDaysOffsetIso(1);
    } else if (deltaMinutes) {
      const [hh, mm] = (entry.time || "22:00").split(":").map((n) => parseInt(n, 10) || 0);
      const totalMinutes = hh * 60 + mm + deltaMinutes;
      if (totalMinutes >= 24 * 60) {
        nextDate = getLocalDaysOffsetIso(1);
      }
      const wrappedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
      const newH = String(Math.floor(wrappedMinutes / 60)).padStart(2, "0");
      const newM = String(wrappedMinutes % 60).padStart(2, "0");
      nextTime = `${newH}:${newM}`;
    }

    updateDiaryEntry(entry.id, {
      ...entry,
      date: nextDate,
      time: nextTime,
    });

    if (linkedProfile) {
      const msg =
        language === "es"
          ? `⏳ Reprogramé nuestro encuentro para ${setTomorrow ? "mañana" : "hoy"} a las ${nextTime} hs.`
          : `⏳ Rescheduled our encounter for ${setTomorrow ? "tomorrow" : "today"} at ${nextTime}.`;
      sendChatMessage(linkedProfile.id, msg);
    }

    setRescheduleToast(
      language === "es"
        ? `✓ Reprogramado (${nextTime} hs)`
        : `✓ Rescheduled (${nextTime})`
    );
    setTimeout(() => setRescheduleToast(null), 2600);
  };

  const handlePoliteCancel = () => {
    audioEngine.playSubBass(50, 0.3);
    if (linkedProfile) {
      const msg =
        language === "es"
          ? `🤝 Hola @${linkedProfile.codename}, te aviso con tiempo que hoy no voy a poder concretar nuestro encuentro. ¡Gracias por la buena onda y reprogramamos pronto!`
          : `🤝 Hey @${linkedProfile.codename}, heads up that I won't be able to make our encounter today. Thanks for understanding!`;
      sendChatMessage(linkedProfile.id, msg);
    }
    onDelete(entry.id);
  };

  const isImmediateHost = linkedProfile ? hasHostingCapability(linkedProfile.mobility) : false;

  const locationMeta: Record<string, { label: string; icon: string }> = {
    my_place: { label: language === "es" ? "Mi Casa" : "My Place", icon: "🏠" },
    their_place: { label: language === "es" ? "Su Casa" : "Their Place", icon: "🔑" },
    club_darkroom: {
      label: t.diary?.clubDarkroom || (language === "es" ? "Boliche o Sala Oscura" : "Club or Darkroom"),
      icon: "⚡",
    },
    bar_lounge: { label: language === "es" ? "Bar o Café" : "Bar or Drinks", icon: "🍸" },
    hotel: { label: language === "es" ? "Hotel o Alojamiento" : "Hotel", icon: "🏨" },
    outdoor_cruising: { label: language === "es" ? "Espacio al Aire Libre" : "Outdoor Space", icon: "🌲" },
    other: { label: language === "es" ? "Otro Espacio" : "Other Space", icon: "📍" },
  };

  const locData = locationMeta[entry.location?.category] || locationMeta.other;

  const handleQuickReview = (score: number, chemistry: number, wouldRepeat: DiaryWouldRepeat) => {
    audioEngine.playSubBass(65);
    const satisfaction: DiarySatisfaction = {
      expectationsRating: score,
      chemistryLevel: chemistry,
      boundariesRespect: 5,
      overallScore: score,
      wouldRepeat,
    };
    if (onQuickReview) {
      onQuickReview(entry, satisfaction);
    } else {
      onEdit({
        ...entry,
        isUpcoming: false,
        satisfaction,
      });
    }
  };

  const handleOpenProfileOrExternal = () => {
    if (linkedProfile) {
      onSelectProfile(linkedProfile);
      audioEngine.playPulse();
    } else {
      onInspectExternal(entry.person);
      audioEngine.playPulse();
    }
  };

  const handleRevancha = () => {
    audioEngine.playSubBass(55);
    setRevanchaSent(true);
    onSendRevancha?.({
      profileId: effectiveProfileId,
      codename: entry.person.codename,
    });
  };

  // Ticket status badge logic
  const renderTicketBadge = () => {
    if (!entry.ticketId) return null;
    const isProposed = entry.tags?.some(
      (t) => t.includes("Ticket Propuesto") || t.includes("Proposed")
    );
    const isDeclined = entry.tags?.some(
      (t) => t.includes("Declinada") || t.includes("Declined")
    );

    if (isDeclined) {
      return (
        <TacticalBadge variant="blood" size="xs">
          🎫 {language === "es" ? "Ticket Declinado" : "Ticket Declined"}
        </TacticalBadge>
      );
    }
    if (isProposed) {
      return (
        <TacticalBadge variant="amber" size="xs">
          🎫 {language === "es" ? "Esperando respuesta" : "Awaiting response"}
        </TacticalBadge>
      );
    }
    return (
      <TacticalBadge variant="emerald" size="xs">
        🎫 {language === "es" ? "Ticket Confirmado" : "Ticket Confirmed"}
      </TacticalBadge>
    );
  };

  // Protocolo de salida pill
  const renderExitProtocolBadge = () => {
    const proto: ExitProtocol | undefined = linkedProfile?.exitProtocol;
    if (!proto) return null;
    if (proto === "fast_encounter") {
      return (
        <TacticalBadge variant="violet" size="xs">
          ⏱️ {t.diary?.exitProtocolFast || (language === "es" ? "Al pie (sin vueltas)" : "Quick encounter")}
        </TacticalBadge>
      );
    }
    if (proto === "chill_cuddle") {
      return (
        <TacticalBadge variant="violet" size="xs">
          🫂 {t.diary?.exitProtocolCuddle || (language === "es" ? "Cuddle & charla" : "Shower & cuddle")}
        </TacticalBadge>
      );
    }
    return (
      <TacticalBadge variant="violet" size="xs">
        🌙 {t.diary?.exitProtocolNight || (language === "es" ? "Pasar la noche" : "Sleepover")}
      </TacticalBadge>
    );
  };

  return (
    <div
      className={`bg-obsidian-surface/95 rounded-2xl border transition-all duration-200 backdrop-blur-md overflow-hidden flex flex-col p-3 sm:p-4 gap-3 ${
        entry.isUpcoming
          ? "border-electricViolet/50 shadow-violet-soft"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* SECCIÓN PRINCIPAL: AVATAR + DETALLES IDENTITARIOS + LOGÍSTICA (~100px) */}
      <div className="flex items-start gap-3 min-w-0">
        {/* Tactical Avatar con click para abrir Ficha/Dossier */}
        <div className="relative shrink-0">
          <TacticalAvatar
            src={heroPhotoSrc}
            alt={entry.person.codename}
            codename={entry.person.codename}
            size="lg"
            borderVariant={entry.isUpcoming ? "violet" : "emerald"}
            onClick={() => {
              onOpenDossier(effectiveProfileId);
              audioEngine.playSubBass(60);
            }}
            className="cursor-pointer hover:scale-105"
          />
          {photosCount > 0 && (
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-black/90 border border-amber-400/50 text-[9px] font-mono text-amber-300 font-bold whitespace-nowrap">
              {photosCount} {language === "es" ? "fotos" : "photos"}
            </span>
          )}
        </div>

        {/* Info Central */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Fila 1: Nombre, Edad, Rol, Badges, Ticket status */}
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <button
              type="button"
              onClick={handleOpenProfileOrExternal}
              className="font-mono font-black text-sm sm:text-base text-white hover:text-electricViolet-glow cursor-pointer transition-colors truncate text-left"
            >
              {entry.person.codename}
            </button>

            {entry.person.age && (
              <span className="text-[11px] font-mono text-neutral-400 font-bold">
                {entry.person.age} {language === "es" ? "años" : "yo"}
              </span>
            )}

            {effectiveRole && (
              <TacticalBadge variant="violet" size="xs">
                {getRoleDisplayLabel(effectiveRole, language)}
              </TacticalBadge>
            )}

            {isImmediateHost && (
              <TacticalBadge variant="amber" size="xs">
                🏠 {language === "es" ? "Lugar" : "Host"}
              </TacticalBadge>
            )}

            {renderTicketBadge()}

            {linkedProfile?.bodyState && (
              <TacticalBadge
                variant={linkedProfile.bodyState === "open" ? "emerald" : "amber"}
                size="xs"
                pulse={linkedProfile.bodyState === "open"}
              >
                {linkedProfile.bodyState === "open"
                  ? language === "es"
                    ? "ABIERTO"
                    : "OPEN"
                  : language === "es"
                  ? "OCUPADO"
                  : "BUSY"}
              </TacticalBadge>
            )}
          </div>

          {/* Fila 2: Fecha, Hora, Lugar */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 flex-wrap">
            <span className="flex items-center gap-1 text-white font-bold" title={entry.date}>
              <Calendar className="w-3 h-3 text-electricViolet-glow shrink-0" />
              <span>{formatDiaryDateDisplay(entry.date, language)}</span>
            </span>
            <span className="text-neutral-600">//</span>
            <span className="flex items-center gap-1 text-neutral-300">
              <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
              <span>{entry.time} hs</span>
            </span>
            <span className="text-neutral-600">//</span>
            <span className="flex items-center gap-1 text-neutral-300 truncate max-w-[180px] sm:max-w-[240px]">
              <span>{locData.icon}</span>
              <span className="truncate">{entry.location?.name || locData.label}</span>
            </span>
          </div>

          {/* Badges Íntimas & Protocolos */}
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            {renderExitProtocolBadge()}
            {mergedBadges.slice(0, 2).map((badge) => (
              <TacticalBadge key={badge} variant="amber" size="xs">
                {badge}
              </TacticalBadge>
            ))}
            {encounterCount > 1 && (
              <span className="text-[10px] font-mono text-neutral-400 font-bold px-1.5 py-0.2 rounded bg-white/5 border border-white/10">
                {encounterCount} {language === "es" ? "sesiones" : "sessions"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN TÁCTICA 2: ACCIÓN PRINCIPAL ERGONÓMICA EN 1 TOQUE (~40px) */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 flex-wrap">
        {/* Caso A: CITA PROGRAMADA A FUTURO -> Barra Anti-Ghost Compacta */}
        {entry.isUpcoming ? (
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase shrink-0">
              {t.account?.rescheduleBtn || (language === "es" ? "Reprogramar:" : "Reschedule:")}
            </span>
            <BrutalistButton
              variant="ghost"
              size="compact"
              onClick={() => handleQuickReschedule(30, false)}
            >
              +30m
            </BrutalistButton>
            <BrutalistButton
              variant="ghost"
              size="compact"
              onClick={() => handleQuickReschedule(60, false)}
            >
              +1h
            </BrutalistButton>
            <BrutalistButton
              variant="ghost"
              size="compact"
              onClick={() => handleQuickReschedule(undefined, true)}
            >
              {language === "es" ? "Mañana" : "Tomorrow"}
            </BrutalistButton>

            {rescheduleToast && (
              <span className="text-[10px] font-mono font-bold text-mintNeon px-1 animate-fade-in">
                {rescheduleToast}
              </span>
            )}

            <BrutalistButton
              variant="danger"
              size="compact"
              onClick={handlePoliteCancel}
              title={
                language === "es"
                  ? "Envía aviso amable por chat y cancela sin perder Karma"
                  : "Sends polite heads-up and cancels without losing Karma"
              }
              className="ml-auto sm:ml-1"
            >
              <HeartHandshake className="w-3 h-3 text-red-400" />
              <span>
                {t.diary?.cancelPoliteBtn ||
                  t.account?.cancelPoliteBtn ||
                  (language === "es" ? "Me bajo con onda" : "Polite cancel")}
              </span>
            </BrutalistButton>

            {/* Botón Evaluar si se desea pasar a concretada */}
            <BrutalistButton
              variant="secondary"
              size="compact"
              onClick={() => onCompleteDate?.(entry)}
              className="text-emerald-300"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{t.diary.evaluateDateBtn || (language === "es" ? "Evaluar Cita" : "Rate Encounter")}</span>
            </BrutalistButton>
          </div>
        ) : (
          /* Caso B: CITA PASADA -> 1-Tap Micro-Evaluación o Puntuación Guardada + Revancha */
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {entry.satisfaction ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 font-mono text-xs text-white font-bold bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-lg">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{entry.satisfaction.expectationsRating}.0</span>
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{entry.satisfaction.chemistryLevel}/5</span>
                </span>
                {entry.satisfaction.wouldRepeat === "yes" && (
                  <TacticalBadge variant="emerald" size="xs">
                    ✓ {language === "es" ? "Repetir" : "Repeat"}
                  </TacticalBadge>
                )}

                {onSendRevancha && (
                  <BrutalistButton
                    variant={revanchaSent ? "secondary" : "tactical"}
                    size="compact"
                    onClick={handleRevancha}
                  >
                    <Zap className="w-3 h-3" />
                    <span>
                      {revanchaSent
                        ? language === "es"
                          ? "Pulso Enviado"
                          : "Pulse Sent"
                        : t.diary?.revanchaBtn || (language === "es" ? "⚡ Revancha" : "Rematch")}
                    </span>
                  </BrutalistButton>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-neutral-400 font-bold">
                  {t.diary.quickReviewPrompt || (language === "es" ? "Calificar:" : "Rate:")}
                </span>
                <button
                  type="button"
                  data-testid="diary-quick-review-fire"
                  onClick={() => handleQuickReview(5, 5, "yes")}
                  title={t.diary.quickReviewFire || (language === "es" ? "🔥 Tremenda química" : "🔥 Great chemistry")}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                >
                  <span>🔥</span>
                  <span>{language === "es" ? "Tremenda" : "Fire"}</span>
                </button>
                <button
                  type="button"
                  data-testid="diary-quick-review-good"
                  onClick={() => handleQuickReview(3, 3, "maybe")}
                  title={t.diary.quickReviewGood || (language === "es" ? "👍 Buena onda" : "👍 Good vibe")}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-electricViolet/20 hover:bg-electricViolet/35 border border-electricViolet/40 text-xs font-mono font-bold text-electricViolet-glow flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-violet-soft/20"
                >
                  <span>👍</span>
                  <span>{language === "es" ? "Buena" : "Good"}</span>
                </button>
                <button
                  type="button"
                  data-testid="diary-quick-review-bad"
                  onClick={() => handleQuickReview(1, 1, "never")}
                  title={t.diary.quickReviewBad || (language === "es" ? "👎 Sin conexión" : "👎 No chemistry")}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono font-bold text-neutral-400 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <span>👎</span>
                  <span>{language === "es" ? "Sin onda" : "Cold"}</span>
                </button>

                {onSendRevancha && (
                  <BrutalistButton
                    variant={revanchaSent ? "secondary" : "tactical"}
                    size="compact"
                    onClick={handleRevancha}
                  >
                    <Zap className="w-3 h-3" />
                    <span>
                      {revanchaSent
                        ? language === "es"
                          ? "Pulso Enviado"
                          : "Pulse Sent"
                        : t.diary?.revanchaBtn || (language === "es" ? "Quiero la Revancha" : "Rematch")}
                    </span>
                  </BrutalistButton>
                )}
              </div>
            )}
          </div>
        )}

        {/* Acciones Secundarias Limpias (Ficha Íntima, Doxy-PEP, Chat, Edit, Delete) */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Ficha Íntima */}
          <BrutalistButton
            variant="ghost"
            size="compact"
            onClick={() => {
              onOpenDossier(effectiveProfileId);
              audioEngine.playSubBass(60);
            }}
            title={language === "es" ? "Ver Ficha Íntima" : "View File"}
            className="text-amber-300"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span className="hidden xs:inline">{language === "es" ? "Ficha" : "File"}</span>
          </BrutalistButton>

          {/* Doxy-PEP 72h para citas pasadas */}
          {!entry.isUpcoming && onStartDoxyPep && (
            <BrutalistButton
              variant="ghost"
              size="compact"
              onClick={() => onStartDoxyPep(entry)}
              title={language === "es" ? "Iniciar ventana Doxy-PEP 72h" : "Start Doxy-PEP 72h"}
              className="text-amber-400"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Doxy</span>
            </BrutalistButton>
          )}

          {/* Chat directo */}
          {linkedProfile && (
            <BrutalistButton
              variant="ghost"
              size="compact-icon"
              onClick={() => {
                onOpenChat(linkedProfile.id);
                audioEngine.playPulse();
              }}
              title={t.diary.cardOpenChat}
            >
              <MessageCircle className="w-3.5 h-3.5 text-electricViolet-glow" />
            </BrutalistButton>
          )}

          {/* Menú de Editar / Borrar */}
          <BrutalistButton
            variant="ghost"
            size="compact-icon"
            onClick={() => {
              onEdit(entry);
              audioEngine.playPulse();
            }}
            title={t.diary.cardEdit}
          >
            <Edit2 className="w-3 h-3" />
          </BrutalistButton>

          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 px-2 py-0.5 rounded-xl">
              <span className="text-[10px] font-mono text-red-300">
                {language === "es" ? "¿Borrar?" : "Delete?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  onDelete(entry.id);
                  setConfirmDelete(false);
                  audioEngine.playPulse();
                }}
                className="px-1.5 py-0.5 rounded bg-red-500 text-white font-mono text-[10px] font-black cursor-pointer"
              >
                {language === "es" ? "Sí" : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px] cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <BrutalistButton
              variant="ghost"
              size="compact-icon"
              onClick={() => setConfirmDelete(true)}
              title={t.diary.cardDelete}
              className="hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </BrutalistButton>
          )}

          {/* Toggle de notas privadas si existen */}
          {entry.privateNotes && (
            <BrutalistButton
              variant="ghost"
              size="compact-icon"
              onClick={() => onToggleReveal(entry.id)}
              title={isRevealed ? t.diary.privateNotesVisible : t.diary.privateNotesHidden}
            >
              {isRevealed ? (
                <EyeOff className="w-3.5 h-3.5 text-electricViolet-glow" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
              )}
            </BrutalistButton>
          )}
        </div>
      </div>

      {/* NOTA PRIVADA CIFRADA REVELADA */}
      {entry.privateNotes && isRevealed && (
        <div className="rounded-xl bg-black/70 border border-white/5 p-2.5 space-y-1 animate-in fade-in">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-neutral-400 font-bold">
            <Lock className="w-3 h-3 text-mintNeon" />
            <span>{t.diary.cardPrivateNote}</span>
          </div>
          <p className="text-xs text-neutral-200 font-mono leading-relaxed break-words">
            {entry.privateNotes}
          </p>
        </div>
      )}
    </div>
  );
};

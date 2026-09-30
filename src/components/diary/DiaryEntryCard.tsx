"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { DiaryEntry, ExitProtocol, VesselProfile, DiarySatisfaction, DiaryWouldRepeat } from "@/types/vessel";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { formatDiaryDateDisplay, getLocalDaysOffsetIso } from "@/lib/calendar/dateLocale";
import { VaultEncryptedImage } from "@/lib/security/encryptedPhotoService";
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
  Camera,
} from "lucide-react";

interface DiaryEntryCardProps {
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
  t: any;
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
  const { updateDiaryEntry, sendChatMessage } = useVessel();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rescheduleToast, setRescheduleToast] = useState<string | null>(null);
  const [revanchaSent, setRevanchaSent] = useState(false);
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

  const isImmediateHost = linkedProfile
    ? linkedProfile.mobility === "Tengo depto / lugar" ||
      linkedProfile.mobility === "Tengo sitio" ||
      linkedProfile.mobility === "Tengo lugar y me muevo" ||
      linkedProfile.mobility === "Tengo sitio/me desplazo"
    : false;

  const locationMeta: Record<string, { label: string; icon: string }> = {
    my_place: { label: language === "es" ? "Mi Casa" : "My Place", icon: "🏠" },
    their_place: { label: language === "es" ? "Su Casa" : "Their Place", icon: "🔑" },
    club_darkroom: {
      label: t.diary.clubDarkroom || (language === "es" ? "Boliche o Sala Oscura" : "Club or Darkroom"),
      icon: "⚡",
    },
    bar_lounge: { label: language === "es" ? "Bar o Café" : "Bar or Drinks", icon: "🍸" },
    hotel: { label: language === "es" ? "Hotel o Alojamiento" : "Hotel", icon: "🏨" },
    outdoor_cruising: { label: language === "es" ? "Espacio al Aire Libre" : "Outdoor Space", icon: "🌲" },
    other: { label: language === "es" ? "Otro Espacio" : "Other Space", icon: "📍" },
  };

  const locData = locationMeta[entry.location.category] || locationMeta.other;

  // Cálculo de tiempo relativo
  const getRelativeDateLabel = (dateStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = dateStr.split("-").map(Number);
      const targetDate = new Date(year, month - 1, day);
      targetDate.setHours(0, 0, 0, 0);

      const diffMs = today.getTime() - targetDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return language === "es" ? "Hoy" : "Today";
      if (diffDays === 1) return language === "es" ? "Ayer" : "Yesterday";
      if (diffDays > 1) return language === "es" ? `Hace ${diffDays} días` : `${diffDays}d ago`;
      if (diffDays === -1) return language === "es" ? "Mañana" : "Tomorrow";
      if (diffDays < -1) return language === "es" ? `En ${Math.abs(diffDays)} días` : `In ${Math.abs(diffDays)}d`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

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

  const renderExitProtocolPill = (protocol: ExitProtocol | undefined) => {
    if (!protocol) return null;
    const isFast = protocol === "fast_encounter";
    const isCuddle = protocol === "chill_cuddle";
    const icon = isFast ? "⏱️" : isCuddle ? "🫂" : "🌙";
    const label = isFast
      ? language === "es"
        ? "Puntual (Sin sobremesa)"
        : "Fast Encounter"
      : isCuddle
      ? language === "es"
        ? "Mimos (Ducha y charla)"
        : "Shower & Cuddle"
      : language === "es"
      ? "Pasar la noche"
      : "Sleepover";

    return (
      <div
        title={label}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-electricViolet/15 border border-electricViolet/30 text-electricViolet-glow backdrop-blur-md shadow-sm"
      >
        <span className="text-xs leading-none">{icon}</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
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

  return (
    <div
      className={`bg-obsidian-surface/95 rounded-3xl border overflow-hidden shadow-card-elevation transition-all backdrop-blur-md flex flex-col sm:flex-row ${
        entry.isUpcoming
          ? "border-electricViolet/50 shadow-violet-soft"
          : "border-white/10 hover:border-electricViolet/40"
      }`}
    >
      {/* COLUMNA / CABECERA HERO: RETRATO FOTOGRÁFICO DE GRAN TAMAÑO */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          onOpenDossier(effectiveProfileId);
          audioEngine.playSubBass(65);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenDossier(effectiveProfileId);
            audioEngine.playSubBass(65);
          }
        }}
        className="relative w-full h-60 sm:w-48 md:w-56 sm:h-auto sm:min-h-[240px] flex-shrink-0 cursor-pointer group overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
        title={
          language === "es"
            ? `Ver Ficha Íntima y fotos de ${entry.person.codename}`
            : `View Lover File and photos of ${entry.person.codename}`
        }
      >
        <VaultEncryptedImage
          src={heroPhotoSrc}
          alt={entry.person.codename}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Sombreado inferior y lateral para lectura impecable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 sm:bg-gradient-to-t sm:from-black/85 sm:via-transparent sm:to-black/25 pointer-events-none" />

        {/* Badge superior izquierdo: Estado Agendado vs Concretado */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {entry.isUpcoming ? (
            <span className="px-2.5 py-1 rounded-xl bg-electricViolet/90 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <Calendar className="w-3 h-3" />
              <span>{t.diary.upcomingDateNotice || t.diary.upcomingDates}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/90 backdrop-blur-md border border-white/20 text-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <CheckCircle2 className="w-3 h-3" />
              <span>{t.diary.completedDateNotice || (language === "es" ? "Concretado" : "Completed")}</span>
            </span>
          )}
        </div>

        {/* Semáforo de Estado Corporal en vivo (arriba a la derecha) */}
        {linkedProfile && (
          <span
            className={`absolute top-3 right-3 px-2 py-0.5 rounded-full border border-black/60 flex items-center gap-1 text-[9px] font-black font-mono shadow-lg ${
              linkedProfile.bodyState === "open"
                ? "bg-mintNeon text-obsidian-deep animate-pulse"
                : linkedProfile.bodyState === "occupied"
                ? "bg-amber-500 text-black"
                : "bg-electricViolet text-white"
            }`}
            title={`Estado corporal: ${linkedProfile.bodyState}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>
              {linkedProfile.bodyState === "open"
                ? language === "es"
                  ? "ABIERTO"
                  : "OPEN"
                : linkedProfile.bodyState === "occupied"
                ? language === "es"
                  ? "OCUPADO"
                  : "BUSY"
                : "ONLINE"}
            </span>
          </span>
        )}

        {/* Pie de foto con contador de galería y sesiones */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/50 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1.5 shadow-md group-hover:border-amber-400 transition-colors">
            <Camera className="w-3 h-3 text-amber-400" />
            <span>
              {photosCount > 0
                ? `${photosCount} ${language === "es" ? "fotos" : "photos"}`
                : language === "es"
                ? "Ficha & Fotos"
                : "File & Photos"}
            </span>
          </span>

          {encounterCount > 0 && (
            <span className="px-2 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white font-mono text-[10px] font-bold">
              {encounterCount} {language === "es" ? (encounterCount === 1 ? "sesión" : "sesiones") : "sessions"}
            </span>
          )}
        </div>
      </div>

      {/* COLUMNA DE CONTENIDO Y ACCIONES UNIFICADAS */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 min-w-0">
        <div className="space-y-3">
          {/* NIVEL 1: CABECERA IDENTITARIA */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenProfileOrExternal}
                  className="font-mono font-black text-base sm:text-lg text-white hover:text-electricViolet-glow cursor-pointer transition-colors truncate text-left"
                >
                  {entry.person.codename}
                </button>

                {entry.person.age && (
                  <span className="text-xs text-neutral-300 font-mono font-bold">
                    {entry.person.age} {language === "es" ? "años" : "yo"}
                  </span>
                )}

                {effectiveRole && (
                  <span className="text-[10px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-2.5 py-0.5 rounded-full uppercase">
                    {getRoleDisplayLabel(effectiveRole, language)}
                  </span>
                )}

                {isImmediateHost && (
                  <span className="text-[10px] font-mono font-bold text-electricViolet-glow bg-electricViolet/20 border border-electricViolet/40 px-2 py-0.5 rounded-full uppercase">
                    🏠 {language === "es" ? "Lugar Propio" : "Host"}
                  </span>
                )}

                {entry.person.isExternalProfile && (
                  <span className="text-[10px] font-mono font-bold text-neutral-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase">
                    {t.diary.cardExternalContact}
                  </span>
                )}
              </div>

              {/* Fecha, Hora y Tiempo Relativo */}
              <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-white font-mono font-bold" title={entry.date}>
                  <Calendar className="w-3.5 h-3.5 text-electricViolet-glow" />
                  {formatDiaryDateDisplay(entry.date, language)}
                </span>
                <span className="text-neutral-500 font-mono">//</span>
                <span className="flex items-center gap-1 font-mono text-neutral-300">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  {entry.time} hs
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300">
                  {getRelativeDateLabel(entry.date)}
                </span>
              </div>
            </div>
          </div>

          {/* NIVEL 2: UBICACIÓN Y CALIFICACIÓN / REPROGRAMACIÓN 1-TOQUE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span className="text-base">{locData.icon}</span>
              <div className="min-w-0">
                <p className="font-mono font-bold truncate text-white">
                  {entry.location.name || locData.label}
                </p>
                {entry.location.address && (
                  <p className="text-[10px] font-mono text-neutral-400 truncate">
                    {entry.location.address}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-start sm:justify-end gap-2 flex-wrap">
              {entry.satisfaction ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded-lg text-white font-mono text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{entry.satisfaction.expectationsRating}.0</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg text-amber-300 font-mono text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{entry.satisfaction.chemistryLevel}/5</span>
                  </div>
                  {entry.satisfaction.wouldRepeat === "yes" && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {language === "es" ? "✓ Repetir" : "✓ Repeat"}
                    </span>
                  )}
                </div>
              ) : entry.isUpcoming ? (
                <button
                  type="button"
                  onClick={() => onCompleteDate?.(entry)}
                  className="px-3.5 py-2 min-h-[44px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.diary.evaluateDateBtn || (language === "es" ? "Evaluar Cita" : "Rate Encounter")}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-neutral-400">
                    {t.diary.quickReviewPrompt || (language === "es" ? "Calificar:" : "Rate:")}
                  </span>
                  <button
                    type="button"
                    data-testid="diary-quick-review-fire"
                    onClick={() => handleQuickReview(5, 5, "yes")}
                    title={t.diary.quickReviewFire || (language === "es" ? "🔥 Tremenda química" : "🔥 Great chemistry")}
                    className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  >
                    <span>🔥</span>
                    <span className="text-[10px] hidden xs:inline">{language === "es" ? "Explosiva" : "Fire"}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="diary-quick-review-good"
                    onClick={() => handleQuickReview(3, 3, "maybe")}
                    title={t.diary.quickReviewGood || (language === "es" ? "👍 Buena onda" : "👍 Good vibe")}
                    className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-electricViolet/20 hover:bg-electricViolet/35 border border-electricViolet/40 text-xs font-mono font-bold text-electricViolet-glow flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-violet-soft/20"
                  >
                    <span>👍</span>
                    <span className="text-[10px] hidden xs:inline">{language === "es" ? "Buena" : "Good"}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="diary-quick-review-bad"
                    onClick={() => handleQuickReview(1, 1, "never")}
                    title={t.diary.quickReviewBad || (language === "es" ? "👎 Sin conexión" : "👎 No chemistry")}
                    className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-mono font-bold text-neutral-400 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <span>👎</span>
                    <span className="text-[10px] hidden xs:inline">{language === "es" ? "Sin onda" : "Cold"}</span>
                  </button>
                  {onCompleteDate && (
                    <button
                      type="button"
                      onClick={() => onCompleteDate(entry)}
                      className="min-h-[44px] px-2 text-[10px] font-mono text-neutral-400 hover:text-white underline ml-1 cursor-pointer"
                    >
                      {language === "es" ? "+ Detalles" : "+ Details"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BARRA TÁCTICA ANTI-GHOST: REPROGRAMAR EN 1 TOQUE (+30m, +1h, Mañana) Y CANCELACIÓN CON AVISO */}
          {entry.isUpcoming && (
            <div className="bg-black/50 border border-white/10 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase px-1">
                  {t.account?.rescheduleBtn || (language === "es" ? "Reprogramar:" : "Reschedule:")}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickReschedule(30, false)}
                  className="min-h-[44px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
                >
                  +30 min
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReschedule(60, false)}
                  className="min-h-[44px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
                >
                  +1 h
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickReschedule(undefined, true)}
                  className="min-h-[44px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
                >
                  {language === "es" ? "Mañana" : "Tomorrow"}
                </button>
                {rescheduleToast && (
                  <span className="text-[10px] font-mono font-bold text-mintNeon px-1.5 animate-fade-in">
                    {rescheduleToast}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handlePoliteCancel}
                title={
                  language === "es"
                    ? "Envía aviso amable por chat y cancela sin perder puntos de Respeto"
                    : "Sends polite chat heads-up and cancels without losing Respect Karma"
                }
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.account?.cancelPoliteBtn || (language === "es" ? "Avisar y Cancelar" : "Notify & Cancel")}</span>
              </button>
            </div>
          )}

          {/* NIVEL 3: PROTOCOLO DE SALIDA, MEDALLAS ÍNTIMAS & ETIQUETAS */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {renderExitProtocolPill(linkedProfile?.exitProtocol || "fast_encounter")}
            {mergedBadges.map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200"
              >
                {badge}
              </span>
            ))}
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-neutral-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* NIVEL 4: NOTAS CONFIDENCIALES CIFRADAS */}
          {entry.privateNotes && (
            <div className="rounded-2xl bg-black/60 border border-white/5 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-mintNeon" />
                  <span>{t.diary.cardPrivateNote}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onToggleReveal(entry.id)}
                  className="text-[10px] font-mono text-electricViolet-glow hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>
                    {isRevealed
                      ? t.diary.privateNotesVisible
                      : t.diary.privateNotesHidden}
                  </span>
                </button>
              </div>

              {isRevealed ? (
                <p className="text-xs text-neutral-200 font-mono leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5 animate-in fade-in break-words">
                  {entry.privateNotes}
                </p>
              ) : (
                <p className="text-[11px] text-neutral-500 font-mono italic">
                  ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                </p>
              )}
            </div>
          )}
        </div>

        {/* NIVEL 5: BOTONERA DE ACCIONES UNIFICADAS (ERGONOMÍA 44PX) */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/5 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
            {/* Botón Ficha Íntima & Galería */}
            <button
              type="button"
              onClick={() => {
                onOpenDossier(effectiveProfileId);
                audioEngine.playSubBass(65);
              }}
              className="shrink-0 px-3 py-1.5 min-h-[44px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{language === "es" ? "Ficha Íntima" : "Lover File"}</span>
              {photosCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-black/60 text-[10px] font-mono text-white">
                  📸 {photosCount}
                </span>
              )}
            </button>

            {/* Botón Quiero la Revancha (integrado desde Agenda Íntima para citas concretadas) */}
            {!entry.isUpcoming && onSendRevancha && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playSubBass(55);
                  setRevanchaSent(true);
                  onSendRevancha({
                    profileId: effectiveProfileId,
                    codename: entry.person.codename,
                  });
                }}
                className={`shrink-0 px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  revanchaSent
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                    : "bg-electricViolet/20 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/40"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {revanchaSent
                    ? language === "es"
                      ? "Pulso Enviado"
                      : "Pulse Sent"
                    : t.diary.revanchaBtn || (language === "es" ? "Quiero la Revancha" : "Rematch")}
                </span>
              </button>
            )}

            {/* Botón Chat Directo */}
            {linkedProfile && (
              <button
                type="button"
                onClick={() => {
                  onOpenChat(linkedProfile.id);
                  audioEngine.playPulse();
                }}
                className="shrink-0 px-3 py-1.5 min-h-[44px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 text-neutral-300 hover:text-white"
              >
                <MessageCircle className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span className="hidden sm:inline">{t.diary.cardOpenChat}</span>
              </button>
            )}

            {/* Botón Doxy-PEP 72h rápido para citas concretadas */}
            {!entry.isUpcoming && onStartDoxyPep && (
              <button
                type="button"
                onClick={() => onStartDoxyPep(entry)}
                title={language === "es" ? "Iniciar ventana Doxy-PEP 72h" : "Start 72h Doxy-PEP window"}
                className="shrink-0 px-3 py-1.5 min-h-[44px] bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 text-amber-400"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>💊 Doxy-PEP</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* Botón Editar */}
            <button
              type="button"
              onClick={() => {
                onEdit(entry);
                audioEngine.playPulse();
              }}
              className="p-2 min-h-[44px] min-w-[44px] bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title={t.diary.cardEdit}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Botón Eliminar con confirmación inline táctil */}
            {confirmDelete ? (
              <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 px-2 py-1 rounded-xl min-h-[44px]">
                <span className="text-[10px] font-mono font-bold text-red-300">
                  {language === "es" ? "¿Borrar?" : "Delete?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(entry.id);
                    setConfirmDelete(false);
                    audioEngine.playPulse();
                  }}
                  className="px-2 py-1 rounded-lg bg-red-500 text-white font-mono text-[10px] font-black cursor-pointer"
                >
                  {language === "es" ? "Sí" : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 rounded-lg bg-white/10 text-neutral-300 font-mono text-[10px] font-bold cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2 min-h-[44px] min-w-[44px] bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/40 text-neutral-400 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                title={t.diary.cardDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
import { Calendar, MessageCircle, CheckCircle2, X } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getLocalTodayIso } from "@/lib/calendar/dateLocale";

export const UpcomingEncounterBanner: React.FC = () => {
  const {
    diaryEntries,
    language,
    setActiveView,
    setActiveChatProfileId,
    openCreateDiaryModal,
  } = useVessel();

  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const nextEncounter = useMemo(() => {
    const todayIso = getLocalTodayIso();
    const upcoming = diaryEntries
      .filter((entry) => entry.isUpcoming && entry.date >= todayIso)
      .sort((a, b) => {
        const dtA = `${a.date}T${a.time || "00:00"}`;
        const dtB = `${b.date}T${b.time || "00:00"}`;
        return dtA.localeCompare(dtB);
      });
    return upcoming[0] || null;
  }, [diaryEntries]);

  if (!nextEncounter || dismissedId === nextEncounter.id) {
    return null;
  }

  const todayIso = getLocalTodayIso();
  const isToday = nextEncounter.date === todayIso;
  const dateLabel = isToday
    ? language === "es"
      ? "HOY"
      : "TODAY"
    : nextEncounter.date.slice(5).replace("-", "/");

  return (
    <div
      role="region"
      aria-label={
        language === "es" ? "Próxima cita agendada" : "Upcoming scheduled encounter"
      }
      className="w-full px-2 sm:px-3 pb-1 bg-obsidian-deep select-none"
    >
      <div className="max-w-4xl mx-auto rounded-xl bg-gradient-to-r from-bloodNeon/15 via-obsidian-surface/90 to-electricViolet/15 border border-bloodNeon/35 px-2.5 py-1.5 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-bloodNeon animate-ping flex-shrink-0" />
          <Calendar className="w-3.5 h-3.5 text-bloodNeon flex-shrink-0" />
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono truncate">
            <span className="text-bloodNeon font-black uppercase tracking-wider">
              {dateLabel} {nextEncounter.time ? `${nextEncounter.time} hs` : ""}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-white font-extrabold truncate">
              {nextEncounter.person.codename}
            </span>
            {nextEncounter.location?.name && (
              <>
                <span className="text-neutral-500 hidden sm:inline">·</span>
                <span className="text-neutral-300 truncate hidden sm:inline">
                  {nextEncounter.location.name}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {nextEncounter.person.profileId && (
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setActiveChatProfileId(nextEncounter.person.profileId!);
                setActiveView("chat");
              }}
              className="px-2 py-1 min-h-[28px] rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[9.5px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title={language === "es" ? "Abrir chat con el contacto" : "Open chat with contact"}
            >
              <MessageCircle className="w-3 h-3 text-electricViolet-glow" />
              <span className="hidden xs:inline">Chat</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              openCreateDiaryModal(nextEncounter.person.profileId, nextEncounter.id);
            }}
            className="px-2 py-1 min-h-[28px] rounded-lg bg-bloodNeon/25 hover:bg-bloodNeon/40 border border-bloodNeon/50 text-white text-[9.5px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title={language === "es" ? "Ver o confirmar cita en Agenda" : "View or confirm encounter in Diary"}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{language === "es" ? "Cita" : "Details"}</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissedId(nextEncounter.id)}
            aria-label={language === "es" ? "Ocultar recordatorio de cita" : "Dismiss encounter reminder"}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

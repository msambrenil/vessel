"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { DiaryEntry, ExitProtocol } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleActionMeta, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  Flame,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Bell,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  MessageCircle,
} from "lucide-react";

interface SmartCalendarGridProps {
  onOpenCreate: (prefillDate?: string) => void;
  onOpenChat?: (profileId: string) => void;
}

export const SmartCalendarGrid: React.FC<SmartCalendarGridProps> = ({
  onOpenCreate,
  onOpenChat,
}) => {
  const {
    diaryEntries,
    openCreateDiaryModal,
    deleteDiaryEntry,
    toggleHealthReminderResolved,
    setSelectedProfile,
    setActiveChatProfileId,
    transmitSignal,
    transmissions,
    profiles,
    language,
    t,
  } = useVessel();

  const renderExitProtocolPill = (protocol: ExitProtocol | undefined) => {
    if (!protocol) return null;
    const isFast = protocol === "fast_encounter";
    const isCuddle = protocol === "chill_cuddle";
    const icon = isFast ? "⏱️" : isCuddle ? "🫂" : "🌙";
    const label = isFast
      ? (language === "es" ? "PUNTUAL // Sin sobremesa" : "FAST ENCOUNTER")
      : isCuddle
      ? (language === "es" ? "MIMOS // Ducha & charla" : "SHOWER & CUDDLE")
      : (language === "es" ? "PASAR LA NOCHE // Si hay química" : "SLEEPOVER");
    const desc = isFast
      ? (language === "es" ? "Protocolo de Salida: Encuentro puntual sin sobremesa" : "Exit Protocol: Fast encounter, no lingering")
      : isCuddle
      ? (language === "es" ? "Protocolo de Salida: Espacio para ducha y mimos (20-30 min)" : "Exit Protocol: Space for shower and cuddle")
      : (language === "es" ? "Protocolo de Salida: Posibilidad de pasar la noche si hay química" : "Exit Protocol: Sleepover if mutual vibe");

    return (
      <div
        title={desc}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-200 backdrop-blur-md shadow-sm"
      >
        <span className="text-xs leading-none">{icon}</span>
        <span className="font-mono text-[10px] font-black uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  };

  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 23)); // Agosto 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-08-23");
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    audioEngine.playPulse();
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    audioEngine.playPulse();
  };

  // Calcular días del mes
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Mapear citas por fecha
  const entriesByDate: Record<string, DiaryEntry[]> = {};
  diaryEntries.forEach((entry) => {
    if (!entriesByDate[entry.date]) {
      entriesByDate[entry.date] = [];
    }
    entriesByDate[entry.date].push(entry);
  });

  const selectedEntries = entriesByDate[selectedDateStr] || [];

  const toggleNoteReveal = (id: string) => {
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    audioEngine.playPulse();
  };

  return (
    <div className="space-y-4 select-none">
      {/* Selector de Mes y Navegación Cinematográfica */}
      <div className="bg-obsidian-surface/90 p-3 sm:p-4 rounded-3xl border border-white/10 flex items-center justify-between shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase font-mono">
              {monthNames[month]} <span className="text-electricViolet-glow">{year}</span>
            </h3>
            <p className="text-[10px] font-mono text-neutral-400">
              {diaryEntries.length} encuentros en bitácora
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
              setSelectedDateStr(now.toISOString().split("T")[0]);
              audioEngine.playPulse();
            }}
            className="px-3 py-2 text-[11px] font-mono font-bold uppercase rounded-xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30 hover:bg-electricViolet hover:text-white transition-all cursor-pointer active:scale-95 shadow-violet-soft"
          >
            Hoy
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cuadrícula del Calendario */}
      <div className="bg-obsidian-surface/90 p-4 rounded-3xl border border-white/10 shadow-card-elevation backdrop-blur-md space-y-3">
        {/* Cabecera de días de la semana */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-[10px] font-mono font-bold text-neutral-400 py-1 uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Celdas de Días */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Días del mes anterior */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => {
            const dayNum = prevMonthDays - firstDayIndex + idx + 1;
            return (
              <div
                key={`prev-${idx}`}
                className="aspect-square rounded-2xl bg-obsidian-deep/40 text-neutral-600 flex items-center justify-center text-xs opacity-30 border border-transparent font-mono"
              >
                {dayNum}
              </div>
            );
          })}

          {/* Días del mes actual */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
              dayNum
            ).padStart(2, "0")}`;

            const isSelected = selectedDateStr === dateStr;
            const dayEntries = entriesByDate[dateStr] || [];
            const hasCompleted = dayEntries.some((e) => !e.isUpcoming);
            const hasUpcoming = dayEntries.some((e) => e.isUpcoming);
            const hasHealthReminder = dayEntries.some(
              (e) => e.healthRoutineReminder?.enabled && !e.healthRoutineReminder?.isResolved
            );

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => {
                  setSelectedDateStr(dateStr);
                  audioEngine.playPulse();
                }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-electricViolet text-white font-mono font-bold shadow-violet-soft scale-105 z-10 ring-2 ring-electricViolet"
                    : dayEntries.length > 0
                    ? "bg-obsidian-card/90 border border-white/20 text-white hover:border-electricViolet/60 hover:scale-102 font-mono"
                    : "bg-obsidian-deep/70 hover:bg-white/10 text-neutral-300 border border-white/5 font-mono"
                }`}
              >
                <span className="text-xs sm:text-sm">{dayNum}</span>

                {/* Indicadores Semánticos de Citas */}
                {dayEntries.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {hasUpcoming && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-bloodNeon animate-pulse shadow-blood-glow"
                        }`}
                        title="Cita Programada"
                      />
                    )}
                    {hasCompleted && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-electricViolet shadow-violet-soft"
                        }`}
                        title="Encuentro Registrado"
                      />
                    )}
                    {hasHealthReminder && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-emerald-400 shadow-sm"
                        }`}
                        title="Control de Salud / PrEP"
                      />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda Semántica */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-electricViolet inline-block shadow-violet-soft" />
            <span>Encuentro Pasado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bloodNeon inline-block animate-pulse shadow-blood-glow" />
            <span>Cita Programada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Salud / PrEP</span>
          </div>
        </div>
      </div>

      {/* Agenda del Día Seleccionado */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-electricViolet-glow" />
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Agenda // <span className="text-electricViolet-glow">{selectedDateStr}</span>
            </h4>
          </div>

          <button
            onClick={() => onOpenCreate(selectedDateStr)}
            className="px-3 py-1.5 bg-electricViolet/15 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/30 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-violet-soft"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Añadir Cita
          </button>
        </div>

        {selectedEntries.length === 0 ? (
          <div className="bg-obsidian-surface/60 p-8 rounded-3xl border border-white/10 text-center space-y-3 shadow-card-elevation backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-white uppercase">
                Sin citas agendadas para esta fecha
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Podés registrar un encuentro ya concretado o programar una nueva cita con antelación.
              </p>
            </div>
            <button
              onClick={() => onOpenCreate(selectedDateStr)}
              className="mt-2 px-4 py-2 bg-electricViolet/15 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/30 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-violet-soft"
            >
              + Documentar Encuentro para {selectedDateStr}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEntries.map((entry) => {
              const isRevealed = !!revealedNotes[entry.id];
              const linkedProfile = entry.person.profileId
                ? profiles.find((p) => p.id === entry.person.profileId)
                : null;

              const effectiveRole = entry.person.role || (linkedProfile ? linkedProfile.role : "Versatile");
              const roleAction = getRoleActionMeta(effectiveRole, language, entry.person.codename);
              const isSent = Boolean(linkedProfile && transmissions[linkedProfile.id]);
              const signalCount = linkedProfile ? (transmissions[linkedProfile.id] || 0) : 0;
              const exitProtocol = linkedProfile?.exitProtocol || "fast_encounter";

              const isImmediateHost = linkedProfile
                ? (linkedProfile.mobility === "Tengo depto / lugar" ||
                   linkedProfile.mobility === "Tengo sitio" ||
                   linkedProfile.mobility === "Tengo lugar y me muevo" ||
                   linkedProfile.mobility === "Tengo sitio/me desplazo")
                : false;

              return (
                <div
                  key={entry.id}
                  className={`bg-obsidian-surface/90 rounded-3xl border p-4 sm:p-5 space-y-3.5 transition-all shadow-card-elevation backdrop-blur-md ${
                    entry.isUpcoming
                      ? "border-bloodNeon/50 shadow-blood-glow"
                      : "border-white/10 hover:border-electricViolet/40"
                  }`}
                >
                  {/* NIVEL 1: IDENTIDAD, TELEMETRÍA, HORA & ESTADO */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        role={linkedProfile ? "button" : undefined}
                        tabIndex={linkedProfile ? 0 : undefined}
                        onClick={() => {
                          if (linkedProfile) {
                            setSelectedProfile(linkedProfile);
                            audioEngine.playPulse();
                          }
                        }}
                        className={`relative flex-shrink-0 ${
                          linkedProfile
                            ? "cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet rounded-2xl"
                            : ""
                        }`}
                        title={linkedProfile ? "Ver expediente de perfil en matriz" : undefined}
                      >
                        <img
                          src={
                            entry.person.avatarUrl ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                          }
                          alt={entry.person.codename}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 group-hover:border-electricViolet transition-colors shadow-sm"
                        />
                        {linkedProfile && (
                          <span
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center text-[9px] font-bold font-mono ${
                              linkedProfile.bodyState === "open"
                                ? "bg-mintNeon text-obsidian-deep font-black animate-pulse"
                                : linkedProfile.bodyState === "occupied"
                                ? "bg-bloodNeon text-white"
                                : "bg-purple-400 text-obsidian-deep font-bold"
                            }`}
                            title={`Estado corporal: ${linkedProfile.bodyState}`}
                          >
                            V
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => {
                              if (linkedProfile) {
                                setSelectedProfile(linkedProfile);
                                audioEngine.playPulse();
                              }
                            }}
                            className={`font-bold text-sm sm:text-base text-white font-mono truncate ${
                              linkedProfile ? "hover:text-electricViolet-glow cursor-pointer" : ""
                            }`}
                          >
                            {entry.person.codename}
                          </span>
                          {entry.person.age && (
                            <span className="text-xs text-neutral-400 font-mono">
                              {entry.person.age} años
                            </span>
                          )}
                          {effectiveRole && (
                            <span className="text-[9px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-2 py-0.5 rounded-full uppercase">
                              {getRoleDisplayLabel(effectiveRole, language)}
                            </span>
                          )}
                          {isImmediateHost && (
                            <span className="text-[9px] font-mono font-bold text-champagneGold bg-amber-950/40 border border-champagneGold/40 px-1.5 py-0.5 rounded-full uppercase">
                              🏠 Lugar
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-white font-mono">
                            <Clock className="w-3.5 h-3.5 text-electricViolet-glow" />
                            {entry.time}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 truncate text-neutral-300 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                            {entry.location.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Badge de Estado / Satisfacción */}
                    <div className="flex-shrink-0">
                      {entry.isUpcoming ? (
                        <span className="px-3 py-1 bg-bloodNeon/20 border border-bloodNeon/60 text-bloodNeon text-[10px] font-mono font-bold rounded-xl uppercase tracking-wider animate-pulse shadow-blood-glow flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-bloodNeon" />
                          Programada
                        </span>
                      ) : entry.satisfaction ? (
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl shadow-sm">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-mono font-bold text-white">
                            {entry.satisfaction.expectationsRating}/5
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* NIVEL 2: FILA DEDICADA DE PROTOCOLO DE SALIDA & ACUERDOS (100% LIBRE DE COLISIONES) */}
                  <div className="pt-1 flex flex-wrap items-center gap-1.5 min-w-0">
                    {renderExitProtocolPill(exitProtocol)}

                    <div className="text-[10px] font-mono font-bold text-electricViolet-glow uppercase tracking-wider flex-shrink-0 px-2 py-0.5 rounded-lg bg-electricViolet/10 border border-electricViolet/20">
                      {entry.encounterType.replace("_", " ")}
                    </div>

                    {linkedProfile?.onTheClock?.isActive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-electricViolet text-white font-mono text-[9.5px] font-black uppercase tracking-wider shadow-violet-soft">
                        <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                        <span>⚡ YA ({linkedProfile.onTheClock.durationMinutes || 45}m)</span>
                      </span>
                    )}
                  </div>

                  {/* Métricas de la Cita si está concretada */}
                  {!entry.isUpcoming && entry.satisfaction && (
                    <div className="grid grid-cols-4 gap-2 bg-obsidian-deep/80 p-2.5 rounded-2xl border border-white/5 text-center">
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                          Expectativa
                        </span>
                        <span className="text-xs font-bold text-white font-mono">
                          {entry.satisfaction.expectationsRating}/5
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                          Química
                        </span>
                        <span className="text-xs font-bold text-bloodNeon font-mono flex items-center justify-center gap-0.5 mt-0.5">
                          <Flame className="w-3 h-3" />
                          {entry.satisfaction.chemistryLevel}/5
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                          Límites
                        </span>
                        <span className="text-xs font-bold text-emerald-400 font-mono flex items-center justify-center gap-0.5 mt-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          {entry.satisfaction.boundariesRespect}/5
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                          Repetir
                        </span>
                        <span className="text-xs font-bold text-white font-mono truncate block mt-0.5">
                          {entry.satisfaction.wouldRepeat === "yes"
                            ? "🔥 Sí"
                            : entry.satisfaction.wouldRepeat === "maybe"
                            ? "🤔 Quizá"
                            : "⛔ No"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Notas Privadas con Revelado de Privacidad */}
                  {entry.privateNotes && (
                    <div className="bg-obsidian-deep/80 p-3.5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                        <span className="flex items-center gap-1.5 font-bold text-electricViolet-glow uppercase">
                          <Lock className="w-3.5 h-3.5" />
                          Notas Personales Privadas (Cifradas)
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleNoteReveal(entry.id)}
                          className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-electricViolet-glow" />}
                          <span>{isRevealed ? "Ocultar" : "Revelar"}</span>
                        </button>
                      </div>

                      <p
                        className={`text-xs text-neutral-200 leading-relaxed font-mono transition-all ${
                          isRevealed ? "blur-none" : "blur-sm select-none"
                        }`}
                      >
                        {entry.privateNotes}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-neutral-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recordatorio de Salud si está activo */}
                  {entry.healthRoutineReminder?.enabled && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/35 border border-emerald-500/30 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono">
                        <Bell className="w-4 h-4" />
                        <span>Control PrEP/Salud: <strong>{entry.healthRoutineReminder.dueDate}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleHealthReminderResolved(entry.id)}
                        className={`px-3 py-1.5 min-h-[38px] rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                          entry.healthRoutineReminder.isResolved
                            ? "bg-mintNeon text-obsidian-deep font-black border-mintNeon shadow-sm"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500 hover:text-obsidian-deep"
                        }`}
                      >
                        {entry.healthRoutineReminder.isResolved ? "✓ Realizado" : "Pendiente"}
                      </button>
                    </div>
                  )}

                  {/* NIVEL 3: BOTONERA ERGONÓMICA AISLADA (Zona del Pulgar, Touch Targets >= 44px) */}
                  <div className="pt-2.5 mt-2.5 border-t border-white/10 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {/* Botón 1: Ver Ficha Completa */}
                      <button
                        type="button"
                        onClick={() => {
                          if (linkedProfile) {
                            audioEngine.playPulse();
                            setSelectedProfile(linkedProfile);
                          }
                        }}
                        disabled={!linkedProfile}
                        aria-label={`Ver ficha completa de ${entry.person.codename}`}
                        className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all border shadow-sm ${
                          linkedProfile
                            ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-neutral-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                            : "bg-white/[0.02] border-white/5 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        <span>Ficha</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>

                      {/* Botón 2: Pulso Cinético de Rol con Sonido Sub-Bass */}
                      <button
                        type="button"
                        onClick={() => {
                          if (linkedProfile) {
                            audioEngine.playSignalSent();
                            transmitSignal(linkedProfile.id);
                          }
                        }}
                        disabled={!linkedProfile}
                        aria-label={`Enviar pulso a ${entry.person.codename}`}
                        title={
                          linkedProfile
                            ? isSent
                              ? roleAction.sentLabel
                              : roleAction.tooltipTemplate
                            : "Contacto externo no registrado en VESSEL"
                        }
                        className={`py-2.5 px-2 min-h-[44px] border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm ${
                          !linkedProfile
                            ? "bg-white/[0.02] border-white/5 text-neutral-600 cursor-not-allowed"
                            : isSent
                            ? `bg-electricViolet text-white border-electricViolet shadow-violet-soft scale-100 cursor-pointer active:scale-95 font-bold`
                            : "bg-electricViolet/15 border-electricViolet/60 text-electricViolet-glow hover:bg-electricViolet hover:text-white cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet font-bold"
                        }`}
                      >
                        <span className="text-base leading-none">{roleAction.icon}</span>
                        <span className="truncate">
                          {!linkedProfile
                            ? "Pulso"
                            : isSent
                            ? (language === "es" ? "✓ Enviado" : "✓ Sent")
                            : (roleAction.shortLabel || "Pulso")}
                        </span>
                        {signalCount > 0 && (
                          <span className="text-[9.5px] font-mono font-black ml-0.5">
                            +{signalCount}
                          </span>
                        )}
                      </button>

                      {/* Botón 3: Abrir Darkroom Chat Inmediato (1 Tap) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (linkedProfile) {
                            audioEngine.playPulse();
                            if (onOpenChat) {
                              onOpenChat(linkedProfile.id);
                            } else {
                              setActiveChatProfileId(linkedProfile.id);
                            }
                          }
                        }}
                        disabled={!linkedProfile}
                        aria-label={`Abrir chat con ${entry.person.codename}`}
                        className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-violet-soft ${
                          linkedProfile
                            ? "bg-electricViolet text-white hover:bg-electricViolet-glow cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet font-bold"
                            : "bg-white/[0.02] border border-white/5 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 stroke-[2.4]" />
                        <span>{t.card?.openChat || "Chat"}</span>
                      </button>
                    </div>

                    {/* Acciones Secundarias de Edición / Borrado */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openCreateDiaryModal(undefined, entry.id)}
                        className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer active:scale-95"
                        title="Editar entrada"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDiaryEntry(entry.id)}
                        className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white/5 hover:bg-bloodNeon/20 text-neutral-400 hover:text-bloodNeon text-xs font-mono flex items-center gap-1.5 transition-all border border-transparent hover:border-bloodNeon/40 cursor-pointer active:scale-95"
                        title="Eliminar entrada"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Borrar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

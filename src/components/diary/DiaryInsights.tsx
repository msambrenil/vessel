"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  Star,
  Flame,
  RotateCcw,
  MapPin,
  ShieldCheck,
  Bell,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const DiaryInsights: React.FC = () => {
  const { diaryEntries, diaryStats, toggleHealthReminderResolved } = useVessel();

  const completedEntries = diaryEntries.filter((e) => !e.isUpcoming);

  // Conteo de ratings de satisfacción
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  completedEntries.forEach((e) => {
    if (e.satisfaction?.expectationsRating) {
      ratingCounts[e.satisfaction.expectationsRating] =
        (ratingCounts[e.satisfaction.expectationsRating] || 0) + 1;
    }
  });

  // Conteo de ubicaciones con iconos temáticos
  const locationMeta: Record<string, { label: string; icon: string }> = {
    my_place: { label: "Mi Sitio / Bóveda", icon: "🏠" },
    their_place: { label: "Su Sitio / Su Lugar", icon: "🔑" },
    club_darkroom: { label: "Club / Darkroom", icon: "⚡" },
    bar_lounge: { label: "Bar / Tragos / Café", icon: "🍸" },
    hotel: { label: "Hotel / Alojamiento", icon: "🏨" },
    outdoor_cruising: { label: "Cruising / Aire Libre", icon: "🌲" },
    other: { label: "Otros Espacios", icon: "📍" },
  };

  const locationCounts: Record<string, number> = {};
  diaryEntries.forEach((e) => {
    const cat = e.location.category;
    locationCounts[cat] = (locationCounts[cat] || 0) + 1;
  });

  // Recordatorios de Salud pendientes
  const pendingHealthReminders = diaryEntries.filter(
    (e) => e.healthRoutineReminder?.enabled && !e.healthRoutineReminder?.isResolved
  );

  return (
    <div className="space-y-4 select-none animate-fade-in">
      {/* Resumen Superior de Métricas Clave (Bento Grid) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Satisfacción Media
            </span>
            <div className="p-1.5 rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-bold text-white">
              {diaryStats.averageSatisfaction}
            </span>
            <span className="text-xs text-neutral-500 font-mono">/ 5.0</span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            Basado en {completedEntries.length} encuentros evaluados
          </p>
        </div>

        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Química Corporal
            </span>
            <div className="p-1.5 rounded-xl bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/30 shadow-blood-glow">
              <Flame className="w-4 h-4 text-bloodNeon" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-bold text-bloodNeon">
              {diaryStats.averageChemistry}
            </span>
            <span className="text-xs text-neutral-500 font-mono">/ 5.0</span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            Índice de intensidad física promedio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Tasa de Repetición
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-mono font-bold text-emerald-400">
              {diaryStats.repeatPercentage}%
            </span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            Citas con deseo mutuo de repetir
          </p>
        </div>

        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Citas Agendadas
            </span>
            <div className="p-1.5 rounded-xl bg-white/5 text-electricViolet-glow border border-white/10">
              <Calendar className="w-4 h-4 text-electricViolet-glow" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-mono font-bold text-white">
              {diaryStats.upcomingDatesCount}
            </span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            Próximos encuentros en calendario
          </p>
        </div>
      </div>

      {/* Desglose de Cumplimiento de Expectativas */}
      <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-electricViolet-glow" />
            Distribución de Satisfacción
          </h4>
          <span className="text-[9px] text-electricViolet-glow font-mono font-bold px-2 py-0.5 rounded-full bg-electricViolet/10 border border-electricViolet/20">
            100% CIFRADO
          </span>
        </div>

        <div className="space-y-2.5">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating] || 0;
            const pct = completedEntries.length > 0 ? (count / completedEntries.length) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 w-12 text-neutral-200 font-mono">
                  <span className="font-bold">{rating}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full bg-electricViolet rounded-full transition-all duration-500 shadow-violet-soft"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs font-bold text-neutral-300">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribución por Categoría de Ubicación */}
      <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-electricViolet-glow" />
            Lugares Más Frecuentes
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(locationCounts).map(([cat, count]) => {
            const meta = locationMeta[cat] || { label: cat, icon: "📍" };
            return (
              <div
                key={cat}
                className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{meta.icon}</span>
                  <span className="text-neutral-200 truncate">{meta.label}</span>
                </div>
                <span className="font-bold text-electricViolet-glow ml-2 px-2 py-0.5 rounded-lg bg-electricViolet/10 border border-electricViolet/20">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel de Chequeos de Salud & PrEP Preventivo */}
      <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-emerald-500/30 space-y-3.5 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Rutina Smart // Salud & PrEP
              </h4>
              <p className="text-[10px] font-mono text-neutral-400">
                {pendingHealthReminders.length} controles pendientes de screening
              </p>
            </div>
          </div>
        </div>

        {pendingHealthReminders.length === 0 ? (
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-mono text-emerald-300 font-bold">
              Estás al día con todos tus chequeos y recordatorios de salud preventiva.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingHealthReminders.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white font-mono">
                    Control por cita con {entry.person.codename}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha límite sugerida: <strong>{entry.healthRoutineReminder?.dueDate}</strong>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleHealthReminderResolved(entry.id);
                    audioEngine.playPulse();
                  }}
                  className="px-3 py-1.5 min-h-[38px] bg-mintNeon/20 hover:bg-mintNeon hover:text-obsidian-deep border border-mintNeon/40 text-mintNeon rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 shadow-sm"
                >
                  Marcar Hecho
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

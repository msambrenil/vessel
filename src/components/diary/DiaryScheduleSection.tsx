"use client";

import React, { useState, useMemo } from "react";
import {
  DiaryEntry,
  VesselProfile,
  DiarySatisfaction,
  ProfileDossier,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { TranslationType } from "@/lib/i18n/translations";
import { getLocalDaysOffsetIso } from "@/lib/calendar/dateLocale";
import { DiaryEntryCard } from "./DiaryEntryCard";
import {
  TacticalSearchInput,
  FilterPill,
  BrutalistButton,
} from "@/components/ui";
import {
  Clock,
  CheckCircle2,
  Calendar,
  Star,
  RotateCcw,
  Users,
} from "lucide-react";

export interface DiaryScheduleSectionProps {
  diaryEntries: DiaryEntry[];
  profiles: VesselProfile[];
  profileDossiers?: Record<string, Partial<ProfileDossier> | any>;
  favoriteProfileIds: string[];
  isFavoriteProfile: (id: string) => boolean;
  onSelectProfile: (profile: VesselProfile) => void;
  onOpenChat: (profileId: string) => void;
  onOpenDossier: (profileId: string) => void;
  onInspectExternal: (person: DiaryEntry["person"]) => void;
  onEditEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onCompleteEntry: (entry: DiaryEntry) => void;
  onQuickReview?: (entry: DiaryEntry, satisfaction: DiarySatisfaction) => void;
  onStartDoxyPep?: (entry: DiaryEntry) => void;
  onSendRevancha?: (lover: { profileId: string; codename: string }) => void;
  onRestoreBackup?: (backup: {
    entries?: DiaryEntry[];
    dossiers?: Record<string, Partial<ProfileDossier>>;
  }) => void;
  onScheduleNew: () => void;
  onNavigateToInsights?: () => void;
  averageRating: number;
  respectScore: number;
  language: "es" | "en";
  t: TranslationType;
  defaultStatusFilter?: "all" | "upcoming" | "completed";
}

const getMonthHeader = (dateStr: string, lang: "es" | "en"): string => {
  try {
    const [year, month] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, 1);
    const raw = d.toLocaleDateString(lang === "es" ? "es-AR" : "en-US", {
      month: "long",
      year: "numeric",
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  } catch {
    return dateStr;
  }
};

export const DiaryScheduleSection: React.FC<DiaryScheduleSectionProps> = ({
  diaryEntries,
  profiles,
  profileDossiers,
  favoriteProfileIds,
  isFavoriteProfile,
  onSelectProfile,
  onOpenChat,
  onOpenDossier,
  onInspectExternal,
  onEditEntry,
  onDeleteEntry,
  onCompleteEntry,
  onQuickReview,
  onStartDoxyPep,
  onSendRevancha,
  onRestoreBackup,
  onScheduleNew,
  onNavigateToInsights,
  averageRating,
  respectScore,
  language,
  t,
  defaultStatusFilter = "all",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilterPreset, setDateFilterPreset] = useState<
    "all" | "7days" | "30days" | "thisYear" | "custom" | "today" | "tomorrow" | "next7days"
  >("all");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed">(defaultStatusFilter);
  const [onlyFavoritesFilter, setOnlyFavoritesFilter] = useState<boolean>(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});

  // Conteo de sesiones concretadas por persona
  const encounterCountByPerson = useMemo(() => {
    const counts: Record<string, number> = {};
    diaryEntries.forEach((entry) => {
      if (!entry.isUpcoming) {
        const pid = entry.person.profileId || `ext-${entry.person.codename.toLowerCase()}`;
        counts[pid] = (counts[pid] || 0) + 1;
      }
    });
    return counts;
  }, [diaryEntries]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setDateFilterPreset("all");
    setCustomFromDate("");
    setCustomToDate("");
    setIsCustomRangeOpen(false);
    setStatusFilter("all");
    setOnlyFavoritesFilter(false);
    setMinRatingFilter(0);
    audioEngine.playPulse();
  };

  const toggleNoteReveal = (id: string) => {
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    audioEngine.playPulse();
  };

  const upcomingCount = diaryEntries.filter((e) => e.isUpcoming).length;
  const completedCount = diaryEntries.filter((e) => !e.isUpcoming).length;

  const getLinkedProfile = (entry: DiaryEntry): VesselProfile | undefined => {
    if (entry.person.profileId) {
      const found = profiles.find((p) => p.id === entry.person.profileId);
      if (found) return found;
    }
    return profiles.find(
      (p) => p.codename.toLowerCase() === entry.person.codename.toLowerCase()
    );
  };

  // Filtrado y ordenamiento cronológico
  const filteredAndSortedEntries = useMemo(() => {
    const todayIso = getLocalDaysOffsetIso(0);
    const tomorrowIso = getLocalDaysOffsetIso(1);
    const nextSevenDaysIso = getLocalDaysOffsetIso(7);
    const sevenDaysAgoIso = getLocalDaysOffsetIso(-7);
    const thirtyDaysAgoIso = getLocalDaysOffsetIso(-30);
    const currentYear = new Date().getFullYear().toString();

    return diaryEntries
      .filter((entry) => {
        // Filtro por Estado
        if (statusFilter === "completed" && entry.isUpcoming) return false;
        if (statusFilter === "upcoming" && !entry.isUpcoming) return false;

        // Filtro por Calificación mínima
        if (minRatingFilter > 0) {
          if (!entry.satisfaction || entry.satisfaction.expectationsRating < minRatingFilter) {
            return false;
          }
        }

        // Filtro por Fechas Locales
        if (dateFilterPreset === "today") {
          if (entry.date !== todayIso) return false;
        } else if (dateFilterPreset === "tomorrow") {
          if (entry.date !== tomorrowIso) return false;
        } else if (dateFilterPreset === "next7days") {
          if (entry.date < todayIso || entry.date > nextSevenDaysIso) return false;
        } else if (dateFilterPreset === "7days") {
          if (entry.date < sevenDaysAgoIso) return false;
        } else if (dateFilterPreset === "30days") {
          if (entry.date < thirtyDaysAgoIso) return false;
        } else if (dateFilterPreset === "thisYear") {
          if (!entry.date.startsWith(currentYear)) return false;
        } else if (dateFilterPreset === "custom") {
          if (customFromDate && entry.date < customFromDate) return false;
          if (customToDate && entry.date > customToDate) return false;
        }

        // Filtro por Favoritos
        if (onlyFavoritesFilter) {
          const isFav = entry.person.profileId ? isFavoriteProfile(entry.person.profileId) : false;
          if (!isFav) return false;
        }

        // Búsqueda textual
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchCodename = entry.person.codename.toLowerCase().includes(q);
          const matchLocation =
            entry.location?.name?.toLowerCase().includes(q) ||
            (entry.location?.address && entry.location.address.toLowerCase().includes(q));
          const matchNotes = entry.privateNotes?.toLowerCase().includes(q);
          const matchTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchCodename && !matchLocation && !matchNotes && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time || "00:00"}`;
        const dateTimeB = `${b.date}T${b.time || "00:00"}`;
        if (statusFilter === "upcoming") {
          return dateTimeA.localeCompare(dateTimeB);
        }
        return dateTimeB.localeCompare(dateTimeA);
      });
  }, [
    diaryEntries,
    statusFilter,
    minRatingFilter,
    onlyFavoritesFilter,
    dateFilterPreset,
    customFromDate,
    customToDate,
    searchQuery,
    isFavoriteProfile,
  ]);

  // Agrupamiento cronológico por mes para feed continuo
  const groupedEntries = useMemo(() => {
    const groups: { month: string; entries: DiaryEntry[] }[] = [];
    filteredAndSortedEntries.forEach((entry) => {
      const monthHeader = getMonthHeader(entry.date, language);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.month === monthHeader) {
        lastGroup.entries.push(entry);
      } else {
        groups.push({ month: monthHeader, entries: [entry] });
      }
    });
    return groups;
  }, [filteredAndSortedEntries, language]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* CABECERA UNIFICADA TÁCTICA DEL FEED: TÍTULO, SELECTORES, BUSCADOR Y FILTROS */}
      <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 backdrop-blur-md shadow-card-elevation space-y-3.5">
        {/* 1. Fila Superior: Título con Icono + Badge de Conteo + Acceso a Fuego/Karma */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-2xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/40 shadow-violet-soft shrink-0">
              <Clock className="w-4 h-4 text-electricViolet-glow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-mono font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                  {t.diary?.tabTimeline || (language === "es" ? "Feed Cronológico" : "Timeline Feed")}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40 font-bold">
                  {filteredAndSortedEntries.length}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono truncate">
                {language === "es"
                  ? "Historial de encuentros ordenados por mes, con notas y valoraciones"
                  : "Encounters history grouped by month, with notes & ratings"}
              </p>
            </div>
          </div>

          {/* Acceso Táctico a Fuego / Karma */}
          {onNavigateToInsights && (
            <button
              type="button"
              onClick={() => {
                onNavigateToInsights();
                audioEngine.playPulse();
              }}
              title={language === "es" ? "Ver telemetría y valoraciones en Fuego" : "View chemistry and reviews in Fire"}
              className="flex items-center justify-center gap-2 px-3 py-1.5 min-h-[38px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electricViolet/30 text-[11px] font-mono transition-all cursor-pointer group shrink-0 active:scale-95"
            >
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-neutral-600">//</span>
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{respectScore}% Karma</span>
              </div>
              <span className="text-[10px] text-electricViolet-glow font-bold group-hover:underline hidden sm:inline">
                {language === "es" ? "Fuego ➔" : "Fire ➔"}
              </span>
            </button>
          )}
        </div>

        {/* 2. Fila Intermedia: Selector Segmentado de Estado (Próximas / Concretadas / Todas) */}
        <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("upcoming");
              audioEngine.playPulse();
            }}
            className={`py-2 px-2.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === "upcoming"
                ? "bg-electricViolet text-white shadow-violet-soft font-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === "es" ? "Próximas" : "Upcoming"}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === "upcoming" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"
              }`}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("completed");
              audioEngine.playPulse();
            }}
            className={`py-2 px-2.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === "completed"
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === "es" ? "Concretadas" : "Completed"}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === "completed" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"
              }`}
            >
              {completedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              audioEngine.playPulse();
            }}
            className={`py-2 px-2.5 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-electricViolet text-white shadow-violet-soft font-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === "es" ? "Todas" : "All"}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === "all" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"
              }`}
            >
              {diaryEntries.length}
            </span>
          </button>
        </div>

        {/* 3. Fila de Buscador Táctico */}
        <TacticalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.diary.filterSearchPlaceholder}
          ariaLabel={t.diary.filterSearchPlaceholder}
        />

        {/* 4. Chips de Filtro Rápido con FilterPill */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <FilterPill
            label={t.diary.filterAll}
            active={dateFilterPreset === "all"}
            variant="violet"
            onClick={() => setDateFilterPreset("all")}
          />

          {statusFilter === "upcoming" ? (
            <>
              <FilterPill
                label={`⚡ ${language === "es" ? "Hoy" : "Today"}`}
                active={dateFilterPreset === "today"}
                variant="violet"
                onClick={() => setDateFilterPreset("today")}
              />
              <FilterPill
                label={`📅 ${language === "es" ? "Mañana" : "Tomorrow"}`}
                active={dateFilterPreset === "tomorrow"}
                variant="violet"
                onClick={() => setDateFilterPreset("tomorrow")}
              />
              <FilterPill
                label={`🗓️ ${language === "es" ? "Próximos 7 días" : "Next 7 Days"}`}
                active={dateFilterPreset === "next7days"}
                variant="violet"
                onClick={() => setDateFilterPreset("next7days")}
              />
            </>
          ) : (
            <>
              <FilterPill
                label={t.diary.filter7Days}
                active={dateFilterPreset === "7days"}
                variant="violet"
                onClick={() => setDateFilterPreset("7days")}
              />
              <FilterPill
                label={t.diary.filter30Days}
                active={dateFilterPreset === "30days"}
                variant="violet"
                onClick={() => setDateFilterPreset("30days")}
              />
              <FilterPill
                label={t.diary.filterThisYear}
                active={dateFilterPreset === "thisYear"}
                variant="violet"
                onClick={() => setDateFilterPreset("thisYear")}
              />
            </>
          )}

          <FilterPill
            label={t.diary.filterCustomRange}
            active={dateFilterPreset === "custom" || isCustomRangeOpen}
            variant="violet"
            onClick={() => {
              setIsCustomRangeOpen(!isCustomRangeOpen);
              setDateFilterPreset("custom");
            }}
          />

          <FilterPill
            label={language === "es" ? "Solo Favoritos" : "Favorites Only"}
            active={onlyFavoritesFilter}
            variant="amber"
            aria-pressed={onlyFavoritesFilter}
            data-testid="diary-filter-only-favorites"
            onClick={() => setOnlyFavoritesFilter(!onlyFavoritesFilter)}
          />

          <FilterPill
            label="5★"
            active={minRatingFilter === 5}
            variant="amber"
            onClick={() => setMinRatingFilter(minRatingFilter === 5 ? 0 : 5)}
          />
        </div>

        {/* Panel de Rango Personalizado */}
        {isCustomRangeOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-black/50 rounded-2xl border border-white/5 animate-in fade-in">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                {t.diary.filterFromDate}:
              </label>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-black/80 border border-white/10 text-white font-mono text-xs focus:border-electricViolet focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                {t.diary.filterToDate}:
              </label>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-black/80 border border-white/10 text-white font-mono text-xs focus:border-electricViolet focus:outline-none"
              />
            </div>

            {(customFromDate || customToDate) && (
              <div className="flex items-end">
                <BrutalistButton
                  variant="ghost"
                  size="default"
                  onClick={() => {
                    setCustomFromDate("");
                    setCustomToDate("");
                    setDateFilterPreset("all");
                    audioEngine.playPulse();
                  }}
                  className="w-full"
                >
                  {t.diary.filterClearRange}
                </BrutalistButton>
              </div>
            )}
          </div>
        )}

        {/* 5. Contador de Resultados */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-white/5">
          <span>
            {t.diary.showingResults} <strong className="text-white font-black">{filteredAndSortedEntries.length}</strong> {t.diary.ofTotal} {diaryEntries.length} {t.diary.encountersLabel}
          </span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider hidden sm:inline">
            {statusFilter === "upcoming"
              ? language === "es"
                ? "Orden: Próximas más cercanas primero"
                : "Sort: Soonest first"
              : language === "es"
              ? "Orden: Cronológico continuo agrupado por mes"
              : "Sort: Chronological feed by month"}
          </span>
        </div>
      </div>

      {/* 3. FEED CRONOLÓGICO CONTINUO DE CITAS */}
      {filteredAndSortedEntries.length === 0 ? (
        <div className="bg-obsidian-surface/80 p-8 sm:p-12 rounded-3xl border border-white/10 text-center space-y-4 shadow-card-elevation backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-electricViolet-glow mx-auto">
            <Users className="w-7 h-7" />
          </div>
          {diaryEntries.length === 0 ? (
            <>
              <div className="space-y-1">
                <h4 className="text-sm font-mono font-bold text-white uppercase">
                  {language === "es"
                    ? "Tu Agenda de Encuentros está lista para estrenarse"
                    : "Your Date Diary is ready for its first entry"}
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  {language === "es"
                    ? "Agendá tu próxima cita o registrá un encuentro pasado con notas y fotos cifradas."
                    : "Schedule an upcoming appointment or log a past encounter with encrypted notes and photos."}
                </p>
              </div>
              <BrutalistButton
                variant="primary"
                size="default"
                onClick={onScheduleNew}
                className="mx-auto"
              >
                + {t.diary.scheduleBtn}
              </BrutalistButton>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h4 className="text-sm font-mono font-bold text-white uppercase">
                  {t.diary.cardEmptyFeedTitle}
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  {t.diary.cardEmptyFeedSub}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <BrutalistButton
                  variant="ghost"
                  size="default"
                  onClick={resetAllFilters}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {language === "es"
                      ? `Restablecer filtros (${diaryEntries.length})`
                      : `Reset filters (${diaryEntries.length})`}
                  </span>
                </BrutalistButton>
                <BrutalistButton
                  variant="primary"
                  size="default"
                  onClick={onScheduleNew}
                >
                  + {t.diary.scheduleBtn}
                </BrutalistButton>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEntries.map((group) => (
            <div key={group.month} className="space-y-3">
              {/* Encabezado del mes para feed cronológico continuo */}
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300 px-3 py-1 rounded-full bg-black/80 border border-white/15 flex items-center gap-1.5 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-electricViolet-glow" />
                  <span>{group.month}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ({group.entries.length})
                  </span>
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Tarjetas del mes */}
              <div className="space-y-3">
                {group.entries.map((entry) => {
                  const linkedProfile = getLinkedProfile(entry);
                  const isRevealed = !!revealedNotes[entry.id];
                  const pid = entry.person.profileId || `ext-${entry.person.codename.toLowerCase()}`;
                  const dossier = profileDossiers?.[pid];
                  const photosCount =
                    dossier?.sharedPhotos?.length ||
                    entry.person.sharedPhotos?.length ||
                    entry.attachedPhotos?.length ||
                    0;
                  const primaryPhotoUrl =
                    dossier?.sharedPhotos?.[0] ||
                    entry.person.avatarUrl ||
                    linkedProfile?.avatarUrl;
                  const intimateBadges: string[] = dossier?.badges || [];
                  const encounterCount = encounterCountByPerson[pid] || 0;

                  return (
                    <DiaryEntryCard
                      key={entry.id}
                      entry={entry}
                      linkedProfile={linkedProfile}
                      isRevealed={isRevealed}
                      onToggleReveal={toggleNoteReveal}
                      onInspectExternal={onInspectExternal}
                      onOpenDossier={onOpenDossier}
                      onSelectProfile={onSelectProfile}
                      onOpenChat={onOpenChat}
                      onEdit={onEditEntry}
                      onDelete={onDeleteEntry}
                      onCompleteDate={onCompleteEntry}
                      onQuickReview={onQuickReview}
                      onStartDoxyPep={onStartDoxyPep}
                      onSendRevancha={onSendRevancha}
                      language={language}
                      t={t}
                      photosCount={photosCount}
                      intimateBadges={intimateBadges}
                      encounterCount={encounterCount}
                      primaryPhotoUrl={primaryPhotoUrl}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

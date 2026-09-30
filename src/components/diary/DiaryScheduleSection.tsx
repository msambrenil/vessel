"use client";

import React, { useState, useMemo, useRef } from "react";
import { DiaryEntry, VesselProfile, DiarySatisfaction } from "@/types/vessel";
import { DiaryEntryCard } from "./DiaryEntryCard";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getLocalDaysOffsetIso, getLocalTodayIso } from "@/lib/calendar/dateLocale";
import {
  encryptDiaryBackup,
  decryptDiaryBackup,
  downloadBackupFile,
} from "@/lib/security/diaryBackupCrypto";
import {
  Search,
  X,
  Calendar,
  Star,
  CheckCircle2,
  Users,
  Clock,
  RotateCcw,
  Download,
  Upload,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";

interface DiaryScheduleSectionProps {
  diaryEntries: DiaryEntry[];
  profiles: VesselProfile[];
  profileDossiers?: Record<string, any>;
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
  onRestoreBackup?: (backup: { entries?: DiaryEntry[]; dossiers?: Record<string, any> }) => void;
  onScheduleNew: () => void;
  onNavigateToInsights?: () => void;
  averageRating: number;
  respectScore: number;
  language: "es" | "en";
  t: any;
}

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
}) => {
  // Estados de Búsqueda y Filtrado
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilterPreset, setDateFilterPreset] = useState<
    "all" | "7days" | "30days" | "thisYear" | "custom" | "today" | "tomorrow" | "next7days"
  >("all");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [onlyFavoritesFilter, setOnlyFavoritesFilter] = useState<boolean>(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});

  // Estados del Modal de Respaldo Cifrado Local
  const [backupModalMode, setBackupModalMode] = useState<"none" | "export" | "import">("none");
  const [backupPassword, setBackupPassword] = useState("");
  const [backupStatusMessage, setBackupStatusMessage] = useState<string | null>(null);
  const [backupErrorMessage, setBackupErrorMessage] = useState<string | null>(null);
  const [importFileContent, setImportFileContent] = useState<string | null>(null);
  const [isProcessingBackup, setIsProcessingBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupPassword || backupPassword.trim().length === 0) {
      setBackupErrorMessage(
        language === "es"
          ? "Ingresá una contraseña para proteger el archivo."
          : "Enter a password to protect the file."
      );
      return;
    }

    try {
      setIsProcessingBackup(true);
      setBackupErrorMessage(null);

      const payload = {
        entries: diaryEntries,
        dossiers: profileDossiers || {},
      };

      const envelope = await encryptDiaryBackup(payload, backupPassword);
      const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
      const filename = `vessel-agenda-respaldo-${getLocalTodayIso()}.json`;
      downloadBackupFile(blob, filename);

      audioEngine.playSubBass(65);
      setBackupStatusMessage(
        t.diary.backupSuccess ||
          (language === "es" ? "Respaldo exportado exitosamente" : "Backup exported successfully")
      );

      setTimeout(() => {
        setBackupModalMode("none");
        setBackupPassword("");
        setBackupStatusMessage(null);
      }, 1400);
    } catch (err: any) {
      setBackupErrorMessage(
        err.message || (language === "es" ? "Error al cifrar el respaldo" : "Error encrypting backup")
      );
    } finally {
      setIsProcessingBackup(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportFileContent(content);
      setBackupPassword("");
      setBackupErrorMessage(null);
      setBackupStatusMessage(null);
      setBackupModalMode("import");
      audioEngine.playPulse();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFileContent) return;
    if (!backupPassword || backupPassword.trim().length === 0) {
      setBackupErrorMessage(
        language === "es" ? "Ingresá la contraseña del archivo." : "Enter file password."
      );
      return;
    }

    try {
      setIsProcessingBackup(true);
      setBackupErrorMessage(null);

      const parsedEnvelope = JSON.parse(importFileContent);
      const restored = await decryptDiaryBackup(parsedEnvelope, backupPassword);

      if (onRestoreBackup) {
        onRestoreBackup(restored as any);
      }

      audioEngine.playSubBass(75);
      setBackupStatusMessage(
        t.diary.backupRestoreSuccess ||
          (language === "es" ? "Respaldo restaurado exitosamente" : "Backup restored successfully")
      );

      setTimeout(() => {
        setBackupModalMode("none");
        setBackupPassword("");
        setImportFileContent(null);
        setBackupStatusMessage(null);
      }, 1400);
    } catch (err: any) {
      setBackupErrorMessage(
        err.message ||
          (language === "es"
            ? "Contraseña incorrecta o archivo inválido"
            : "Invalid password or corrupted file")
      );
    } finally {
      setIsProcessingBackup(false);
    }
  };

  // Conteo de sesiones concretadas por persona (para mostrar en cada tarjeta)
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

  // Filtrado y ordenamiento cronológico inteligente (ascendente en Próximas, descendente en Concretadas)
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

        // Filtro por Fechas Locales (UTC-3 seguro: histórico + prospectivo)
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
            entry.location.name.toLowerCase().includes(q) ||
            (entry.location.address && entry.location.address.toLowerCase().includes(q));
          const matchNotes = entry.privateNotes.toLowerCase().includes(q);
          const matchTags = entry.tags.some((t) => t.toLowerCase().includes(q));
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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. SELECTOR PRINCIPAL: PRÓXIMAS VS CONCRETADAS & RESUMEN DE REPUTACIÓN */}
      <div className="bg-obsidian-surface/90 p-2 sm:p-2.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-card-elevation flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Interruptor segmentado de Estado (44px Touch Targets) */}
        <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("upcoming");
              audioEngine.playPulse();
            }}
            className={`py-2 px-3 min-h-[44px] rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
            className={`py-2 px-3 min-h-[44px] rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
            className={`py-2 px-3 min-h-[44px] rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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

        {/* Resumen Compacto de Reputación y Respaldo Local Cifrado */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          <button
            type="button"
            data-testid="diary-export-backup-btn"
            onClick={() => {
              setBackupPassword("");
              setBackupErrorMessage(null);
              setBackupStatusMessage(null);
              setBackupModalMode("export");
              audioEngine.playPulse();
            }}
            className="px-3 py-2 min-h-[40px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 text-[11px] font-mono font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title={language === "es" ? "Exportar respaldo cifrado AES-GCM" : "Export AES-GCM encrypted backup"}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.diary.backupExportBtn || (language === "es" ? "Exportar Respaldo 🔒" : "Export Backup 🔒")}</span>
          </button>

          <button
            type="button"
            data-testid="diary-import-backup-btn"
            onClick={() => {
              setBackupPassword("");
              setBackupErrorMessage(null);
              setBackupStatusMessage(null);
              fileInputRef.current?.click();
            }}
            className="px-3 py-2 min-h-[40px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electricViolet/40 text-[11px] font-mono font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title={language === "es" ? "Restaurar respaldo cifrado" : "Restore encrypted backup"}
          >
            <Upload className="w-3.5 h-3.5 text-electricViolet-glow" />
            <span>{t.diary.backupImportBtn || (language === "es" ? "Restaurar Respaldo 📥" : "Restore Backup 📥")}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />

          {onNavigateToInsights && (
            <button
              type="button"
              onClick={() => {
                onNavigateToInsights();
                audioEngine.playPulse();
              }}
              title={language === "es" ? "Ver telemetría y valoraciones en Métricas" : "View telemetry and reviews in Insights"}
              className="flex items-center justify-center sm:justify-end gap-2 px-3 py-2 min-h-[40px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-electricViolet/30 text-[11px] font-mono transition-all cursor-pointer group"
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
              <span className="text-[10px] text-electricViolet-glow font-bold group-hover:underline">
                {language === "es" ? "Métricas ➔" : "Insights ➔"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA Y FILTROS TÁCTICOS */}
      <div className="space-y-3 bg-obsidian-surface/80 p-3 sm:p-4 rounded-3xl border border-white/10 backdrop-blur-md shadow-card-elevation">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.diary.filterSearchPlaceholder}
            className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus:ring-1 focus:ring-electricViolet font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chips de Filtro Rápido (Ergonomía 44px: Prospectivos en Próximas / Históricos en Concretadas y Todas) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setDateFilterPreset("all");
              audioEngine.playPulse();
            }}
            className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
              dateFilterPreset === "all"
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.diary.filterAll}
          </button>

          {statusFilter === "upcoming" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setDateFilterPreset("today");
                  audioEngine.playPulse();
                }}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                  dateFilterPreset === "today"
                    ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                ⚡ {language === "es" ? "Hoy" : "Today"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateFilterPreset("tomorrow");
                  audioEngine.playPulse();
                }}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                  dateFilterPreset === "tomorrow"
                    ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                📅 {language === "es" ? "Mañana" : "Tomorrow"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateFilterPreset("next7days");
                  audioEngine.playPulse();
                }}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                  dateFilterPreset === "next7days"
                    ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                🗓️ {language === "es" ? "Próximos 7 días" : "Next 7 Days"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setDateFilterPreset("7days");
                  audioEngine.playPulse();
                }}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                  dateFilterPreset === "7days"
                    ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.diary.filter7Days}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateFilterPreset("30days");
                  audioEngine.playPulse();
                }}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                  dateFilterPreset === "30days"
                    ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.diary.filter30Days}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateFilterPreset("thisYear");
                  audioEngine.playPulse();
                }}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
                  dateFilterPreset === "thisYear"
                    ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.diary.filterThisYear}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateFilterPreset("custom");
                  setIsCustomRangeOpen(!isCustomRangeOpen);
                  audioEngine.playPulse();
                }}
                className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  dateFilterPreset === "custom"
                    ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                    : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.diary.filterCustomRange}</span>
              </button>
            </>
          )}

          <div className="h-5 w-px bg-white/10 mx-0.5 flex-shrink-0" />

          {/* Filtro Solo Favoritos */}
          <button
            type="button"
            data-testid="diary-filter-only-favorites"
            aria-pressed={onlyFavoritesFilter}
            onClick={() => {
              setOnlyFavoritesFilter(!onlyFavoritesFilter);
              audioEngine.playPulse();
            }}
            className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              onlyFavoritesFilter
                ? "bg-amber-500/25 border-amber-400 text-amber-300 font-black shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-amber-300 hover:bg-white/5"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavoritesFilter ? "fill-amber-400 text-amber-400" : "text-amber-400/80"}`} />
            <span>{t.diary.filterFavoritesOnly || (language === "es" ? "Solo Favoritos" : "Favorites Only")}</span>
            {favoriteProfileIds.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-white/10 text-neutral-300">
                {favoriteProfileIds.length}
              </span>
            )}
          </button>

          {/* Filtro Mejor Valorados 5★ */}
          <button
            type="button"
            onClick={() => {
              setMinRatingFilter(minRatingFilter === 5 ? 0 : 5);
              audioEngine.playPulse();
            }}
            className={`px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer active:scale-95 ${
              minRatingFilter === 5
                ? "bg-purple-950/50 border-purple-500/50 text-white font-bold shadow-violet-soft"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{t.diary.filterTopRated}</span>
          </button>
        </div>

        {/* Expander de Fechas Personalizadas */}
        {(dateFilterPreset === "custom" || isCustomRangeOpen) && (
          <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end animate-in fade-in">
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
              <button
                type="button"
                onClick={() => {
                  setCustomFromDate("");
                  setCustomToDate("");
                  setDateFilterPreset("all");
                  audioEngine.playPulse();
                }}
                className="py-2 px-3 min-h-[44px] bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                {t.diary.filterClearRange}
              </button>
            )}
          </div>
        )}

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-0.5">
          <span>
            {t.diary.showingResults} <strong className="text-white">{filteredAndSortedEntries.length}</strong> {t.diary.ofTotal} {diaryEntries.length} {t.diary.encountersLabel}
          </span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
            {statusFilter === "upcoming"
              ? language === "es"
                ? "Orden: Próximas más cercanas primero"
                : "Sort: Soonest first"
              : language === "es"
              ? "Orden: Más recientes primero"
              : "Sort: Newest first"}
          </span>
        </div>
      </div>

      {/* 3. LISTADO DE CITAS (EMPTY STATES DIFERENCIADOS) */}
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
              <button
                type="button"
                onClick={onScheduleNew}
                className="px-5 py-2.5 min-h-[44px] bg-electricViolet text-white hover:bg-electricViolet-glow font-bold rounded-2xl text-xs font-mono shadow-violet-soft transition-all cursor-pointer active:scale-95"
              >
                + {t.diary.scheduleBtn}
              </button>
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
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-4 py-2.5 min-h-[44px] bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold rounded-2xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === "es" ? `Restablecer filtros (${diaryEntries.length})` : `Reset filters (${diaryEntries.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={onScheduleNew}
                  className="px-5 py-2.5 min-h-[44px] bg-electricViolet text-white hover:bg-electricViolet-glow font-bold rounded-2xl text-xs font-mono shadow-violet-soft transition-all cursor-pointer active:scale-95"
                >
                  + {t.diary.scheduleBtn}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedEntries.map((entry) => {
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
      )}

      {/* MODAL DE RESPALDO CIFRADO AES-GCM */}
      {backupModalMode !== "none" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-obsidian-surface border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-mono font-bold text-white text-sm uppercase">
                  {backupModalMode === "export"
                    ? language === "es"
                      ? "Exportar Respaldo Cifrado"
                      : "Export Encrypted Backup"
                    : language === "es"
                    ? "Restaurar Respaldo Cifrado"
                    : "Restore Encrypted Backup"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBackupModalMode("none")}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={backupModalMode === "export" ? handleExportBackup : handleImportBackup}
              className="space-y-4"
            >
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                {backupModalMode === "export"
                  ? language === "es"
                    ? "Tu agenda, fichas íntimas y fotos se cifrarán localmente con AES-GCM 256-bit usando la clave que elijas."
                    : "Your appointments, lover files, and photos will be encrypted locally with 256-bit AES-GCM using your password."
                  : language === "es"
                  ? "Ingresá la contraseña con la que protegiste tu archivo de respaldo para descifrarlo y restaurar tus registros."
                  : "Enter the password used to protect your backup file to decrypt and restore your entries."}
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-neutral-300 uppercase">
                  {language === "es" ? "Contraseña de Cifrado" : "Encryption Password"}
                </label>
                <input
                  type="password"
                  data-testid="diary-backup-password-input"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  placeholder={language === "es" ? "Mínimo 4 caracteres..." : "Enter password..."}
                  className="w-full px-4 py-3 rounded-2xl bg-black/80 border border-white/15 text-white font-mono text-xs focus:border-electricViolet focus:outline-none"
                  autoFocus
                />
              </div>

              {backupErrorMessage && (
                <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{backupErrorMessage}</span>
                </div>
              )}

              {backupStatusMessage && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{backupStatusMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBackupModalMode("none")}
                  className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-mono font-bold text-xs uppercase cursor-pointer"
                >
                  {language === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  data-testid="diary-backup-submit-btn"
                  disabled={isProcessingBackup}
                  className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase cursor-pointer shadow-violet-soft disabled:opacity-50"
                >
                  {isProcessingBackup
                    ? language === "es"
                      ? "Procesando..."
                      : "Processing..."
                    : backupModalMode === "export"
                    ? language === "es"
                      ? "Cifrar y Descargar"
                      : "Encrypt & Download"
                    : language === "es"
                    ? "Descifrar y Restaurar"
                    : "Decrypt & Restore"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

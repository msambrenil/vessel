"use client";

import React, { useState, useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
import { DiaryEntry, ExitProtocol, EncounterTestimonial, VesselProfile } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleActionMeta, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { DoxyPepTrackerCard } from "./DoxyPepTrackerCard";
import { SectionHeroHeader } from "@/components/ui";
import {
  Search,
  X,
  Calendar,
  Clock,
  MapPin,
  Star,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Plus,
  Filter,
  UserCheck,
  Users,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Zap,
  HeartPulse,
} from "lucide-react";

export const DateDiaryView: React.FC = () => {
  const {
    openCreateDiaryModal,
    openItsExposureModal,
    diaryEntries,
    diaryStats,
    doxyPepTrackers,
    addDoxyPepTracker,
    deleteDiaryEntry,
    myReceivedTestimonials,
    toggleTestimonialVisibility,
    profiles,
    setSelectedProfile,
    setActiveChatProfileId,
    myProfile,
    language,
    t,
  } = useVessel();

  // Estados de Búsqueda y Filtrado por Fecha
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilterPreset, setDateFilterPreset] = useState<"all" | "7days" | "30days" | "thisYear" | "custom">("all");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "upcoming">("all");
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"diary" | "health">("diary");

  // Estados de interfaz interactiva
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(true);
  const [inspectExternalContact, setInspectExternalContact] = useState<DiaryEntry["person"] | null>(null);

  const toggleNoteReveal = (id: string) => {
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    audioEngine.playPulse();
  };

  // Cálculo de fechas relativas (Hoy, Ayer, Hace X días)
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

  // Encontrar perfil vinculado en la matriz
  const getLinkedProfile = (entry: DiaryEntry): VesselProfile | undefined => {
    if (entry.person.profileId) {
      const found = profiles.find((p) => p.id === entry.person.profileId);
      if (found) return found;
    }
    return profiles.find(
      (p) => p.codename.toLowerCase() === entry.person.codename.toLowerCase()
    );
  };

  // Encontrar autor de un testimonio recibido
  const getAuthorProfile = (testimonial: EncounterTestimonial): VesselProfile | undefined => {
    if (testimonial.authorId) {
      const found = profiles.find((p) => p.id === testimonial.authorId);
      if (found) return found;
    }
    return profiles.find(
      (p) => p.codename.toLowerCase() === testimonial.authorCodename.toLowerCase()
    );
  };

  // Conteo de citas
  const upcomingCount = diaryEntries.filter((e) => e.isUpcoming).length;
  const completedCount = diaryEntries.filter((e) => !e.isUpcoming).length;

  // Promedio de valoración recibida sobre mí
  const averageReceivedRating = useMemo(() => {
    if (!myReceivedTestimonials || myReceivedTestimonials.length === 0) return 5.0;
    const ratings = myReceivedTestimonials
      .map((t) => t.rating || 5)
      .filter((r) => r > 0);
    if (ratings.length === 0) return 5.0;
    const sum = ratings.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / ratings.length).toFixed(1));
  }, [myReceivedTestimonials]);

  // Tags comunitarios recibidos más populares
  const topReceivedTags = useMemo(() => {
    const counts: Record<string, number> = {};
    (myReceivedTestimonials || []).forEach((t) => {
      (t.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [myReceivedTestimonials]);

  // Filtrado y ordenamiento cronológico descendente
  const filteredAndSortedEntries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const currentYear = today.getFullYear().toString();

    return diaryEntries
      .filter((entry) => {
        // Filtro por Estado (Concretados vs Agendados)
        if (statusFilter === "completed" && entry.isUpcoming) return false;
        if (statusFilter === "upcoming" && !entry.isUpcoming) return false;

        // Filtro por Calificación mínima
        if (minRatingFilter > 0) {
          if (!entry.satisfaction || entry.satisfaction.expectationsRating < minRatingFilter) {
            return false;
          }
        }

        // Filtro por Fechas
        if (dateFilterPreset === "7days") {
          const entryDate = new Date(entry.date + "T00:00:00");
          if (entryDate < sevenDaysAgo) return false;
        } else if (dateFilterPreset === "30days") {
          const entryDate = new Date(entry.date + "T00:00:00");
          if (entryDate < thirtyDaysAgo) return false;
        } else if (dateFilterPreset === "thisYear") {
          if (!entry.date.startsWith(currentYear)) return false;
        } else if (dateFilterPreset === "custom") {
          if (customFromDate && entry.date < customFromDate) return false;
          if (customToDate && entry.date > customToDate) return false;
        }

        // Búsqueda textual
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchCodename = entry.person.codename.toLowerCase().includes(q);
          const matchLocation = entry.location.name.toLowerCase().includes(q) ||
            (entry.location.address && entry.location.address.toLowerCase().includes(q));
          const matchNotes = entry.privateNotes.toLowerCase().includes(q);
          const matchTags = entry.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchCodename && !matchLocation && !matchNotes && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Orden estrictamente cronológico: Más reciente primero
        const dateTimeA = `${a.date}T${a.time || "00:00"}`;
        const dateTimeB = `${b.date}T${b.time || "00:00"}`;
        return dateTimeB.localeCompare(dateTimeA);
      });
  }, [
    diaryEntries,
    statusFilter,
    minRatingFilter,
    dateFilterPreset,
    customFromDate,
    customToDate,
    searchQuery,
  ]);

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

  const locationMeta: Record<string, { label: string; icon: string }> = {
    my_place: { label: language === "es" ? "Mi Bóveda // Hosting" : "My Place // Hosting", icon: "🏠" },
    their_place: { label: language === "es" ? "Su Sitio // Su Depto" : "Their Place", icon: "🔑" },
    club_darkroom: { label: language === "es" ? "Club // Darkroom" : "Club // Darkroom", icon: "⚡" },
    bar_lounge: { label: language === "es" ? "Bar // Café // Previa" : "Bar // Drinks", icon: "🍸" },
    hotel: { label: language === "es" ? "Hotel // Alojamiento" : "Hotel // Stay", icon: "🏨" },
    outdoor_cruising: { label: language === "es" ? "Cruising // Aire Libre" : "Outdoor Cruising", icon: "🌲" },
    other: { label: language === "es" ? "Otro Espacio" : "Other Space", icon: "📍" },
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 p-3 sm:p-4 pb-28 space-y-4 select-none bg-obsidian-deep min-h-screen animate-fade-in">
      {/* 1. HERO CABECERA: DASHBOARD DE ENCUENTROS */}
      <SectionHeroHeader
        variant="violet"
        icon={<UserCheck className="w-5 h-5 stroke-[2.5]" />}
        title={t.diary.title}
        tag="AES-256 VAULT"
        subtitle={t.diary.subtitle}
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end w-full sm:w-auto">
            {/* Cápsula Dock Táctica de Utilidades Secundarias */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md flex-shrink-0">
              {/* Botón Doxy-PEP */}
              <button
                type="button"
                onClick={() => {
                  addDoxyPepTracker({
                    partnerCodename: "KLAUS_030",
                    encounterDate: new Date().toISOString().split("T")[0],
                    encounterTime: new Date().toTimeString().slice(0, 5),
                  });
                  audioEngine.playPulse();
                }}
                className="px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl hover:bg-electricViolet/10 text-electricViolet-glow font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-transparent hover:border-electricViolet/30"
                title="Activar seguimiento clínico Doxy-PEP"
              >
                <HeartPulse className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span className="font-bold">Doxy-PEP</span>
              </button>

              <div className="w-px h-4 bg-white/10" />

              {/* Botón Notificar ITS Anónima */}
              <button
                type="button"
                onClick={() => {
                  openItsExposureModal();
                  audioEngine.playPulse();
                }}
                className="px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl hover:bg-red-950/40 text-red-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-transparent hover:border-red-500/30"
                title="Enviar alerta clínica 100% anónima a contactos recientes"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span className="font-bold">{t.diary.itsAlertBtn.split(" ")[0]}</span>
              </button>
            </div>

            {/* BOTÓN HERO CTA ELEVADO: + DOCUMENTAR ENCUENTRO */}
            <button
              type="button"
              onClick={() => {
                openCreateDiaryModal();
                audioEngine.playPulse();
              }}
              className="px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-electricViolet to-purple-600 hover:from-electricViolet-glow hover:to-purple-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet hover:scale-[1.02] active:scale-[0.96] flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="font-mono uppercase tracking-wider whitespace-nowrap">
                {t.diary.scheduleBtn}
              </span>
            </button>
          </div>
        }
      />

      {/* 2. SELECTOR SEGMENTADO SUPERIOR: BITÁCORA DE CITAS vs SALUD & CUIDADO */}
      <div className="bg-obsidian-surface/90 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-card-elevation">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("diary");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeTab === "diary"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{language === "es" ? "Bitácora de Citas" : "Encounter Log"}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeTab === "diary"
                  ? "bg-white/20 text-white font-extrabold"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {completedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("health");
              audioEngine.playPulse();
            }}
            className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 ${
              activeTab === "health"
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HeartPulse className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{language === "es" ? "Salud & Cuidado" : "Health & Care"}</span>
            {doxyPepTrackers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-bloodNeon animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 3. CONTENIDO SEGÚN PESTAÑA ACTIVA */}
      {activeTab === "diary" ? (
        <>
          {/* Banner compacto si hay Doxy-PEP activo */}
          {doxyPepTrackers.length > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">💊</span>
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <span>Seguimiento Doxy-PEP Activo</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-neutral-300 font-mono truncate">
                    Tenés {doxyPepTrackers.length} ventana(s) clínica(s) de 72h en curso.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("health");
                  audioEngine.playPulse();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-mono text-xs font-bold transition-all cursor-pointer flex-shrink-0"
              >
                Ver Botiquín
              </button>
            </div>
          )}


      {/* 3. SECCIÓN: TELEMETRÍA DE CITAS & RESPECT KARMA */}
      <SectionHeroHeader
        variant="amber"
        compact
        icon={<Sparkles className="w-4 h-4 text-champagneGold" />}
        title="Telemetría & Métricas de Satisfacción"
        tag="KPI AUDIT"
        subtitle="Estadísticas de citas completadas, puntualidad y reputación comunitaria"
      />

      {/* BENTO GRID DE TELEMETRÍA (4 KPIS PRINCIPALES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: TOTAL ENCUENTROS */}
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              {t.diary.kpiTotal}
            </span>
            <div className="p-1.5 rounded-xl bg-electricViolet/15 text-electricViolet-glow border border-electricViolet/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-black text-white">
              {completedCount}
            </span>
            {upcomingCount > 0 && (
              <span className="text-xs text-bloodNeon font-mono font-bold">
                (+{upcomingCount} agendados)
              </span>
            )}
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {t.diary.kpiTotalSub}
          </p>
        </div>

        {/* KPI 2: RESPECT KARMA SCORE */}
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              {t.diary.kpiKarma}
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-black text-emerald-400">
              {myProfile.respectScore || 100}%
            </span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {t.diary.kpiKarmaSub} // Impecable
          </p>
        </div>

        {/* KPI 3: VALORACIÓN MEDIA SOBRE MÍ */}
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              {t.diary.kpiRatingReceived}
            </span>
            <div className="p-1.5 rounded-xl bg-purple-950/40 text-electricViolet-glow border border-purple-500/30">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-black text-white">
              ★ {averageReceivedRating.toFixed(1)}
            </span>
            <span className="text-xs text-neutral-400 font-mono font-bold">/ 5.0</span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {myReceivedTestimonials.length} valoraciones validadas
          </p>
        </div>

        {/* KPI 4: TASA DE REPETICIÓN & QUÍMICA */}
        <div className="bg-obsidian-surface/90 p-4 sm:p-5 rounded-3xl border border-white/10 space-y-1.5 shadow-card-elevation backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              {t.diary.kpiRepeat}
            </span>
            <div className="p-1.5 rounded-xl bg-bloodNeon/15 text-bloodNeon border border-bloodNeon/30 shadow-blood-glow">
              <Flame className="w-4 h-4 text-bloodNeon" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-mono font-black text-bloodNeon">
              {diaryStats.repeatPercentage || 85}%
            </span>
          </div>
          <p className="text-[10px] font-mono text-neutral-400">
            {t.diary.kpiRepeatSub}
          </p>
        </div>
      </div>

      {/* SECCIÓN: VALORACIONES DE LOS USUARIOS SOBRE MÍ (DOBLE CONSENTIMIENTO) */}
      <div className="bg-obsidian-surface/90 rounded-3xl border border-white/10 p-4 sm:p-5 space-y-4 shadow-card-elevation backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/40 text-electricViolet-glow border border-purple-500/30">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.diary.reviewsSectionTitle}
                </h3>
                <span className="text-[9px] font-mono font-bold text-mintNeon uppercase bg-mintNeon/15 border border-mintNeon/40 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Doble Consentimiento OK
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {t.diary.reviewsSectionSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsReviewsExpanded(!isReviewsExpanded);
              audioEngine.playPulse();
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={isReviewsExpanded ? "Plegar valoraciones" : "Desplegar valoraciones"}
          >
            {isReviewsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* TAGS COMUNITARIOS DESTACADOS */}
        {topReceivedTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase mr-1 flex-shrink-0">
              {language === "es" ? "Tags otorgados:" : "Awarded tags:"}
            </span>
            {topReceivedTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl bg-electricViolet/15 border border-electricViolet/35 text-electricViolet-glow flex-shrink-0 flex items-center gap-1"
              >
                <span>✓</span>
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* FEED DE RESEÑAS RECIBIDAS (DESPLEGABLE) */}
        {isReviewsExpanded && (
          <div className="space-y-3 pt-2">
            {myReceivedTestimonials.length === 0 ? (
              <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center space-y-2">
                <p className="text-xs font-mono font-bold text-neutral-300">
                  {t.diary.noReviewsTitle}
                </p>
                <p className="text-[11px] text-neutral-500 max-w-md mx-auto">
                  {t.diary.noReviewsSub}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myReceivedTestimonials.map((testimonial) => {
                  const authorProfile = getAuthorProfile(testimonial);
                  const isPublic = testimonial.status === "approved";

                  return (
                    <div
                      key={testimonial.id}
                      className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-3 shadow-card-elevation backdrop-blur-md hover:border-white/20 transition-all"
                    >
                      <div className="space-y-2">
                        {/* Autor y Nota */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`flex items-center gap-2.5 ${
                              authorProfile ? "cursor-pointer group" : ""
                            }`}
                            onClick={() => {
                              if (authorProfile) {
                                setSelectedProfile(authorProfile);
                                audioEngine.playPulse();
                              }
                            }}
                          >
                            <img
                              src={
                                testimonial.authorAvatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                              }
                              alt={testimonial.authorCodename}
                              className="w-9 h-9 rounded-xl object-cover border border-white/10 group-hover:border-electricViolet transition-colors"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold text-white group-hover:text-electricViolet-glow transition-colors">
                                  {testimonial.authorCodename}
                                </span>
                                {authorProfile && (
                                  <span className="text-[9px] font-mono text-electricViolet-glow">➔</span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {testimonial.createdAt}
                              </span>
                            </div>
                          </div>

                          {/* Estrellas */}
                          <div className="flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-lg text-white font-mono text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{testimonial.rating || 5}.0</span>
                          </div>
                        </div>

                        {/* Testimonio en Cursiva */}
                        <p className="text-xs text-neutral-200 font-sans italic leading-relaxed pl-2.5 border-l-2 border-electricViolet/50">
                          &ldquo;{testimonial.content}&rdquo;
                        </p>

                        {/* Tags de Reseña */}
                        {testimonial.tags && testimonial.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            {testimonial.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-neutral-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Botonera de Visibilidad */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                            isPublic
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublic ? "bg-emerald-400" : "bg-neutral-500"}`} />
                          <span>{isPublic ? t.diary.reviewsPublicBadge : t.diary.reviewsPrivateBadge}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            toggleTestimonialVisibility("me", testimonial.id);
                          }}
                          className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer font-bold flex items-center gap-1.5 active:scale-95"
                        >
                          {isPublic ? (
                            <>
                              <EyeOff className="w-3 h-3 text-neutral-400" />
                              <span>{t.diary.reviewsMakePrivate}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-neutral-400" />
                              <span>{t.diary.reviewsMakePublic}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. SECCIÓN: HISTORIAL DE CITAS Y BITÁCORA PRIVADA */}
      <SectionHeroHeader
        variant="cyan"
        compact
        icon={<Calendar className="w-4 h-4 text-cyan-400" />}
        title="Bitácora de Encuentros"
        tag={`${filteredAndSortedEntries.length} CITAS`}
        subtitle="Registro cronológico cifrado local-first de experiencias y conexiones"
      />

      {/* BARRA DE BÚSQUEDA Y FILTRADO AVANZADO POR FECHAS */}
      <div className="space-y-3 bg-obsidian-surface/60 p-4 rounded-3xl border border-white/10 backdrop-blur-md shadow-card-elevation">
        {/* Buscador Textual */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.diary.filterSearchPlaceholder}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus:ring-1 focus:ring-electricViolet font-mono"
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

        {/* Chips de Presets de Fecha */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setDateFilterPreset("all");
              audioEngine.playPulse();
            }}
            className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
              dateFilterPreset === "all"
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.diary.filterAll}
          </button>

          <button
            type="button"
            onClick={() => {
              setDateFilterPreset("7days");
              audioEngine.playPulse();
            }}
            className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
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
            className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
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
            className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
              dateFilterPreset === "thisYear"
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.diary.filterThisYear}
          </button>

          {/* Toggle de Rango de Fecha Personalizado */}
          <button
            type="button"
            onClick={() => {
              setDateFilterPreset("custom");
              setIsCustomRangeOpen(!isCustomRangeOpen);
              audioEngine.playPulse();
            }}
            className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              dateFilterPreset === "custom"
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-bold"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.diary.filterCustomRange}</span>
          </button>

          {/* Separador vertical */}
          <div className="h-6 w-px bg-white/10 mx-1 flex-shrink-0" />

          {/* Filtros de Concretados vs Agendados */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter(statusFilter === "completed" ? "all" : "completed");
              audioEngine.playPulse();
            }}
            className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
              statusFilter === "completed"
                ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow font-bold"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.diary.filterCompleted} ({completedCount})
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter(statusFilter === "upcoming" ? "all" : "upcoming");
              audioEngine.playPulse();
            }}
            className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer active:scale-95 ${
              statusFilter === "upcoming"
                ? "bg-bloodNeon/20 border-bloodNeon text-bloodNeon font-extrabold"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.diary.filterUpcoming} ({upcomingCount})
          </button>

          {/* Filtro Top 5 Estrellas */}
          <button
            type="button"
            onClick={() => {
              setMinRatingFilter(minRatingFilter === 5 ? 0 : 5);
              audioEngine.playPulse();
            }}
            className={`px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer active:scale-95 ${
              minRatingFilter === 5
                ? "bg-purple-950/50 border-purple-500/50 text-white font-bold shadow-violet-soft"
                : "bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{t.diary.filterTopRated}</span>
          </button>
        </div>

        {/* EXPANDER DE RANGO PERSONALIZADO (DESDE / HASTA) */}
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
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/10 text-white font-mono text-xs focus:border-electricViolet focus:outline-none"
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
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/10 text-white font-mono text-xs focus:border-electricViolet focus:outline-none"
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
                className="py-2 px-3 min-h-[40px] bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                {t.diary.filterClearRange}
              </button>
            )}
          </div>
        )}

        {/* Resumen de Resultados Filtrados */}
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
          <span>
            {t.diary.showingResults} <strong className="text-white">{filteredAndSortedEntries.length}</strong> {t.diary.ofTotal} {diaryEntries.length} {t.diary.encountersLabel}
          </span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
            {language === "es" ? "Orden: Más recientes primero" : "Sort: Newest first"}
          </span>
        </div>
      </div>

      {/* FEED CRONOLÓGICO DE ENCUENTROS */}
      {filteredAndSortedEntries.length === 0 ? (
        <div className="bg-obsidian-surface/80 p-8 sm:p-12 rounded-3xl border border-white/10 text-center space-y-4 shadow-card-elevation backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-mono font-bold text-white uppercase">
              {t.diary.cardEmptyFeedTitle}
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {t.diary.cardEmptyFeedSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCreateDiaryModal()}
            className="px-5 py-2.5 min-h-[44px] bg-electricViolet text-white hover:bg-electricViolet-glow font-bold rounded-2xl text-xs font-mono shadow-violet-soft transition-all cursor-pointer active:scale-95"
          >
            + {t.diary.scheduleBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedEntries.map((entry) => {
            const isRevealed = !!revealedNotes[entry.id];
            const linkedProfile = getLinkedProfile(entry);

            const effectiveRole = entry.person.role || (linkedProfile ? linkedProfile.role : "Versatile");
            const roleMeta = getRoleActionMeta(effectiveRole, language, entry.person.codename);
            const exitProtocol = linkedProfile?.exitProtocol || "fast_encounter";
            const relativeDate = getRelativeDateLabel(entry.date);

            const isImmediateHost = linkedProfile
              ? (linkedProfile.mobility === "Tengo depto / lugar" ||
                 linkedProfile.mobility === "Tengo sitio" ||
                 linkedProfile.mobility === "Tengo lugar y me muevo" ||
                 linkedProfile.mobility === "Tengo sitio/me desplazo")
              : false;

            const locData = locationMeta[entry.location.category] || locationMeta.other;

            return (
              <div
                key={entry.id}
                className={`bg-obsidian-surface/95 rounded-3xl border p-4 sm:p-5 space-y-4 shadow-card-elevation transition-all backdrop-blur-md ${
                  entry.isUpcoming
                    ? "border-bloodNeon/50 shadow-blood-glow"
                    : "border-white/10 hover:border-electricViolet/40"
                }`}
              >
                {/* NIVEL 1: ROSTRO, IDENTIDAD, ACCESO A PERFIL Y FECHA */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* AVATAR / ROSTRO DEL ENCUENTRO */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (linkedProfile) {
                          setSelectedProfile(linkedProfile);
                          audioEngine.playPulse();
                        } else {
                          setInspectExternalContact(entry.person);
                          audioEngine.playPulse();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (linkedProfile) {
                            setSelectedProfile(linkedProfile);
                            audioEngine.playPulse();
                          } else {
                            setInspectExternalContact(entry.person);
                            audioEngine.playPulse();
                          }
                        }
                      }}
                      className="relative flex-shrink-0 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet rounded-2xl"
                      title={linkedProfile ? `${t.diary.cardViewProfile} de ${entry.person.codename}` : "Ver expediente"}
                    >
                      <img
                        src={
                          entry.person.avatarUrl ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                        }
                        alt={entry.person.codename}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-electricViolet transition-colors shadow-md"
                      />

                      {/* Semáforo de Estado Corporal */}
                      {linkedProfile && (
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black font-mono ${
                            linkedProfile.bodyState === "open"
                              ? "bg-mintNeon text-obsidian-deep font-black animate-pulse shadow-mint-glow"
                              : linkedProfile.bodyState === "occupied"
                              ? "bg-bloodNeon text-white font-bold"
                              : "bg-electricViolet text-white font-bold shadow-violet-soft"
                          }`}
                          title={`Estado corporal: ${linkedProfile.bodyState}`}
                        >
                          V
                        </span>
                      )}
                    </div>

                    {/* DATOS DE LA PERSONA */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => {
                            if (linkedProfile) {
                              setSelectedProfile(linkedProfile);
                              audioEngine.playPulse();
                            } else {
                              setInspectExternalContact(entry.person);
                              audioEngine.playPulse();
                            }
                          }}
                          className="font-mono font-black text-sm sm:text-base text-white hover:text-electricViolet-glow cursor-pointer transition-colors truncate"
                        >
                          {entry.person.codename}
                        </span>

                        {entry.person.age && (
                          <span className="text-xs text-neutral-400 font-mono">
                            {entry.person.age} {language === "es" ? "años" : "yo"}
                          </span>
                        )}

                        {effectiveRole && (
                          <span className="text-[9px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-2 py-0.5 rounded-full uppercase">
                            {getRoleDisplayLabel(effectiveRole, language)}
                          </span>
                        )}

                        {isImmediateHost && (
                          <span className="text-[9px] font-mono font-bold text-electricViolet-glow bg-electricViolet/20 border border-electricViolet/40 px-1.5 py-0.5 rounded-full uppercase">
                            🏠 {language === "es" ? "Lugar" : "Host"}
                          </span>
                        )}

                        {entry.person.isExternalProfile && (
                          <span className="text-[9px] font-mono font-bold text-neutral-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full uppercase">
                            {t.diary.cardExternalContact}
                          </span>
                        )}
                      </div>

                      {/* FECHA Y HORA CON TIEMPO RELATIVO */}
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-white font-mono font-bold">
                          <Calendar className="w-3.5 h-3.5 text-electricViolet-glow" />
                          {entry.date}
                        </span>
                        <span className="text-neutral-500 font-mono">//</span>
                        <span className="flex items-center gap-1 font-mono text-neutral-300">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          {entry.time} hs
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300">
                          {relativeDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ESTADO DE AGENDADO VS CONCRETADO */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {entry.isUpcoming ? (
                      <span className="px-2.5 py-1 rounded-xl bg-bloodNeon/20 border border-bloodNeon/50 text-bloodNeon font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{t.diary.upcomingDates}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Concretado</span>
                      </span>
                    )}

                    {/* Botón táctico directo para ver perfil */}
                    {linkedProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProfile(linkedProfile);
                          audioEngine.playPulse();
                        }}
                        className="text-[10px] font-mono font-bold text-electricViolet-glow hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                      >
                        <span>{t.diary.cardViewProfile}</span>
                        <span>➔</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* NIVEL 2: UBICACIÓN, SATISFACCIÓN Y EXIT PROTOCOL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/5">
                  {/* Ubicación */}
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

                  {/* Valoración propia dada al encuentro */}
                  <div className="flex items-center justify-start sm:justify-end gap-3">
                    {entry.satisfaction ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-lg text-white font-mono text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{entry.satisfaction.expectationsRating}.0</span>
                        </div>
                        <div className="flex items-center gap-1 bg-bloodNeon/15 border border-bloodNeon/30 px-2 py-0.5 rounded-lg text-bloodNeon font-mono text-xs font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{entry.satisfaction.chemistryLevel}/5</span>
                        </div>
                        {entry.satisfaction.wouldRepeat === "yes" && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400">
                            ✓ Repetir
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500 italic">
                        {entry.isUpcoming ? "Cita pendiente" : "Sin evaluar"}
                      </span>
                    )}
                  </div>
                </div>

                {/* NIVEL 3: PROTOCOLO DE SALIDA & TAGS */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderExitProtocolPill(exitProtocol)}
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-neutral-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* NIVEL 4: NOTAS CONFIDENCIALES CIFRADAS (AES-256) */}
                {entry.privateNotes && (
                  <div className="rounded-2xl bg-black/60 border border-white/5 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-mintNeon" />
                        <span>{t.diary.cardPrivateNote} (AES-256)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleNoteReveal(entry.id)}
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

                {/* NIVEL 5: BOTONERA DE ACCIONES RÁPIDAS (ERGONOMÍA 44PX) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2">
                    {/* Botón Ver Perfil */}
                    <button
                      type="button"
                      onClick={() => {
                        if (linkedProfile) {
                          setSelectedProfile(linkedProfile);
                          audioEngine.playPulse();
                        } else {
                          setInspectExternalContact(entry.person);
                          audioEngine.playPulse();
                        }
                      }}
                      className="px-3 py-1.5 min-h-[40px] bg-white/5 hover:bg-electricViolet/20 hover:text-electricViolet-glow border border-white/10 hover:border-electricViolet/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 text-neutral-300"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{t.diary.cardViewProfile}</span>
                    </button>

                    {/* Botón Chat Directo */}
                    {linkedProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChatProfileId(linkedProfile.id);
                          audioEngine.playPulse();
                        }}
                        className="px-3 py-1.5 min-h-[40px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 text-neutral-300 hover:text-white"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-electricViolet-glow" />
                        <span className="hidden sm:inline">{t.diary.cardOpenChat}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botón Editar */}
                    <button
                      type="button"
                      onClick={() => {
                        openCreateDiaryModal(entry.person.profileId, entry.id);
                        audioEngine.playPulse();
                      }}
                      className="p-2 min-h-[40px] min-w-[40px] bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      title={t.diary.cardEdit}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(t.diary.cardDeleteConfirm)) {
                          deleteDiaryEntry(entry.id);
                          audioEngine.playPulse();
                        }
                      }}
                      className="p-2 min-h-[40px] min-w-[40px] bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/40 text-neutral-400 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      title={t.diary.cardDelete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      ) : (
        /* PESTAÑA: SALUD & CUIDADO */
        <div className="space-y-4 animate-fade-in">
          {/* BOTIQUÍN CLÍNICO DOXY-PEP */}
          <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-emerald-500/30 space-y-4 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <SectionHeroHeader
              variant="mint"
              icon={<span className="text-xl leading-none">💊</span>}
              title={t.diary.doxyPepTitle}
              tag="VENTANA 72H"
              subtitle={t.diary.doxyPepSub}
              actions={
                <button
                  type="button"
                  onClick={() => {
                    addDoxyPepTracker({
                      partnerCodename: "CONTACTO_NUEVO",
                      encounterDate: new Date().toISOString().split("T")[0],
                      encounterTime: new Date().toTimeString().slice(0, 5),
                    });
                    audioEngine.playPulse();
                  }}
                  className="px-3 py-1.5 min-h-[38px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{language === "es" ? "Nuevo Tracker" : "New Tracker"}</span>
                </button>
              }
            />

            {doxyPepTrackers.length > 0 ? (
              <div className="space-y-3 pt-1">
                {doxyPepTrackers.map((tracker) => (
                  <DoxyPepTrackerCard key={tracker.id} tracker={tracker} />
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                <span className="text-2xl block">🛡️</span>
                <p className="text-xs font-mono font-bold text-white">
                  {language === "es" ? "Sin seguimientos Doxy-PEP activos" : "No active Doxy-PEP trackers"}
                </p>
                <p className="text-[11px] text-neutral-400 font-mono max-w-md mx-auto">
                  {language === "es"
                    ? "La profilaxis post-exposición con Doxiciclina (200mg) es más efectiva tomada dentro de las 24hs y hasta 72hs después de un encuentro sexual de riesgo."
                    : "Post-exposure prophylaxis with Doxycycline (200mg) is most effective when taken within 24h to 72h after a sexual encounter."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    addDoxyPepTracker({
                      partnerCodename: "CONTACTO",
                      encounterDate: new Date().toISOString().split("T")[0],
                      encounterTime: new Date().toTimeString().slice(0, 5),
                    });
                    audioEngine.playPulse();
                  }}
                  className="mt-2 px-4 py-2 min-h-[40px] rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  + {language === "es" ? "Iniciar Seguimiento Doxy-PEP (72h)" : "Start Doxy-PEP Tracker (72h)"}
                </button>
              </div>
            )}
          </div>

          {/* CALENDARIO & CONTROL PrEP 90 DÍAS */}
          <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-card-elevation backdrop-blur-md">
            <SectionHeroHeader
              variant="violet"
              icon={<ShieldCheck className="w-5 h-5 text-electricViolet-glow" />}
              title={language === "es" ? "Control & Calendario PrEP" : "PrEP Tracking & Calendar"}
              tag="CICLO 90 DÍAS"
              subtitle={
                language === "es"
                  ? "Monitoreo preventivo trimestral, adherencia y recordatorio de laboratorio"
                  : "Quarterly preventative monitoring, adherence and lab reminders"
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                  {language === "es" ? "Pauta Terapéutica" : "Regimen"}
                </span>
                <span className="text-sm font-mono font-black text-white block">
                  {myProfile.hivStatus?.includes("PrEP")
                    ? language === "es" ? "PrEP Diaria Activa" : "Daily PrEP Active"
                    : language === "es" ? "PrEP No Registrada" : "No PrEP Registered"}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {language === "es" ? "Protección comprobada >99%" : "Protection verified >99%"}
                </span>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                  {language === "es" ? "Próximo Chequeo Clínico" : "Next Lab Checkup"}
                </span>
                <span className="text-sm font-mono font-black text-amber-300 block">
                  {language === "es" ? "En 45 días" : "In 45 days"}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  VIH, Creatinina, Sífilis, VHB/VHC
                </span>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                  {language === "es" ? "Stock / Receta Médica" : "Prescription / Stock"}
                </span>
                <span className="text-sm font-mono font-black text-electricViolet-glow block">
                  {language === "es" ? "Vigente (Hospital / Centro)" : "Valid (Public Health)"}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {language === "es" ? "Acceso gratuito Ley Nacional" : "Free national coverage"}
                </span>
              </div>
            </div>
          </div>

          {/* ALERTA ANÓNIMA DE EXPOSICIÓN A ITS */}
          <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-red-500/30 space-y-3.5 shadow-card-elevation backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <SectionHeroHeader
              variant="blood"
              icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
              title={language === "es" ? "Alerta de Exposición a ITS // 100% Anónima" : "Anonymous STI Exposure Alert"}
              tag="PROTECCIÓN COLECTIVA"
              subtitle={
                language === "es"
                  ? "Avisá a tus contactos recientes para que puedan testearse a tiempo sin revelar tu identidad"
                  : "Notify recent partners so they can get tested in time without revealing your identity"
              }
            />

            <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-mono text-neutral-200">
                  {language === "es"
                    ? "Cero estigma, máxima responsabilidad. VESSEL envía un aviso criptográfico anónimo a los perfiles con los que registraste encuentros en los últimos 30 días."
                    : "Zero stigma, maximum responsibility. VESSEL sends an anonymous cryptographic alert to partners you logged encounters with in the last 30 days."}
                </p>
                <p className="text-[10px] font-mono text-neutral-400">
                  🔒 {language === "es" ? "Ni tu nombre, ni tu perfil, ni la fecha exacta son revelados." : "Neither your name, profile, nor the exact date are ever revealed."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  openItsExposureModal();
                  audioEngine.playPulse();
                }}
                className="px-4 py-2.5 min-h-[44px] bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{language === "es" ? "Emitir Alerta Anónima" : "Broadcast Anonymous Alert"}</span>
              </button>
            </div>
          </div>

          {/* PROTOCOLO DE REDUCCIÓN DE DAÑOS // CHEM-CHILL */}
          <div className="bg-obsidian-surface/90 rounded-3xl p-4 sm:p-5 border border-white/10 space-y-3 shadow-card-elevation backdrop-blur-md">
            <SectionHeroHeader
              variant="violet"
              icon={<Sparkles className="w-4 h-4 text-champagneGold" />}
              title={language === "es" ? "Reducción de Daños // Pautas de Cuidado" : "Harm Reduction // Care Protocol"}
              tag="CHEM-CHILL & SALUD"
              subtitle={
                language === "es"
                  ? "Información basada en evidencia para encuentros placenteros, informados y seguros"
                  : "Evidence-based guidelines for pleasurable, informed, and safe encounters"
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>💧</span>
                  <span>{language === "es" ? "Hidratación & Sales" : "Hydration & Electrolytes"}</span>
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {language === "es"
                    ? "Tomá agua en sorbos pequeños. Si la sesión se extiende, sumá bebidas isotónicas para no descompensar."
                    : "Sip water regularly. For longer sessions, add electrolyte drinks to prevent dehydration."}
                </p>
              </div>

              <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>🤝</span>
                  <span>{language === "es" ? "Consentimiento Continuo" : "Ongoing Consent"}</span>
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {language === "es"
                    ? "Un 'sí' inicial no es un cheque en blanco. Chequeá periódicamente cómo se siente el otro y comunicá tus límites."
                    : "An initial yes is not permanent. Check in periodically and communicate your boundaries clearly."}
                </p>
              </div>

              <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>{language === "es" ? "Tiempos & Espaciado" : "Timing & Spacing"}</span>
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {language === "es"
                    ? "Evitá redosificaciones apresuradas. Dale tiempo al cuerpo para procesar y descansá entre rondas."
                    : "Avoid rushing redosing. Allow your body time to metabolize and rest between rounds."}
                </p>
              </div>

              <div className="p-3.5 bg-black/50 border border-white/10 rounded-2xl space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>{language === "es" ? "Línea de Auxilio 24h" : "24/7 Helpline"}</span>
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {language === "es"
                    ? "Ante dudas de salud o emergencias médicas, llamá al 107 (SAME) o al 144 en Argentina."
                    : "For medical emergencies in Argentina, dial 107 (SAME) or 144."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FICHA PARA CONTACTO EXTERNO (SI NO ESTÁ EN MATRIZ) */}
      {inspectExternalContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-obsidian-surface border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-electricViolet/15 text-electricViolet-glow">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-mono font-bold text-white text-sm uppercase">
                  Ficha de Contacto // {inspectExternalContact.codename}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectExternalContact(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={
                  inspectExternalContact.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                }
                alt={inspectExternalContact.codename}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-electricViolet/60 shadow-md"
              />
              <div className="space-y-1">
                <h4 className="font-mono font-black text-white text-base">
                  {inspectExternalContact.codename}
                </h4>
                {inspectExternalContact.age && (
                  <p className="text-xs font-mono text-neutral-400">
                    {inspectExternalContact.age} años
                  </p>
                )}
                {inspectExternalContact.role && (
                  <span className="inline-block text-[10px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-2 py-0.5 rounded-full uppercase">
                    {getRoleDisplayLabel(inspectExternalContact.role, language)}
                  </span>
                )}
              </div>
            </div>

            {inspectExternalContact.privateNotes && (
              <div className="bg-black/60 rounded-2xl p-3 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                  Notas Privadas:
                </span>
                <p className="text-xs font-mono text-neutral-200">
                  {inspectExternalContact.privateNotes}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setInspectExternalContact(null)}
              className="w-full py-2.5 min-h-[44px] rounded-xl bg-electricViolet text-white font-mono font-bold text-xs uppercase cursor-pointer hover:bg-electricViolet-glow shadow-violet-soft"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React from "react";
import {
  useRadarMatrix,
  useLogistics,
  useSettings,
  useAuth,
} from "@/context/VesselContext";
import { VesselProfile } from "@/types/vessel";
import { ProfileCard } from "./ProfileCard";
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Zap,
  Home,
  ShieldCheck,
  Ghost,
  Flame,
  Radio,
  UserPlus,
  FlaskConical,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

interface ProfileGridProps {
  onSelectProfile: (profile: VesselProfile) => void;
  onOpenChat: (profileId: string) => void;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  onSelectProfile,
  onOpenChat,
}) => {
  const {
    filteredProfiles,
    filters,
    setFilters,
    resetFilters,
    setIsFilterDrawerOpen,
    isOnTheClockFilterActive,
    setIsOnTheClockFilterActive,
    setActiveView,
  } = useRadarMatrix();
  const { openNightlifeModal } = useLogistics();
  const { language, t, appMode, setAppMode, isUnlimited } = useSettings();
  const { openAuthModal, currentUserUid } = useAuth();

  const [sortBy, setSortBy] = React.useState<"distance" | "recent" | "affinity">("distance");
  const [searchValue, setSearchValue] = React.useState(filters.searchQuery);

  React.useEffect(() => {
    setSearchValue(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    React.startTransition(() => {
      setFilters((prev) => ({ ...prev, searchQuery: val }));
    });
  };

  const activeFiltersCount =
    (filters.bodyStates.length < 3 ? 1 : 0) +
    filters.roles.length +
    (filters.minIntensity > 1 ? 1 : 0) +
    (filters.immediateHostOnly ? 1 : 0) +
    filters.selectedKinks.length +
    (filters.onlyAntiGhost ? 1 : 0) +
    (filters.onlyVerified ? 1 : 0) +
    (filters.onlyMutualKinks ? 1 : 0) +
    ((filters.substanceAtmospheres && filters.substanceAtmospheres.length > 0) ? 1 : 0) +
    (filters.searchQuery.trim() !== "" ? 1 : 0) +
    (isOnTheClockFilterActive ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  // Quick Filter Helpers
  const isOnlyOpenActive =
    filters.bodyStates.length === 1 && filters.bodyStates[0] === "open";
  const isHostOnlyActive = filters.immediateHostOnly;
  const isAntiGhostActive = filters.onlyAntiGhost;
  const isVerifiedActive = !!filters.onlyVerified;
  const isMutualKinksActive = !!filters.onlyMutualKinks;
  const isSoberActive = !!(filters.substanceAtmospheres && filters.substanceAtmospheres.includes("sober"));
  const isHighIntensityActive = filters.minIntensity >= 3;
  const isTopActive =
    filters.roles.length > 0 &&
    filters.roles.every((r) => r === "Top" || r === "Vers Top");
  const isBottomActive =
    filters.roles.length > 0 &&
    filters.roles.every((r) => r === "Bottom" || r === "Vers Bottom");
  const isVersActive =
    filters.roles.length === 1 && filters.roles[0] === "Versatile";

  const toggleQuickFilter = (type: string) => {
    audioEngine.playPulse();
    if (type === "open") {
      setFilters((prev) => ({
        ...prev,
        bodyStates: isOnlyOpenActive
          ? ["open", "occupied", "dormant"]
          : ["open"],
      }));
    } else if (type === "host") {
      setFilters((prev) => ({
        ...prev,
        immediateHostOnly: !prev.immediateHostOnly,
      }));
    } else if (type === "verified") {
      setFilters((prev) => ({
        ...prev,
        onlyVerified: !prev.onlyVerified,
      }));
    } else if (type === "mutualKinks") {
      setFilters((prev) => ({
        ...prev,
        onlyMutualKinks: !prev.onlyMutualKinks,
      }));
    } else if (type === "sober") {
      setFilters((prev) => ({
        ...prev,
        substanceAtmospheres: isSoberActive ? [] : ["sober", "social_drinks"],
      }));
    } else if (type === "antiGhost") {
      setFilters((prev) => ({
        ...prev,
        onlyAntiGhost: !prev.onlyAntiGhost,
      }));
    } else if (type === "intensity") {
      setFilters((prev) => ({
        ...prev,
        minIntensity: isHighIntensityActive ? 1 : 3,
      }));
    } else if (type === "top") {
      setFilters((prev) => ({
        ...prev,
        roles: isTopActive ? [] : ["Top", "Vers Top"],
      }));
    } else if (type === "bottom") {
      setFilters((prev) => ({
        ...prev,
        roles: isBottomActive ? [] : ["Bottom", "Vers Bottom"],
      }));
    } else if (type === "vers") {
      setFilters((prev) => ({
        ...prev,
        roles: isVersActive ? [] : ["Versatile"],
      }));
    }
  };

  // Jerarquía de visualización táctica y comercial:
  // Tier 4: Miembro Unlimited CON Listo YA activo (Máxima visibilidad de todo el sistema)
  // Tier 3: Miembro Unlimited (Sin Listo YA) -> Los usuarios con membresía se ven antes que los que tienen boost
  // Tier 2: Usuario Estándar (Free) CON Listo YA activo -> Aparece destacado sobre los usuarios estándar
  // Tier 1: Usuario Estándar normal
  const getPriorityTier = React.useCallback(
    (p: VesselProfile): number => {
      const isMember = Boolean(
        p.isUnlimited ||
        p.userPlan === "unlimited" ||
        p.userPlan === "pro" ||
        (p.isCurrentUser && isUnlimited)
      );
      const isReadyNow = Boolean(p.onTheClock?.isActive);

      if (isMember && isReadyNow) return 4;
      if (isMember) return 3;
      if (isReadyNow) return 2;
      return 1;
    },
    [isUnlimited]
  );

  // Ordenamiento reactivo según criterio táctico y jerarquía comercial
  const sortedProfiles = React.useMemo(() => {
    const list = [...filteredProfiles];

    if (sortBy === "distance") {
      return list.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;

        // 1. Jerarquía de visibilidad: Miembros > Boost/Listo YA > Estándar
        const tierA = getPriorityTier(a);
        const tierB = getPriorityTier(b);
        if (tierA !== tierB) {
          return tierB - tierA;
        }

        // 2. Si comparten tier, ordenar por proximidad física (distancia)
        return a.distanceMeters - b.distanceMeters;
      });
    }

    if (sortBy === "recent") {
      return list.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;

        // 1. Jerarquía de visibilidad: Miembros > Boost/Listo YA > Estándar
        const tierA = getPriorityTier(a);
        const tierB = getPriorityTier(b);
        if (tierA !== tierB) {
          return tierB - tierA;
        }

        // 2. Si comparten tier, priorizar disponibilidad inmediata ('open' vs 'occupied'/'dormant')
        const aOpen = a.bodyState === "open" ? 1 : 0;
        const bOpen = b.bodyState === "open" ? 1 : 0;
        if (aOpen !== bOpen) {
          return bOpen - aOpen;
        }

        return a.distanceMeters - b.distanceMeters;
      });
    }

    if (sortBy === "affinity") {
      const affinityScores = new Map<string, number>();
      for (const p of list) {
        if (p.kinkMatrix) {
          let score = 0;
          for (const v of Object.values(p.kinkMatrix)) {
            if (v === "love" || v === "curious") score++;
          }
          affinityScores.set(p.id, score);
        } else {
          affinityScores.set(p.id, 0);
        }
      }
      return list.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;

        // 1. Jerarquía de visibilidad: Miembros > Boost/Listo YA > Estándar
        const tierA = getPriorityTier(a);
        const tierB = getPriorityTier(b);
        if (tierA !== tierB) {
          return tierB - tierA;
        }

        // 2. Si comparten tier, ordenar por afinidad en Kink Matrix
        const scoreA = affinityScores.get(a.id) || 0;
        const scoreB = affinityScores.get(b.id) || 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }

        return a.distanceMeters - b.distanceMeters;
      });
    }

    return list;
  }, [filteredProfiles, sortBy, getPriorityTier]);

  const handleResetAllFilters = () => {
    audioEngine.playPulse();
    setSearchValue("");
    resetFilters();
    setIsOnTheClockFilterActive(false);
  };

  return (
    <div className="flex flex-col flex-1 pb-32 select-none">
      {/* =========================================================
          BARRA DE BÚSQUEDA Y FILTROS RÁPIDOS (Sticky Top con Frosted Glass)
          ========================================================= */}
      <div className="p-2 sm:p-2.5 bg-obsidian-deep/95 border-b border-white/10 sticky top-[52px] sm:top-[56px] z-20 space-y-2 shadow-md backdrop-blur-md">
        
        {/* Fila 1: Input de Búsqueda y Botón de Drawer Completo */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex-1">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${
              searchValue ? "text-electricViolet-glow" : "text-neutral-400"
            }`} />
            <input
              type="text"
              placeholder={t.filters?.searchPlaceholder || "Buscar por rol, fetiche, alias..."}
              aria-label={t.filters?.searchPlaceholder || "Buscar por rol, fetiche, alias..."}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full min-h-[38px] bg-white/5 border border-white/10 rounded-xl text-white text-xs pl-10 pr-9 py-1.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all font-sans"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setSearchValue("");
                  React.startTransition(() => {
                    setFilters((prev) => ({ ...prev, searchQuery: "" }));
                  });
                }}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botón de Filtros Avanzados con Badge de Filtros Activos */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              setIsFilterDrawerOpen(true);
            }}
            aria-label={t.filters?.title || "Filtros Avanzados"}
            className={`px-3 min-h-[38px] relative flex items-center justify-center gap-1.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0 text-xs font-mono font-bold ${
              hasActiveFilters
                ? "bg-electricViolet text-white border-electricViolet-glow font-bold shadow-violet-glow hover:bg-electricViolet/90"
                : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
            }`}
            title={t.filters?.title || "Filtros Dinámicos"}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline uppercase text-[10.5px]">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-bloodNeon text-white text-[9px] font-mono font-black flex items-center justify-center shadow-blood-glow">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Fila 2: Píldoras de Filtro Rápido con Etiqueta Semántica Distintiva */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1 scroll-smooth">
          <div className="flex items-center gap-1 text-[9.5px] font-mono font-extrabold uppercase text-neutral-400 tracking-wider flex-shrink-0 pr-1.5 border-r border-white/10">
            <span className="text-electricViolet-glow">⚡</span>
            <span>Filtrar:</span>
          </div>
          {/* 1. Todos / Reset */}
          <button
            type="button"
            onClick={handleResetAllFilters}
            aria-pressed={!hasActiveFilters}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              !hasActiveFilters
                ? "bg-white/15 text-white border-white/30 shadow-sm"
                : "bg-white/5 text-neutral-400 border-white/5 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>✨</span>
            <span>{t.filters?.quickAll || (language === "es" ? "Todos" : "All")}</span>
          </button>

          {/* 2. Radar On-The-Clock: Listos YA (60 min) */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              setIsOnTheClockFilterActive(!isOnTheClockFilterActive);
            }}
            aria-pressed={isOnTheClockFilterActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              isOnTheClockFilterActive
                ? "bg-electricViolet text-white border-electricViolet-glow font-black shadow-violet-glow animate-pulse"
                : "bg-white/5 text-purple-300 border-purple-500/30 hover:bg-purple-900/30 hover:text-purple-200"
            }`}
          >
            <Zap className="w-3 h-3 fill-current text-electricViolet-glow" />
            <span>{t.filters?.quickBoost || (language === "es" ? "Listos YA" : "Ready Now")}</span>
          </button>

          {/* 3. Solo Disponibles / Open */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("open")}
            aria-pressed={isOnlyOpenActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              isOnlyOpenActive
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-black"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-mintNeon shadow-mint-glow animate-pulse" />
            <span>{t.filters?.quickOpen || (language === "es" ? "Solo Disponibles" : "Available Only")}</span>
          </button>

          {/* 4. Con Lugar */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("host")}
            aria-pressed={isHostOnlyActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              isHostOnlyActive
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-black"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>🏠</span>
            <span>{t.filters?.quickHost || (language === "es" ? "Con Lugar" : "Has Place")}</span>
          </button>

          {/* 5. Solo Verificados 3D (1-Tap Directo) */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("verified")}
            aria-pressed={isVerifiedActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mintNeon active:scale-95 ${
              isVerifiedActive
                ? "bg-mintNeon text-obsidian-deep border-mintNeon shadow-mint-glow font-black"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-current" />
            <span>{t.filters?.quickVerified || (language === "es" ? "Solo Verificados" : "Verified Only")}</span>
          </button>

          {/* 6. Deseos Mutuos / Kinks Afines (1-Tap Directo) */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("mutualKinks")}
            aria-pressed={isMutualKinksActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-95 ${
              isMutualKinksActive
                ? "bg-purple-600 text-white border-purple-400 shadow-md font-black"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-purple-400 fill-current" />
            <span>{language === "es" ? "Deseos Mutuos" : "Mutual Kinks"}</span>
          </button>

          {/* 7. Atmósfera Chill / Sobrio (1-Tap Directo) */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("sober")}
            aria-pressed={isSoberActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 ${
              isSoberActive
                ? "bg-mintNeon text-obsidian-deep border-mintNeon shadow-mint-glow font-black"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>🍸</span>
            <span>{language === "es" ? "Chill / Sobrio" : "Chill / Sober"}</span>
          </button>

          {/* 8. Fiestas & Boliches (Nightlife & Events) */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playSubBass(60);
              openNightlifeModal();
            }}
            className="px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 hover:text-white active:scale-95"
          >
            <span>🎉</span>
            <span>{language === "es" ? "Fiestas & Boliches" : "Nightlife & Clubs"}</span>
          </button>

          {/* 9. Anti-Ghost Protocol */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("antiGhost")}
            aria-pressed={isAntiGhostActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 ${
              isAntiGhostActive
                ? "bg-mintNeon text-obsidian-deep border-mintNeon shadow-mint-glow font-extrabold"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <Ghost className="w-3.5 h-3.5" />
            <span>Anti-Ghost</span>
          </button>

          {/* 10. Nivel 3-4 Intenso */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("intensity")}
            aria-pressed={isHighIntensityActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 ${
              isHighIntensityActive
                ? "bg-bloodNeon text-white border-bloodNeon shadow-blood-glow font-extrabold"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-bloodNeon" />
            <span>{language === "es" ? "Intensidad 3-4" : "Intensity 3-4"}</span>
          </button>

          {/* 11. Rol: Activos (Top) */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("top")}
            aria-pressed={isTopActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              isTopActive
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-black"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>👑</span>
            <span>{language === "es" ? "Activos" : "Tops"}</span>
          </button>

          {/* 12. Rol: Versátiles */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("vers")}
            aria-pressed={isVersActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              isVersActive
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-black"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>🔄</span>
            <span>{language === "es" ? "Versátiles" : "Vers"}</span>
          </button>

          {/* 13. Rol: Pasivos (Bottom) */}
          <button
            type="button"
            onClick={() => toggleQuickFilter("bottom")}
            aria-pressed={isBottomActive}
            className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              isBottomActive
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-black"
                : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>🍑</span>
            <span>{language === "es" ? "Pasivos" : "Bottoms"}</span>
          </button>
        </div>

        {/* Fila 3: Resumen de Grilla, Contador y Selector de Ordenamiento Táctico */}
        <div className="flex items-center justify-between text-xs text-neutral-400 px-0.5 pt-0.5 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-white font-mono flex items-center gap-1.5 text-[11px] sm:text-xs flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping inline-block" />
              <span>
                {sortedProfiles.length} {t.nav?.grid || (language === "es" ? "Cerca" : "Nearby")}
              </span>
            </span>

            <span className="text-neutral-600 hidden sm:inline">•</span>

            {/* Selector de Ordenamiento Táctico (1-Tap) */}
            <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5 font-mono text-[9.5px] flex-shrink-0">
              <span className="text-[8.5px] text-neutral-400 font-extrabold uppercase px-1 hidden xs:inline">
                {language === "es" ? "ORDEN:" : "SORT:"}
              </span>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setSortBy("distance");
                }}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  sortBy === "distance"
                    ? "bg-electricViolet text-white font-black shadow-violet-soft"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Ordenar por proximidad física (Google S2)"
              >
                📍 {language === "es" ? "Cerca" : "Dist"}
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setSortBy("recent");
                }}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  sortBy === "recent"
                    ? "bg-electricViolet text-white font-black shadow-violet-soft"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Ordenar por Listos YA y Disponibles ahora"
              >
                ⚡ {language === "es" ? "Activos" : "Live"}
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setSortBy("affinity");
                }}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  sortBy === "affinity"
                    ? "bg-electricViolet text-white font-black shadow-violet-soft"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Ordenar por coincidencia de Kink Matrix y deseos mutuos"
              >
                🔥 {language === "es" ? "Afinidad" : "Match"}
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              aria-label={t.filters?.reset || "Limpiar Filtros"}
              className="flex items-center gap-1 text-[10.5px] text-bloodNeon hover:text-bloodNeon-glow font-bold font-mono cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bloodNeon rounded px-1.5 py-0.5 transition-all bg-bloodNeon/10 border border-bloodNeon/30 active:scale-95 flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3 stroke-[2.5]" />
              <span>{t.filters?.reset || "Limpiar"} ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          GRILLA DE PERFILES RESPONSIVA (2 cols <380px, 3 cols mobile, 4-5 cols desktop)
          ========================================================= */}
      {sortedProfiles.length > 0 ? (
        <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 p-2 sm:p-2.5">
          {sortedProfiles.map((profile, index) => (
            <div
              key={profile.id}
              className="[content-visibility:auto] [contain-intrinsic-size:0_260px]"
            >
              <ProfileCard
                profile={profile}
                onSelect={onSelectProfile}
                onOpenChat={onOpenChat}
                isPriority={index < 4}
              />
            </div>
          ))}
        </div>
      ) : !hasActiveFilters && appMode === "real" ? (
        /* Estado Vacío Táctico: Modo Real Limpio */
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center my-auto space-y-4 max-w-md mx-auto">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Radio className="w-8 h-8 stroke-[2.2] animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black animate-ping" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-wider uppercase font-mono">
                {language === "es" ? "RADAR EN ESPERA // ZONA LIMPIA" : "RADAR STANDBY // CLEAN ZONE"}
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                ⚡ REAL
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-sm">
              {language === "es"
                ? "Estás operando en Modo Real. El entorno inicia limpio y sin datos ficticios. Registra tu perfil o inicia sesión para transmitir tu presencia en Firestore."
                : "Operating in Real Mode with clean production data. Register or log in to broadcast your presence on Firestore."}
            </p>
          </div>

          <div className="pt-2 flex flex-col w-full gap-2.5">
            <button
              type="button"
              onClick={() => {
                audioEngine.playSubBass(70);
                openAuthModal(currentUserUid && currentUserUid !== "unauthenticated" ? "verify" : "register");
              }}
              className="w-full py-3.5 min-h-[48px] bg-electricViolet hover:bg-electricViolet-glow text-white font-bold text-xs rounded-2xl active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet transition-all shadow-violet-soft uppercase tracking-wider font-mono cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>
                {currentUserUid && currentUserUid !== "unauthenticated"
                  ? (language === "es" ? "Gestionar Mi Perfil" : "Manage My Profile")
                  : (language === "es" ? "Registrar Mi Perfil" : "Register My Profile")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setAppMode("test");
              }}
              className="w-full py-2.5 min-h-[42px] bg-white/5 hover:bg-white/10 text-electricViolet-glow border border-electricViolet/30 font-bold text-xs rounded-2xl active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet transition-all uppercase tracking-wider font-mono cursor-pointer flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{language === "es" ? "Cargar Modo de Prueba (Mock)" : "Switch to Test Mode (Mock)"}</span>
            </button>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-left text-[11px] text-neutral-400 font-mono space-y-1">
              <span className="text-white font-bold block">💡 Multi-Usuario Local:</span>
              <p className="text-[10px] leading-relaxed text-neutral-400">
                Abre otra ventana de navegador en <code className="text-electricViolet-glow">localhost:3001?mode=real</code> (modo incógnito) para registrar un 2º usuario y probar perfiles y chat en tiempo real.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Estado Vacío Impeccable Brutalist con Acciones Directas (Filtros) */
        <div className="flex flex-col items-center justify-center p-8 text-center my-auto space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-center text-electricViolet-glow shadow-violet-glow animate-pulse">
            <Search className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-white tracking-tight uppercase font-mono">
              {t.filters.noResultsTitle}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {t.filters.noResultsDesc}
            </p>
          </div>

          <div className="pt-2 flex flex-col w-full gap-2">
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="w-full py-3.5 min-h-[48px] bg-electricViolet text-white font-extrabold text-xs rounded-2xl hover:bg-electricViolet-glow active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all shadow-violet-soft uppercase tracking-wider font-mono cursor-pointer"
            >
              {t.filters?.resetBtn || "Restablecer Filtros"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

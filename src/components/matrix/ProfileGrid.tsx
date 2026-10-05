"use client";

import React from "react";
import {
  useRadarMatrix,
  useSettings,
  useAuth,
  useLogistics,
} from "@/context/VesselContext";
import { VesselProfile, HotspotCategory } from "@/types/vessel";
import { ProfileCard } from "./ProfileCard";
import { PlacesGrid } from "./PlacesGrid";
import { MatrixUnlimitedPromoCard } from "./MatrixUnlimitedPromoCard";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";
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
  Plane,
  Plus,
  Star,
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
    matrixTab,
    favoriteProfileIds: favIdsProp,
    operatingIntent = "now",
    intentClusters = [],
  } = useRadarMatrix();
  const favoriteProfileIds = favIdsProp || [];
  const { language, t, appMode, setAppMode, isUnlimited } = useSettings();
  const { openAuthModal, currentUserUid } = useAuth();
  const {
    openNightlifeModal,
    travelMode,
    openTravelModal,
    tacticalHotspots,
    nightlifeEvents,
  } = useLogistics();

  // Estados locales para la pestaña Lugares & Fiestas
  const [placesSearchQuery, setPlacesSearchQuery] = React.useState("");
  const [placesCategory, setPlacesCategory] = React.useState<"all" | HotspotCategory | "nightlife">("all");
  const [placesSortBy, setPlacesSortBy] = React.useState<"distance" | "rating" | "activity">("distance");
  const [isProposeOpen, setIsProposeOpen] = React.useState(false);

  const placesCategories: { id: "all" | HotspotCategory | "nightlife"; label: string; icon: string }[] = [
    { id: "all", label: language === "es" ? "Todos" : "All", icon: "🌐" },
    { id: "cruising_area", label: language === "es" ? "Al Aire Libre" : "Cruising", icon: "🌲" },
    { id: "nightlife", label: language === "es" ? "Fiestas" : "Nightlife", icon: "🎉" },
    { id: "darkroom_club", label: language === "es" ? "Salas Oscuras" : "Darkrooms", icon: "⚡" },
    { id: "sauna", label: language === "es" ? "Saunas" : "Saunas", icon: "🧖" },
    { id: "queer_bar", label: language === "es" ? "Bares" : "Bars", icon: "🍸" },
  ];

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
    (filters.onlyFavorites ? 1 : 0) +
    ((filters.substanceAtmospheres && filters.substanceAtmospheres.length > 0) ? 1 : 0) +
    (filters.searchQuery.trim() !== "" ? 1 : 0) +
    (isOnTheClockFilterActive ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  // Quick Filter Helpers
  const isFavoritesActive = !!filters.onlyFavorites;
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
    if (type === "favorites") {
      setFilters((prev) => ({
        ...prev,
        onlyFavorites: !prev.onlyFavorites,
      }));
    } else if (type === "open") {
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
    <div className="flex flex-col flex-1 pb-48 sm:pb-56 select-none">
      {/* =========================================================
          BARRA DE BÚSQUEDA Y FILTROS RÁPIDOS (Sticky Top con Frosted Glass)
          ========================================================= */}
      <div className="p-2 sm:p-2.5 bg-obsidian-deep/95 border-b border-white/10 sticky top-[98px] z-20 space-y-2 shadow-md backdrop-blur-md">
        {/* =========================================================
            HEADER CONTEXTUAL PARA PESTAÑA: PERSONAS (2 FILAS COMPACTAS)
            ========================================================= */}
        {matrixTab === "people" && (
          <>
            {/* Fila 1: Input de Búsqueda + Modo Viajero + Botón de Filtros Avanzados */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${
                  searchValue ? "text-electricViolet-glow" : "text-neutral-400"
                }`} />
                <input
                  type="text"
                  data-testid="people-search-input"
                  placeholder={t.filters?.searchPlaceholder || "Buscar por rol, fetiche, alias..."}
                  aria-label={t.filters?.searchPlaceholder || "Buscar por rol, fetiche, alias..."}
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full min-h-[38px] bg-white/5 border border-white/10 rounded-xl text-white text-xs pl-9 pr-8 py-1.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all font-sans"
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
                    aria-label={language === "es" ? "Limpiar búsqueda" : "Clear search"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botón Modo Viajero integrado en Fila 1 */}
              <button
                type="button"
                data-testid="people-travel-mode-button"
                onClick={() => {
                  audioEngine.playPulse();
                  openTravelModal();
                }}
                aria-label={travelMode.isActive ? `Modo Viajero Activo: ${travelMode.cityName}` : "Activar Modo Viajero"}
                title={
                  travelMode.isActive
                    ? `Modo Viajero: ${travelMode.cityName} (${travelMode.country}) • Tocar para cambiar o restablecer`
                    : "Simular ubicación en otra ciudad (Modo Viajero)"
                }
                className={`px-2.5 min-h-[38px] rounded-xl flex items-center justify-center gap-1 font-mono text-[10px] font-bold border transition-all cursor-pointer active:scale-95 flex-shrink-0 ${
                  travelMode.isActive
                    ? "bg-electricViolet text-white border-electricViolet-glow shadow-violet-glow animate-pulse font-black"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Plane className={`w-3.5 h-3.5 ${travelMode.isActive ? "text-white" : "text-electricViolet-glow"}`} />
                <span className="truncate max-w-[72px] sm:max-w-[110px]">
                  {travelMode.isActive ? travelMode.cityName : (language === "es" ? "Viajero" : "Travel")}
                </span>
              </button>

              {/* Botón de Filtros Avanzados con Badge de Filtros Activos */}
              <button
                type="button"
                data-testid="filter-toggle-button"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsFilterDrawerOpen(true);
                }}
                aria-label={t.filters?.title || "Filtros Avanzados"}
                className={`px-2.5 sm:px-3 min-h-[38px] relative flex items-center justify-center gap-1.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex-shrink-0 text-xs font-mono font-bold ${
                  hasActiveFilters
                    ? "bg-electricViolet text-white border-electricViolet-glow font-bold shadow-violet-glow hover:bg-electricViolet/90"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
                title={t.filters?.title || "Filtros Dinámicos"}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline uppercase text-[10.5px]">
                  {language === "es" ? "Filtros" : "Filters"}
                </span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-bloodNeon text-white text-[9px] font-mono font-black flex items-center justify-center shadow-blood-glow">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Fila 2 Unificada: Selector de Ordenamiento (1-Tap) + Píldoras de Filtro Rápido */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1 scroll-smooth">
              {/* Selector de Ordenamiento Táctico Integrado */}
              <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-full p-0.5 font-mono text-[9.5px] flex-shrink-0 mr-0.5">
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setSortBy("distance");
                  }}
                  className={`px-2 py-1 min-h-[28px] rounded-full transition-all cursor-pointer ${
                    sortBy === "distance"
                      ? "bg-electricViolet text-white font-black shadow-violet-soft"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  title={language === "es" ? "Ordenar por proximidad física (Google S2)" : "Sort by physical proximity"}
                >
                  📍 {language === "es" ? "Cerca" : "Dist"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setSortBy("recent");
                  }}
                  className={`px-2 py-1 min-h-[28px] rounded-full transition-all cursor-pointer ${
                    sortBy === "recent"
                      ? "bg-electricViolet text-white font-black shadow-violet-soft"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  title={language === "es" ? "Ordenar por perfiles On-Line y disponibles" : "Sort by Online and available"}
                >
                  ⚡ {language === "es" ? "On-Line" : "Online"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setSortBy("affinity");
                  }}
                  className={`px-2 py-1 min-h-[28px] rounded-full transition-all cursor-pointer ${
                    sortBy === "affinity"
                      ? "bg-electricViolet text-white font-black shadow-violet-soft"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  title={language === "es" ? "Ordenar por coincidencia de preferencias y deseos mutuos" : "Sort by mutual kinks and affinity"}
                >
                  🔥 {language === "es" ? "Afinidad" : "Match"}
                </button>
              </div>

              <div className="h-4 w-px bg-white/15 flex-shrink-0 mx-0.5" />

              {/* 1.5. Favoritos */}
              <button
                type="button"
                data-testid="filter-pill-favorites"
                onClick={() => toggleQuickFilter("favorites")}
                aria-pressed={isFavoritesActive}
                className={`px-2.5 py-1 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 ${
                  isFavoritesActive
                    ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)] font-black"
                    : "bg-white/5 text-neutral-300 border-white/10 hover:text-amber-300 hover:bg-white/10"
                }`}
              >
                <Star
                  className={`w-3 h-3 ${
                    isFavoritesActive ? "fill-amber-400 text-amber-400" : "text-amber-400/80"
                  }`}
                />
                <span>{t.filters?.quickFavorites || (language === "es" ? "Favoritos" : "Favorites")}</span>
                {favoriteProfileIds.length > 0 && (
                  <span className={`text-[9px] px-1 rounded-full font-mono ${
                    isFavoritesActive ? "bg-amber-400 text-black font-black" : "bg-white/10 text-neutral-400"
                  }`}>
                    {favoriteProfileIds.length}
                  </span>
                )}
              </button>


              {/* 3. Con lugar */}
              <button
                type="button"
                onClick={() => toggleQuickFilter("host")}
                aria-pressed={isHostOnlyActive}
                className={`px-2.5 py-1 min-h-[30px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 ${
                  isHostOnlyActive
                    ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)] font-black"
                    : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
                }`}
                title={language === "es" ? "Mostrar solo perfiles con lugar propio disponible ya" : "Show only profiles with place"}
              >
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === "es" ? "Con lugar" : "Has place"}</span>
              </button>

              {/* 4. Verificados */}
              <button
                type="button"
                onClick={() => toggleQuickFilter("verified")}
                aria-pressed={isVerifiedActive}
                className={`px-2.5 py-1 min-h-[30px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95 ${
                  isVerifiedActive
                    ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] font-black"
                    : "bg-white/5 text-neutral-300 border-white/10 hover:text-cyan-300 hover:bg-white/10"
                }`}
                title={language === "es" ? "Solo perfiles verificados biométricamente 3D" : "Verified profiles only"}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === "es" ? "Verificados" : "Verified"}</span>
              </button>

              {/* Reset / Limpiar rápido si hay filtros activos */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="px-2.5 py-1 min-h-[30px] rounded-full text-[10px] font-mono font-bold text-bloodNeon hover:text-white bg-bloodNeon/10 border border-bloodNeon/30 hover:bg-bloodNeon/20 flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer active:scale-95"
                  title={language === "es" ? "Restablecer todos los filtros" : "Reset all filters"}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === "es" ? "Limpiar" : "Clear"}</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* =========================================================
            HEADER CONTEXTUAL PARA PESTAÑA: LUGARES & FIESTAS (2 FILAS COMPACTAS)
            ========================================================= */}
        {matrixTab === "places" && (
          <>
            {/* Fila 1: Búsqueda de Lugares + Modo Viajero + Botón Proponer Lugar */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${
                  placesSearchQuery ? "text-electricViolet-glow" : "text-neutral-400"
                }`} />
                <input
                  type="text"
                  data-testid="places-search-input"
                  placeholder={t.filters?.searchPlacesPlaceholder || (language === "es" ? "Buscar sauna, cruising, fiesta, boliche..." : "Search sauna, cruising, club, party...")}
                  aria-label="Buscar lugares o fiestas"
                  value={placesSearchQuery}
                  onChange={(e) => setPlacesSearchQuery(e.target.value)}
                  className="w-full min-h-[38px] bg-white/5 border border-white/10 rounded-xl text-white text-xs pl-9 pr-8 py-1.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all font-sans"
                />
                {placesSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setPlacesSearchQuery("");
                    }}
                    aria-label="Limpiar búsqueda de lugares"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botón Modo Viajero integrado en Fila 1 */}
              <button
                type="button"
                data-testid="places-travel-mode-button"
                onClick={() => {
                  audioEngine.playPulse();
                  openTravelModal();
                }}
                aria-label={travelMode.isActive ? `Modo Viajero Activo: ${travelMode.cityName}` : "Activar Modo Viajero"}
                title={
                  travelMode.isActive
                    ? `Modo Viajero: ${travelMode.cityName} (${travelMode.country}) • Tocar para cambiar o restablecer`
                    : "Simular ubicación en otra ciudad (Modo Viajero)"
                }
                className={`px-2.5 min-h-[38px] rounded-xl flex items-center justify-center gap-1 font-mono text-[10px] font-bold border transition-all cursor-pointer active:scale-95 flex-shrink-0 ${
                  travelMode.isActive
                    ? "bg-electricViolet text-white border-electricViolet-glow shadow-violet-glow animate-pulse font-black"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Plane className={`w-3.5 h-3.5 ${travelMode.isActive ? "text-white" : "text-electricViolet-glow"}`} />
                <span className="truncate max-w-[72px] sm:max-w-[110px]">
                  {travelMode.isActive ? travelMode.cityName : (language === "es" ? "Viajero" : "Travel")}
                </span>
              </button>

              {/* Botón Destacado: Proponer Lugar */}
              <button
                type="button"
                data-testid="propose-place-header-button"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsProposeOpen(true);
                }}
                aria-label="Proponer nuevo punto táctico"
                className="px-2.5 sm:px-3 min-h-[38px] rounded-xl bg-electricViolet text-white border border-electricViolet-glow font-bold shadow-violet-glow hover:bg-electricViolet/90 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-mono active:scale-95 transition-all flex-shrink-0"
                title="Proponer nuevo punto de cruising, sauna o espacio"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline uppercase text-[10.5px]">
                  {t.filters?.proposePlaceBtn || (language === "es" ? "Proponer Lugar" : "Propose Place")}
                </span>
              </button>
            </div>

            {/* Fila 2 Unificada: Selector de Ordenamiento + Píldoras de Categorías de Lugares */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1 scroll-smooth">
              <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-full p-0.5 font-mono text-[9.5px] flex-shrink-0 mr-0.5">
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setPlacesSortBy("distance");
                  }}
                  className={`px-2 py-1 min-h-[28px] rounded-full transition-all cursor-pointer ${
                    placesSortBy === "distance"
                      ? "bg-electricViolet text-white font-black shadow-violet-soft"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  📍 {language === "es" ? "Cerca" : "Dist"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setPlacesSortBy("rating");
                  }}
                  className={`px-2 py-1 min-h-[28px] rounded-full transition-all cursor-pointer ${
                    placesSortBy === "rating"
                      ? "bg-electricViolet text-white font-black shadow-violet-soft"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  ⭐ {language === "es" ? "Calificados" : "Rating"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setPlacesSortBy("activity");
                  }}
                  className={`px-2 py-1 min-h-[28px] rounded-full transition-all cursor-pointer ${
                    placesSortBy === "activity"
                      ? "bg-electricViolet text-white font-black shadow-violet-soft"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  👥 {language === "es" ? "Concurrencia" : "Active"}
                </button>
              </div>

              {placesCategories.map((cat) => {
                const isSelected = placesCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setPlacesCategory(cat.id);
                    }}
                    className={`px-2.5 py-1 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                      isSelected
                        ? "bg-electricViolet text-white border-electricViolet-glow font-black shadow-violet-glow"
                        : "bg-white/5 text-neutral-300 border-white/10 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =========================================================
          CONTENIDO SEGÚN PESTAÑA ACTIVA: PERSONAS vs LUGARES
          ========================================================= */}
      {matrixTab === "places" ? (
        <PlacesGrid
          hideStickyHeader={true}
          searchQuery={placesSearchQuery}
          selectedCategory={placesCategory}
          sortBy={placesSortBy}
          isProposeOpen={isProposeOpen}
          setIsProposeOpen={setIsProposeOpen}
          onOpenNightlifeModal={openNightlifeModal}
        />
      ) : sortedProfiles.length > 0 ? (
        <div className="flex flex-col flex-1 p-2 sm:p-3 space-y-5">
          {/* Billboard Táctico de Fiestas y Hotspots (solo en modo nightlife con eventos activos) */}
          {operatingIntent === "nightlife" && nightlifeEvents.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-obsidian-surface border border-pink-500/30 rounded-2xl space-y-2.5 backdrop-blur-md shadow-[0_0_25px_rgba(236,72,153,0.15)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base animate-pulse">🍸</span>
                  <div>
                    <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                      {language === "es" ? "Cartelera Nocturna & Fiestas Activas" : "Active Nightlife & Parties"}
                    </h4>
                    <p className="text-[10px] text-pink-300/80 font-sans">
                      {language === "es" ? "Eventos y clubes recomendados para esta noche" : "Recommended events and clubs tonight"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playSubBass(60);
                    openNightlifeModal();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>{language === "es" ? "Ver Agenda" : "Full Agenda"}</span>
                  <span>→</span>
                </button>
              </div>

              {/* Scroll horizontal de eventos destacados */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {nightlifeEvents.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      audioEngine.playPulse();
                      openNightlifeModal();
                    }}
                    className="flex-shrink-0 w-48 sm:w-56 p-2 rounded-xl bg-black/60 border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer space-y-1 group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-white group-hover:text-pink-300 transition-colors truncate max-w-[120px]">
                        {evt.name}
                      </span>
                      {evt.hasDarkroom && (
                        <span className="text-[9px] px-1 py-0.2 bg-purple-900/60 text-purple-300 rounded border border-purple-500/40">
                          ⚡ Darkroom
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate">
                      📍 {evt.venueName} • {evt.neighborhood}
                    </p>
                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 pt-0.5">
                      <span>🕒 {evt.timeRange}</span>
                      <span className="text-emerald-400 font-bold">👥 {evt.activeAttendeesCount} presentes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Racimos de Intención Operativa (De-grindrización del radar) */}
          {intentClusters && intentClusters.length > 0 ? (
            <div className="space-y-6">
              {intentClusters.map((cluster) => (
                <section key={cluster.id} className="space-y-2.5">
                  <div className="flex items-center justify-between px-1 py-1 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cluster.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider">
                            {cluster.title}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-bold border border-white/10">
                            {cluster.profiles.length}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-neutral-400 font-sans">
                          {cluster.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {cluster.profiles.map((profile, idx) => {
                      const globalIndex = sortedProfiles.findIndex((p) => p.id === profile.id);
                      const isLockedByLimit = !isUnlimited && globalIndex >= FREE_TIER_LIMITS.maxFreeProfilesInMatrix;
                      const showPromoAfterThis = !isUnlimited && globalIndex === FREE_TIER_LIMITS.maxFreeProfilesInMatrix - 1;

                      return (
                        <React.Fragment key={profile.id}>
                          <div className="[content-visibility:auto] [contain-intrinsic-size:0_260px]">
                            <ProfileCard
                              profile={profile}
                              onSelect={onSelectProfile}
                              onOpenChat={onOpenChat}
                              isPriority={idx < 2}
                              isLockedByGridLimit={isLockedByLimit}
                            />
                          </div>
                          {showPromoAfterThis && (
                            <MatrixUnlimitedPromoCard
                              key={`promo-${profile.id}`}
                              totalProfilesCount={sortedProfiles.length}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Fallback: Cuadrícula directa tradicional (tests unitarios o filtros sin racimos) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              {sortedProfiles.map((profile, index) => {
                const isLockedByLimit = !isUnlimited && index >= FREE_TIER_LIMITS.maxFreeProfilesInMatrix;
                const showPromoAfterThis = !isUnlimited && index === FREE_TIER_LIMITS.maxFreeProfilesInMatrix - 1;

                return (
                  <React.Fragment key={profile.id}>
                    <div className="[content-visibility:auto] [contain-intrinsic-size:0_260px]">
                      <ProfileCard
                        profile={profile}
                        onSelect={onSelectProfile}
                        onOpenChat={onOpenChat}
                        isPriority={index < 4}
                        isLockedByGridLimit={isLockedByLimit}
                      />
                    </div>
                    {showPromoAfterThis && (
                      <MatrixUnlimitedPromoCard
                        key="unlimited-matrix-promo-divider"
                        totalProfilesCount={sortedProfiles.length}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {sortedProfiles.length === 1 && sortedProfiles[0].isCurrentUser && hasActiveFilters && (
            <div className="p-5 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 text-center space-y-3 my-2 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-electricViolet/20 border border-electricViolet/40 flex items-center justify-center text-electricViolet-glow">
                <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {language === "es"
                    ? "Filtros activos sin coincidencias"
                    : "Active filters with no matches"}
                </p>
                <p className="text-[11px] text-neutral-400 font-sans max-w-xs mx-auto">
                  {language === "es"
                    ? "Los filtros aplicados excluyen al resto de los perfiles disponibles en el radar."
                    : "Your active filters exclude all other profiles available on the radar."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="px-3.5 py-1.5 min-h-[36px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-mono font-bold transition-all shadow-violet-soft cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Restablecer Filtros" : "Reset Filters"}</span>
              </button>
            </div>
          )}
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
                {language === "es" ? "RADAR EN ESPERA - ZONA LIMPIA" : "RADAR STANDBY - CLEAN ZONE"}
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

            {process.env.NODE_ENV === "development" && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-left text-[11px] text-neutral-400 font-mono space-y-1">
                <span className="text-white font-bold block">💡 Multi-Usuario Local:</span>
                <p className="text-[10px] leading-relaxed text-neutral-400">
                  Abre otra ventana de navegador en <code className="text-electricViolet-glow">localhost:3001?mode=real</code> (modo incógnito) para registrar un 2º usuario y probar perfiles y chat en tiempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Estado Vacío Impeccable Brutalist con Chips de Filtros Removibles (1-Tap) */
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center my-auto space-y-4 max-w-md mx-auto">
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

          {/* Chips Interactivos de Filtros Activos (Relajación Selectiva 1-Tap) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {searchValue.trim() !== "" && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setSearchValue("");
                  setFilters((prev) => ({ ...prev, searchQuery: "" }));
                }}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full bg-white/10 hover:bg-bloodNeon/20 border border-white/15 hover:border-bloodNeon/40 text-white text-[10.5px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>&ldquo;{searchValue}&rdquo;</span>
                <X className="w-3 h-3 text-bloodNeon" />
              </button>
            )}
            {isFavoritesActive && (
              <button
                type="button"
                onClick={() => toggleQuickFilter("favorites")}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10.5px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>⭐ {t.filters?.quickFavorites || (language === "es" ? "Favoritos" : "Favorites")}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {isOnTheClockFilterActive && (
              <button
                type="button"
                onClick={() => setIsOnTheClockFilterActive(false)}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full bg-electricViolet/20 border border-electricViolet/40 text-electricViolet-glow text-[10.5px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>⚡ {t.filters?.quickBoost || (language === "es" ? "Listos YA" : "Ready Now")}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {isHostOnlyActive && (
              <button
                type="button"
                onClick={() => toggleQuickFilter("host")}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full bg-white/10 border border-white/20 text-white text-[10.5px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>🏠 {t.filters?.quickHost || (language === "es" ? "Con Casa" : "Has Place")}</span>
                <X className="w-3 h-3 text-bloodNeon" />
              </button>
            )}
            {isVerifiedActive && (
              <button
                type="button"
                onClick={() => toggleQuickFilter("verified")}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full bg-white/10 border border-white/20 text-white text-[10.5px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>🛡️ {t.filters?.quickVerified || (language === "es" ? "Verificados" : "Verified")}</span>
                <X className="w-3 h-3 text-bloodNeon" />
              </button>
            )}
            {isMutualKinksActive && (
              <button
                type="button"
                onClick={() => toggleQuickFilter("mutualKinks")}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full bg-white/10 border border-white/20 text-white text-[10.5px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>✨ {language === "es" ? "Deseos Mutuos" : "Mutual Kinks"}</span>
                <X className="w-3 h-3 text-bloodNeon" />
              </button>
            )}
            {isSoberActive && (
              <button
                type="button"
                onClick={() => toggleQuickFilter("sober")}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full bg-white/10 border border-white/20 text-white text-[10.5px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>🌿 {language === "es" ? "Sobrio" : "Sober"}</span>
                <X className="w-3 h-3 text-bloodNeon" />
              </button>
            )}
            {isHighIntensityActive && (
              <button
                type="button"
                onClick={() => toggleQuickFilter("intensity")}
                className="px-2.5 py-1.5 min-h-[32px] rounded-full bg-white/10 border border-white/20 text-white text-[10.5px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>🚀 {language === "es" ? "+Intenso" : "+Intensity"}</span>
                <X className="w-3 h-3 text-bloodNeon" />
              </button>
            )}
          </div>

          <div className="pt-2 flex flex-col w-full gap-2">
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="w-full py-3.5 min-h-[48px] bg-electricViolet text-white font-extrabold text-xs rounded-2xl hover:bg-electricViolet-glow active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all shadow-violet-soft uppercase tracking-wider font-mono cursor-pointer"
            >
              {t.filters?.resetBtn || (language === "es" ? "Restablecer Todos los Filtros" : "Reset All Filters")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

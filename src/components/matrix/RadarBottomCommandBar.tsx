"use client";

import React, { useState, useTransition } from "react";
import {
  useRadarMatrix,
  useSettings,
  useLogistics,
} from "@/context/VesselContext";
import {
  TacticalBottomSheet,
  TacticalSearchInput,
  FilterPill,
  SortSegmentedControl,
  BrutalistButton,
} from "@/components/ui";
import { IntentHubSelector } from "./IntentHubSelector";
import {
  Search,
  RotateCcw,
  Home,
  ShieldCheck,
  Star,
  Plane,
  Plus,
  ChevronUp,
  ChevronDown,
  Ghost,
  Flame,
  Sparkles,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  HotspotCategory,
  RoleType,
  EnergyVibe,
  SubstanceAtmosphere,
} from "@/types/vessel";
import {
  ROLE_OPTIONS,
  KINK_CATALOG,
} from "@/data/kinkCatalog";
import { ENERGY_VIBE_CATALOG } from "@/data/energyCatalog";
import { SUBSTANCE_ATMOSPHERE_CATALOG } from "@/data/substanceCatalog";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { getKinkLocalizedLabel } from "@/lib/kinks/kinkAdminService";

export interface RadarBottomCommandBarProps {
  sortBy?: "distance" | "recent" | "affinity";
  onSortByChange?: (sort: "distance" | "recent" | "affinity") => void;
  onProposePlace?: () => void;
  placesSearchQuery?: string;
  onPlacesSearchChange?: (val: string) => void;
  placesCategory?: "all" | HotspotCategory | "nightlife";
  onPlacesCategoryChange?: (cat: "all" | HotspotCategory | "nightlife") => void;
  placesSortBy?: "distance" | "rating" | "activity";
  onPlacesSortByChange?: (sort: "distance" | "rating" | "activity") => void;
  className?: string;
  hidePeekBar?: boolean;
}

export const RadarBottomCommandBar: React.FC<RadarBottomCommandBarProps> = ({
  sortBy: propSortBy,
  onSortByChange,
  onProposePlace,
  placesSearchQuery: propPlacesSearchQuery,
  onPlacesSearchChange,
  placesCategory: propPlacesCategory = "all",
  onPlacesCategoryChange,
  placesSortBy: propPlacesSortBy = "distance",
  onPlacesSortByChange,
  className = "",
  hidePeekBar = false,
}) => {
  const radarContext = useRadarMatrix();
  const {
    filters,
    setFilters,
    resetFilters,
    setIsFilterDrawerOpen,
    isOnTheClockFilterActive,
    setIsOnTheClockFilterActive,
    matrixTab,
    favoriteProfileIds: favIdsProp,
    operatingIntent = "now",
  } = radarContext;

  const favoriteProfileIds = favIdsProp || [];
  const filteredProfilesCount = radarContext.filteredProfiles?.length ?? 0;
  const { language, t } = useSettings();
  const { travelMode, openTravelModal } = useLogistics();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>(filters.searchQuery);
  const [kinkSearchQuery, setKinkSearchQuery] = useState<string>("");
  const [isKinksExpanded, setIsKinksExpanded] = useState<boolean>(filters.selectedKinks.length > 0);
  const [, startTransition] = useTransition();

  // Sort state handling (prop with local fallback)
  const [localSortBy, setLocalSortBy] = useState<"distance" | "recent" | "affinity">("distance");
  const sortBy = propSortBy !== undefined ? propSortBy : localSortBy;
  const setSortBy = onSortByChange || setLocalSortBy;

  // Local state fallbacks for places tab
  const [localPlacesSearch, setLocalPlacesSearch] = useState<string>("");
  const placesSearch = propPlacesSearchQuery !== undefined ? propPlacesSearchQuery : localPlacesSearch;
  const handlePlacesSearch = (val: string) => {
    if (onPlacesSearchChange) {
      onPlacesSearchChange(val);
    } else {
      setLocalPlacesSearch(val);
    }
  };

  const placesCategories: { id: "all" | HotspotCategory | "nightlife"; label: string; icon: string }[] = [
    { id: "all", label: language === "es" ? "Todos" : "All", icon: "🌐" },
    { id: "cruising_area", label: language === "es" ? "Cruising" : "Cruising", icon: "🌲" },
    { id: "nightlife", label: language === "es" ? "Fiestas" : "Nightlife", icon: "🎉" },
    { id: "darkroom_club", label: language === "es" ? "Darkrooms" : "Darkrooms", icon: "⚡" },
    { id: "sauna", label: language === "es" ? "Saunas" : "Saunas", icon: "🧖" },
    { id: "queer_bar", label: language === "es" ? "Bares" : "Bars", icon: "🍸" },
  ];

  React.useEffect(() => {
    setSearchValue(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    startTransition(() => {
      setFilters((prev) => ({ ...prev, searchQuery: val }));
    });
  };

  const activeFiltersCount =
    (filters.bodyStates.length < 3 ? 1 : 0) +
    filters.roles.length +
    (filters.minIntensity > 1 ? 1 : 0) +
    (filters.immediateHostOnly ? 1 : 0) +
    filters.selectedKinks.length +
    (filters.energyVibes?.length || 0) +
    (filters.onlyAntiGhost ? 1 : 0) +
    (filters.onlyVerified ? 1 : 0) +
    (filters.onlyMutualKinks ? 1 : 0) +
    (filters.onlyFavorites ? 1 : 0) +
    ((filters.substanceAtmospheres && filters.substanceAtmospheres.length > 0) ? 1 : 0) +
    (filters.searchQuery.trim() !== "" ? 1 : 0) +
    (isOnTheClockFilterActive ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const isFavoritesActive = !!filters.onlyFavorites;
  const isHostOnlyActive = filters.immediateHostOnly;
  const isVerifiedActive = !!filters.onlyVerified;
  const isAntiGhostActive = !!filters.onlyAntiGhost;
  const isMutualKinksActive = !!filters.onlyMutualKinks;

  const toggleRole = (role: RoleType) => {
    audioEngine.playPulse();
    setFilters((prev) => {
      const exists = prev.roles.includes(role);
      return {
        ...prev,
        roles: exists ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
      };
    });
  };

  const toggleEnergyVibe = (vibeId: EnergyVibe) => {
    audioEngine.playPulse();
    setFilters((prev) => {
      const exists = prev.energyVibes.includes(vibeId);
      return {
        ...prev,
        energyVibes: exists
          ? prev.energyVibes.filter((v) => v !== vibeId)
          : [...prev.energyVibes, vibeId],
      };
    });
  };

  const toggleKink = (kinkId: string) => {
    audioEngine.playPulse();
    setFilters((prev) => {
      const exists = prev.selectedKinks.includes(kinkId);
      return {
        ...prev,
        selectedKinks: exists
          ? prev.selectedKinks.filter((k) => k !== kinkId)
          : [...prev.selectedKinks, kinkId],
      };
    });
  };

  const toggleSubstanceAtmosphere = (vibe: SubstanceAtmosphere) => {
    audioEngine.playPulse();
    setFilters((prev) => {
      const current = prev.substanceAtmospheres || [];
      const exists = current.includes(vibe);
      return {
        ...prev,
        substanceAtmospheres: exists
          ? current.filter((v) => v !== vibe)
          : [...current, vibe],
      };
    });
  };

  const handleResetAllFilters = () => {
    audioEngine.playPulse();
    setSearchValue("");
    resetFilters();
    setIsOnTheClockFilterActive(false);
  };

  const getIntentTitle = () => {
    if (matrixTab === "places") return language === "es" ? "Boliches & Joda" : "Spots & Parties";
    if (operatingIntent === "now") return language === "es" ? "Pinta ya" : "Ready Now";
    if (operatingIntent === "kink") return language === "es" ? "Morbos" : "Kinks";
    if (operatingIntent === "stealth") return language === "es" ? "Discreto" : "Stealth";
    return language === "es" ? "Radar Activo" : "Active Radar";
  };

  // Group kinks into 3 tribes for direct kinks section
  const gearKinks = KINK_CATALOG.filter((k) => k.category === "gear");
  const dynamicKinks = KINK_CATALOG.filter(
    (k) => k.category === "dynamic" || k.category === "intensity"
  );
  const practicesKinks = KINK_CATALOG.filter(
    (k) => k.category === "fetish" || k.category === "scene"
  );

  const isSheetOpen = isExpanded || Boolean(radarContext.isFilterDrawerOpen);
  const handleSheetChange = (nextState: boolean) => {
    setIsExpanded(nextState);
    if (setIsFilterDrawerOpen) {
      setIsFilterDrawerOpen(nextState);
    }
  };

  return (
    <TacticalBottomSheet
      isExpanded={isSheetOpen}
      onExpandedChange={handleSheetChange}
      fullscreen={true}
      hidePeekBar={hidePeekBar}
      title={getIntentTitle()}
      badge={
        activeFiltersCount > 0 && matrixTab === "people" ? (
          <span className="w-4 h-4 rounded-full bg-bloodNeon text-white text-[9px] font-mono font-black flex items-center justify-center shadow-blood-glow">
            {activeFiltersCount}
          </span>
        ) : null
      }
      className={className}
      peekContent={
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Lado Izquierdo: Estado de Sintonía Actual con Contador de Filtros */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-electricViolet/15 border border-electricViolet/30 text-white min-w-0 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping flex-shrink-0" />
            <span className="text-[11px] font-mono font-black uppercase tracking-wider truncate max-w-[130px] sm:max-w-[200px]">
              {getIntentTitle()}
            </span>
            {activeFiltersCount > 0 && matrixTab === "people" && (
              <span className="px-1.5 py-0.2 rounded-full bg-bloodNeon text-white text-[9px] font-mono font-black shadow-blood-glow">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {/* Lado Derecho: Único Botón de Acción Táctica 'Filtrar' */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-electricViolet/20 group-hover:bg-electricViolet/30 border border-electricViolet/40 text-[11px] font-mono font-bold text-electricViolet-glow flex-shrink-0 transition-colors">
            <span>{language === "es" ? "Filtrar" : "Filter"}</span>
            <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      }
      footer={
        <div className="space-y-2 w-full">
          <BrutalistButton
            variant="primary"
            size="default"
            onClick={() => {
              audioEngine.playPulse();
              handleSheetChange(false);
            }}
            className="w-full text-xs uppercase tracking-wider"
          >
            {t.filters?.apply || "Aplicar Filtros"} {filteredProfilesCount > 0 ? `(${filteredProfilesCount})` : ""}
          </BrutalistButton>

          {hasActiveFilters && (
            <BrutalistButton
              variant="ghost"
              size="sm"
              onClick={handleResetAllFilters}
              className="w-full text-xs text-neutral-400 hover:text-bloodNeon"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>{t.filters?.reset || (language === "es" ? "Restablecer todos los filtros" : "Reset all filters")}</span>
            </BrutalistButton>
          )}
        </div>
      }
    >
      <div className="space-y-4 pb-8 overflow-x-hidden">
        {/* =========================================================
            BLOQUE SINTONÍA: ¿QUÉ PINTA HOY? (Sintonía e Intención)
            ========================================================= */}
        <section
          aria-label="Sintonía e Intención"
          className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
              <span className="text-sm">⚡</span>
              <span>{language === "es" ? "Sintonía // ¿Qué pinta hoy?" : "Operating Intent"}</span>
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-neutral-400">
              {language === "es" ? "Modo del radar" : "Radar mode"}
            </span>
          </div>
          <IntentHubSelector />
        </section>

        {/* =========================================================
            PESTAÑA PERSONAS: BLOQUES 1 A 6
            ========================================================= */}
        {matrixTab === "people" ? (
          <>
            {/* BÚSQUEDA RÁPIDA POR ALIAS, ROL O MORBOS */}
            <div className="w-full">
              <TacticalSearchInput
                testId="people-search-input"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={t.filters?.searchPlaceholder || (language === "es" ? "Buscar por rol, morbos, alias..." : "Search by role, kinks, alias...")}
                ariaLabel={t.filters?.searchPlaceholder || "Buscar por rol, morbos, alias..."}
                onClear={() => {
                  startTransition(() => {
                    setFilters((prev) => ({ ...prev, searchQuery: "" }));
                  });
                }}
              />
            </div>

            {/* =========================================================
                BLOQUE 1: ROL & POSICIÓN
                ========================================================= */}
            <section
              aria-label="Rol Táctico"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <span>👥</span>
                  <span>{language === "es" ? "1. Rol y posición" : "1. Role & Position"}</span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-neutral-400">
                  {language === "es" ? "Dinámica sexual" : "Sexual dynamic"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <FilterPill
                    key={role}
                    label={getRoleDisplayLabel(role as RoleType, language)}
                    active={filters.roles.includes(role as RoleType)}
                    variant="violet"
                    onClick={() => toggleRole(role as RoleType)}
                    className="min-h-[44px] px-3.5 py-2.5 text-xs font-bold"
                  />
                ))}
              </div>
            </section>

            {/* =========================================================
                BLOQUE 2: DISTANCIA MÁXIMA & MODO VIAJERO
                ========================================================= */}
            <section
              aria-label="Distancia y Modo Viajero"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <span>📏</span>
                  <span>{language === "es" ? "2. Distancia y viaje" : "2. Distance & Travel"}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-electricViolet-glow font-mono px-2 py-0.5 rounded-full bg-electricViolet/15 border border-electricViolet/30">
                    {filters.maxDistanceKm} km
                  </span>
                  <BrutalistButton
                    variant={travelMode.isActive ? "primary" : "ghost"}
                    size="compact"
                    soundEffect="none"
                    data-testid="people-travel-mode-button"
                    onClick={() => {
                      audioEngine.playPulse();
                      openTravelModal();
                    }}
                    aria-label={travelMode.isActive ? `Modo Viajero: ${travelMode.cityName}` : "Modo Viajero"}
                    title={
                      travelMode.isActive
                        ? `Modo Viajero: ${travelMode.cityName} (${travelMode.country})`
                        : "Simular ubicación en otra ciudad"
                    }
                    className={`min-h-[36px] flex-shrink-0 !rounded-xl !text-xs !font-bold ${
                      travelMode.isActive
                        ? "!bg-electricViolet !text-white !border-electricViolet-glow shadow-violet-glow animate-pulse font-black"
                        : "!bg-white/5 !border-white/10 text-neutral-300 hover:text-white hover:!bg-white/10"
                    }`}
                  >
                    <Plane className={`w-3.5 h-3.5 ${travelMode.isActive ? "text-white" : "text-electricViolet-glow"}`} />
                    <span className="truncate max-w-[85px]">
                      {travelMode.isActive ? travelMode.cityName : (language === "es" ? "Viajero" : "Travel")}
                    </span>
                  </BrutalistButton>
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={filters.maxDistanceKm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxDistanceKm: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-electricViolet bg-neutral-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>0.5 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </section>

            {/* =========================================================
                BLOQUE 3: PREFERENCIAS & LOGÍSTICA RÁPIDA
                ========================================================= */}
            <section
              aria-label="Preferencias y Logística"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === "es" ? "3. Preferencias y logística" : "3. Quick Logistics"}</span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-neutral-400">
                  {language === "es" ? "Filtros directos" : "Direct filters"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* 3.1 Favoritos */}
                <FilterPill
                  data-testid="filter-pill-favorites"
                  label={t.filters?.quickFavorites || (language === "es" ? "Favoritos" : "Favorites")}
                  icon={<Star className={`w-3.5 h-3.5 ${isFavoritesActive ? "fill-amber-400 text-amber-400" : "text-amber-400/80"}`} />}
                  active={isFavoritesActive}
                  count={favoriteProfileIds.length}
                  variant="amber"
                  onClick={() => {
                    audioEngine.playPulse();
                    setFilters((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }));
                  }}
                  className="w-full justify-start py-2.5 px-3 min-h-[44px]"
                />

                {/* 3.2 Con lugar */}
                <FilterPill
                  label={language === "es" ? "Con lugar ya" : "Has place now"}
                  icon={<Home className="w-3.5 h-3.5 text-emerald-400" />}
                  active={isHostOnlyActive}
                  variant="emerald"
                  onClick={() => {
                    audioEngine.playPulse();
                    setFilters((prev) => ({ ...prev, immediateHostOnly: !prev.immediateHostOnly }));
                  }}
                  className="w-full justify-start py-2.5 px-3 min-h-[44px]"
                />

                {/* 3.3 Verificados 3D */}
                <FilterPill
                  label={language === "es" ? "Verificados 3D" : "3D Verified"}
                  icon={<ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  active={isVerifiedActive}
                  variant="cyan"
                  onClick={() => {
                    audioEngine.playPulse();
                    setFilters((prev) => ({ ...prev, onlyVerified: !prev.onlyVerified }));
                  }}
                  className="w-full justify-start py-2.5 px-3 min-h-[44px]"
                />

                {/* 3.4 Cero plantones (Anti-ghost) */}
                <FilterPill
                  label={language === "es" ? "Cero plantones" : "Anti-ghost"}
                  icon={<Ghost className="w-3.5 h-3.5 text-emerald-400" />}
                  active={isAntiGhostActive}
                  variant="emerald"
                  onClick={() => {
                    audioEngine.playPulse();
                    setFilters((prev) => ({ ...prev, onlyAntiGhost: !prev.onlyAntiGhost }));
                  }}
                  className="w-full justify-start py-2.5 px-3 min-h-[44px]"
                />

                {/* 3.5 Deseos mutuos */}
                <FilterPill
                  label={language === "es" ? "Deseos mutuos" : "Mutual kinks"}
                  icon={<Sparkles className="w-3.5 h-3.5 text-bloodNeon" />}
                  active={isMutualKinksActive}
                  variant="blood"
                  onClick={() => {
                    audioEngine.playPulse();
                    setFilters((prev) => ({ ...prev, onlyMutualKinks: !prev.onlyMutualKinks }));
                  }}
                  className="w-full justify-start py-2.5 px-3 min-h-[44px] col-span-2"
                />
              </div>
            </section>

            {/* =========================================================
                BLOQUE 4: ORDENAR PERFILES POR
                ========================================================= */}
            <section
              aria-label="Criterio de Ordenamiento"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <span>📍</span>
                  <span>{language === "es" ? "4. Ordenar perfiles por" : "4. Sort Profiles"}</span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-neutral-400">
                  {language === "es" ? "Prioridad de visualización" : "List priority"}
                </span>
              </div>
              <div className="w-full">
                <SortSegmentedControl
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-full"
                  options={[
                    { id: "distance", label: language === "es" ? "Cerca" : "Nearby", icon: "📍" },
                    { id: "recent", label: language === "es" ? "Activos" : "Online", icon: "⚡" },
                    { id: "affinity", label: language === "es" ? "Afinidad" : "Match", icon: "🔥" },
                  ]}
                />
              </div>
            </section>

            {/* =========================================================
                BLOQUE 5: FETICHES & MORBOS (COLAPSABLE ERGONÓMICO)
                ========================================================= */}
            <section
              aria-label="Fetiches y Morbos"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  audioEngine.playPulse();
                  setIsKinksExpanded((prev) => !prev);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsKinksExpanded((prev) => !prev);
                  }
                }}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <span>⛓️</span>
                  <span>{language === "es" ? "5. Fetiches y morbos" : "5. Kinks & Fetishes"}</span>
                </span>
                <div className="flex items-center gap-2">
                  {filters.selectedKinks.length > 0 && (
                    <span className="text-[10px] sm:text-xs font-mono text-bloodNeon font-bold px-2 py-0.5 rounded-full bg-bloodNeon/15 border border-bloodNeon/30">
                      {filters.selectedKinks.length} {t.filters?.selectedCount || "sel."}
                    </span>
                  )}
                  <div className="p-1 rounded-lg bg-white/5 border border-white/10 text-neutral-400">
                    {isKinksExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {!isKinksExpanded && filters.selectedKinks.length === 0 && (
                <p className="text-[11px] text-neutral-400 font-sans">
                  {language === "es"
                    ? "Tocar para explorar cuero, dynamic, BDSM y prácticas..."
                    : "Tap to explore leather, power dynamics, BDSM & practices..."}
                </p>
              )}

              {/* Si está expandido o hay filtros activos de morbos, mostrar buscador y tribus */}
              {isKinksExpanded && (
                <div className="space-y-3 pt-1 border-t border-white/5 animate-fadeIn">
                  <TacticalSearchInput
                    value={kinkSearchQuery}
                    onChange={setKinkSearchQuery}
                    placeholder={language === "es" ? "Buscar fetiche, cuero, bdsm..." : "Search kink..."}
                    ariaLabel="Buscar fetiche o morbo"
                    onClear={() => setKinkSearchQuery("")}
                    testId="kink-search-bottom-bar"
                  />

                  {/* Tribu 1: Cuero & Gear */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 flex items-center gap-1">
                      <span>⛓️</span>
                      <span>{t.filters?.kinkCategoryGear || (language === "es" ? "Cuero & Gear" : "Leather & Gear")}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {gearKinks
                        .filter((k) =>
                          !kinkSearchQuery.trim()
                            ? true
                            : getKinkLocalizedLabel(k.id, t)
                                .toLowerCase()
                                .includes(kinkSearchQuery.toLowerCase()) ||
                              k.id.toLowerCase().includes(kinkSearchQuery.toLowerCase())
                        )
                        .map((kink) => (
                          <FilterPill
                            key={kink.id}
                            label={getKinkLocalizedLabel(kink.id, t)}
                            active={filters.selectedKinks.includes(kink.id)}
                            variant="blood"
                            onClick={() => toggleKink(kink.id)}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Tribu 2: Dinámicas de Poder */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 flex items-center gap-1">
                      <span>⚡</span>
                      <span>{t.filters?.kinkCategoryDynamic || (language === "es" ? "Dinámicas de Poder" : "Power Dynamics")}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dynamicKinks
                        .filter((k) =>
                          !kinkSearchQuery.trim()
                            ? true
                            : getKinkLocalizedLabel(k.id, t)
                                .toLowerCase()
                                .includes(kinkSearchQuery.toLowerCase()) ||
                              k.id.toLowerCase().includes(kinkSearchQuery.toLowerCase())
                        )
                        .map((kink) => (
                          <FilterPill
                            key={kink.id}
                            label={getKinkLocalizedLabel(kink.id, t)}
                            active={filters.selectedKinks.includes(kink.id)}
                            variant="blood"
                            onClick={() => toggleKink(kink.id)}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Tribu 3: Morbos & Prácticas */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 flex items-center gap-1">
                      <span>🔥</span>
                      <span>{t.filters?.kinkCategoryPractices || (language === "es" ? "Morbos & Prácticas" : "Practices & Kinks")}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {practicesKinks
                        .filter((k) =>
                          !kinkSearchQuery.trim()
                            ? true
                            : getKinkLocalizedLabel(k.id, t)
                                .toLowerCase()
                                .includes(kinkSearchQuery.toLowerCase()) ||
                              k.id.toLowerCase().includes(kinkSearchQuery.toLowerCase())
                        )
                        .map((kink) => (
                          <FilterPill
                            key={kink.id}
                            label={getKinkLocalizedLabel(kink.id, t)}
                            active={filters.selectedKinks.includes(kink.id)}
                            variant="blood"
                            onClick={() => toggleKink(kink.id)}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* =========================================================
                BLOQUE 6: ONDA & SUSTANCIAS
                ========================================================= */}
            <section
              aria-label="Onda y Sustancias"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-electricViolet" />
                  <span>{language === "es" ? "6. Onda y sustancias" : "6. Vibe & Atmosphere"}</span>
                </span>
                {((filters.energyVibes?.length || 0) + (filters.substanceAtmospheres?.length || 0)) > 0 && (
                  <span className="text-[10px] sm:text-xs font-mono text-electricViolet-glow font-bold">
                    {(filters.energyVibes?.length || 0) + (filters.substanceAtmospheres?.length || 0)} {t.filters?.selectedCount || "sel."}
                  </span>
                )}
              </div>

              {/* 6.1 ¿Qué onda buscás hoy? */}
              <div className="space-y-2">
                <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 block">
                  {language === "es" ? "¿Qué onda buscás hoy?" : "Desired Vibe"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {ENERGY_VIBE_CATALOG.map((vibe) => {
                    const isSelected = (filters.energyVibes || []).includes(vibe.id);
                    return (
                      <BrutalistButton
                        key={vibe.id}
                        variant="ghost"
                        soundEffect="none"
                        aria-pressed={isSelected}
                        onClick={() => toggleEnergyVibe(vibe.id)}
                        className={`p-2.5 min-h-[48px] !rounded-xl !justify-start !font-normal !normal-case text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? `${vibe.tagColor} !border-current font-bold shadow-sm ring-1 ring-white/20`
                            : "!bg-white/5 !border-white/10 text-neutral-300 hover:!bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="text-base shrink-0">{vibe.emoji}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{vibe.label}</span>
                          <span className="text-[9px] text-neutral-400 block truncate leading-tight opacity-80">
                            {vibe.description.split(",")[0]}
                          </span>
                        </div>
                      </BrutalistButton>
                    );
                  })}
                </div>
              </div>

              {/* 6.2 Clima y Sustancias */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] sm:text-xs font-semibold text-neutral-400 block">
                  {language === "es" ? "Ambiente y sustancias" : "Substance Atmosphere"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    Object.keys(SUBSTANCE_ATMOSPHERE_CATALOG) as SubstanceAtmosphere[]
                  ).map((key) => {
                    const item = SUBSTANCE_ATMOSPHERE_CATALOG[key];
                    const isSelected = filters.substanceAtmospheres?.includes(key);
                    const langKey = language === "en" ? "en" : "es";

                    return (
                      <BrutalistButton
                        key={key}
                        variant="ghost"
                        soundEffect="none"
                        aria-pressed={!!isSelected}
                        onClick={() => toggleSubstanceAtmosphere(key)}
                        className={`p-2.5 min-h-[44px] !rounded-xl !justify-start !font-normal !normal-case border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? `${item.badgeClass} ring-1 ring-white/30 font-bold shadow-md`
                            : "!bg-white/5 !border-white/10 text-neutral-300 hover:!bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="truncate text-xs font-semibold">{item.title[langKey]}</span>
                      </BrutalistButton>
                    );
                  })}
                </div>
              </div>
            </section>
          </>) : (
          /* =========================================================
             PESTAÑA LUGARES & BOLICHES: BLOQUES 2 A 4
             ========================================================= */
          <>
            {/* BLOQUE 2: BÚSQUEDA DE LUGARES & ACCIONES */}
            <section
              aria-label="Búsqueda de Lugares"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-electricViolet" />
                  <span>{language === "es" ? "2. Buscar lugares o eventos" : "2. Search Spots"}</span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-neutral-400">
                  {language === "es" ? "Saunas, boliches, cruising" : "Spots & parties"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <TacticalSearchInput
                    testId="places-search-input"
                    value={placesSearch}
                    onChange={handlePlacesSearch}
                    placeholder={t.filters?.searchPlacesPlaceholder || (language === "es" ? "Buscar sauna, cruising, fiesta, boliche..." : "Search sauna, cruising, club...")}
                    ariaLabel="Buscar lugares o fiestas"
                    onClear={() => handlePlacesSearch("")}
                  />
                </div>

                {/* Modo Viajero para Lugares */}
                <BrutalistButton
                  variant={travelMode.isActive ? "primary" : "ghost"}
                  size="compact"
                  soundEffect="none"
                  data-testid="places-travel-mode-button"
                  onClick={() => {
                    audioEngine.playPulse();
                    openTravelModal();
                  }}
                  aria-label={travelMode.isActive ? `Modo Viajero: ${travelMode.cityName}` : "Modo Viajero"}
                  className={`min-h-[44px] flex-shrink-0 !rounded-xl !text-xs !font-bold ${
                    travelMode.isActive
                      ? "!bg-electricViolet !text-white !border-electricViolet-glow shadow-violet-glow animate-pulse font-black"
                      : "!bg-white/5 !border-white/10 text-neutral-300 hover:text-white hover:!bg-white/10"
                  }`}
                >
                  <Plane className={`w-3.5 h-3.5 ${travelMode.isActive ? "text-white" : "text-electricViolet-glow"}`} />
                  <span className="truncate max-w-[85px]">
                    {travelMode.isActive ? travelMode.cityName : (language === "es" ? "Viajero" : "Travel")}
                  </span>
                </BrutalistButton>

                {/* Botón Proponer Lugar */}
                <BrutalistButton
                  variant="primary"
                  size="compact"
                  soundEffect="none"
                  data-testid="propose-place-header-button"
                  onClick={() => {
                    audioEngine.playPulse();
                    if (onProposePlace) onProposePlace();
                  }}
                  aria-label="Proponer nuevo punto táctico"
                  className="min-h-[44px] flex-shrink-0 !rounded-xl !text-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline uppercase text-xs">
                    {t.filters?.proposePlaceBtn || (language === "es" ? "Proponer" : "Propose")}
                  </span>
                </BrutalistButton>
              </div>
            </section>

            {/* BLOQUE 3: ORDEN DE LUGARES */}
            <section
              aria-label="Criterio de Orden de Lugares"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <span>📍</span>
                  <span>{language === "es" ? "3. Ordenar lugares por" : "3. Sort Spots"}</span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-neutral-400">
                  {language === "es" ? "Cerca, calificados o concurrencia" : "Distance, rating, activity"}
                </span>
              </div>
              <div className="w-full">
                <SortSegmentedControl
                  value={propPlacesSortBy}
                  onChange={(val) => onPlacesSortByChange && onPlacesSortByChange(val as "distance" | "rating" | "activity")}
                  className="w-full"
                  options={[
                    { id: "distance", label: language === "es" ? "Cerca" : "Dist", icon: "📍" },
                    { id: "rating", label: language === "es" ? "Calificados" : "Rating", icon: "⭐" },
                    { id: "activity", label: language === "es" ? "Concurrencia" : "Active", icon: "👥" },
                  ]}
                />
              </div>
            </section>

            {/* BLOQUE 4: CATEGORÍAS DE LUGARES */}
            <section
              aria-label="Categorías de Lugares"
              className="bg-obsidian-surface/60 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                  <span>🏙️</span>
                  <span>{language === "es" ? "4. Tipo de espacio" : "4. Space Type"}</span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-neutral-400">
                  {language === "es" ? "Filtrar por rubro" : "By category"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {placesCategories.map((cat) => (
                  <FilterPill
                    key={cat.id}
                    label={cat.label}
                    icon={<span>{cat.icon}</span>}
                    active={propPlacesCategory === cat.id}
                    variant="violet"
                    onClick={() => onPlacesCategoryChange && onPlacesCategoryChange(cat.id)}
                    className="w-full justify-start py-2.5 px-3 min-h-[44px]"
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </TacticalBottomSheet>
  );
};

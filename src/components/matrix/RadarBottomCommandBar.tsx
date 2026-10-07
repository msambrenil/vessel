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
  SlidersHorizontal,
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
  INTENSITY_LABELS,
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [kinkSearchQuery, setKinkSearchQuery] = useState<string>("");
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
    if (matrixTab === "places") return language === "es" ? "Boliches & Lugares" : "Hotspots & Places";
    if (operatingIntent === "now") return language === "es" ? "Pinta ya" : "Ready Now";
    if (operatingIntent === "kink") return language === "es" ? "Morbos" : "Kinks";
    if (operatingIntent === "stealth") return language === "es" ? "Discreto" : "Stealth";
    return language === "es" ? "Radar Activo" : "Active Radar";
  };

  // Group kinks into 3 tribes for advanced section
  const gearKinks = KINK_CATALOG.filter((k) => k.category === "gear");
  const dynamicKinks = KINK_CATALOG.filter(
    (k) => k.category === "dynamic" || k.category === "intensity"
  );
  const practicesKinks = KINK_CATALOG.filter(
    (k) => k.category === "fetish" || k.category === "scene"
  );

  const advancedCount =
    filters.selectedKinks.length +
    (filters.substanceAtmospheres?.length || 0) +
    (filters.maxDistanceKm < 20 ? 1 : 0) +
    (filters.minIntensity > 1 ? 1 : 0);

  const tempoList = [
    { lvl: 1, emoji: "☕", label: INTENSITY_LABELS[1]?.label || "Tranqui" },
    { lvl: 2, emoji: "⚡", label: INTENSITY_LABELS[2]?.label || "Al hueso" },
    { lvl: 3, emoji: "🔥", label: INTENSITY_LABELS[3]?.label || "Picante" },
    { lvl: 4, emoji: "⛓️", label: INTENSITY_LABELS[4]?.label || "Extremo" },
  ];

  return (
    <TacticalBottomSheet
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
      fullscreen={true}
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
              setIsExpanded(false);
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
      <div className="space-y-5 pb-6 overflow-x-hidden">
        {/* =========================================================
            BLOQUE 1: SINTONÍA & INTENCIÓN OPERATIVA
            ========================================================= */}
        <section aria-label="Sintonía e Intención Operativa" className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>{language === "es" ? "1. Sintonía Activa" : "1. Active Intent"}</span>
            </span>
            <span className="text-[9.5px] font-mono text-neutral-500">
              {language === "es" ? "Modo del radar" : "Radar mode"}
            </span>
          </div>
          <IntentHubSelector />
        </section>

        {/* =========================================================
            PESTAÑA PERSONAS: BLOQUES 2 A 7
            ========================================================= */}
        {matrixTab === "people" ? (
          <>
            {/* BLOQUE 2: BÚSQUEDA RÁPIDA & MODO VIAJERO */}
            <section aria-label="Búsqueda Rápida" className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Search className="w-3 h-3 text-electricViolet" />
                <span>{language === "es" ? "2. Búsqueda Táctica" : "2. Tactical Search"}</span>
              </span>

              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <TacticalSearchInput
                    testId="people-search-input"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder={t.filters?.searchPlaceholder || "Buscar por rol, morbos, alias..."}
                    ariaLabel={t.filters?.searchPlaceholder || "Buscar por rol, morbos, alias..."}
                    onClear={() => {
                      startTransition(() => {
                        setFilters((prev) => ({ ...prev, searchQuery: "" }));
                      });
                    }}
                  />
                </div>

                {/* Modo Viajero */}
                <button
                  type="button"
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
                  className={`px-3 min-h-[38px] rounded-xl flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold border transition-all cursor-pointer active:scale-95 flex-shrink-0 ${
                    travelMode.isActive
                      ? "bg-electricViolet text-white border-electricViolet-glow shadow-violet-glow animate-pulse font-black"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Plane className={`w-3.5 h-3.5 ${travelMode.isActive ? "text-white" : "text-electricViolet-glow"}`} />
                  <span className="truncate max-w-[76px]">
                    {travelMode.isActive ? travelMode.cityName : (language === "es" ? "Viajero" : "Travel")}
                  </span>
                </button>

                {/* Botón de acceso / sincronización a Filtros Avanzados */}
                <button
                  type="button"
                  data-testid="filter-toggle-button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setIsFilterDrawerOpen(true);
                    setIsAdvancedOpen(true);
                  }}
                  aria-label={t.filters?.title || "Filtros Avanzados"}
                  title="Afinar fetiches y parámetros avanzados"
                  className={`px-3 min-h-[38px] flex items-center justify-center gap-1.5 rounded-xl border transition-all cursor-pointer text-xs font-mono font-bold active:scale-95 flex-shrink-0 ${
                    advancedCount > 0
                      ? "bg-electricViolet text-white border-electricViolet-glow shadow-violet-glow"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span className="hidden sm:inline uppercase text-[10px]">
                    {language === "es" ? "Avanzados" : "Advanced"}
                  </span>
                  {advancedCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-bloodNeon text-white text-[9px] font-mono font-black flex items-center justify-center shadow-blood-glow">
                      {advancedCount}
                    </span>
                  )}
                </button>
              </div>
            </section>

            {/* BLOQUE 3: ORDEN DE VISUALIZACIÓN (Cero scroll horizontal) */}
            <section aria-label="Criterio de Ordenamiento" className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <span>📍</span>
                <span>{language === "es" ? "3. Criterio de Orden" : "3. Sort Priority"}</span>
              </span>
              <div className="w-full">
                <SortSegmentedControl
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-full justify-between"
                  options={[
                    { id: "distance", label: language === "es" ? "Cerca" : "Dist", icon: "📍" },
                    { id: "recent", label: language === "es" ? "On-Line" : "Online", icon: "⚡" },
                    { id: "affinity", label: language === "es" ? "Afinidad" : "Match", icon: "🔥" },
                  ]}
                />
              </div>
            </section>

            {/* BLOQUE 4: CONFIANZA & LOGÍSTICA RÁPIDA (Grid 2-col, Cero scroll horizontal) */}
            <section aria-label="Confianza y Logística Rápida" className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === "es" ? "4. Confianza & Logística Rápida" : "4. Trust & Quick Logistics"}</span>
                </span>
                <span className="text-[9.5px] font-mono text-neutral-500">
                  {language === "es" ? "Opciones directas" : "Direct options"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* 4.1 Favoritos */}
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

                {/* 4.2 Con lugar */}
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

                {/* 4.3 Verificados 3D */}
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

                {/* 4.4 Cero plantones (Anti-ghost) */}
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

                {/* 4.5 Deseos mutuos */}
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

            {/* BLOQUE 5: ROL & POSICIÓN (Flex-wrap, Cero scroll horizontal) */}
            <section aria-label="Rol Táctico" className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <span>🛡️</span>
                <span>{language === "es" ? "5. Rol & Posición" : "5. Role & Position"}</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {ROLE_OPTIONS.map((role) => (
                  <FilterPill
                    key={role}
                    label={getRoleDisplayLabel(role as RoleType, language)}
                    active={filters.roles.includes(role as RoleType)}
                    variant="violet"
                    onClick={() => toggleRole(role as RoleType)}
                  />
                ))}
              </div>
            </section>

            {/* BLOQUE 6: ONDA & RITMO DE HOY (2-col grid, Cero scroll horizontal) */}
            <section aria-label="Onda y Ritmo de Hoy" className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-electricViolet" />
                  <span>{language === "es" ? "6. ¿Qué onda buscás hoy?" : "6. Desired Vibe"}</span>
                </span>
                {filters.energyVibes && filters.energyVibes.length > 0 && (
                  <span className="text-[10px] font-mono text-electricViolet-glow font-bold">
                    {filters.energyVibes.length} {t.filters?.selectedCount || "sel."}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ENERGY_VIBE_CATALOG.map((vibe) => {
                  const isSelected = (filters.energyVibes || []).includes(vibe.id);
                  return (
                    <button
                      key={vibe.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleEnergyVibe(vibe.id)}
                      className={`p-2.5 min-h-[48px] rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? `${vibe.tagColor} border-current font-bold shadow-sm ring-1 ring-white/20`
                          : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="text-base shrink-0">{vibe.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{vibe.label}</span>
                        <span className="text-[9px] text-neutral-400 block truncate leading-tight opacity-80">
                          {vibe.description.split(",")[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* BLOQUE 7: FILTROS AVANZADOS (Acordeón Plegable: Morbos, Sustancias & Distancia) */}
            <section aria-label="Filtros Avanzados y Morbos" className="pt-2 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsAdvancedOpen((prev) => !prev);
                }}
                className="w-full p-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white flex items-center justify-between transition-all cursor-pointer group active:scale-[0.99]"
                aria-expanded={isAdvancedOpen}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 group-hover:text-white transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white block">
                        {language === "es" ? "7. Morbos, Sustancias & Distancia" : "7. Kinks, Substances & Distance"}
                      </span>
                      {advancedCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-electricViolet text-white">
                          {advancedCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[9.5px] text-neutral-400 block">
                      {language === "es" ? "Afinar preferencias sensoriales" : "Fine-tune sensory preferences"}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                    isAdvancedOpen ? "rotate-180 text-electricViolet" : ""
                  }`}
                />
              </button>

              {isAdvancedOpen && (
                <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* 7.1 Morbos por Tribu */}
                  <div className="space-y-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-neutral-300 uppercase tracking-wider block">
                        {t.filters?.kinksSection || (language === "es" ? "Morbos & Fetiches" : "Kinks & Fetishes")}
                      </label>
                      {filters.selectedKinks.length > 0 && (
                        <span className="text-[10px] font-mono text-bloodNeon font-bold">
                          {filters.selectedKinks.length} {t.filters?.selectedCount || "sel."}
                        </span>
                      )}
                    </div>

                    <TacticalSearchInput
                      value={kinkSearchQuery}
                      onChange={setKinkSearchQuery}
                      placeholder={language === "es" ? "Buscar fetiche, cuero, bdsm..." : "Search kink..."}
                      ariaLabel="Buscar fetiche o morbo"
                      onClear={() => setKinkSearchQuery("")}
                      testId="kink-search-bottom-bar"
                    />

                    {/* Grupo 1: Cuero & Gear */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
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

                    {/* Grupo 2: Dinámicas de Poder */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
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

                    {/* Grupo 3: Morbos & Prácticas */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
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

                  {/* 7.2 Atmósfera de Sustancias */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">
                      {t.filters?.substanceSectionTitle || (language === "es" ? "Atmósfera de Sustancias" : "Substance Atmosphere")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        Object.keys(SUBSTANCE_ATMOSPHERE_CATALOG) as SubstanceAtmosphere[]
                      ).map((key) => {
                        const item = SUBSTANCE_ATMOSPHERE_CATALOG[key];
                        const isSelected = filters.substanceAtmospheres?.includes(key);
                        const langKey = language === "en" ? "en" : "es";

                        return (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={!!isSelected}
                            onClick={() => toggleSubstanceAtmosphere(key)}
                            className={`p-2 min-h-[42px] rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                              isSelected
                                ? `${item.badgeClass} ring-1 ring-white/30 font-bold shadow-md`
                                : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="text-sm shrink-0">{item.icon}</span>
                            <span className="truncate text-[11px]">{item.title[langKey]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7.3 Intensidad Corporal Mínima */}
                  <div className="space-y-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🌶️</span>
                        <span>{t.filters?.intensitySection || (language === "es" ? "Intensidad Corporal Mínima" : "Minimum Intensity")}</span>
                      </label>
                      <span className="text-xs font-bold text-electricViolet-glow font-mono">
                        {INTENSITY_LABELS[filters.minIntensity]?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {tempoList.map((tempo) => {
                        const isSelected = filters.minIntensity === tempo.lvl;
                        return (
                          <button
                            key={tempo.lvl}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              audioEngine.playPulse();
                              setFilters((prev) => ({ ...prev, minIntensity: tempo.lvl }));
                            }}
                            className={`py-2 px-1 min-h-[42px] rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                              isSelected
                                ? tempo.lvl === 4
                                  ? "bg-bloodNeon border-bloodNeon text-white shadow-blood-glow"
                                  : "bg-electricViolet border-electricViolet text-white shadow-violet-soft font-bold"
                                : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="text-sm leading-none">{tempo.emoji}</span>
                            <span className="text-[10px] font-bold tracking-tight block truncate w-full">
                              {tempo.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7.4 Rango de Distancia Máxima */}
                  <div className="space-y-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider">
                        📍 {t.filters?.maxDistanceLabel || (language === "es" ? "Distancia Máxima" : "Max Distance")}
                      </label>
                      <span className="text-xs font-bold text-white font-mono">
                        {filters.maxDistanceKm} km
                      </span>
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
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          /* =========================================================
             PESTAÑA LUGARES & BOLICHES: BLOQUES 2 A 4
             ========================================================= */
          <>
            {/* BLOQUE 2: BÚSQUEDA DE LUGARES & ACCIONES */}
            <section aria-label="Búsqueda de Lugares" className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Search className="w-3 h-3 text-electricViolet" />
                <span>{language === "es" ? "2. Búsqueda de Lugares & Puntos" : "2. Search Spots"}</span>
              </span>

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
                <button
                  type="button"
                  data-testid="places-travel-mode-button"
                  onClick={() => {
                    audioEngine.playPulse();
                    openTravelModal();
                  }}
                  aria-label={travelMode.isActive ? `Modo Viajero: ${travelMode.cityName}` : "Modo Viajero"}
                  className={`px-3 min-h-[38px] rounded-xl flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold border transition-all cursor-pointer active:scale-95 flex-shrink-0 ${
                    travelMode.isActive
                      ? "bg-electricViolet text-white border-electricViolet-glow shadow-violet-glow animate-pulse font-black"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Plane className={`w-3.5 h-3.5 ${travelMode.isActive ? "text-white" : "text-electricViolet-glow"}`} />
                  <span className="truncate max-w-[76px]">
                    {travelMode.isActive ? travelMode.cityName : (language === "es" ? "Viajero" : "Travel")}
                  </span>
                </button>

                {/* Botón Proponer Lugar */}
                <button
                  type="button"
                  data-testid="propose-place-header-button"
                  onClick={() => {
                    audioEngine.playPulse();
                    if (onProposePlace) onProposePlace();
                  }}
                  aria-label="Proponer nuevo punto táctico"
                  className="px-3 min-h-[38px] rounded-xl bg-electricViolet text-white border border-electricViolet-glow font-bold shadow-violet-glow hover:bg-electricViolet/90 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-mono active:scale-95 transition-all flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline uppercase text-[10px]">
                    {t.filters?.proposePlaceBtn || (language === "es" ? "Proponer" : "Propose")}
                  </span>
                </button>
              </div>
            </section>

            {/* BLOQUE 3: ORDEN DE LUGARES */}
            <section aria-label="Criterio de Orden de Lugares" className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <span>📍</span>
                <span>{language === "es" ? "3. Criterio de Orden" : "3. Sort Priority"}</span>
              </span>
              <div className="w-full">
                <SortSegmentedControl
                  value={propPlacesSortBy}
                  onChange={(val) => onPlacesSortByChange && onPlacesSortByChange(val as "distance" | "rating" | "activity")}
                  className="w-full justify-between"
                  options={[
                    { id: "distance", label: language === "es" ? "Cerca" : "Dist", icon: "📍" },
                    { id: "rating", label: language === "es" ? "Calificados" : "Rating", icon: "⭐" },
                    { id: "activity", label: language === "es" ? "Concurrencia" : "Active", icon: "👥" },
                  ]}
                />
              </div>
            </section>

            {/* BLOQUE 4: CATEGORÍAS DE LUGARES (Grid 2-col, Cero scroll horizontal) */}
            <section aria-label="Categorías de Lugares" className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <span>🏙️</span>
                <span>{language === "es" ? "4. Categorías de Espacios" : "4. Space Categories"}</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {placesCategories.map((cat) => (
                  <FilterPill
                    key={cat.id}
                    label={cat.label}
                    icon={<span>{cat.icon}</span>}
                    active={propPlacesCategory === cat.id}
                    variant="violet"
                    onClick={() => onPlacesCategoryChange && onPlacesCategoryChange(cat.id)}
                    className="w-full justify-start py-2 px-3 min-h-[40px]"
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

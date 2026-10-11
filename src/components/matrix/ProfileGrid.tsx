"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  useRadarMatrix,
  useSettings,
  useAuth,
  useLogistics,
} from "@/context/VesselContext";
import { VesselProfile, HotspotCategory, KinkMutualMatch } from "@/types/vessel";
import { ProfileCard } from "./ProfileCard";
import { PlacesGrid } from "./PlacesGrid";
import { MatrixUnlimitedPromoCard } from "./MatrixUnlimitedPromoCard";
import { RadarBottomCommandBar } from "./RadarBottomCommandBar";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";

const RendezvousSheet = dynamic(
  () => import("@/components/chat/RendezvousSheet").then((m) => m.RendezvousSheet),
  { ssr: false }
);
const ProfileBentoQuickPeek = dynamic(
  () => import("./ProfileBentoQuickPeek").then((m) => m.ProfileBentoQuickPeek),
  { ssr: false }
);
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  Zap,
  Home,
  ShieldCheck,
  Radio,
  UserPlus,
  FlaskConical,
  Plane,
  Plus,
  Star,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  TacticalSearchInput,
  FilterPill,
  SortSegmentedControl,
  BrutalistButton,
} from "@/components/ui";

const EMPTY_MUTUAL_MATCHES: readonly KinkMutualMatch[] = Object.freeze([]);

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
    matrixTab,
    setMatrixTab,
    favoriteProfileIds: favIdsProp,
    operatingIntent = "now",
    setOperatingIntent,
    intentClusters = [],
    transmissions = {},
    transmitSignal,
    toggleFavoriteProfile,
    boundaries = {},
    profileDossiers = {},
    getMutualKinkMatches,
  } = useRadarMatrix();
  const favoriteProfileIds = favIdsProp || [];
  const { language, t, appMode, setAppMode, isUnlimited, openUnlimitedModal } = useSettings();
  const { openAuthModal, currentUserUid } = useAuth();
  const {
    openNightlifeModal,
    travelMode,
    openTravelModal,
    tacticalHotspots,
    nightlifeEvents,
  } = useLogistics();

  // Estado desacoplado del sheet táctico de Rendezvous (Singleton en memoria)
  const [rendezvousTargetProfile, setRendezvousTargetProfile] = React.useState<VesselProfile | null>(null);

  // Estado desacoplado de Quick Peek Bento (Singleton para toda la Grilla)
  const [quickPeekProfile, setQuickPeekProfile] = React.useState<VesselProfile | null>(null);
  const [isBillboardVisible, setIsBillboardVisible] = React.useState<boolean>(false);

  // Estados locales para la pestaña Lugares & Fiestas
  const [placesSearchQuery, setPlacesSearchQuery] = React.useState("");
  const [placesCategory, setPlacesCategory] = React.useState<"all" | HotspotCategory | "nightlife">("all");
  const [placesSortBy, setPlacesSortBy] = React.useState<"distance" | "rating" | "activity">("distance");
  const [isProposeOpen, setIsProposeOpen] = React.useState(false);

  const placesCategories: { id: "all" | HotspotCategory | "nightlife"; label: string; icon: string }[] = [
    { id: "all", label: language === "es" ? "Todos" : "All", icon: "🌐" },
    { id: "cruising_area", label: language === "es" ? "Áreas de Cruising" : "Cruising Areas", icon: "🌲" },
    { id: "nightlife", label: language === "es" ? "Fiestas" : "Nightlife", icon: "🎉" },
    { id: "darkroom_club", label: language === "es" ? "Darkrooms" : "Darkrooms", icon: "⚡" },
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

  // Mapa de índices O(1) para evitar escaneos O(N*M) con findIndex dentro del renderizado de racimos
  const profileIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < sortedProfiles.length; i++) {
      map.set(sortedProfiles[i].id, i);
    }
    return map;
  }, [sortedProfiles]);

  // Set O(1) de favoritos memorizado para eliminar búsquedas lineales en el render loop
  const favoriteIdsSet = React.useMemo(
    () => new Set(favoriteProfileIds),
    [favoriteProfileIds]
  );

  // Mapa de mutualMatches O(1) con referencias estables de array para blindar React.memo(ProfileCard)
  const mutualMatchesMap = React.useMemo(() => {
    const map = new Map<string, readonly KinkMutualMatch[]>();
    if (!getMutualKinkMatches) return map;
    for (let i = 0; i < sortedProfiles.length; i++) {
      const p = sortedProfiles[i];
      map.set(p.id, getMutualKinkMatches(p.kinkMatrix) || EMPTY_MUTUAL_MATCHES);
    }
    return map;
  }, [sortedProfiles, getMutualKinkMatches]);

  const handleResetAllFilters = () => {
    audioEngine.playPulse();
    setSearchValue("");
    resetFilters();
    setIsOnTheClockFilterActive(false);
  };

  const totalPlacesCount = (tacticalHotspots?.length || 0) + (nightlifeEvents?.length || 0);

  return (
    <div className="flex flex-col flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-28 select-none">
      {/* =========================================================
          CABECERA TÁCTICA DEL RADAR (ALTERNATIVA A - RADAR ZEN)
          SWITCHER 1-TAP (GENTE vs BOLICHES)
          ========================================================= */}
      <div className="flex flex-col gap-2 p-2 sm:p-3 pb-1">
        {/* Fila 1: Switcher 1-Tap Unificado (Full Width) */}
        <div
          role="tablist"
          aria-label={language === "es" ? "Cambiar vista del radar" : "Switch radar view"}
          className="grid grid-cols-2 w-full p-1 bg-obsidian-surface/90 border border-white/10 rounded-2xl backdrop-blur-md shadow-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={matrixTab === "people"}
            data-testid="radar-tab-people"
            onClick={() => {
              if (matrixTab !== "people") {
                audioEngine.playSubBass(60, 0.1);
                setMatrixTab("people");
              }
            }}
            className={`w-full py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              matrixTab === "people"
                ? "bg-electricViolet text-white shadow-violet-soft border border-electricViolet-glow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>👥</span>
            <span>{language === "es" ? "Gente" : "People"}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                matrixTab === "people" ? "bg-white/20 text-white" : "bg-white/5 text-neutral-400"
              }`}
            >
              {sortedProfiles.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={matrixTab === "places"}
            data-testid="radar-tab-places"
            onClick={() => {
              if (matrixTab !== "places") {
                audioEngine.playSubBass(60, 0.1);
                setMatrixTab("places");
                if (setOperatingIntent) setOperatingIntent("nightlife");
              }
            }}
            className={`w-full py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              matrixTab === "places"
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-pink-400"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>🍸</span>
            <span>{language === "es" ? "Boliches & Joda" : "Spots & Parties"}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                matrixTab === "places" ? "bg-white/20 text-white" : "bg-white/5 text-neutral-400"
              }`}
            >
              {totalPlacesCount}
            </span>
          </button>
        </div>

        {/* Fila 2: Carrusel Ergonómico de Filtros 1-Tap (Thumb Zone) con Acciones Pinned en Desktop */}
        {matrixTab === "people" && (
          <div className="flex items-center gap-2 w-full py-1">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-2 px-2 sm:mx-0 sm:px-0 flex-1 min-w-0">
              <FilterPill
                label={language === "es" ? "⚡ Pinta ya" : "⚡ Ready Now"}
                active={isOnTheClockFilterActive}
                variant="violet"
                onClick={() => {
                  audioEngine.playPulse();
                  setIsOnTheClockFilterActive(!isOnTheClockFilterActive);
                }}
              />
              <FilterPill
                label={language === "es" ? "🏠 Pone casa" : "🏠 Has Place"}
                active={isHostOnlyActive}
                variant="emerald"
                onClick={() => toggleQuickFilter("host")}
              />
              <FilterPill
                label={language === "es" ? "✨ Morbos mutuos" : "✨ Mutual Kinks"}
                active={isMutualKinksActive}
                variant="blood"
                onClick={() => toggleQuickFilter("mutualKinks")}
              />
              <FilterPill
                label={language === "es" ? "⭐ Favoritos" : "⭐ Favorites"}
                active={isFavoritesActive}
                count={favoriteProfileIds.length}
                variant="amber"
                onClick={() => toggleQuickFilter("favorites")}
              />
              <FilterPill
                label={language === "es" ? "🛡️ Verificados" : "🛡️ Verified"}
                active={isVerifiedActive}
                variant="cyan"
                onClick={() => toggleQuickFilter("verified")}
              />
              <FilterPill
                label={language === "es" ? "👻 Cero plantones" : "👻 Anti-Ghost"}
                active={isAntiGhostActive}
                variant="emerald"
                onClick={() => toggleQuickFilter("antiGhost")}
              />
            </div>

            {/* Acciones de Filtro: Botón de Drawer + Link Limpiar (Siempre visibles, sin recorte en desktop) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <BrutalistButton
                type="button"
                variant="tactical"
                size="compact"
                soundEffect="pulse"
                onClick={() => setIsFilterDrawerOpen(true)}
                data-testid="bento-radar-top-filters-btn"
                className="!px-3 !py-1.5 min-h-[38px] sm:min-h-[34px] !rounded-xl !bg-white/5 hover:!bg-white/10 border !border-white/15 hover:!border-electricViolet text-xs font-mono font-bold flex items-center gap-1.5 flex-shrink-0 transition-all active:scale-95 relative after:absolute after:-inset-1 after:content-['']"
                aria-label={language === "es" ? "Abrir panel completo de filtros" : "Open all filters"}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-electricViolet" />
                <span>{language === "es" ? "Filtros" : "Filters"}</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-bloodNeon text-white text-[9px] font-mono font-black flex items-center justify-center shadow-blood-glow">
                    {activeFiltersCount}
                  </span>
                )}
              </BrutalistButton>

              {/* Chip de Limpieza 1-Tap */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="text-[11px] font-mono text-neutral-400 hover:text-bloodNeon underline underline-offset-2 flex-shrink-0 whitespace-nowrap cursor-pointer transition-colors px-1"
                >
                  {language === "es" ? "✕ Limpiar" : "✕ Clear"}
                </button>
              )}
            </div>
          </div>
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
        <div className="flex flex-col flex-1 p-2 sm:p-3 pt-1 space-y-3">

          {/* =========================================================
              BENTO BILLBOARD COLAPSABLE: SALIDAS & JODA HOY
             ========================================================= */}
          {isBillboardVisible && (
            <div
              data-testid="bento-billboard-card"
              className="p-2.5 sm:p-3 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-obsidian-surface border border-pink-500/30 rounded-2xl flex items-center justify-between gap-2.5 shadow-[0_0_20px_rgba(236,72,153,0.15)] animate-in fade-in transition-all"
            >
              <div
                className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                onClick={() => {
                  audioEngine.playSubBass(60);
                  openNightlifeModal();
                }}
              >
                <span className="text-base sm:text-lg flex-shrink-0">🍸</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-pink-300 uppercase tracking-wider">
                      {language === "es" ? "SALIDAS & JODA HOY:" : "NIGHTLIFE TONIGHT:"}
                    </span>
                    <span className="text-xs font-mono font-black text-white truncate">
                      {nightlifeEvents && nightlifeEvents.length > 0 ? nightlifeEvents[0].name : "Crobar"}
                    </span>
                    {(nightlifeEvents && nightlifeEvents.length > 0 ? nightlifeEvents[0].hasDarkroom : true) && (
                      <span className="text-[8.5px] px-1.5 py-0.2 bg-purple-900/70 text-purple-200 rounded border border-purple-500/50 font-mono font-bold">
                        ⚡ Darkroom activo
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-400 font-sans truncate">
                    📍 {nightlifeEvents && nightlifeEvents.length > 0 ? `${nightlifeEvents[0].venueName} • ${nightlifeEvents[0].activeAttendeesCount} presentes hoy` : "Palermo • Lista abierta"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <BrutalistButton
                  variant="ghost"
                  size="compact"
                  soundEffect="pulse"
                  onClick={() => {
                    audioEngine.playSubBass(60);
                    openNightlifeModal();
                  }}
                  className="!px-2.5 !py-1 !rounded-xl !bg-pink-500/20 hover:!bg-pink-500/30 !text-pink-300 !border !border-pink-500/40 !text-[10px] !font-mono font-bold flex items-center gap-1"
                >
                  <span>{language === "es" ? "Ver Agenda" : "Agenda"}</span>
                  <span>→</span>
                </BrutalistButton>

                <button
                  type="button"
                  onClick={() => setIsBillboardVisible(false)}
                  className="relative p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-neutral-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer after:absolute after:-inset-1.5 after:content-['']"
                  title={language === "es" ? "Ocultar cartel" : "Hide billboard"}
                  aria-label={language === "es" ? "Ocultar cartel" : "Hide billboard"}
                >
                  <X className="w-4 h-4" />
                </button>
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
                        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                          {cluster.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="@container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 @xs:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {cluster.profiles.map((profile, idx) => {
                      const globalIndex = profileIndexMap.get(profile.id) ?? -1;
                      const isLockedByLimit = !isUnlimited && globalIndex >= FREE_TIER_LIMITS.maxFreeProfilesInMatrix;
                      const showPromoAfterThis = !isUnlimited && globalIndex === FREE_TIER_LIMITS.maxFreeProfilesInMatrix - 1;

                      return (
                        <React.Fragment key={profile.id}>
                          <div className="[content-visibility:auto] [contain-intrinsic-size:0_260px]">
                            <ProfileCard
                              profile={profile}
                              onSelect={setQuickPeekProfile}
                              onOpenChat={onOpenChat}
                              onOpenRendezvous={setRendezvousTargetProfile}
                              isPriority={idx < 2}
                              isLockedByGridLimit={isLockedByLimit}
                              isFavorite={favoriteIdsSet.has(profile.id)}
                              onToggleFavorite={toggleFavoriteProfile}
                              signalCount={transmissions[profile.id] || 0}
                              onTransmitSignal={transmitSignal}
                              isAttenuated={boundaries[profile.id]?.radarVisibility === "attenuated"}
                              dossierRating={profileDossiers[profile.id]?.rating || null}
                              customAlias={profileDossiers[profile.id]?.customAlias || null}
                              mutualMatches={mutualMatchesMap.get(profile.id) ?? EMPTY_MUTUAL_MATCHES}
                              language={language}
                              isUnlimited={isUnlimited}
                              openUnlimitedModal={openUnlimitedModal}
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
            <div className="@container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 @xs:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {sortedProfiles.map((profile, index) => {
                const isLockedByLimit = !isUnlimited && index >= FREE_TIER_LIMITS.maxFreeProfilesInMatrix;
                const showPromoAfterThis = !isUnlimited && index === FREE_TIER_LIMITS.maxFreeProfilesInMatrix - 1;

                return (
                  <React.Fragment key={profile.id}>
                    <div className="[content-visibility:auto] [contain-intrinsic-size:0_260px]">
                      <ProfileCard
                        profile={profile}
                        onSelect={setQuickPeekProfile}
                        onOpenChat={onOpenChat}
                        onOpenRendezvous={setRendezvousTargetProfile}
                        isPriority={index < 4}
                        isLockedByGridLimit={isLockedByLimit}
                        isFavorite={favoriteIdsSet.has(profile.id)}
                        onToggleFavorite={toggleFavoriteProfile}
                        signalCount={transmissions[profile.id] || 0}
                        onTransmitSignal={transmitSignal}
                        isAttenuated={boundaries[profile.id]?.radarVisibility === "attenuated"}
                        dossierRating={profileDossiers[profile.id]?.rating || null}
                        customAlias={profileDossiers[profile.id]?.customAlias || null}
                        mutualMatches={mutualMatchesMap.get(profile.id) ?? EMPTY_MUTUAL_MATCHES}
                        language={language}
                        isUnlimited={isUnlimited}
                        openUnlimitedModal={openUnlimitedModal}
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
              <BrutalistButton
                variant="primary"
                size="compact"
                soundEffect="pulse"
                onClick={handleResetAllFilters}
                className="!px-3.5 !py-1.5 min-h-[36px] !rounded-xl text-xs font-mono font-bold shadow-violet-soft flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === "es" ? "Restablecer Filtros" : "Reset Filters"}</span>
              </BrutalistButton>
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
            <BrutalistButton
              variant="primary"
              size="lg"
              soundEffect="none"
              onClick={() => {
                audioEngine.playSubBass(70);
                openAuthModal(currentUserUid && currentUserUid !== "unauthenticated" ? "verify" : "register");
              }}
              className="w-full min-h-[48px] !rounded-2xl text-xs uppercase tracking-wider font-mono shadow-violet-soft flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>
                {currentUserUid && currentUserUid !== "unauthenticated"
                  ? (language === "es" ? "Gestionar Mi Perfil" : "Manage My Profile")
                  : (language === "es" ? "Registrar Mi Perfil" : "Register My Profile")}
              </span>
            </BrutalistButton>

            <BrutalistButton
              variant="outline"
              size="compact"
              soundEffect="none"
              onClick={() => {
                audioEngine.playPulse();
                setAppMode("test");
              }}
              className="w-full min-h-[42px] !rounded-2xl text-xs uppercase tracking-wider font-mono !border-electricViolet/30 !text-electricViolet-glow hover:!bg-white/10 flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{language === "es" ? "Cargar Modo de Prueba (Mock)" : "Switch to Test Mode (Mock)"}</span>
            </BrutalistButton>

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
              <FilterPill
                label={`“${searchValue}”`}
                active={true}
                variant="default"
                onClear={() => {
                  setSearchValue("");
                  setFilters((prev) => ({ ...prev, searchQuery: "" }));
                }}
              />
            )}
            {isFavoritesActive && (
              <FilterPill
                label={`⭐ ${t.filters?.quickFavorites || (language === "es" ? "Favoritos" : "Favorites")}`}
                active={true}
                variant="amber"
                onClear={() => toggleQuickFilter("favorites")}
              />
            )}
            {isOnTheClockFilterActive && (
              <FilterPill
                label={`⚡ ${t.filters?.quickBoost || (language === "es" ? "Pinta ya" : "Ready Now")}`}
                active={true}
                variant="violet"
                onClear={() => setIsOnTheClockFilterActive(false)}
              />
            )}
            {isHostOnlyActive && (
              <FilterPill
                label={`🏠 ${t.filters?.quickHost || (language === "es" ? "Pone lugar" : "Has Place")}`}
                active={true}
                variant="emerald"
                onClear={() => toggleQuickFilter("host")}
              />
            )}
            {isVerifiedActive && (
              <FilterPill
                label={`🛡️ ${t.filters?.quickVerified || (language === "es" ? "Verificados" : "Verified")}`}
                active={true}
                variant="cyan"
                onClear={() => toggleQuickFilter("verified")}
              />
            )}
            {isMutualKinksActive && (
              <FilterPill
                label={`✨ ${language === "es" ? "Morbos mutuos" : "Mutual Kinks"}`}
                active={true}
                variant="violet"
                onClear={() => toggleQuickFilter("mutualKinks")}
              />
            )}
            {isSoberActive && (
              <FilterPill
                label={`🌿 ${language === "es" ? "Sobrio" : "Sober"}`}
                active={true}
                variant="default"
                onClear={() => toggleQuickFilter("sober")}
              />
            )}
            {isHighIntensityActive && (
              <FilterPill
                label={`🚀 ${language === "es" ? "+Picante" : "+Intensity"}`}
                active={true}
                variant="blood"
                onClear={() => toggleQuickFilter("intensity")}
              />
            )}
          </div>

          <div className="pt-2 flex flex-col w-full gap-2">
            <BrutalistButton
              variant="primary"
              size="lg"
              soundEffect="pulse"
              onClick={handleResetAllFilters}
              className="w-full min-h-[48px] !rounded-2xl text-xs uppercase tracking-wider font-mono shadow-violet-soft"
            >
              {t.filters?.resetBtn || (language === "es" ? "Restablecer Todos los Filtros" : "Reset All Filters")}
            </BrutalistButton>
          </div>
        </div>
      )}

      {/* Quick Peek Bento Sheet (Singleton dinámico para toda la Grilla) */}
      {quickPeekProfile && (
        <ProfileBentoQuickPeek
          isOpen={Boolean(quickPeekProfile)}
          profile={quickPeekProfile}
          onClose={() => setQuickPeekProfile(null)}
          onOpenChat={(profileId) => {
            setQuickPeekProfile(null);
            onOpenChat(profileId);
          }}
          onOpenRendezvous={(p) => {
            setQuickPeekProfile(null);
            setRendezvousTargetProfile(p);
          }}
          onViewFullProfile={(p) => {
            setQuickPeekProfile(null);
            onSelectProfile(p);
          }}
        />
      )}

      {/* Sheet Táctico Desacoplado de Rendezvous / Pre-Flight (Singleton para toda la Grilla) */}
      {rendezvousTargetProfile && (
        <RendezvousSheet
          isOpen={Boolean(rendezvousTargetProfile)}
          onClose={() => setRendezvousTargetProfile(null)}
          targetProfile={rendezvousTargetProfile}
        />
      )}

      {/* Barra de Comandos Flotante con BottomSheet Deslizable (App Shell 2.0) */}
      <RadarBottomCommandBar
        hidePeekBar={true}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onProposePlace={() => setIsProposeOpen(true)}
        placesSearchQuery={placesSearchQuery}
        onPlacesSearchChange={setPlacesSearchQuery}
        placesCategory={placesCategory}
        onPlacesCategoryChange={setPlacesCategory}
        placesSortBy={placesSortBy}
        onPlacesSortByChange={setPlacesSortBy}
      />
    </div>
  );
};

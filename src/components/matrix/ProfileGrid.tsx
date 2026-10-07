"use client";

import React from "react";
import dynamic from "next/dynamic";
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
import { RadarBottomCommandBar } from "./RadarBottomCommandBar";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";

const RendezvousSheet = dynamic(
  () => import("@/components/chat/RendezvousSheet").then((m) => m.RendezvousSheet),
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
} from "@/components/ui";

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

  // Estado desacoplado del sheet táctico de Rendezvous (Singleton en memoria)
  const [rendezvousTargetProfile, setRendezvousTargetProfile] = React.useState<VesselProfile | null>(null);

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

  const handleResetAllFilters = () => {
    audioEngine.playPulse();
    setSearchValue("");
    resetFilters();
    setIsOnTheClockFilterActive(false);
  };

  return (
    <div className="flex flex-col flex-1 pb-48 sm:pb-56 select-none">
      {/* =========================================================
          CONTENIDO SEGÚN PESTAÑA ACTIVA: PERSONAS vs LUGARES
          (100% Pantalla Completa Inmersiva - App Shell 2.0)
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
                              onOpenRendezvous={setRendezvousTargetProfile}
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
                        onOpenRendezvous={setRendezvousTargetProfile}
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

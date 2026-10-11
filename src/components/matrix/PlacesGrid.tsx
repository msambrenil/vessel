"use client";

import React, { useState, useMemo } from "react";
import { useLogistics, useAuth, useSettings } from "@/context/VesselContext";
import {
  TacticalHotspot,
  HotspotCategory,
  HotspotReportReason,
  NightlifeEvent,
} from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { calculateHaversineDistance } from "@/lib/geo/GeospatialEngine";
import {
  Search,
  X,
  Plus,
  MapPin,
  Users,
  Star,
  ShieldAlert,
  ThumbsUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  Flag,
  Calendar,
  PartyPopper,
  Plane,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  TacticalSearchInput,
  FilterPill,
  SortSegmentedControl,
  BrutalistButton,
  BrutalistInput,
  BrutalistSelect,
  BrutalistTextarea,
} from "@/components/ui";

export interface PlacesGridProps {
  onOpenNightlifeModal?: () => void;
  hideStickyHeader?: boolean;
  searchQuery?: string;
  selectedCategory?: "all" | HotspotCategory | "nightlife";
  sortBy?: "distance" | "rating" | "activity";
  isProposeOpen?: boolean;
  setIsProposeOpen?: (open: boolean) => void;
}

export const PlacesGrid: React.FC<PlacesGridProps> = ({
  onOpenNightlifeModal,
  hideStickyHeader = false,
  searchQuery: propSearchQuery,
  selectedCategory: propSelectedCategory,
  sortBy: propSortBy,
  isProposeOpen: propIsProposeOpen,
  setIsProposeOpen: propSetIsProposeOpen,
}) => {
  const {
    tacticalHotspots,
    checkInHotspot,
    checkOutHotspot,
    proposeHotspot,
    confirmHotspot,
    rateHotspot,
    reportHotspot,
    nightlifeEvents,
    toggleEventRsvp,
    travelMode,
    openTravelModal,
    myCoordinates,
  } = useLogistics();
  const { currentUserUid } = useAuth();
  const { language, t } = useSettings();

  const currentUserId = currentUserUid || "anon_user";

  // Filtros de Lugares locales si no vienen por props
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localSelectedCategory, setLocalSelectedCategory] = useState<"all" | HotspotCategory | "nightlife">("all");
  const [localSortBy, setLocalSortBy] = useState<"distance" | "rating" | "activity">("distance");
  const [localIsProposeOpen, setLocalIsProposeOpen] = useState(false);

  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = setLocalSearchQuery;
  const selectedCategory = propSelectedCategory !== undefined ? propSelectedCategory : localSelectedCategory;
  const setSelectedCategory = setLocalSelectedCategory;
  const sortBy = propSortBy !== undefined ? propSortBy : localSortBy;
  const setSortBy = setLocalSortBy;
  const isProposeOpen = propIsProposeOpen !== undefined ? propIsProposeOpen : localIsProposeOpen;
  const setIsProposeOpen = propSetIsProposeOpen || setLocalIsProposeOpen;

  // Sub-Modales y Acordeones
  const [reportingSpot, setReportingSpot] = useState<TacticalHotspot | null>(null);
  const [ratingSpot, setRatingSpot] = useState<TacticalHotspot | null>(null);
  const [expandedReportsId, setExpandedReportsId] = useState<string | null>(null);

  // Formulario de Proposición
  const [proposeName, setProposeName] = useState("");
  const [proposeCategory, setProposeCategory] = useState<HotspotCategory>("cruising_area");
  const [proposeAddress, setProposeAddress] = useState("");
  const [proposeDescription, setProposeDescription] = useState("");
  const [proposeDiscretion, setProposeDiscretion] = useState<"high" | "medium" | "low">("high");
  const [proposeBestHours, setProposeBestHours] = useState("");
  const [proposeError, setProposeError] = useState("");

  // Formulario de Denuncia
  const [reportReason, setReportReason] = useState<HotspotReportReason>("safety_hazard");
  const [reportComment, setReportComment] = useState("");
  const [reportError, setReportError] = useState("");

  // Formulario de Calificación
  const [userScore, setUserScore] = useState<number>(5);
  const [userRatingTags, setUserRatingTags] = useState<string[]>([]);

  // Categorías de Filtro
  const categories: { id: "all" | HotspotCategory | "nightlife"; label: string; icon: string }[] = [
    { id: "all", label: language === "es" ? "Todos" : "All", icon: "🌐" },
    { id: "cruising_area", label: language === "es" ? "Áreas de Cruising" : "Cruising Areas", icon: "🌲" },
    { id: "nightlife", label: language === "es" ? "Fiestas" : "Nightlife", icon: "🎉" },
    { id: "darkroom_club", label: language === "es" ? "Darkrooms" : "Darkrooms", icon: "⚡" },
    { id: "sauna", label: language === "es" ? "Saunas" : "Saunas", icon: "🧖" },
    { id: "queer_bar", label: language === "es" ? "Bares Queer" : "Queer Bars", icon: "🍸" },
  ];

  const ratingTagOptions = [
    "🕯️ Oscuro / Discreto",
    "🛡️ Seguro",
    "👥 Mucho movimiento",
    "🧼 Limpio",
    "🤫 Código tácito",
  ];

  const reportReasons: { id: HotspotReportReason; label: string; icon: string }[] = [
    { id: "safety_hazard", label: language === "es" ? "Peligro de Seguridad / Zona liberada" : "Safety Hazard / Danger", icon: "🚨" },
    { id: "police_raid", label: language === "es" ? "Presencia Policial / Redadas" : "Police Presence / Raid", icon: "👮" },
    { id: "closed_permanently", label: language === "es" ? "Lugar cerrado / Inexistente" : "Closed / Non-existent", icon: "🚪" },
    { id: "private_property", label: language === "es" ? "Domicilio particular / Conflicto" : "Private Residence", icon: "🏠" },
    { id: "fake_troll", label: language === "es" ? "Punto falso / Troleo malicioso" : "False / Malicious Info", icon: "⚠️" },
    { id: "other", label: language === "es" ? "Otro motivo relevante" : "Other relevant reason", icon: "❓" },
  ];

  // Coordenadas activas (reales o Modo Viajero)
  const activeCoordinates = useMemo(() => {
    if (travelMode.isActive && travelMode.virtualCoords) {
      return travelMode.virtualCoords;
    }
    return myCoordinates || { lat: -33.1325, lng: -64.3470 };
  }, [travelMode, myCoordinates]);

  // Lista combinada de Hotspots filtrada y ordenada
  const filteredHotspots = useMemo(() => {
    let list = tacticalHotspots.filter((h) => h.status !== "suspended");

    if (selectedCategory !== "all" && selectedCategory !== "nightlife") {
      list = list.filter((h) => h.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q)
      );
    }

    // Calcular distancia estimada en metros
    const withDistance = list.map((h) => {
      const dist = calculateHaversineDistance(
        activeCoordinates.lat,
        activeCoordinates.lng,
        h.coordinates.lat,
        h.coordinates.lng
      );
      return { ...h, computedDistance: dist };
    });

    // Ordenamiento
    return withDistance.sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "activity") {
        return (b.activeVesselsCount || 0) - (a.activeVesselsCount || 0);
      }
      return a.computedDistance - b.computedDistance;
    });
  }, [tacticalHotspots, selectedCategory, searchQuery, activeCoordinates, sortBy]);

  // Fiestas de Nightlife filtradas
  const filteredEvents = useMemo(() => {
    if (selectedCategory !== "all" && selectedCategory !== "nightlife") {
      return [];
    }
    let list = [...nightlifeEvents];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ev) =>
          ev.name.toLowerCase().includes(q) ||
          ev.venueName.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [nightlifeEvents, selectedCategory, searchQuery]);

  // Handler: Enviar Propuesta
  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeName.trim()) {
      setProposeError(language === "es" ? "El nombre del lugar es obligatorio." : "Place name is required.");
      return;
    }
    if (!proposeAddress.trim()) {
      setProposeError(language === "es" ? "La dirección o zona aproximada es obligatoria." : "Address or zone is required.");
      return;
    }

    await proposeHotspot({
      name: proposeName.trim(),
      category: proposeCategory,
      address: proposeAddress.trim(),
      description: proposeDescription.trim(),
      discretionLevel: proposeDiscretion,
      bestHours: proposeBestHours.trim() || undefined,
      coordinates: activeCoordinates,
    });

    setProposeName("");
    setProposeAddress("");
    setProposeDescription("");
    setProposeBestHours("");
    setProposeError("");
    setIsProposeOpen(false);
  };

  // Handler: Enviar Denuncia
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingSpot) return;

    if (!reportComment.trim() || reportComment.trim().length < 10) {
      setReportError(language === "es" ? "Explicá el motivo en al menos 10 caracteres." : "Explain reason in >= 10 chars.");
      return;
    }

    const res = await reportHotspot(reportingSpot.id, reportReason, reportComment.trim());
    if (res.success) {
      setReportingSpot(null);
      setReportComment("");
      setReportError("");
    } else {
      setReportError(res.error || (language === "es" ? "Error al registrar denuncia" : "Report failed"));
    }
  };

  // Handler: Enviar Calificación
  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingSpot) return;

    await rateHotspot(ratingSpot.id, userScore, userRatingTags);
    setRatingSpot(null);
    setUserRatingTags([]);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="flex flex-col flex-1 pb-48 sm:pb-56 select-none animate-in fade-in duration-200">
      {/* =========================================================
          SUB-HEADER CONTEXTUAL DE LUGARES & FIESTAS (Flujo Natural Zen)
          ========================================================= */}
      {!hideStickyHeader && (
        <div className="p-2 sm:p-2.5 bg-obsidian-surface/60 border-b border-white/5 space-y-2 backdrop-blur-sm">
          {/* Fila 1: Búsqueda de Lugares + Botón Proponer Lugar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <TacticalSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={
                t.filters?.searchPlacesPlaceholder ||
                (language === "es"
                  ? "Buscar sauna, cruising, fiesta, boliche..."
                  : "Search sauna, cruising, club, party...")
              }
              ariaLabel="Buscar lugares o fiestas"
              onClear={() => setSearchQuery("")}
              testId="places-grid-search-input"
            />

            {/* Botón Destacado: Proponer Lugar */}
            <BrutalistButton
              variant="primary"
              size="sm"
              onClick={() => {
                audioEngine.playPulse();
                setIsProposeOpen(true);
              }}
              aria-label="Proponer nuevo punto táctico"
              title="Proponer nuevo punto de cruising, sauna o espacio"
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline uppercase text-[10.5px]">
                {t.filters?.proposePlaceBtn ||
                  (language === "es" ? "Proponer Lugar" : "Propose Place")}
              </span>
            </BrutalistButton>
          </div>

          {/* Fila 2: Píldoras de Categorías de Lugares */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1 scroll-smooth">
            <div className="flex items-center gap-1 text-[9.5px] font-mono font-extrabold uppercase text-neutral-400 tracking-wider flex-shrink-0 pr-1.5 border-r border-white/10">
              <span className="text-electricViolet-glow">📍</span>
              <span>{language === "es" ? "Lugar:" : "Type:"}</span>
            </div>

            {categories.map((cat) => (
              <FilterPill
                key={cat.id}
                label={cat.label}
                icon={<span>{cat.icon}</span>}
                active={selectedCategory === cat.id}
                variant="violet"
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>

          {/* Fila 3: Resumen, Ordenamiento y Modo Viajero */}
          <div className="flex items-center justify-between text-xs text-neutral-400 px-0.5 pt-0.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-extrabold text-white font-mono flex items-center gap-1.5 text-[11px] sm:text-xs flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping inline-block" />
                <span>
                  {filteredHotspots.length + filteredEvents.length}{" "}
                  {language === "es" ? "Boliches y Lugares" : "Clubs & Places"}
                </span>
              </span>

              <span className="text-neutral-600 hidden sm:inline">•</span>

              {/* Selector de Ordenamiento */}
              <SortSegmentedControl
                value={sortBy}
                onChange={setSortBy}
                options={[
                  {
                    id: "distance",
                    label: language === "es" ? "Cerca" : "Dist",
                    icon: "📍",
                  },
                  {
                    id: "rating",
                    label: language === "es" ? "Calificados" : "Rating",
                    icon: "⭐",
                  },
                  {
                    id: "activity",
                    label: language === "es" ? "Concurrencia" : "Active",
                    icon: "👥",
                  },
                ]}
              />
            </div>

            {/* Botón Modo Viajero en la Fila de Opciones */}
            <BrutalistButton
              variant={travelMode.isActive ? "primary" : "ghost"}
              size="compact"
              soundEffect="none"
              onClick={() => {
                audioEngine.playPulse();
                openTravelModal();
              }}
              aria-label={travelMode.isActive ? `Modo Viajero Activo: ${travelMode.cityName}` : "Activar Modo Viajero"}
              title={travelMode.isActive ? `Modo Viajero: ${travelMode.cityName} (${travelMode.country}) • Tocá para cambiar o volver` : "Simular ubicación en otra ciudad"}
              className={`!px-2.5 !py-1 !rounded-lg !text-[9.5px] font-mono font-bold flex items-center gap-1.5 flex-shrink-0 ${
                travelMode.isActive
                  ? "!bg-electricViolet !text-white !border-electricViolet-glow shadow-violet-glow animate-pulse"
                  : "!bg-white/5 !border-white/10 text-neutral-300 hover:text-white hover:!bg-white/10"
              }`}
            >
              <Plane className={`w-3 h-3 ${travelMode.isActive ? "text-white" : "text-electricViolet-glow"}`} />
              <span className="truncate max-w-[100px] sm:max-w-[130px]">
                {travelMode.isActive ? `✈️ ${travelMode.cityName}` : "✈️ Viajero"}
              </span>
            </BrutalistButton>
          </div>
        </div>
      )}

      {/* =========================================================
          CONTENIDO: LISTADO TÁCTICO DE LUGARES Y FIESTAS
          ========================================================= */}
      <div className="p-3 sm:p-4 space-y-4">
        {/* Sección 1: Cartelera Nocturna & Fiestas Activas (Visible antes de mostrar todos los lugares) */}
        {filteredEvents.length > 0 && (
          <section
            aria-label={language === "es" ? "Cartelera Nocturna & Fiestas Activas" : "Active Nightlife & Parties"}
            className="p-3.5 sm:p-4 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-obsidian-surface border border-pink-500/30 rounded-2xl space-y-3 backdrop-blur-md shadow-[0_0_25px_rgba(236,72,153,0.15)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl animate-pulse">🍸</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-xs sm:text-sm font-black uppercase text-white tracking-wider">
                      {language === "es" ? "Cartelera Nocturna & Fiestas Activas" : "Active Nightlife & Parties"}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                      {filteredEvents.length} {language === "es" ? "activas hoy" : "active"}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-pink-300/80 font-sans">
                    {language === "es" ? "Eventos y clubes recomendados para esta noche" : "Recommended events and clubs tonight"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEvents.map((ev) => {
                const isGoing = ev.confirmedAttendees.includes(currentUserId);
                return (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-obsidian-surface border border-white/10 hover:border-electricViolet/40 transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                  >
                    {ev.hasDarkroom && (
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-bloodNeon/20 border-l border-b border-bloodNeon/40 text-bloodNeon text-[9px] font-mono font-black uppercase tracking-wider rounded-bl-lg">
                        {language === "es" ? "⚡ SALA OSCURA ACTIVA" : "⚡ DARKROOM ACTIVE"}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎉</span>
                        <h4 className="font-bold text-white text-sm group-hover:text-electricViolet-glow transition-colors">
                          {ev.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 text-[10.5px] font-mono text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          {ev.dateLabel} • {ev.timeRange}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-500" />
                          {ev.venueName}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed font-sans line-clamp-2">
                        {ev.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                        <Users className="w-3.5 h-3.5 text-electricViolet-glow" />
                        <span>
                          {ev.confirmedAttendees.length} {language === "es" ? "confirmados" : "going"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenNightlifeModal && (
                          <BrutalistButton
                            variant="ghost"
                            size="compact"
                            soundEffect="none"
                            onClick={() => {
                              audioEngine.playPulse();
                              onOpenNightlifeModal();
                            }}
                            className="!px-2.5 !py-1 !rounded-lg !text-[10.5px] font-mono font-bold !bg-white/5 !border-white/10 text-neutral-300 hover:text-white"
                          >
                            {language === "es" ? "Pista de Baile" : "Floor"}
                          </BrutalistButton>
                        )}
                        <BrutalistButton
                          variant={isGoing ? "mint" : "primary"}
                          size="compact"
                          soundEffect="none"
                          onClick={() => {
                            audioEngine.playPulse();
                            toggleEventRsvp(ev.id);
                          }}
                          className={`!px-3 !py-1 !rounded-lg !text-[10.5px] font-mono font-bold ${
                            isGoing
                              ? "!bg-mintNeon !text-black font-black shadow-mint-glow"
                              : "!bg-electricViolet !text-white !border-electricViolet-glow hover:!bg-electricViolet/90"
                          }`}
                        >
                          {isGoing ? "Asistiré ✓" : "Voy"}
                        </BrutalistButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Sección 2: Todos los Boliches, Saunas & Puntos Tácticos */}
        <section
          aria-label={language === "es" ? "Todos los Boliches, Saunas & Puntos Tácticos" : "All Clubs, Saunas & Tactical Spots"}
          className="space-y-2.5 pt-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-electricViolet-glow" />
              <h3 className="font-mono text-xs font-extrabold uppercase text-white tracking-wider">
                {language === "es" ? "Todos los Boliches, Saunas & Puntos Tácticos" : "All Clubs, Saunas & Tactical Spots"}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {filteredHotspots.length} {language === "es" ? "lugares activos" : "active spots"}
            </span>
          </div>

          {filteredHotspots.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/10 bg-obsidian-surface text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-xl">
                📍
              </div>
              <h4 className="font-bold text-white text-sm">
                {language === "es" ? "Sin puntos en esta categoría" : "No spots in this category"}
              </h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                {language === "es"
                  ? "¿Conocés un sauna, zona de cruising o bar que no figura? Podés proponerlo para que la comunidad lo confirme."
                  : "Know a sauna or cruising spot? Propose it to the community to verify."}
              </p>
              <BrutalistButton
                variant="primary"
                size="compact"
                soundEffect="none"
                onClick={() => setIsProposeOpen(true)}
                className="!px-4 !py-2 !rounded-xl !text-xs font-mono font-bold shadow-violet-glow"
              >
                [ + Proponer Este Lugar ]
              </BrutalistButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredHotspots.map((spot) => {
                const isCheckedIn = Boolean(spot.isCheckedIn);
                const hasAlreadyConfirmed = spot.confirmedByUserIds?.includes(currentUserId);
                const isUnderAlert = spot.status === "flagged" || (spot.reportsCount && spot.reportsCount >= 2);
                const isProposed = spot.status === "proposed";
                const isReportsExpanded = expandedReportsId === spot.id;

                return (
                  <div
                    key={spot.id}
                    className={`p-3.5 rounded-2xl bg-obsidian-surface border transition-all flex flex-col justify-between gap-3 relative ${
                      isUnderAlert
                        ? "border-bloodNeon/40 bg-bloodNeon/5"
                        : isProposed
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Cabecera de la Tarjeta */}
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {spot.category === "sauna"
                              ? "🧖"
                              : spot.category === "darkroom_club"
                              ? "⚡"
                              : spot.category === "queer_bar"
                              ? "🍸"
                              : "🌲"}
                          </span>
                          <div>
                            <h4 className="font-bold text-white text-sm">{spot.name}</h4>
                            <p className="text-[10.5px] font-mono text-neutral-400">
                              {spot.address} • ~{formatDistance(spot.computedDistance || 300)}
                            </p>
                          </div>
                        </div>

                        {/* Badges de Estado */}
                        {isUnderAlert ? (
                          <span className="px-2 py-0.5 rounded-md bg-bloodNeon/20 border border-bloodNeon text-bloodNeon text-[9px] font-mono font-black uppercase tracking-wider flex-shrink-0">
                            ALERTA ({spot.reportsCount} REPORTES)
                          </span>
                        ) : isProposed ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500 text-amber-300 text-[9px] font-mono font-black uppercase tracking-wider flex-shrink-0">
                            EN VALIDACIÓN ({spot.confirmationsCount || 1}/3)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-electricViolet/20 border border-electricViolet/50 text-electricViolet-glow text-[9px] font-mono font-bold uppercase tracking-wider flex-shrink-0">
                            ACTIVO & VERIFICADO
                          </span>
                        )}
                      </div>

                      {spot.description && (
                        <p className="text-xs text-neutral-300 font-sans leading-relaxed pt-0.5">
                          {spot.description}
                        </p>
                      )}

                      {/* Metadatos Tácticos (Horarios & Discreción) */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-neutral-400">
                        {spot.bestHours && (
                          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-neutral-500" />
                            {spot.bestHours}
                          </span>
                        )}
                        <span className="bg-white/5 px-2 py-0.5 rounded">
                          Discreción:{" "}
                          <strong className="text-white">
                            {spot.discretionLevel === "high"
                              ? "Alta"
                              : spot.discretionLevel === "low"
                              ? "Baja"
                              : "Media"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Acordeón de Alertas Preventivas Anónimas */}
                    {isUnderAlert && spot.reports && spot.reports.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-bloodNeon/10 border border-bloodNeon/30 space-y-1.5 text-xs">
                        <BrutalistButton
                          type="button"
                          variant="ghost"
                          size="compact"
                          soundEffect="none"
                          onClick={() => setExpandedReportsId(isReportsExpanded ? null : spot.id)}
                          className="w-full !justify-between !px-1 text-[11px] font-mono font-bold text-bloodNeon"
                        >
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{spot.reports.length} advertencias comunitarias</span>
                          </span>
                          {isReportsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </BrutalistButton>

                        {isReportsExpanded && (
                          <div className="space-y-1.5 pt-1.5 border-t border-bloodNeon/20">
                            {spot.reports.map((rep) => (
                              <div key={rep.id} className="text-[11px] text-neutral-200 font-sans">
                                • <strong className="text-bloodNeon">[{rep.reason}]</strong>: &ldquo;{rep.comment}&rdquo;
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Barra de Calificación & Concurrencia */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        {/* Rating con Estrellas */}
                        <BrutalistButton
                          type="button"
                          variant="ghost"
                          size="compact"
                          soundEffect="none"
                          onClick={() => {
                            audioEngine.playPulse();
                            setRatingSpot(spot);
                          }}
                          className="!px-1.5 !py-0.5 flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
                          title="Calificar este lugar"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{spot.rating ? spot.rating.toFixed(1) : "0.0"}</span>
                          <span className="text-neutral-500 text-[10px]">
                            ({spot.ratingsCount || 0})
                          </span>
                        </BrutalistButton>

                        {/* Concurrencia Activa */}
                        <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
                          <Users className="w-3.5 h-3.5 text-electricViolet-glow" />
                          <span>{spot.activeVesselsCount || 0} aquí</span>
                        </div>
                      </div>

                      {/* Acciones del Lugar */}
                      <div className="flex items-center gap-1.5">
                        {/* Botón de Confirmación para Lugares En Validación */}
                        {isProposed && (
                          <BrutalistButton
                            variant="ghost"
                            size="compact"
                            soundEffect="none"
                            disabled={hasAlreadyConfirmed}
                            onClick={async () => {
                              await confirmHotspot(spot.id);
                            }}
                            className={`!px-2.5 !py-1 !rounded-lg !text-[10.5px] font-mono font-bold flex items-center gap-1 transition-all ${
                              hasAlreadyConfirmed
                                ? "!bg-white/5 text-neutral-500 !border-white/5 cursor-default"
                                : "!bg-electricViolet/20 !border-electricViolet !text-electricViolet-glow hover:!bg-electricViolet/30 cursor-pointer active:scale-95"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{hasAlreadyConfirmed ? "Confirmaste ✓" : "Confirmar (3)"}</span>
                          </BrutalistButton>
                        )}

                        {/* Botón Check-in Táctico */}
                        <BrutalistButton
                          variant={isCheckedIn ? "mint" : "secondary"}
                          size="compact"
                          soundEffect="none"
                          onClick={() => {
                            if (isCheckedIn) {
                              checkOutHotspot(spot.id);
                            } else {
                              checkInHotspot(spot.id);
                            }
                          }}
                          className={`!px-2.5 !py-1 !rounded-lg !text-[10.5px] font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                            isCheckedIn
                              ? "!bg-mintNeon !text-black font-black shadow-mint-glow"
                              : "!bg-white/10 hover:!bg-white/20 !text-white !border-white/10"
                          }`}
                        >
                          {isCheckedIn
                            ? (language === "es" ? "Presente ✓" : "Checked in ✓")
                            : (language === "es" ? "Llegué" : "Check-in")}
                        </BrutalistButton>

                        {/* Botón de Denuncia */}
                        <BrutalistButton
                          variant="ghost"
                          size="compact-icon"
                          soundEffect="none"
                          onClick={() => {
                            audioEngine.playPulse();
                            setReportingSpot(spot);
                          }}
                          aria-label="Denunciar este lugar"
                          className="!p-1.5 !rounded-lg text-neutral-400 hover:!text-bloodNeon hover:!bg-bloodNeon/10 !border-transparent hover:!border-bloodNeon/30 cursor-pointer"
                          title="Reportar peligro, redada o cierre"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </BrutalistButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =========================================================
          SUB-MODAL: PROPONER NUEVO PUNTO TÁCTICO
          ========================================================= */}
      {isProposeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={language === "es" ? "Proponer Nuevo Punto Táctico" : "Propose Tactical Hotspot"}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in"
        >
          <div className="w-full max-w-lg bg-obsidian border border-white/15 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-electricViolet-glow" />
                <h3 className="font-bold text-white font-mono text-sm uppercase">
                  {language === "es" ? "Proponer Nuevo Punto Táctico" : "Propose Tactical Hotspot"}
                </h3>
              </div>
              <BrutalistButton
                type="button"
                variant="ghost"
                size="compact-icon"
                soundEffect="none"
                onClick={() => setIsProposeOpen(false)}
                className="!p-1 !rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </BrutalistButton>
            </div>

            {proposeError && (
              <div className="p-2.5 rounded-xl bg-bloodNeon/20 border border-bloodNeon text-bloodNeon text-xs font-mono">
                {proposeError}
              </div>
            )}

            <form onSubmit={handleProposeSubmit} className="space-y-3 font-sans text-xs">
              <div>
                <BrutalistInput
                  label="Nombre del Punto / Espacio *"
                  required
                  placeholder="Ej. Bosques de Palermo Cruising, Sauna Dédalo..."
                  value={proposeName}
                  onChange={(e) => setProposeName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <BrutalistSelect
                  label="Categoría *"
                  value={proposeCategory}
                  onChange={(val) => setProposeCategory(val as HotspotCategory)}
                  options={[
                    { value: "cruising_area", label: language === "es" ? "Áreas de Cruising" : "Cruising Areas" },
                    { value: "darkroom_club", label: "Darkroom / Club" },
                    { value: "sauna", label: "Sauna Gay" },
                    { value: "queer_bar", label: "Bar Queer" },
                  ]}
                />

                <BrutalistSelect
                  label="Discreción Requerida"
                  value={proposeDiscretion}
                  onChange={(val) => setProposeDiscretion(val as "high" | "medium" | "low")}
                  options={[
                    { value: "high", label: "Alta (Zona oculta)" },
                    { value: "medium", label: "Media (Comercial)" },
                    { value: "low", label: "Baja (Abierto)" },
                  ]}
                />
              </div>

              <BrutalistInput
                label="Dirección o Zona Aproximada *"
                required
                placeholder="Ej. Av. Sarmiento & Av. Figueroa Alcorta, Palermo"
                value={proposeAddress}
                onChange={(e) => setProposeAddress(e.target.value)}
              />

              <BrutalistTextarea
                label="Descripción Táctica & Códigos"
                rows={2}
                placeholder="Indicaciones para ingresar, poca luz, códigos de contacto..."
                value={proposeDescription}
                onChange={(e) => setProposeDescription(e.target.value)}
              />

              <BrutalistInput
                label="Mejores Horarios"
                placeholder="Ej. 23:00 a 04:00 hs, fines de semana"
                value={proposeBestHours}
                onChange={(e) => setProposeBestHours(e.target.value)}
              />

              <div className="pt-2 flex justify-end gap-2">
                <BrutalistButton
                  type="button"
                  variant="ghost"
                  size="compact"
                  soundEffect="none"
                  onClick={() => setIsProposeOpen(false)}
                  className="!px-4 !py-2 !rounded-xl !border-white/10 text-neutral-400 hover:text-white font-mono text-xs"
                >
                  Cancelar
                </BrutalistButton>
                <BrutalistButton
                  type="submit"
                  variant="primary"
                  size="compact"
                  soundEffect="pulse"
                  className="!px-5 !py-2 !rounded-xl font-mono text-xs font-bold shadow-violet-glow"
                >
                  Enviar a Validación
                </BrutalistButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-MODAL: DENUNCIAR LUGAR (CON COMENTARIO OBLIGATORIO)
          ========================================================= */}
      {reportingSpot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Denunciar Punto Táctico"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in"
        >
          <div className="w-full max-w-md bg-obsidian border border-bloodNeon/30 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-bloodNeon">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-bold font-mono text-sm uppercase">
                  Denunciar Punto Táctico
                </h3>
              </div>
              <BrutalistButton
                type="button"
                variant="ghost"
                size="compact-icon"
                soundEffect="none"
                onClick={() => setReportingSpot(null)}
                className="!p-1 !rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </BrutalistButton>
            </div>

            <p className="text-xs text-neutral-300">
              Estás reportando <strong className="text-white">{reportingSpot.name}</strong>. Con 2 denuncias el punto queda bajo alerta preventiva comunitaria.
            </p>

            {reportError && (
              <div className="p-2.5 rounded-xl bg-bloodNeon/20 border border-bloodNeon text-bloodNeon text-xs font-mono">
                {reportError}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-3 font-sans text-xs">
              <BrutalistSelect
                label="Motivo de la Denuncia *"
                value={reportReason}
                onChange={(val) => setReportReason(val as HotspotReportReason)}
                options={reportReasons.map((r) => ({
                  value: r.id,
                  label: `${r.icon} ${r.label}`,
                }))}
              />

              <BrutalistTextarea
                label="Explicación Detallada (Obligatorio, mín. 10 caracteres) *"
                required
                rows={3}
                placeholder="Describí qué ocurrió (patrulleros frecuentes, zona peligrosa, candado puesto...)"
                value={reportComment}
                onChange={(e) => setReportComment(e.target.value)}
                hint={`Caracteres: ${reportComment.length}/10 mínimo`}
              />

              <div className="pt-2 flex justify-end gap-2">
                <BrutalistButton
                  type="button"
                  variant="ghost"
                  size="compact"
                  soundEffect="none"
                  onClick={() => setReportingSpot(null)}
                  className="!px-4 !py-2 !rounded-xl !border-white/10 text-neutral-400 hover:text-white font-mono text-xs"
                >
                  Cancelar
                </BrutalistButton>
                <BrutalistButton
                  type="submit"
                  variant="danger"
                  size="compact"
                  soundEffect="pulse"
                  disabled={reportComment.trim().length < 10}
                  className="!px-5 !py-2 !rounded-xl font-mono text-xs font-bold shadow-blood-glow disabled:opacity-50"
                >
                  Enviar Denuncia
                </BrutalistButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-MODAL: CALIFICAR CON ESTRELLAS Y TAGS
          ========================================================= */}
      {ratingSpot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Calificar Lugar"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in"
        >
          <div className="w-full max-w-md bg-obsidian border border-white/15 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <h3 className="font-bold font-mono text-sm uppercase text-white">
                  Calificar Lugar
                </h3>
              </div>
              <BrutalistButton
                type="button"
                variant="ghost"
                size="compact-icon"
                soundEffect="none"
                onClick={() => setRatingSpot(null)}
                className="!p-1 !rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </BrutalistButton>
            </div>

            <p className="text-xs text-neutral-300">
              Puntuá tu experiencia táctica en <strong className="text-white">{ratingSpot.name}</strong>:
            </p>

            <form onSubmit={handleRateSubmit} className="space-y-4 font-sans text-xs">
              {/* Estrellas 1 a 5 */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <BrutalistButton
                    key={s}
                    type="button"
                    variant="ghost"
                    size="compact-icon"
                    soundEffect="none"
                    onClick={() => {
                      audioEngine.playPulse();
                      setUserScore(s);
                    }}
                    className="!p-2 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= userScore
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          : "text-neutral-600"
                      }`}
                    />
                  </BrutalistButton>
                ))}
              </div>

              {/* Tags Tácticos */}
              <div>
                <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-2">
                  Etiquetas Tácticas (Opcional)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ratingTagOptions.map((tag) => {
                    const isSelected = userRatingTags.includes(tag);
                    return (
                      <FilterPill
                        key={tag}
                        label={tag}
                        active={isSelected}
                        variant="violet"
                        onClick={() => {
                          setUserRatingTags((prev) =>
                            isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                          );
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <BrutalistButton
                  type="button"
                  variant="ghost"
                  size="compact"
                  soundEffect="none"
                  onClick={() => setRatingSpot(null)}
                  className="!px-4 !py-2 !rounded-xl !border-white/10 text-neutral-400 hover:text-white font-mono text-xs"
                >
                  Cancelar
                </BrutalistButton>
                <BrutalistButton
                  type="submit"
                  variant="primary"
                  size="compact"
                  soundEffect="pulse"
                  className="!px-5 !py-2 !rounded-xl font-mono text-xs font-bold shadow-violet-glow"
                >
                  Guardar Calificación
                </BrutalistButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

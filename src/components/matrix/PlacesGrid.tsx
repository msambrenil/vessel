"use client";

import React, { useState, useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
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
    currentUserUid,
    language,
    t,
  } = useVessel();

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
    { id: "cruising_area", label: language === "es" ? "Al Aire Libre" : "Cruising", icon: "🌲" },
    { id: "nightlife", label: language === "es" ? "Fiestas" : "Nightlife", icon: "🎉" },
    { id: "darkroom_club", label: language === "es" ? "Salas Oscuras" : "Darkrooms", icon: "⚡" },
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
          SUB-HEADER CONTEXTUAL DE LUGARES & FIESTAS (Sticky Top)
          ========================================================= */}
      {!hideStickyHeader && (
        <div className="p-2 sm:p-2.5 bg-obsidian-deep/95 border-b border-white/10 sticky top-[52px] sm:top-[56px] z-20 space-y-2 shadow-md backdrop-blur-md">
          {/* Fila 1: Búsqueda de Lugares + Botón Proponer Lugar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none ${
                searchQuery ? "text-electricViolet-glow" : "text-neutral-400"
              }`} />
              <input
                type="text"
                placeholder={t.filters?.searchPlacesPlaceholder || (language === "es" ? "Buscar sauna, cruising, fiesta, boliche..." : "Search sauna, cruising, club, party...")}
                aria-label="Buscar lugares o fiestas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[38px] bg-white/5 border border-white/10 rounded-xl text-white text-xs pl-10 pr-9 py-1.5 placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-electricViolet/50 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setSearchQuery("");
                  }}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Botón Destacado: Proponer Lugar */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setIsProposeOpen(true);
              }}
              aria-label="Proponer nuevo punto táctico"
              className="px-3 min-h-[38px] rounded-xl bg-electricViolet text-white border border-electricViolet-glow font-bold shadow-violet-glow hover:bg-electricViolet/90 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-mono active:scale-95 transition-all flex-shrink-0"
              title="Proponer nuevo punto de cruising, sauna o espacio"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline uppercase text-[10.5px]">
                {t.filters?.proposePlaceBtn || (language === "es" ? "Proponer Lugar" : "Propose Place")}
              </span>
            </button>
          </div>

          {/* Fila 2: Píldoras de Categorías de Lugares */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1 scroll-smooth">
            <div className="flex items-center gap-1 text-[9.5px] font-mono font-extrabold uppercase text-neutral-400 tracking-wider flex-shrink-0 pr-1.5 border-r border-white/10">
              <span className="text-electricViolet-glow">📍</span>
              <span>{language === "es" ? "Lugar:" : "Type:"}</span>
            </div>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 min-h-[32px] rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
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

          {/* Fila 3: Resumen, Ordenamiento y Modo Viajero */}
          <div className="flex items-center justify-between text-xs text-neutral-400 px-0.5 pt-0.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-extrabold text-white font-mono flex items-center gap-1.5 text-[11px] sm:text-xs flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping inline-block" />
                <span>
                  {filteredHotspots.length + filteredEvents.length} {language === "es" ? "Lugares & Fiestas" : "Spots & Parties"}
                </span>
              </span>

              <span className="text-neutral-600 hidden sm:inline">•</span>

              {/* Selector de Ordenamiento */}
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
                >
                  📍 {language === "es" ? "Cerca" : "Dist"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setSortBy("rating");
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    sortBy === "rating"
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
                    setSortBy("activity");
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    sortBy === "activity"
                      ? "bg-electricViolet text-white font-black shadow-violet-soft"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  👥 {language === "es" ? "Concurrencia" : "Active"}
                </button>
              </div>
            </div>

            {/* Botón Modo Viajero en la Fila de Opciones */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                openTravelModal();
              }}
              aria-label={travelMode.isActive ? `Modo Viajero Activo: ${travelMode.cityName}` : "Activar Modo Viajero"}
              title={travelMode.isActive ? `Modo Viajero: ${travelMode.cityName} (${travelMode.country}) • Tocar para cambiar o volver` : "Simular ubicación en otra ciudad"}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono text-[9.5px] font-bold border transition-all cursor-pointer active:scale-95 flex-shrink-0 ${
                travelMode.isActive
                  ? "bg-electricViolet text-white border-electricViolet-glow shadow-violet-glow animate-pulse"
                  : "bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Plane className={`w-3 h-3 ${travelMode.isActive ? "text-white" : "text-electricViolet-glow"}`} />
              <span className="truncate max-w-[100px] sm:max-w-[130px]">
                {travelMode.isActive ? `✈️ ${travelMode.cityName}` : "✈️ Viajero"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          CONTENIDO: LISTADO TÁCTICO DE LUGARES Y FIESTAS
          ========================================================= */}
      <div className="p-3 sm:p-4 space-y-4">
        {/* Sección: Fiestas & Cartelera Nocturna (Si aplica a la categoría seleccionada) */}
        {filteredEvents.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-electricViolet-glow" />
                <h3 className="font-mono text-xs font-extrabold uppercase text-white tracking-wider">
                  {language === "es" ? "Fiestas & Boliches Destacados" : "Featured Parties & Nightlife"}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                {filteredEvents.length} {language === "es" ? "eventos" : "events"}
              </span>
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
                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playPulse();
                              onOpenNightlifeModal();
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold bg-white/5 border border-white/10 text-neutral-300 hover:text-white cursor-pointer"
                          >
                            {language === "es" ? "Pista de Baile" : "Floor"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            toggleEventRsvp(ev.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                            isGoing
                              ? "bg-mintNeon text-black font-black shadow-mint-glow"
                              : "bg-electricViolet text-white border border-electricViolet-glow hover:bg-electricViolet/90"
                          }`}
                        >
                          {isGoing ? "Asistiré ✓" : "Voy"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sección: Puntos Tácticos & Cruising (Hotspots) */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-electricViolet-glow" />
              <h3 className="font-mono text-xs font-extrabold uppercase text-white tracking-wider">
                {language === "es" ? "Puntos Tácticos & Cruising" : "Tactical Hotspots & Cruising"}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {filteredHotspots.length} {language === "es" ? "puntos activos" : "active spots"}
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
              <button
                type="button"
                onClick={() => setIsProposeOpen(true)}
                className="px-4 py-2 rounded-xl bg-electricViolet text-white font-mono text-xs font-bold shadow-violet-glow cursor-pointer"
              >
                [ + Proponer Este Lugar ]
              </button>
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
                              {spot.address} • ~{formatDistance((spot as any).computedDistance || 300)}
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
                        <button
                          type="button"
                          onClick={() => setExpandedReportsId(isReportsExpanded ? null : spot.id)}
                          className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-bloodNeon cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{spot.reports.length} advertencias comunitarias</span>
                          </span>
                          {isReportsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

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
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setRatingSpot(spot);
                          }}
                          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
                          title="Calificar este lugar"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{spot.rating ? spot.rating.toFixed(1) : "0.0"}</span>
                          <span className="text-neutral-500 text-[10px]">
                            ({spot.ratingsCount || 0})
                          </span>
                        </button>

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
                          <button
                            type="button"
                            disabled={hasAlreadyConfirmed}
                            onClick={async () => {
                              await confirmHotspot(spot.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold flex items-center gap-1 transition-all ${
                              hasAlreadyConfirmed
                                ? "bg-white/5 text-neutral-500 border border-white/5 cursor-default"
                                : "bg-electricViolet/20 border border-electricViolet text-electricViolet-glow hover:bg-electricViolet/30 cursor-pointer active:scale-95"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{hasAlreadyConfirmed ? "Confirmaste ✓" : "Confirmar (3)"}</span>
                          </button>
                        )}

                        {/* Botón Check-in Táctico */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isCheckedIn) {
                              checkOutHotspot(spot.id);
                            } else {
                              checkInHotspot(spot.id);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                            isCheckedIn
                              ? "bg-mintNeon text-black font-black shadow-mint-glow"
                              : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                          }`}
                        >
                          {isCheckedIn
                            ? (language === "es" ? "Presente ✓" : "Checked in ✓")
                            : (language === "es" ? "Llegué" : "Check-in")}
                        </button>

                        {/* Botón de Denuncia */}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setReportingSpot(spot);
                          }}
                          aria-label="Denunciar este lugar"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-bloodNeon hover:bg-bloodNeon/10 border border-transparent hover:border-bloodNeon/30 cursor-pointer"
                          title="Reportar peligro, redada o cierre"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          SUB-MODAL: PROPONER NUEVO PUNTO TÁCTICO
          ========================================================= */}
      {isProposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-lg bg-obsidian border border-white/15 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-electricViolet-glow" />
                <h3 className="font-bold text-white font-mono text-sm uppercase">
                  {language === "es" ? "Proponer Nuevo Punto Táctico" : "Propose Tactical Hotspot"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProposeOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {proposeError && (
              <div className="p-2.5 rounded-xl bg-bloodNeon/20 border border-bloodNeon text-bloodNeon text-xs font-mono">
                {proposeError}
              </div>
            )}

            <form onSubmit={handleProposeSubmit} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-1">
                  Nombre del Punto / Espacio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bosques de Palermo Cruising, Sauna Dédalo..."
                  value={proposeName}
                  onChange={(e) => setProposeName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricViolet"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-1">
                    Categoría *
                  </label>
                  <select
                    value={proposeCategory}
                    onChange={(e) => setProposeCategory(e.target.value as HotspotCategory)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricViolet"
                  >
                    <option value="cruising_area">Cruising / Aire Libre</option>
                    <option value="darkroom_club">Darkroom / Club</option>
                    <option value="sauna">Sauna Gay</option>
                    <option value="queer_bar">Bar Queer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-1">
                    Discreción Requerida
                  </label>
                  <select
                    value={proposeDiscretion}
                    onChange={(e) => setProposeDiscretion(e.target.value as "high" | "medium" | "low")}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricViolet"
                  >
                    <option value="high">Alta (Zona oculta)</option>
                    <option value="medium">Media (Comercial)</option>
                    <option value="low">Baja (Abierto)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-1">
                  Dirección o Zona Aproximada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Av. Sarmiento & Av. Figueroa Alcorta, Palermo"
                  value={proposeAddress}
                  onChange={(e) => setProposeAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricViolet"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-1">
                  Descripción Táctica & Códigos
                </label>
                <textarea
                  rows={2}
                  placeholder="Indicaciones para ingresar, poca luz, códigos de contacto..."
                  value={proposeDescription}
                  onChange={(e) => setProposeDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricViolet"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-1">
                  Mejores Horarios
                </label>
                <input
                  type="text"
                  placeholder="Ej. 23:00 a 04:00 hs, fines de semana"
                  value={proposeBestHours}
                  onChange={(e) => setProposeBestHours(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricViolet"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProposeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electricViolet text-white font-mono text-xs font-bold shadow-violet-glow cursor-pointer"
                >
                  Enviar a Validación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-MODAL: DENUNCIAR LUGAR (CON COMENTARIO OBLIGATORIO)
          ========================================================= */}
      {reportingSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md bg-obsidian border border-bloodNeon/30 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-bloodNeon">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-bold font-mono text-sm uppercase">
                  Denunciar Punto Táctico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportingSpot(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
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
              <div>
                <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-1">
                  Motivo de la Denuncia *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as HotspotReportReason)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-bloodNeon"
                >
                  {reportReasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.icon} {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-mono text-[10.5px] uppercase mb-1">
                  Explicación Detallada (Obligatorio, mín. 10 caracteres) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describí qué ocurrió (patrulleros frecuentes, zona peligrosa, candado puesto...)"
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-bloodNeon"
                />
                <span className="text-[10px] text-neutral-500 font-mono">
                  Caracteres: {reportComment.length}/10 mínimo
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportingSpot(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reportComment.trim().length < 10}
                  className="px-5 py-2 rounded-xl bg-bloodNeon text-white font-mono text-xs font-bold shadow-blood-glow disabled:opacity-50 cursor-pointer"
                >
                  Enviar Denuncia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-MODAL: CALIFICAR CON ESTRELLAS Y TAGS
          ========================================================= */}
      {ratingSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md bg-obsidian border border-white/15 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <h3 className="font-bold font-mono text-sm uppercase text-white">
                  Calificar Lugar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRatingSpot(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Puntuá tu experiencia táctica en <strong className="text-white">{ratingSpot.name}</strong>:
            </p>

            <form onSubmit={handleRateSubmit} className="space-y-4 font-sans text-xs">
              {/* Estrellas 1 a 5 */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setUserScore(s);
                    }}
                    className="p-2 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= userScore
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          : "text-neutral-600"
                      }`}
                    />
                  </button>
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
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setUserRatingTags((prev) =>
                            isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-electricViolet text-white border border-electricViolet-glow font-bold shadow-violet-soft"
                            : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingSpot(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-electricViolet text-white font-mono text-xs font-bold shadow-violet-glow cursor-pointer"
                >
                  Guardar Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

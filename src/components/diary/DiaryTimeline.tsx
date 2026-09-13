"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { DiaryEntry, ExitProtocol } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleActionMeta, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  MapPin,
  Star,
  Flame,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Bell,
  MessageSquareHeart,
  Plus,
  Filter,
  X,
  Zap,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

interface DiaryTimelineProps {
  onOpenCreate: () => void;
  onOpenChat?: (profileId: string) => void;
}

export const DiaryTimeline: React.FC<DiaryTimelineProps> = ({
  onOpenCreate,
  onOpenChat,
}) => {
  const {
    diaryEntries,
    openCreateDiaryModal,
    deleteDiaryEntry,
    toggleHealthReminderResolved,
    setSelectedProfile,
    setActiveChatProfileId,
    transmitSignal,
    transmissions,
    profiles,
    language,
    t,
  } = useVessel();

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
    const desc = isFast
      ? (language === "es" ? "Protocolo de Salida: Encuentro puntual sin sobremesa" : "Exit Protocol: Fast encounter, no lingering")
      : isCuddle
      ? (language === "es" ? "Protocolo de Salida: Espacio para ducha y mimos (20-30 min)" : "Exit Protocol: Space for shower and cuddle")
      : (language === "es" ? "Protocolo de Salida: Posibilidad de pasar la noche si hay química" : "Exit Protocol: Sleepover if mutual vibe");

    return (
      <div
        title={desc}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/50 text-amber-200 backdrop-blur-md shadow-sm"
      >
        <span className="text-xs leading-none">{icon}</span>
        <span className="font-mono text-[10px] font-black uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "completed" | "upcoming">("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});

  const toggleNoteReveal = (id: string) => {
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    audioEngine.playPulse();
  };

  const handleFilterChange = (type: "all" | "completed" | "upcoming") => {
    setFilterType(type);
    audioEngine.playPulse();
  };

  const handleRatingFilter = () => {
    setMinRating((prev) => (prev === 5 ? 0 : 5));
    audioEngine.playPulse();
  };

  const filteredEntries = diaryEntries.filter((entry) => {
    if (filterType === "completed" && entry.isUpcoming) return false;
    if (filterType === "upcoming" && !entry.isUpcoming) return false;

    if (minRating > 0 && (!entry.satisfaction || entry.satisfaction.expectationsRating < minRating)) {
      return false;
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchCodename = entry.person.codename.toLowerCase().includes(q);
      const matchLocation = entry.location.name.toLowerCase().includes(q);
      const matchNotes = entry.privateNotes.toLowerCase().includes(q);
      const matchTags = entry.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchCodename && !matchLocation && !matchNotes && !matchTags) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Barra de Búsqueda y Filtros Rápidos */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por persona, lugar, etiquetas o notas confidenciales..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-obsidian-surface/90 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-electricViolet focus:ring-1 focus:ring-electricViolet shadow-card-elevation font-mono backdrop-blur-md"
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

        {/* Chips de Filtrado Táctil */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => handleFilterChange("all")}
            aria-selected={filterType === "all"}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex items-center gap-1.5 ${
              filterType === "all"
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
                : "bg-obsidian-surface/80 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>Todas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${filterType === "all" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-400"}`}>
              {diaryEntries.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("completed")}
            aria-selected={filterType === "completed"}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 flex items-center gap-1.5 ${
              filterType === "completed"
                ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft font-extrabold"
                : "bg-obsidian-surface/80 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>Concretadas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${filterType === "completed" ? "bg-white/20 text-white" : "bg-white/10 text-neutral-400"}`}>
              {diaryEntries.filter((e) => !e.isUpcoming).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("upcoming")}
            aria-selected={filterType === "upcoming"}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloodNeon active:scale-95 flex items-center gap-1.5 ${
              filterType === "upcoming"
                ? "bg-bloodNeon text-white border-bloodNeon shadow-blood-glow font-extrabold"
                : "bg-obsidian-surface/80 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>Agendadas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${filterType === "upcoming" ? "bg-black text-bloodNeon" : "bg-bloodNeon/20 text-bloodNeon"}`}>
              {diaryEntries.filter((e) => e.isUpcoming).length}
            </span>
          </button>

          {/* Filtro por Estrellas */}
          <button
            type="button"
            onClick={handleRatingFilter}
            aria-pressed={minRating === 5}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              minRating === 5
                ? "bg-amber-400/20 border-amber-400/50 text-amber-300 font-extrabold shadow-sm"
                : "bg-obsidian-surface/80 border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Top 5★</span>
          </button>
        </div>
      </div>

      {/* Lista / Timeline de Entradas */}
      {filteredEntries.length === 0 ? (
        <div className="bg-obsidian-surface/60 p-8 rounded-3xl border border-white/10 text-center space-y-3 shadow-card-elevation backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-mono font-bold text-white uppercase">
              No se encontraron entradas
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              Probá cambiando los filtros de búsqueda o documentá un nuevo encuentro.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreate}
            className="px-4 py-2.5 min-h-[44px] bg-electricViolet text-white hover:bg-electricViolet-glow font-bold rounded-2xl text-xs font-mono shadow-violet-soft transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
          >
            + Documentar Encuentro
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const isRevealed = !!revealedNotes[entry.id];
            const linkedProfile = entry.person.profileId
              ? profiles.find((p) => p.id === entry.person.profileId)
              : null;

            const effectiveRole = entry.person.role || (linkedProfile ? linkedProfile.role : "Versatile");
            const roleAction = getRoleActionMeta(effectiveRole, language, entry.person.codename);
            const isSent = Boolean(linkedProfile && transmissions[linkedProfile.id]);
            const signalCount = linkedProfile ? (transmissions[linkedProfile.id] || 0) : 0;
            const exitProtocol = linkedProfile?.exitProtocol || "fast_encounter";

            const isImmediateHost = linkedProfile
              ? (linkedProfile.mobility === "Tengo depto / lugar" ||
                 linkedProfile.mobility === "Tengo sitio" ||
                 linkedProfile.mobility === "Tengo lugar y me muevo" ||
                 linkedProfile.mobility === "Tengo sitio/me desplazo")
              : false;

            return (
              <div
                key={entry.id}
                className={`bg-obsidian-surface/90 rounded-3xl border p-4 sm:p-5 space-y-3.5 shadow-card-elevation transition-all backdrop-blur-md ${
                  entry.isUpcoming
                    ? "border-bloodNeon/50 shadow-blood-glow"
                    : "border-white/10 hover:border-electricViolet/40"
                }`}
              >
                {/* NIVEL 1: IDENTIDAD, TELEMETRÍA, FECHA/HORA & ESTADO */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      role={linkedProfile ? "button" : undefined}
                      tabIndex={linkedProfile ? 0 : undefined}
                      onClick={() => {
                        if (linkedProfile) {
                          setSelectedProfile(linkedProfile);
                          audioEngine.playPulse();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (linkedProfile && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setSelectedProfile(linkedProfile);
                          audioEngine.playPulse();
                        }
                      }}
                      className={`relative flex-shrink-0 ${
                        linkedProfile
                          ? "cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet rounded-2xl"
                          : ""
                      }`}
                      title={linkedProfile ? "Ver expediente de perfil en matriz" : undefined}
                    >
                      <img
                        src={
                          entry.person.avatarUrl ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                        }
                        alt={entry.person.codename}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 group-hover:border-electricViolet transition-colors shadow-sm"
                      />
                      {linkedProfile && (
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center text-[9px] font-bold font-mono ${
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

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => {
                            if (linkedProfile) {
                              setSelectedProfile(linkedProfile);
                              audioEngine.playPulse();
                            }
                          }}
                          className={`font-bold text-sm sm:text-base text-white font-mono truncate ${
                            linkedProfile ? "hover:text-electricViolet-glow cursor-pointer" : ""
                          }`}
                        >
                          {entry.person.codename}
                        </span>
                        {entry.person.age && (
                          <span className="text-xs text-neutral-400 font-mono">
                            {entry.person.age} años
                          </span>
                        )}
                        {effectiveRole && (
                          <span className="text-[9px] font-mono font-bold text-electricViolet-glow bg-electricViolet/15 border border-electricViolet/30 px-2 py-0.5 rounded-full uppercase">
                            {getRoleDisplayLabel(effectiveRole, language)}
                          </span>
                        )}
                        {isImmediateHost && (
                          <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 rounded-full uppercase">
                            🏠 Lugar
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-white font-mono">
                          <Calendar className="w-3.5 h-3.5 text-electricViolet-glow" />
                          {entry.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-neutral-300 font-mono">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          {entry.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badge de Estado / Rating */}
                  <div className="flex-shrink-0">
                    {entry.isUpcoming ? (
                      <span className="px-3 py-1 bg-bloodNeon/20 border border-bloodNeon/60 text-bloodNeon text-[10px] font-mono font-bold rounded-xl uppercase tracking-wider animate-pulse shadow-blood-glow flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-bloodNeon" />
                        Programada
                      </span>
                    ) : entry.satisfaction ? (
                      <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-xl shadow-sm">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-mono font-bold text-white">
                          {entry.satisfaction.expectationsRating}/5
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Ubicación del Encuentro */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/50 border border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-neutral-300 truncate max-w-[280px]">
                    <MapPin className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                    <span className="truncate font-mono">{entry.location.name}</span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-electricViolet-glow uppercase tracking-wider flex-shrink-0 px-2 py-0.5 rounded-lg bg-electricViolet/10 border border-electricViolet/20">
                    {entry.encounterType.replace("_", " ")}
                  </div>
                </div>

                {/* NIVEL 2: FILA DEDICADA DE PROTOCOLO DE SALIDA & ACUERDOS (100% LIBRE DE COLISIONES) */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 min-w-0">
                  {renderExitProtocolPill(exitProtocol)}

                  {linkedProfile?.onTheClock?.isActive && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-400 text-amber-300 font-mono text-[9.5px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>⚡ YA ({linkedProfile.onTheClock.durationMinutes || 45}m)</span>
                    </span>
                  )}
                </div>

                {/* Métricas de Satisfacción detalladas (si está concretada) */}
                {!entry.isUpcoming && entry.satisfaction && (
                  <div className="grid grid-cols-4 gap-2 bg-obsidian-deep/80 p-2.5 rounded-2xl border border-white/5 text-center">
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                        Expectativa
                      </span>
                      <span className="text-xs font-bold text-white font-mono">
                        {entry.satisfaction.expectationsRating}/5
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                        Química
                      </span>
                      <span className="text-xs font-bold text-bloodNeon font-mono flex items-center justify-center gap-0.5">
                        <Flame className="w-3 h-3" />
                        {entry.satisfaction.chemistryLevel}/5
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                        Límites
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono flex items-center justify-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        {entry.satisfaction.boundariesRespect}/5
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                        Repetir
                      </span>
                      <span className="text-xs font-bold text-white font-mono truncate block">
                        {entry.satisfaction.wouldRepeat === "yes"
                          ? "🔥 Sí"
                          : entry.satisfaction.wouldRepeat === "maybe"
                          ? "🤔 Quizá"
                          : "⛔ No"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bitácora de Notas Privadas Cifradas */}
                {entry.privateNotes && (
                  <div className="bg-obsidian-deep/80 p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span className="flex items-center gap-1.5 font-bold text-mintNeon uppercase">
                        <Lock className="w-3.5 h-3.5" />
                        Notas Confidenciales Cifradas
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleNoteReveal(entry.id)}
                        className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center gap-1 font-mono transition-all cursor-pointer"
                      >
                        {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-electricViolet-glow" />}
                        <span>{isRevealed ? "Ocultar" : "Revelar"}</span>
                      </button>
                    </div>

                    <p
                      className={`text-xs text-neutral-200 leading-relaxed font-mono transition-all ${
                        isRevealed ? "blur-none" : "blur-sm select-none"
                      }`}
                    >
                      {entry.privateNotes}
                    </p>
                  </div>
                )}

                {/* Etiquetas de Contexto */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-neutral-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Alerta de Salud Preventiva / PrEP */}
                {entry.healthRoutineReminder?.enabled && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/35 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono">
                      <Bell className="w-4 h-4" />
                      <span>Control de Rutina / PrEP: <strong>{entry.healthRoutineReminder.dueDate}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleHealthReminderResolved(entry.id)}
                      className={`px-3 py-1.5 min-h-[38px] rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        entry.healthRoutineReminder.isResolved
                          ? "bg-mintNeon text-obsidian-deep font-black border-mintNeon shadow-mint-glow"
                          : "bg-mintNeon/20 text-mintNeon border-mintNeon/40 hover:bg-mintNeon hover:text-obsidian-deep"
                      }`}
                    >
                      {entry.healthRoutineReminder.isResolved ? "✓ Completado" : "Pendiente"}
                    </button>
                  </div>
                )}

                {/* NIVEL 3: BOTONERA ERGONÓMICA AISLADA (Zona del Pulgar, Touch Targets >= 44px) */}
                <div className="pt-2.5 mt-2.5 border-t border-white/10 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {/* Botón 1: Ver Ficha Completa */}
                    <button
                      type="button"
                      onClick={() => {
                        if (linkedProfile) {
                          audioEngine.playPulse();
                          setSelectedProfile(linkedProfile);
                        }
                      }}
                      disabled={!linkedProfile}
                      aria-label={`Ver ficha completa de ${entry.person.codename}`}
                      className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all border shadow-sm ${
                        linkedProfile
                          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-neutral-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                          : "bg-white/[0.02] border-white/5 text-neutral-600 cursor-not-allowed"
                      }`}
                    >
                      <span>Ficha</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    {/* Botón 2: Pulso Cinético de Rol con Sonido Sub-Bass */}
                    <button
                      type="button"
                      onClick={() => {
                        if (linkedProfile) {
                          audioEngine.playSignalSent();
                          transmitSignal(linkedProfile.id);
                        }
                      }}
                      disabled={!linkedProfile}
                      aria-label={`Enviar pulso a ${entry.person.codename}`}
                      title={
                        linkedProfile
                          ? isSent
                            ? roleAction.sentLabel
                            : roleAction.tooltipTemplate
                          : "Contacto externo no registrado en VESSEL"
                      }
                      className={`py-2.5 px-2 min-h-[44px] border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm ${
                        !linkedProfile
                          ? "bg-white/[0.02] border-white/5 text-neutral-600 cursor-not-allowed"
                          : isSent
                          ? "bg-electricViolet text-white border-electricViolet shadow-violet-soft scale-100 cursor-pointer active:scale-95"
                          : "bg-electricViolet/15 border-electricViolet/60 text-electricViolet-glow hover:bg-electricViolet hover:text-white cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                      }`}
                    >
                      <span className="text-base leading-none">{roleAction.icon}</span>
                      <span className="truncate">
                        {!linkedProfile
                          ? "Pulso"
                          : isSent
                          ? (language === "es" ? "✓ Enviado" : "✓ Sent")
                          : (roleAction.shortLabel || "Pulso")}
                      </span>
                      {signalCount > 0 && (
                        <span className="text-[9.5px] font-mono font-black ml-0.5">
                          +{signalCount}
                        </span>
                      )}
                    </button>

                    {/* Botón 3: Abrir Darkroom Chat Inmediato (1 Tap) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (linkedProfile) {
                          audioEngine.playPulse();
                          if (onOpenChat) {
                            onOpenChat(linkedProfile.id);
                          } else {
                            setActiveChatProfileId(linkedProfile.id);
                          }
                        }
                      }}
                      disabled={!linkedProfile}
                      aria-label={`Abrir chat con ${entry.person.codename}`}
                      className={`py-2.5 px-2 min-h-[44px] rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-violet-soft ${
                        linkedProfile
                          ? "bg-electricViolet text-white hover:bg-electricViolet-glow cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                          : "bg-white/[0.02] border border-white/5 text-neutral-600 cursor-not-allowed"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 stroke-[2.4]" />
                      <span>{t.card?.openChat || "Chat"}</span>
                    </button>
                  </div>

                  {/* Acciones Secundarias de Edición / Borrado */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openCreateDiaryModal(undefined, entry.id)}
                      className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer active:scale-95"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDiaryEntry(entry.id)}
                      className="px-3 py-1.5 min-h-[36px] rounded-xl bg-white/5 hover:bg-bloodNeon/20 text-neutral-400 hover:text-bloodNeon text-xs font-mono flex items-center gap-1.5 transition-all border border-transparent hover:border-bloodNeon/40 cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Borrar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { StaffMember } from "@/types/admin";
import { TacticalHotspot, HotspotStatus, HotspotReport } from "@/types/vessel";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  Compass,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Eye,
  Star,
  Users,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  X,
  Radio,
} from "lucide-react";

interface HotspotsManagementTabProps {
  currentStaff: StaffMember;
}

export const HotspotsManagementTab: React.FC<HotspotsManagementTabProps> = ({
  currentStaff,
}) => {
  const {
    tacticalHotspots,
    adminUpdateHotspotStatus,
    adminDismissReports,
    adminDeleteHotspot,
    language,
  } = useVessel();

  const [statusFilter, setStatusFilter] = useState<"all" | HotspotStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportsSpot, setSelectedReportsSpot] = useState<TacticalHotspot | null>(null);

  // Métricas
  const totalSpots = tacticalHotspots.length;
  const proposedCount = tacticalHotspots.filter((h) => h.status === "proposed").length;
  const activeCount = tacticalHotspots.filter((h) => h.status === "active").length;
  const flaggedCount = tacticalHotspots.filter((h) => h.status === "flagged").length;
  const suspendedCount = tacticalHotspots.filter((h) => h.status === "suspended").length;
  const totalReportsCount = tacticalHotspots.reduce((sum, h) => sum + (h.reportsCount || 0), 0);

  // Filtrado
  const filteredHotspots = tacticalHotspots.filter((h) => {
    if (statusFilter !== "all" && h.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchAddress = h.address.toLowerCase().includes(q);
      const matchCreator = h.creatorAlias?.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchCreator) return false;
    }
    return true;
  });

  const getStatusBadge = (status: HotspotStatus) => {
    switch (status) {
      case "proposed":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
            PROPUESTO (EN VALIDACIÓN)
          </span>
        );
      case "flagged":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/50 animate-pulse">
            ALERTA / DENUNCIADO
          </span>
        );
      case "suspended":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700">
            SUSPENDIDO
          </span>
        );
      case "active":
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            ACTIVO & OFICIAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* 1. Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-obsidian-surface border border-white/10 space-y-1">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Total Puntos</span>
          <div className="text-xl font-black text-white flex items-center gap-1.5">
            <Compass className="w-5 h-5 text-electricViolet" />
            <span>{totalSpots}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
          <span className="text-[10px] text-amber-300 uppercase tracking-wider block">En Validación</span>
          <div className="text-xl font-black text-amber-400">{proposedCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] text-emerald-300 uppercase tracking-wider block">Activos</span>
          <div className="text-xl font-black text-emerald-400">{activeCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-bloodNeon/15 border border-bloodNeon/30 space-y-1">
          <span className="text-[10px] text-bloodNeon uppercase tracking-wider block">Bajo Alerta</span>
          <div className="text-xl font-black text-bloodNeon">{flaggedCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Denuncias Totales</span>
          <div className="text-xl font-black text-white flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{totalReportsCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-obsidian-surface border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filtro por estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-black"
                : "bg-white/5 text-neutral-400 hover:text-white"
            }`}
          >
            Todos ({totalSpots})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("proposed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "proposed"
                ? "bg-amber-500 text-black"
                : "bg-white/5 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            Propuestas ({proposedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "active"
                ? "bg-emerald-500 text-black"
                : "bg-white/5 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            Activos ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("flagged")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "flagged"
                ? "bg-bloodNeon text-white"
                : "bg-white/5 text-bloodNeon hover:bg-bloodNeon/20"
            }`}
          >
            Alertas ({flaggedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("suspended")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "suspended"
                ? "bg-neutral-700 text-white"
                : "bg-white/5 text-neutral-400 hover:text-white"
            }`}
          >
            Suspendidos ({suspendedCount})
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, zona..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-electricViolet"
          />
        </div>
      </div>

      {/* 3. Lista de Hotspots y Controles de Moderación */}
      <div className="space-y-3">
        {filteredHotspots.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 bg-obsidian-surface rounded-2xl border border-white/5 text-xs">
            No hay puntos tácticos en esta categoría o búsqueda.
          </div>
        ) : (
          filteredHotspots.map((spot) => (
            <div
              key={spot.id}
              className={`p-4 rounded-2xl border bg-obsidian-surface/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                spot.status === "flagged"
                  ? "border-bloodNeon/40 bg-bloodNeon/5"
                  : spot.status === "proposed"
                  ? "border-amber-500/30"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Información del Lugar */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white tracking-wide">
                    {spot.name}
                  </span>
                  {getStatusBadge(spot.status)}
                  <span className="text-[10px] text-neutral-400 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    {spot.category.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-mintNeon bg-mintNeon/10 border border-mintNeon/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <Users className="w-3 h-3 text-mintNeon" />
                    <span>{spot.activeVesselsCount} en vivo</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-400 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{spot.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{spot.rating > 0 ? spot.rating.toFixed(1) : "Sin votos"} ({spot.ratingsCount || 0})</span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Confirmaciones: <strong className="text-white">{spot.confirmationsCount || 0}</strong>
                  </div>
                  {spot.creatorAlias && (
                    <div className="text-[11px] text-neutral-500">
                      Creado por: <strong className="text-electricViolet-glow">{spot.creatorAlias}</strong>
                    </div>
                  )}
                </div>

                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {spot.description}
                </p>

                {/* Banner de Denuncias si las tiene */}
                {spot.reports && spot.reports.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-bloodNeon font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{spot.reports.length} Denuncias con justificación</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        audioEngine.playPulse();
                        setSelectedReportsSpot(spot);
                      }}
                      className="text-[11px] text-electricViolet-glow underline hover:text-white cursor-pointer font-bold"
                    >
                      Ver comentarios de denuncia →
                    </button>
                  </div>
                )}
              </div>

              {/* Botones de Acción Administrativa */}
              <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0 lg:border-l lg:border-white/10 lg:pl-4">
                {/* Activar / Aprobar */}
                {spot.status !== "active" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await adminUpdateHotspotStatus(spot.id, "active");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Aprobar y activar en la app"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprobar</span>
                  </button>
                )}

                {/* Marcar Alerta */}
                {spot.status !== "flagged" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await adminUpdateHotspotStatus(spot.id, "flagged");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Marcar como lugar bajo alerta preventiva"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Alerta</span>
                  </button>
                )}

                {/* Suspender */}
                {spot.status !== "suspended" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await adminUpdateHotspotStatus(spot.id, "suspended");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-bloodNeon/15 hover:bg-bloodNeon/25 text-bloodNeon border border-bloodNeon/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Suspender y ocultar temporalmente"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Suspender</span>
                  </button>
                )}

                {/* Limpiar denuncias */}
                {spot.reports && spot.reports.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      await adminDismissReports(spot.id);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Desestimar denuncias y dejar en limpio"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-mintNeon" />
                    <span>Limpiar</span>
                  </button>
                )}

                {/* Eliminar definitivo */}
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`¿Estás seguro de eliminar definitivamente "${spot.name}"?`)) {
                      await adminDeleteHotspot(spot.id);
                    }
                  }}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-bloodNeon/20 text-neutral-500 hover:text-bloodNeon border border-white/5 hover:border-bloodNeon/30 transition-all cursor-pointer"
                  title="Eliminar punto de la base de datos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================================================
          SUB-MODAL ADMIN: INSPECCIÓN DE DENUNCIAS Y COMENTARIOS
          ========================================================= */}
      {selectedReportsSpot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
          <div className="w-full max-w-lg bg-obsidian-deep border border-bloodNeon/40 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-bloodNeon/20 pb-3">
              <div className="flex items-center gap-2 text-bloodNeon">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-black uppercase text-white">
                    Denuncias Recibidas
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {selectedReportsSpot.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportsSpot(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {(!selectedReportsSpot.reports || selectedReportsSpot.reports.length === 0) ? (
                <div className="py-6 text-center text-neutral-500 text-xs font-mono">
                  No hay denuncias registradas para este punto.
                </div>
              ) : (
                selectedReportsSpot.reports.map((report, idx) => (
                  <div
                    key={report.id || idx}
                    className="p-3 rounded-xl bg-black/50 border border-bloodNeon/20 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span className="px-2 py-0.5 rounded bg-bloodNeon/20 text-bloodNeon font-bold uppercase">
                        {report.reason.replace("_", " ")}
                      </span>
                      <span>{new Date(report.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="text-neutral-400 text-[11px]">
                      Usuario denunciante: <span className="text-white font-mono">{report.userAlias || report.userId}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.03] text-neutral-200 font-sans leading-relaxed border border-white/5 mt-1">
                      "{report.comment}"
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={async () => {
                  await adminDismissReports(selectedReportsSpot.id);
                  setSelectedReportsSpot(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Desestimar Todas y Limpiar
              </button>

              <button
                type="button"
                onClick={() => setSelectedReportsSpot(null)}
                className="px-4 py-1.5 rounded-xl bg-electricViolet text-white text-xs font-bold hover:bg-electricViolet-glow cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

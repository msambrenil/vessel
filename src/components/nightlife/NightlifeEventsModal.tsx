"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { NightlifeEvent } from "@/types/vessel";
import { EventDetailModal } from "./EventDetailModal";
import { ClubFloorRadarModal } from "./ClubFloorRadarModal";
import { MissedConnectionsModal } from "./MissedConnectionsModal";
import { OpticalBeaconModal } from "./OpticalBeaconModal";
import { AfterHoursModal } from "./AfterHoursModal";
import { WingmanModal } from "./WingmanModal";
import { SpikedDrinkAlertModal } from "./SpikedDrinkAlertModal";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  PartyPopper,
  Calendar,
  MapPin,
  Clock,
  Radio,
  Eye,
  Users,
  Zap,
  Moon,
  X,
  Sparkles,
  Flame,
  Check,
} from "lucide-react";

export const NightlifeEventsModal: React.FC = () => {
  const {
    isNightlifeModalOpen,
    closeNightlifeModal,
    nightlifeEvents,
    activeCheckin,
    missedConnections,
    openMissedConnectionsModal,
    openOpticalBeacon,
    openAfterHoursModal,
    openWingmanModal,
    wingmanPair,
    toggleEventRsvp,
    currentUserUid,
  } = useVessel();

  const [selectedEvent, setSelectedEvent] = useState<NightlifeEvent | null>(null);
  const [isFloorRadarOpen, setIsFloorRadarOpen] = useState(false);
  const [filterDarkroom, setFilterDarkroom] = useState(false);

  const filteredEvents = nightlifeEvents.filter((ev) => {
    if (filterDarkroom && !ev.hasDarkroom) return false;
    return true;
  });

  return (
    <>
      {isNightlifeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
          <div className="w-full max-w-2xl bg-obsidian border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-obsidian-surface flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center">
                <PartyPopper className="w-4 h-4 text-electricViolet-glow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                    VESSEL Nightlife // Fiestas & Boliches
                  </h2>
                  <span className="px-1.5 py-0.2 rounded bg-electricViolet/20 text-electricViolet-glow font-mono text-[10px] font-bold border border-electricViolet/30">
                    BSAS
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Cartelera nocturna, radar de pista y cruces presenciales
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeNightlifeModal}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner de Check-in Activo (si está en un local ahora mismo) */}
          {activeCheckin && (
            <div className="p-3 bg-purple-950/40 border-b border-purple-500/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                <div>
                  <span className="font-mono text-xs font-bold text-white block">
                    Check-in Activo: {activeCheckin.eventName}
                  </span>
                  <span className="text-[10px] text-purple-300 font-mono">
                    📍 {activeCheckin.venueName} • Zona activa
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFloorRadarOpen(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Abrir Radar de Pista ➔
              </button>
            </div>
          )}

          {/* Barra de Acceso Rápido a Herramientas Nocturnas */}
          <div className="p-3 bg-neutral-950/70 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            <button
              type="button"
              onClick={() => openMissedConnectionsModal()}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-white/15 hover:border-emerald-500/50 rounded-xl font-mono text-xs text-neutral-200 flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cruces en la Pista</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {missedConnections.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => openOpticalBeacon()}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-fuchsia-500/40 hover:border-fuchsia-400 rounded-xl font-mono text-xs text-fuchsia-200 flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,0,127,0.2)]"
            >
              <Zap className="w-3.5 h-3.5 text-[#ff2a85] animate-pulse" />
              <span>Baliza Fucsia</span>
            </button>

            <button
              type="button"
              onClick={() => openWingmanModal()}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-white/15 hover:border-blue-500/50 rounded-xl font-mono text-xs text-neutral-200 flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Modo Wingman</span>
              {wingmanPair && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => openAfterHoursModal()}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-white/15 hover:border-indigo-500/50 rounded-xl font-mono text-xs text-neutral-200 flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>After-Hours</span>
            </button>
          </div>

          {/* Filtros Rápidos de Cartelera */}
          <div className="px-4 py-2 bg-neutral-900/40 border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              {filteredEvents.length} Fiestas en Radar
            </span>
            <button
              type="button"
              onClick={() => setFilterDarkroom((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 ${
                filterDarkroom
                  ? "bg-purple-950 border border-purple-500 text-purple-300 font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>🌑 Solo con Darkroom</span>
            </button>
          </div>

          {/* Grilla de Fiestas */}
          <div className="p-4 overflow-y-auto space-y-3">
            {filteredEvents.map((ev) => {
              const isGoing =
                ev.confirmedAttendees.includes("my-user-id") ||
                ev.confirmedAttendees.includes(currentUserUid);

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-3 bg-neutral-900/90 hover:bg-neutral-900 border border-white/10 hover:border-electricViolet/50 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row gap-3 group shadow-sm"
                >
                  {/* Flyer miniatura en 16:9 / aspect */}
                  <div className="relative w-full sm:w-36 h-28 sm:h-auto rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                    <img
                      src={ev.flyerUrl}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-1.5 left-1.5 flex gap-1">
                      {ev.isHotTonight && (
                        <span className="px-1.5 py-0.2 rounded bg-bloodNeon text-white font-mono text-[9px] font-bold">
                          HOT
                        </span>
                      )}
                      {ev.hasDarkroom && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-mono text-[9px] font-bold">
                          🌑
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Datos del Evento */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-mono text-sm font-bold text-white group-hover:text-electricViolet-glow transition-colors leading-tight truncate">
                          {ev.name}
                        </h3>
                        <span className="text-[10px] font-mono text-electricViolet-glow font-bold flex-shrink-0">
                          {ev.dateLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
                        <span className="font-semibold text-white">{ev.venueName}</span>
                        <span className="text-neutral-500">•</span>
                        <span className="text-neutral-400">{ev.neighborhood}</span>
                      </div>

                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                        {ev.description}
                      </p>
                    </div>

                    {/* Footer de la tarjeta con Asistentes y Botón Voy */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                      <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-electricViolet-glow" />
                        <span>{ev.activeAttendeesCount} van hoy</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEventRsvp(ev.id);
                          }}
                          className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                            isGoing
                              ? "bg-emerald-950 border border-emerald-500/50 text-emerald-300"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          {isGoing ? "✓ Voy" : "Voy hoy"}
                        </button>

                        <span className="text-xs font-mono text-electricViolet-glow group-hover:translate-x-0.5 transition-transform">
                          Detalles →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Modal Detallado de Fiesta */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onOpenFloorRadar={() => {
            setSelectedEvent(null);
            setIsFloorRadarOpen(true);
          }}
        />
      )}

      {/* Modal de Radar de Pista en el Local */}
      <ClubFloorRadarModal
        isOpen={isFloorRadarOpen}
        onClose={() => setIsFloorRadarOpen(false)}
      />

      {/* Modales Complementarios */}
      <MissedConnectionsModal />
      <OpticalBeaconModal />
      <AfterHoursModal />
      <WingmanModal />
      <SpikedDrinkAlertModal />
    </>
  );
};

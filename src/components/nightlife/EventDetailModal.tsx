"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { NightlifeEvent } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleDisplayLabel } from "@/data/roleActionCatalog";
import {
  MapPin,
  Clock,
  Music,
  DollarSign,
  Users,
  Check,
  Zap,
  Radio,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface Props {
  event: NightlifeEvent;
  onClose: () => void;
  onOpenFloorRadar?: () => void;
}

export const EventDetailModal: React.FC<Props> = ({ event, onClose }) => {
  const {
    toggleEventRsvp,
    checkInToEvent,
    activeCheckin,
    profiles,
    setSelectedProfile,
    currentUserUid,
    language,
  } = useVessel();

  const isGoing =
    event.confirmedAttendees.includes("my-user-id") ||
    event.confirmedAttendees.includes(currentUserUid);

  const isCheckedInHere = activeCheckin?.eventId === event.id;

  const handleToggleRsvp = () => {
    toggleEventRsvp(event.id);
  };

  const handleCheckin = () => {
    checkInToEvent(event.id, "dancefloor");
    audioEngine.playSignalSent();
  };

  // Asistentes de mock basados en los perfiles
  const attendeeProfiles = profiles.filter((p) =>
    event.confirmedAttendees.includes(p.id)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.name}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none [overscroll-behavior:contain]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-obsidian border-t sm:border border-white/15 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200 sm:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Tactical Drag Handle */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Flyer Hero */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden flex-shrink-0">
          <img
            src={event.flyerUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle del evento"
            className="absolute top-3 right-3 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {event.isHotTonight && (
              <span className="px-2 py-0.5 rounded-full bg-bloodNeon text-white font-mono text-[10px] font-bold shadow-blood-glow">
                🔥 HOT TONIGHT
              </span>
            )}
            {event.hasDarkroom && (
              <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold">
                🌑 DARKROOM
              </span>
            )}
          </div>

          {/* Título sobre el degradado inferior */}
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-xl font-bold font-mono text-white tracking-tight leading-tight drop-shadow-md">
              {event.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-1">
              <MapPin className="w-3.5 h-3.5 text-electricViolet-glow flex-shrink-0" />
              <span className="font-semibold text-white">{event.venueName}</span>
              <span className="text-neutral-500">•</span>
              <span>{event.neighborhood}</span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Evento */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Fila de Datos Tácticos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-neutral-900/90 border border-white/10 rounded-xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-electricViolet-glow flex-shrink-0" />
              <div>
                <span className="text-[9px] text-neutral-400 block font-mono">HORARIO</span>
                <span className="font-bold text-white text-[11px] truncate block">{event.timeRange}</span>
              </div>
            </div>

            <div className="p-2 bg-neutral-900/90 border border-white/10 rounded-xl flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div>
                <span className="text-[9px] text-neutral-400 block font-mono">GÉNERO</span>
                <span className="font-bold text-white text-[11px] truncate block">{event.genre}</span>
              </div>
            </div>

            <div className="p-2 bg-neutral-900/90 border border-white/10 rounded-xl flex items-center gap-2 col-span-2 sm:col-span-1">
              <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[9px] text-neutral-400 block font-mono">ENTRADA</span>
                <span className="font-bold text-white text-[11px] truncate block">{event.coverPriceEstimate || "A confirmar"}</span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-xs text-neutral-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
            {event.description}
          </p>

          {/* Botones de Acción de Fiesta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleToggleRsvp}
              className={`py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isGoing
                  ? "bg-emerald-950 border border-emerald-500/50 text-emerald-300"
                  : "bg-electricViolet hover:bg-electricViolet-glow text-white font-bold shadow-violet-soft"
              }`}
            >
              {isGoing ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Confirmado: Voy esta noche ✓</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Voy esta noche // Pre-Matching</span>
                </>
              )}
            </button>

            {isCheckedInHere ? (
              <div className="py-3 px-4 rounded-xl font-mono text-xs font-bold bg-mintNeon/20 border border-mintNeon/60 text-mintNeon flex items-center justify-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-mintNeon" />
                <span>Estás presente en este evento</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCheckin}
                className="py-3 px-4 rounded-xl font-mono text-xs font-bold bg-neutral-900 hover:bg-neutral-800 border border-white/20 hover:border-electricViolet/50 text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Radio className="w-4 h-4 text-electricViolet-glow" />
                <span>Estoy en el lugar • Marcar presencia</span>
              </button>
            )}
          </div>

          {/* Galería de Asistentes Confirmados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-electricViolet-glow" />
                <span>¿Quién va hoy?</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {event.activeAttendeesCount} Vessels confirmados
              </span>
            </div>

            {attendeeProfiles.length === 0 ? (
              <div className="py-6 text-center text-neutral-500 text-xs font-mono">
                Sé el primero en confirmar asistencia para coordinar previa.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {attendeeProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProfile(p);
                    }}
                    className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/15 bg-neutral-900 cursor-pointer group shadow-sm hover:border-electricViolet transition-all"
                  >
                    <img
                      src={p.avatarUrl}
                      alt={p.codename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-1 left-1 right-1">
                      <span className="font-mono text-[9px] font-bold text-white block truncate">
                        {p.codename}
                      </span>
                      <span className="font-mono text-[8px] text-electricViolet-glow block truncate">
                        {getRoleDisplayLabel(p.role, language)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

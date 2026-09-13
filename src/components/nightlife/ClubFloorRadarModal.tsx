"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";
import { ClubZoneType } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  MapPin,
  Radio,
  Zap,
  ShieldAlert,
  LogOut,
  X,
  Users,
  Eye,
} from "lucide-react";

export const CLUB_ZONES: { id: ClubZoneType; label: string; icon: string; desc: string }[] = [
  { id: "dancefloor", label: "Pista Central", icon: "📍", desc: "El centro de la música, sudor y baile." },
  { id: "bar", label: "Barra Principal", icon: "🍸", desc: "Tragos, pausa y charlas cara a cara." },
  { id: "smoking_patio", label: "Patio / Fumadero", icon: "🚬", desc: "Espacio al aire libre para distender." },
  { id: "darkroom", label: "Darkroom / Cruising", icon: "🌑", desc: "Zona roja sin luces, contacto corporal." },
  { id: "bathrooms", label: "Zona de Baños", icon: "🚻", desc: "Espejos, colas y encuentros casuales." },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ClubFloorRadarModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    activeCheckin,
    updateEventZone,
    checkOutOfEvent,
    openOpticalBeacon,
    openSpikedAlertModal,
    openMissedConnectionsModal,
    profiles,
    setSelectedProfile,
  } = useVessel();

  if (!isOpen || !activeCheckin) return null;

  const handleZoneChange = (zone: ClubZoneType) => {
    updateEventZone(zone);
    audioEngine.playSubBass(60);
  };

  const handleLeaveVenue = () => {
    checkOutOfEvent();
    onClose();
  };

  // Mock de otros usuarios en el local distribuidos por zonas
  const attendeesInVenue = profiles.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-obsidian border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Táctico */}
        <div className="p-4 border-b border-white/10 bg-obsidian-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-electricViolet/15 border border-electricViolet/30 flex items-center justify-center">
              <Radio className="w-4 h-4 text-electricViolet-glow animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Radar de Pista // En Vivo
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-neutral-400">
                {activeCheckin.eventName} • {activeCheckin.venueName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Acciones Rápidas Tácticas de Fiesta */}
        <div className="p-3 bg-neutral-950 border-b border-white/10 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              openOpticalBeacon();
            }}
            className="p-2.5 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border border-fuchsia-500/40 rounded-xl text-left flex flex-col justify-between transition-all active:scale-95 shadow-[0_0_15px_rgba(255,0,127,0.2)] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Zap className="w-4 h-4 text-[#ff2a85] animate-bounce" />
              <span className="text-[9px] font-mono text-[#ff2a85] font-bold">FUCSIA</span>
            </div>
            <span className="text-xs font-mono font-bold text-white mt-1">Baliza Fucsia</span>
            <span className="text-[9px] text-neutral-300">Para que te ubiquen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              openMissedConnectionsModal();
            }}
            className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/15 rounded-xl text-left flex flex-col justify-between transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-mono text-emerald-400 font-bold">LOG</span>
            </div>
            <span className="text-xs font-mono font-bold text-white mt-1">Cruces Pista</span>
            <span className="text-[9px] text-neutral-400">Ver coincidencias</span>
          </button>

          <button
            type="button"
            onClick={() => {
              openSpikedAlertModal();
            }}
            className="p-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 rounded-xl text-left flex flex-col justify-between transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="text-[9px] font-mono text-red-400 font-bold">SOS</span>
            </div>
            <span className="text-xs font-mono font-bold text-white mt-1">Vaso Seguro</span>
            <span className="text-[9px] text-neutral-400">Auxilio silencioso</span>
          </button>
        </div>

        {/* Selector de Micro-Zona en el Local */}
        <div className="p-4 overflow-y-auto space-y-4">
          <div>
            <span className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              📍 Tu Micro-Zona Actual en el Boliche
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CLUB_ZONES.map((z) => {
                const isCurrent = activeCheckin.zone === z.id;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => handleZoneChange(z.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isCurrent
                        ? "bg-electricViolet/20 border-electricViolet text-electricViolet-glow ring-1 ring-electricViolet shadow-md scale-[1.02]"
                        : "bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300"
                    }`}
                  >
                    <span className="text-xl mb-1">{z.icon}</span>
                    <span className="text-xs font-mono font-bold block truncate">{z.label}</span>
                    <span className="text-[9.5px] text-neutral-400 block line-clamp-1">{z.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quiénes están en el local */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Gente en el Boliche Ahora
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {attendeesInVenue.length} cerca tuyo
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {attendeesInVenue.map((profile, idx) => {
                const zoneMock = CLUB_ZONES[idx % CLUB_ZONES.length];
                return (
                  <div
                    key={profile.id}
                    onClick={() => {
                      setSelectedProfile(profile);
                    }}
                    className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-neutral-900 cursor-pointer group shadow-sm hover:border-electricViolet/50 transition-all"
                  >
                    <img
                      src={profile.avatarUrl}
                      alt={profile.codename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5">
                      <span className="font-mono text-[10px] font-bold text-white block truncate">
                        {profile.codename}
                      </span>
                      <span className="font-mono text-[8.5px] text-electricViolet-glow block truncate">
                        {zoneMock.icon} {zoneMock.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer: Salir del boliche */}
        <div className="p-3 border-t border-white/10 bg-obsidian-surface flex items-center justify-between">
          <button
            type="button"
            onClick={handleLeaveVenue}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir del Boliche // Desactivar Check-in</span>
          </button>
          <span className="text-[10px] font-mono text-neutral-400">
            Auto-expira a las 08:00 AM
          </span>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
import { VesselProfile } from "@/types/vessel";
import {
  Calendar,
  Navigation,
  ShieldAlert,
  MapPin,
  Clock,
  X,
  Sparkles,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getLocalTodayIso } from "@/lib/calendar/dateLocale";

interface EncounterContextBarProps {
  profile: VesselProfile;
  onOpenRendezvousSheet: () => void;
  onOpenEnRoute: () => void;
  onOpenSafetyBeacon: () => void;
  onCancelRendezvousPin?: () => void;
  onOpenDossier?: () => void;
}

export const EncounterContextBar: React.FC<EncounterContextBarProps> = ({
  profile,
  onOpenRendezvousSheet,
  onOpenEnRoute,
  onOpenSafetyBeacon,
  onCancelRendezvousPin,
  onOpenDossier,
}) => {
  const {
    activeRendezvous,
    safetyBeacon,
    diaryEntries,
    language,
    t,
  } = useVessel();

  const isRendezvousActive = activeRendezvous?.profileId === profile.id;
  const isBeaconActive = safetyBeacon?.isActive;

  // Cita de hoy con este perfil específico
  const todayDateWithProfile = useMemo(() => {
    const todayIso = getLocalTodayIso();
    return (diaryEntries || []).find(
      (entry) =>
        entry?.isUpcoming &&
        entry?.date === todayIso &&
        entry?.person?.profileId === profile?.id
    );
  }, [diaryEntries, profile?.id]);

  // Si no hay cita hoy ni PIN activo ni SOS, no mostramos barra invasiva
  if (!isRendezvousActive && !todayDateWithProfile && !isBeaconActive) {
    return null;
  }

  return (
    <div className="w-full bg-obsidian-surface/95 border-b border-white/10 px-3 py-1.5 flex items-center justify-between gap-2 z-10 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* ESTADO 1: PIN ACTIVO O BEACON SOS ACTIVO (MÁXIMA PRIORIDAD) */}
      {isRendezvousActive || isBeaconActive ? (
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-bloodNeon animate-ping flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-mono font-black text-bloodNeon uppercase tracking-wider flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {isRendezvousActive
                    ? (language === "es" ? "Encuentro Activo" : "Active Meeting")
                    : (language === "es" ? "Guardián SOS Activo" : "SOS Guard Active")}
                </span>
              </span>
              {activeRendezvous?.locationName && (
                <span className="text-[10px] text-neutral-400 font-mono block truncate">
                  {activeRendezvous.locationName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                onOpenEnRoute();
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              title={language === "es" ? "Avisar que estoy en viaje" : "En route"}
            >
              <Navigation className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">{language === "es" ? "En camino" : "En route"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                onOpenSafetyBeacon();
              }}
              className="px-2.5 py-1 rounded-xl bg-bloodNeon/20 hover:bg-bloodNeon/30 border border-bloodNeon/40 text-bloodNeon font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-blood-glow"
              title={language === "es" ? "Abrir Guardián SOS" : "Safety SOS"}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>SOS</span>
            </button>

            {onCancelRendezvousPin && isRendezvousActive && (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  onCancelRendezvousPin();
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title={language === "es" ? "Finalizar PIN de encuentro" : "Cancel meeting"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ESTADO 2: CITA PACTADA PARA HOY */
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-electricViolet animate-pulse flex-shrink-0" />
            <div className="flex items-center gap-1.5 text-xs font-mono truncate">
              <span className="text-electricViolet-glow font-black uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-electricViolet flex-shrink-0" />
                <span>{language === "es" ? "Cita hoy" : "Date today"}</span>
              </span>
              {todayDateWithProfile?.time && (
                <span className="text-white font-bold">
                  {todayDateWithProfile.time} hs
                </span>
              )}
              {todayDateWithProfile?.location?.name && (
                <span className="text-neutral-400 truncate hidden sm:inline">
                  · {todayDateWithProfile.location.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                onOpenEnRoute();
              }}
              className="px-2.5 py-1 rounded-xl bg-electricViolet/20 hover:bg-electricViolet/30 border border-electricViolet/40 text-electricViolet-glow font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-violet-soft"
            >
              <Navigation className="w-3 h-3" />
              <span>{language === "es" ? "Estoy yendo" : "On my way"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                onOpenSafetyBeacon();
              }}
              className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title={language === "es" ? "Abrir Guardián SOS" : "Safety SOS"}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-neutral-400 hover:text-bloodNeon" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

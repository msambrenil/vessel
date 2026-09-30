"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Activity,
  Flame,
  ArrowDownLeft,
  ArrowUpRight,
  LayoutGrid,
  Zap,
  Trash2,
} from "lucide-react";
import { useVessel } from "@/context/VesselContext";
import { VesselProfile } from "@/types/vessel";
import { PulseCard } from "./PulseCard";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export interface PulsesViewProps {
  onOpenChat: (profileId: string) => void;
}

export const PulsesView: React.FC<PulsesViewProps> = ({ onOpenChat }) => {
  const {
    profiles,
    myBodyState,
    setMyBodyState,
    transmissions,
    sentPulsesMeta,
    receivedPulses,
    missedConnections,
    returnPulse,
    markPulsesAsRead,
    clearPulse,
    clearAllReadPulses,
    unreadPulsesCount,
    hasMutualPulse,
    t,
    language,
    formatDist,
    setActiveView,
    setSelectedProfile,
    openCreateDiaryModal,
  } = useVessel();

  const [activeTab, setActiveTab] = useState<"received" | "mutual" | "sent">("received");

  // Mapas de resolución dual (ID y Codename) para evitar pérdida de pulsos provenientes de Firestore
  const { profilesById, profilesByCodename } = useMemo(() => {
    const byId = new Map<string, VesselProfile>();
    const byCode = new Map<string, VesselProfile>();
    profiles.forEach((p) => {
      byId.set(p.id, p);
      if (p.codename) {
        byCode.set(p.codename.toLowerCase(), p);
      }
    });
    return { profilesById: byId, profilesByCodename: byCode };
  }, [profiles]);

  const resolveProfile = useMemo(
    () => (idOrCodename?: string): VesselProfile | undefined => {
      if (!idOrCodename) return undefined;
      return (
        profilesById.get(idOrCodename) ||
        profilesByCodename.get(idOrCodename.toLowerCase())
      );
    },
    [profilesById, profilesByCodename]
  );

  // Hidratación de Zumbidos Recibidos (con soporte de resolución dual id/codename)
  const enrichedReceivedPulses = useMemo(() => {
    return receivedPulses
      .map((pulse) => {
        const profile =
          resolveProfile(pulse.fromProfileId) ||
          resolveProfile(pulse.fromCodename);
        return {
          ...pulse,
          profile,
        };
      })
      .filter((item): item is typeof item & { profile: VesselProfile } => Boolean(item.profile))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [receivedPulses, resolveProfile]);

  // Hidratación de Zumbidos Enviados + Zumbidos de Reencuentro ("Te vi en la pista")
  const enrichedSentPulses = useMemo(() => {
    const itemsMap = new Map<
      string,
      {
        profile: VesselProfile;
        timestamp: string;
        isReencounter?: boolean;
        reencounterNote?: string;
      }
    >();

    Object.entries(transmissions).forEach(([profileId, count]) => {
      if (count <= 0) return;
      const profile = resolveProfile(profileId);
      if (!profile) return;
      const meta = sentPulsesMeta?.[profile.id] || sentPulsesMeta?.[profileId];
      itemsMap.set(profile.id, {
        profile,
        timestamp: meta?.lastSentAt || new Date().toISOString(),
      });
    });

    // Unificar Zumbidos de Reencuentro enviados desde MissedConnectionsModal
    (missedConnections || []).forEach((conn) => {
      if (!conn.pulseSent) return;
      const profile = resolveProfile(conn.peerProfileId) || resolveProfile(conn.peerCodename);
      if (!profile) return;
      const existing = itemsMap.get(profile.id);
      itemsMap.set(profile.id, {
        profile,
        timestamp: existing?.timestamp || conn.overlappedAt || new Date().toISOString(),
        isReencounter: true,
        reencounterNote: conn.pulseNote,
      });
    });

    return Array.from(itemsMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [transmissions, sentPulsesMeta, missedConnections, resolveProfile]);

  // Zumbidos Mutuos (intersección activa lista para encuentro)
  const enrichedMutualPulses = useMemo(() => {
    return enrichedReceivedPulses.filter((item) => hasMutualPulse(item.profile.id));
  }, [enrichedReceivedPulses, hasMutualPulse]);

  // Conteo de zumbidos ya vistos que pueden limpiarse sin afectar mutuos
  const cleanableReadCount = useMemo(() => {
    return enrichedReceivedPulses.filter(
      (item) => item.isRead && !hasMutualPulse(item.profile.id)
    ).length;
  }, [enrichedReceivedPulses, hasMutualPulse]);

  // Marcar pulsos recibidos como leídos al visualizar la pestaña Recibidos
  useEffect(() => {
    if (activeTab === "received" && unreadPulsesCount > 0) {
      const timer = setTimeout(() => {
        markPulsesAsRead();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [activeTab, unreadPulsesCount, markPulsesAsRead]);

  return (
    <section
      aria-label={t.pulses?.title || "Zumbidos"}
      className="flex flex-col flex-1 p-3 sm:p-4 pb-48 sm:pb-56 space-y-4 select-none bg-obsidian-deep min-h-[calc(100vh-140px)]"
    >
      {/* CABECERA DE TRIAJE TÁCTICO DE 1 SOLO NIVEL */}
      <header className="border-b border-white/10 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-electricViolet-glow stroke-[2.4]" />
              <span>{t.pulses?.title || "Zumbidos"}</span>
            </h1>
            <p className="text-xs text-neutral-400">
              {t.pulses?.subtitle}
            </p>
          </div>

          {cleanableReadCount > 0 && (
            <button
              type="button"
              onClick={clearAllReadPulses}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
            >
              <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t.pulses?.clearAll || "Limpiar vistos"}</span>
            </button>
          )}
        </div>

        {/* Selector de Triaje (Mutuos | Recibidos | Enviados) - 44px Touch Targets */}
        <div
          role="tablist"
          aria-label={t.pulses?.title || "Zumbidos"}
          className="grid grid-cols-3 gap-1.5 p-1 bg-obsidian-surface rounded-2xl border border-white/10 shadow-card-elevation"
        >
          {/* Pestaña 1: Recibidos */}
          <button
            id="tab-pulses-received"
            type="button"
            role="tab"
            aria-selected={activeTab === "received"}
            aria-controls="panel-pulses-received"
            onClick={() => {
              audioEngine.playPulse();
              setActiveTab("received");
            }}
            className={`min-h-[44px] px-2 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              activeTab === "received"
                ? "bg-electricViolet text-white shadow-violet-soft font-black"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{t.pulses?.tabReceived || "Recibidos"}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                unreadPulsesCount > 0
                  ? "bg-bloodNeon text-white font-black animate-pulse"
                  : activeTab === "received"
                  ? "bg-black/40 text-white font-black"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {enrichedReceivedPulses.length}
            </span>
          </button>

          {/* Pestaña 2: Mutuos */}
          <button
            id="tab-pulses-mutual"
            type="button"
            role="tab"
            aria-selected={activeTab === "mutual"}
            aria-controls="panel-pulses-mutual"
            onClick={() => {
              audioEngine.playPulse();
              setActiveTab("mutual");
            }}
            className={`min-h-[44px] px-2 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              activeTab === "mutual"
                ? "bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 font-black"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{t.pulses?.tabMutual || "Mutuos 🔥"}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === "mutual"
                  ? "bg-emerald-950 text-emerald-300 font-black"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {enrichedMutualPulses.length}
            </span>
          </button>

          {/* Pestaña 3: Enviados */}
          <button
            id="tab-pulses-sent"
            type="button"
            role="tab"
            aria-selected={activeTab === "sent"}
            aria-controls="panel-pulses-sent"
            onClick={() => {
              audioEngine.playPulse();
              setActiveTab("sent");
            }}
            className={`min-h-[44px] px-2 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              activeTab === "sent"
                ? "bg-electricViolet text-white shadow-violet-soft font-black"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{t.pulses?.tabSent || "Enviados"}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === "sent"
                  ? "bg-black/40 text-white font-black"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {enrichedSentPulses.length}
            </span>
          </button>
        </div>
      </header>

      {/* PANEL 1: ZUMBIDOS RECIBIDOS */}
      {activeTab === "received" && (
        <div
          id="panel-pulses-received"
          role="tabpanel"
          aria-labelledby="tab-pulses-received"
          className="space-y-3"
        >
          {enrichedReceivedPulses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-obsidian-surface border border-white/10 space-y-4 my-6">
              <div className="w-14 h-14 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-center text-electricViolet shadow-violet-soft">
                <Activity className="w-7 h-7 stroke-[1.8] animate-pulse" />
              </div>
              <div className="max-w-xs space-y-1">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.pulses?.emptyReceivedTitle}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t.pulses?.emptyReceivedDesc}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                {myBodyState === "dormant" && (
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playStateSwitch("open");
                      setMyBodyState("open");
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase font-mono rounded-xl transition-all active:scale-[0.96] cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>{t.pulses?.activateVisibilityCta || "Pasar a Disponible Ahora"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setActiveView("grid");
                  }}
                  className="min-h-[44px] px-5 py-2.5 bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-black uppercase font-mono rounded-xl shadow-violet-soft transition-all active:scale-[0.96] cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
                >
                  <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.pulses?.goToGrid || "Ver Perfiles Cerca"}</span>
                </button>
              </div>
            </div>
          ) : (
            enrichedReceivedPulses.map((item) => (
              <PulseCard
                key={`${item.id}-${item.fromProfileId}`}
                profile={item.profile}
                mode="received"
                timestamp={item.timestamp}
                isRead={item.isRead}
                isMutual={hasMutualPulse(item.profile.id)}
                pulseId={item.id}
                language={language}
                t={t}
                formatDist={formatDist}
                onSelectProfile={setSelectedProfile}
                onReturnPulse={returnPulse}
                onOpenChat={onOpenChat}
                onScheduleEncounter={(profileId) => openCreateDiaryModal(profileId)}
                onDismissPulse={clearPulse}
              />
            ))
          )}
        </div>
      )}

      {/* PANEL 2: ZUMBIDOS MUTUOS (LISTOS PARA ENCUENTRO) */}
      {activeTab === "mutual" && (
        <div
          id="panel-pulses-mutual"
          role="tabpanel"
          aria-labelledby="tab-pulses-mutual"
          className="space-y-3"
        >
          {enrichedMutualPulses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-obsidian-surface border border-white/10 space-y-4 my-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Flame className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div className="max-w-xs space-y-1">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.pulses?.emptyMutualTitle}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t.pulses?.emptyMutualDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setActiveView("grid");
                }}
                className="min-h-[44px] px-5 py-2.5 bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-black uppercase font-mono rounded-xl shadow-violet-soft transition-all active:scale-[0.96] cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
              >
                <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                <span>{t.pulses?.goToGrid || "Ver Perfiles Cerca"}</span>
              </button>
            </div>
          ) : (
            enrichedMutualPulses.map((item) => (
              <PulseCard
                key={`mutual-${item.id}-${item.fromProfileId}`}
                profile={item.profile}
                mode="mutual"
                timestamp={item.timestamp}
                isRead={true}
                isMutual={true}
                language={language}
                t={t}
                formatDist={formatDist}
                onSelectProfile={setSelectedProfile}
                onReturnPulse={returnPulse}
                onOpenChat={onOpenChat}
                onScheduleEncounter={(profileId) => openCreateDiaryModal(profileId)}
              />
            ))
          )}
        </div>
      )}

      {/* PANEL 3: ZUMBIDOS ENVIADOS */}
      {activeTab === "sent" && (
        <div
          id="panel-pulses-sent"
          role="tabpanel"
          aria-labelledby="tab-pulses-sent"
          className="space-y-3"
        >
          {enrichedSentPulses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-obsidian-surface border border-white/10 space-y-4 my-6">
              <div className="w-14 h-14 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-center text-electricViolet shadow-violet-soft">
                <ArrowUpRight className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div className="max-w-xs space-y-1">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.pulses?.emptySentTitle}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t.pulses?.emptySentDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setActiveView("grid");
                }}
                className="min-h-[44px] px-5 py-2.5 bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-black uppercase font-mono rounded-xl shadow-violet-soft transition-all active:scale-[0.96] cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
              >
                <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                <span>{t.pulses?.goToGrid || "Ver Perfiles Cerca"}</span>
              </button>
            </div>
          ) : (
            enrichedSentPulses.map((item) => (
              <PulseCard
                key={`sent-${item.profile.id}`}
                profile={item.profile}
                mode="sent"
                timestamp={item.timestamp}
                isRead={true}
                isMutual={hasMutualPulse(item.profile.id)}
                isReencounter={item.isReencounter}
                reencounterNote={item.reencounterNote}
                language={language}
                t={t}
                formatDist={formatDist}
                onSelectProfile={setSelectedProfile}
                onReturnPulse={returnPulse}
                onOpenChat={onOpenChat}
                onScheduleEncounter={(profileId) => openCreateDiaryModal(profileId)}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
};

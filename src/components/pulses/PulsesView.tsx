"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import {
  Activity,
  Zap,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Ghost,
  CloudFog,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCheck,
  Sparkles,
  ExternalLink,
  Home,
  Car,
} from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getRoleActionMeta, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { VesselProfile, ExitProtocol } from "@/types/vessel";
import { SectionHeroHeader } from "@/components/ui";

export const PulsesView: React.FC = () => {
  const {
    profiles,
    receivedPulses,
    returnPulse,
    markPulsesAsRead,
    transmissions,
    transmitSignal,
    setSelectedProfile,
    setActiveChatProfileId,
    setActiveView,
    formatDist,
    t,
    language,
  } = useVessel();

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [pulsingProfileId, setPulsingProfileId] = useState<string | null>(null);

  // Al ingresar a la vista de pulsos, marcamos los pulsos como leídos
  useEffect(() => {
    const timer = setTimeout(() => {
      markPulsesAsRead();
    }, 1200);
    return () => clearTimeout(timer);
  }, [markPulsesAsRead]);

  // Mapa rápido de perfiles por ID
  const profilesMap = useMemo(() => {
    const map = new Map<string, VesselProfile>();
    profiles.forEach((p) => map.set(p.id, p));
    return map;
  }, [profiles]);

  // Pulsos recibidos con datos del perfil enriquecidos
  const enrichedReceivedPulses = useMemo(() => {
    return receivedPulses
      .map((pulse) => {
        const profile = profilesMap.get(pulse.fromProfileId);
        return {
          ...pulse,
          profile,
        };
      })
      .filter((item): item is typeof item & { profile: VesselProfile } => Boolean(item.profile))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [receivedPulses, profilesMap]);

  // Perfiles a los que el usuario envió al menos un pulso
  const enrichedSentPulses = useMemo(() => {
    return Object.entries(transmissions)
      .filter(([_, count]) => count > 0)
      .map(([profileId, count]) => {
        const profile = profilesMap.get(profileId);
        return {
          profileId,
          count,
          profile,
        };
      })
      .filter((item): item is typeof item & { profile: VesselProfile } => Boolean(item.profile));
  }, [transmissions, profilesMap]);

  const unreadCount = useMemo(() => {
    return receivedPulses.filter((p) => !p.isRead).length;
  }, [receivedPulses]);

  // Helper de tiempo relativo en español rioplatense / inglés
  const formatTimeAgo = (isoString: string) => {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diffMin = Math.max(1, Math.floor((now - then) / (1000 * 60)));

    if (language === "es") {
      if (diffMin < 2) return "Hace un instante";
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours === 1) return "Hace 1 hora";
      if (diffHours < 24) return `Hace ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Ayer";
      return `Hace ${diffDays} días`;
    } else {
      if (diffMin < 2) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours === 1) return "1h ago";
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      return `${diffDays}d ago`;
    }
  };

  // Helper para renderizar la píldora de protocolo de salida destacada (100% libre de colisiones)
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
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 backdrop-blur-md shadow-sm"
      >
        <span className="text-xs leading-none">{icon}</span>
        <span className="font-mono text-[10px] font-black uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 p-3 sm:p-4 pb-28 space-y-4 select-none bg-obsidian-deep min-h-[calc(100vh-140px)]">
      {/* CABECERA HERO TÁCTICA */}
      <SectionHeroHeader
        title={t.pulses.title}
        tag={unreadCount > 0 ? `${unreadCount} ${language === "es" ? "NUEVOS" : "NEW"}` : undefined}
        subtitle={t.pulses.subtitle}
        variant="violet"
        icon={<Activity className="w-4 h-4 stroke-[2.4] text-electricViolet-glow" />}
      />

      {/* SUB-PESTAÑAS RECIBIDOS / ENVIADOS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "received"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveTab("received");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeTab === "received"
                ? "bg-electricViolet text-white border border-electricViolet shadow-violet-soft font-extrabold"
                : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{t.pulses.tabReceived}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "received"
                  ? "bg-black/30 text-white font-black"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {enrichedReceivedPulses.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "sent"}
            onClick={() => {
              audioEngine.playPulse();
              setActiveTab("sent");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
              activeTab === "sent"
                ? "bg-electricViolet text-white border border-electricViolet shadow-violet-soft font-extrabold"
                : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{t.pulses.tabSent}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "sent"
                  ? "bg-black/30 text-white font-black"
                  : "bg-white/10 text-neutral-300"
              }`}
            >
              {enrichedSentPulses.length}
            </span>
          </button>
        </div>

      {/* CONTENIDO SEGÚN SUB-PESTAÑA */}
      {activeTab === "received" && (
        <div className="space-y-3">
          {enrichedReceivedPulses.length === 0 ? (
            /* ESTADO VACÍO RECIBIDOS */
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 my-8">
              <div className="w-14 h-14 rounded-full bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-center text-electricViolet shadow-violet-soft">
                <Activity className="w-7 h-7 stroke-[1.8] animate-pulse" />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.pulses.emptyReceivedTitle}
                </h3>
                <p className="text-xs text-neutral-400">
                  {t.pulses.emptyReceivedDesc}
                </p>
              </div>
              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setActiveView("grid");
                  }}
                  className="px-5 py-2.5 bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-black uppercase font-mono rounded-2xl shadow-violet-soft transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.pulses.goToGrid}</span>
                </button>
              </div>
            </div>
          ) : (
            /* LISTA DE PULSOS RECIBIDOS */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {enrichedReceivedPulses.map((item) => {
                const { profile, id: pulseId, timestamp, isRead, returned } = item;
                const roleAction = getRoleActionMeta(profile.role, language, profile.codename);
                const roleDisplay = getRoleDisplayLabel(profile.role, language);
                const isSentByMe = Boolean(transmissions[profile.id]);
                const hasPlace =
                  profile.mobility?.toLowerCase().includes("depto") ||
                  profile.mobility?.toLowerCase().includes("sitio") ||
                  profile.mobility?.toLowerCase().includes("lugar");

                return (
                  <div
                    key={pulseId}
                    className={`group relative flex flex-col p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 bg-obsidian-surface hover:border-electricViolet/60 shadow-card-elevation ${
                      !isRead
                        ? "border-electricViolet/60 bg-gradient-to-b from-electricViolet/10 via-obsidian-surface to-obsidian-surface shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-electricViolet/40"
                        : "border-white/10 hover:shadow-lg"
                    }`}
                  >
                    {/* NIVEL 1: IDENTIDAD, AVATAR & TELEMETRÍA */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar táctico 56x56px interactivo */}
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(profile)}
                        className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/15 group-hover:border-electricViolet/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                        title={t.pulses.viewProfile}
                      >
                        <img
                          src={profile.avatarUrl}
                          alt={profile.codename}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            profile.isFogMode ? "filter blur-[4px]" : ""
                          }`}
                          loading="lazy"
                          decoding="async"
                        />
                        {profile.verification?.isVerified && (
                          <span
                            title="ID Verificado"
                            className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-mintNeon text-obsidian-deep flex items-center justify-center text-[8.5px] font-black shadow-sm"
                          >
                            ✓
                          </span>
                        )}
                      </button>

                      {/* Metadata de Identidad */}
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        {/* Fila 1: Codename + Edad + Unread indicator + Tiempo relativo */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedProfile(profile)}
                              className="text-sm font-black text-white hover:text-electricViolet-glow transition-colors truncate font-mono text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
                            >
                              {profile.codename}
                            </button>
                            {profile.showAge && (
                              <span className="text-[11px] text-neutral-400 font-medium font-mono">
                                {profile.age}
                              </span>
                            )}
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping flex-shrink-0" />
                            )}
                          </div>

                          <span className="text-[10px] text-neutral-400 font-mono flex-shrink-0 whitespace-nowrap">
                            {formatTimeAgo(timestamp)}
                          </span>
                        </div>

                        {/* Fila 2: Rol • Distancia • Movilidad */}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-300 font-mono flex-wrap">
                          <span className="text-electricViolet-glow font-bold">
                            {roleDisplay}
                          </span>
                          <span className="text-white/30">•</span>
                          <span className="text-neutral-300">
                            {formatDist(profile.distanceMeters)}
                          </span>
                          {hasPlace ? (
                            <>
                              <span className="text-white/30">•</span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-purple-200 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.2 rounded-md font-mono">
                                <Home className="w-2.5 h-2.5 text-electricViolet-glow" />
                                <span>{language === "es" ? "Tiene sitio" : "Has place"}</span>
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-white/30">•</span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                                <Car className="w-2.5 h-2.5" />
                                <span>{language === "es" ? "Se desplaza" : "Mobile"}</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Fila 3: Estado de Pulso + Anti-Ghost Karma */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {returned || isSentByMe ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                              <CheckCheck className="w-3 h-3" />
                              <span>{t.pulses.returnedBadge}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-electricViolet-glow bg-purple-950/50 border border-electricViolet/40 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.25)]">
                              <span>{roleAction.icon}</span>
                              <span>{language === "es" ? "Pulso entrante" : "Incoming pulse"}</span>
                            </span>
                          )}

                          {(profile.respectScore && profile.respectScore >= 90) || profile.isAntiGhost ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              <Ghost className="w-2.5 h-2.5" />
                              <span>{profile.respectScore ? `${profile.respectScore}% Karma` : "Anti-Ghost"}</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* NIVEL 2: FILA DEDICADA DE PROTOCOLO DE SALIDA & ON-THE-CLOCK (100% LIBRE DE COLISIONES) */}
                    <div className="pt-2 mt-2 flex flex-wrap items-center gap-1.5 min-w-0">
                      {renderExitProtocolPill(profile.exitProtocol)}

                      {profile.onTheClock?.isActive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-electricViolet text-electricViolet-glow font-mono text-[9.5px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                          <span>⚡ YA ({profile.onTheClock.durationMinutes || 45}m)</span>
                        </span>
                      )}
                    </div>

                    {/* NIVEL 3: BOTONERA ERGONÓMICA AISLADA (Touch Targets >= 44px) */}
                    <div className="pt-2.5 mt-2.5 border-t border-white/10 grid grid-cols-3 gap-2">
                      {/* Botón 1: Ver Ficha Completa */}
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(profile)}
                        className="min-h-[44px] px-2 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
                        title={t.pulses.viewProfile}
                      >
                        <span>{language === "es" ? "Ficha" : "Profile"}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>

                      {/* Botón 2: Devolver Pulso con Micro-Interacción */}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setPulsingProfileId(profile.id);
                          returnPulse(profile.id);
                          setTimeout(() => setPulsingProfileId(null), 650);
                        }}
                        className={`relative overflow-hidden min-h-[44px] px-2 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-xs font-mono font-black uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                          returned || isSentByMe
                            ? "bg-electricViolet/20 border-electricViolet/60 text-electricViolet-glow hover:bg-electricViolet/30 font-bold"
                            : "bg-electricViolet text-white border-electricViolet hover:bg-electricViolet-glow shadow-violet-soft font-bold"
                        }`}
                        title={returned || isSentByMe ? t.pulses.pulseReturned : t.pulses.returnPulse}
                      >
                        {pulsingProfileId === profile.id && (
                          <span className="absolute inset-0 rounded-xl bg-electricViolet-glow/40 animate-pulse-wave pointer-events-none" />
                        )}
                        <span
                          className={`text-sm leading-none transition-transform duration-200 ${
                            pulsingProfileId === profile.id ? "scale-125 animate-bounce" : ""
                          }`}
                        >
                          {roleAction.icon}
                        </span>
                        <span className="truncate">
                          {returned || isSentByMe ? (language === "es" ? "Devuelto" : "Returned") : (language === "es" ? "Devolver" : "Return")}
                        </span>
                      </button>

                      {/* Botón 3: Abrir Chat Directo */}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setActiveChatProfileId(profile.id);
                        }}
                        className="min-h-[44px] px-2 py-2 rounded-xl bg-electricViolet/15 border border-electricViolet/40 hover:bg-electricViolet hover:text-white text-electricViolet-glow sm:bg-electricViolet sm:text-white sm:hover:bg-electricViolet-glow transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-violet-soft"
                        title={t.pulses.openChat}
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2.4]" />
                        <span className="truncate">{language === "es" ? "Chat" : "Chat"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-PESTAÑA ENVIADOS */}
      {activeTab === "sent" && (
        <div className="space-y-3">
          {enrichedSentPulses.length === 0 ? (
            /* ESTADO VACÍO ENVIADOS */
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 my-8">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                <ArrowUpRight className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {t.pulses.emptySentTitle}
                </h3>
                <p className="text-xs text-neutral-400">
                  {t.pulses.emptySentDesc}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView("grid")}
                  className="px-4 py-2 bg-electricViolet text-white text-xs font-black uppercase font-mono rounded-xl hover:bg-electricViolet-glow shadow-violet-soft transition-all active:scale-95"
                >
                  {t.pulses.goToGrid}
                </button>
              </div>
            </div>
          ) : (
            /* LISTA DE PULSOS ENVIADOS */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {enrichedSentPulses.map(({ profile, count }) => {
                const roleAction = getRoleActionMeta(profile.role, language, profile.codename);
                const roleDisplay = getRoleDisplayLabel(profile.role, language);
                const hasPlace =
                  profile.mobility?.toLowerCase().includes("depto") ||
                  profile.mobility?.toLowerCase().includes("sitio") ||
                  profile.mobility?.toLowerCase().includes("lugar");

                return (
                  <div
                    key={profile.id}
                    className="group relative flex flex-col p-3.5 sm:p-4 rounded-2xl border border-white/10 hover:border-electricViolet/60 bg-obsidian-surface transition-all duration-200 shadow-card-elevation hover:shadow-lg"
                  >
                    {/* NIVEL 1: IDENTIDAD, AVATAR & TELEMETRÍA */}
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(profile)}
                        className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/15 group-hover:border-electricViolet/60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                        title={t.pulses.viewProfile}
                      >
                        <img
                          src={profile.avatarUrl}
                          alt={profile.codename}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            profile.isFogMode ? "filter blur-[4px]" : ""
                          }`}
                          loading="lazy"
                          decoding="async"
                        />
                        {profile.verification?.isVerified && (
                          <span
                            title="ID Verificado"
                            className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-mintNeon text-obsidian-deep flex items-center justify-center text-[8.5px] font-black shadow-sm"
                          >
                            ✓
                          </span>
                        )}
                      </button>

                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedProfile(profile)}
                              className="text-sm font-black text-white hover:text-electricViolet-glow transition-colors truncate font-mono text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
                            >
                              {profile.codename}
                            </button>
                            {profile.showAge && (
                              <span className="text-[11px] text-neutral-400 font-medium font-mono">
                                {profile.age}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-300 font-mono flex-wrap">
                          <span className="text-electricViolet-glow font-bold">{roleDisplay}</span>
                          <span className="text-white/30">•</span>
                          <span className="text-neutral-300">{formatDist(profile.distanceMeters)}</span>
                          {hasPlace ? (
                            <>
                              <span className="text-white/30">•</span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-purple-200 bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.2 rounded-md font-mono">
                                <Home className="w-2.5 h-2.5 text-electricViolet-glow" />
                                <span>{language === "es" ? "Tiene sitio" : "Has place"}</span>
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-white/30">•</span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                                <Car className="w-2.5 h-2.5" />
                                <span>{language === "es" ? "Se desplaza" : "Mobile"}</span>
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-electricViolet-glow bg-purple-950/50 border border-electricViolet/40 px-2 py-0.5 rounded-full">
                            <span>{roleAction.icon}</span>
                            <span>
                              {count} {count === 1 ? (language === "es" ? "pulso enviado" : "pulse sent") : (language === "es" ? "pulsos enviados" : "pulses sent")}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* NIVEL 2: FILA DEDICADA DE PROTOCOLO DE SALIDA & ON-THE-CLOCK (100% LIBRE DE COLISIONES) */}
                    <div className="pt-2 mt-2 flex flex-wrap items-center gap-1.5 min-w-0">
                      {renderExitProtocolPill(profile.exitProtocol)}

                      {profile.onTheClock?.isActive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-electricViolet text-electricViolet-glow font-mono text-[9.5px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                          <span>⚡ YA ({profile.onTheClock.durationMinutes || 45}m)</span>
                        </span>
                      )}
                    </div>

                    {/* NIVEL 3: BOTONERA ERGONÓMICA AISLADA (Touch Targets >= 44px) */}
                    <div className="pt-2.5 mt-2.5 border-t border-white/10 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(profile)}
                        className="min-h-[44px] px-2 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
                        title={t.pulses.viewProfile}
                      >
                        <span>{language === "es" ? "Ficha" : "Profile"}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setPulsingProfileId(profile.id);
                          transmitSignal(profile.id);
                          setTimeout(() => setPulsingProfileId(null), 650);
                        }}
                        className="relative overflow-hidden min-h-[44px] px-2 py-2 rounded-xl bg-electricViolet/15 border border-electricViolet/50 hover:bg-electricViolet hover:text-white text-electricViolet-glow transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                        title={roleAction.actionLabel}
                      >
                        {pulsingProfileId === profile.id && (
                          <span className="absolute inset-0 rounded-xl bg-electricViolet-glow/40 animate-pulse-wave pointer-events-none" />
                        )}
                        <span
                          className={`text-sm leading-none transition-transform duration-200 ${
                            pulsingProfileId === profile.id ? "scale-125 animate-bounce" : ""
                          }`}
                        >
                          {roleAction.icon}
                        </span>
                        <span className="truncate">{language === "es" ? "+1 Pulso" : "+1 Pulse"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setActiveChatProfileId(profile.id);
                        }}
                        className="min-h-[44px] px-2 py-2 rounded-xl bg-electricViolet/15 border border-electricViolet/40 hover:bg-electricViolet hover:text-white text-electricViolet-glow sm:bg-electricViolet sm:text-white sm:hover:bg-electricViolet-glow transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 shadow-violet-soft"
                        title={t.pulses.openChat}
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2.4]" />
                        <span className="truncate">{language === "es" ? "Chat" : "Chat"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import {
  MessageSquare,
  Zap,
  Flame,
  Navigation,
  Sparkles,
  LayoutGrid,
  Clock,
  ShieldCheck,
  Building2,
  ChevronRight,
  FolderLock,
  Home,
  Car,
  Ghost,
  CheckCheck,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { getRoleActionMeta, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { formatLocaleTime24h, hasHostingCapability, formatBoundaryProtocolLabel } from "@/lib/calendar/dateLocale";
import { ExitProtocol, VesselProfile } from "@/types/vessel";

interface DarkroomListViewProps {
  onOpenChat: (profileId: string) => void;
  initialSection?: "chats" | "pulses";
}

export const DarkroomListView: React.FC<DarkroomListViewProps> = ({
  onOpenChat,
}) => {
  const {
    profiles,
    chatMessages,
    transmissions,
    receivedPulses,
    unreadPulsesCount,
    t,
    language,
    formatDist,
    setActiveView,
    getBoundaryForProfile,
    getProfileDossier,
    setSelectedProfile,
    transmitSignal,
  } = useVessel();

  // Sub-filtro dentro de chats: "all" | "active" | "hosting"
  const [chatFilter, setChatFilter] = useState<"all" | "active" | "hosting">("all");

  // Perfiles por ID y Codename
  const profilesMap = useMemo(() => {
    const map = new Map<string, VesselProfile>();
    profiles.forEach((p) => {
      map.set(p.id, p);
      if (p.codename) map.set(p.codename.toLowerCase(), p);
    });
    return map;
  }, [profiles]);

  // Pulsos recibidos enriquecidos (para el banner de acceso rápido)
  const enrichedReceivedPulses = useMemo(() => {
    return receivedPulses
      .map((pulse) => ({
        ...pulse,
        profile:
          profilesMap.get(pulse.fromProfileId) ||
          (pulse.fromCodename ? profilesMap.get(pulse.fromCodename.toLowerCase()) : undefined),
      }))
      .filter((item): item is typeof item & { profile: VesselProfile } => Boolean(item.profile))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [receivedPulses, profilesMap]);

  // Perfiles con interacción de chat activa
  const profilesWithInteractions = useMemo(() => {
    return profiles.filter(
      (p) => (chatMessages[p.id] && chatMessages[p.id].length > 0) || (transmissions[p.id] || 0) > 0
    );
  }, [profiles, chatMessages, transmissions]);

  // Perfiles con hosting disponible inmediato
  const immediateHostProfiles = useMemo(() => {
    return profiles.filter(
      (p) => hasHostingCapability(p.mobility) && p.bodyState === "open"
    );
  }, [profiles]);

  // Filtrado según pestaña seleccionada de chats
  const filteredChatList = useMemo(() => {
    if (chatFilter === "active") {
      return profiles.filter((p) => chatMessages[p.id] && chatMessages[p.id].length > 0);
    }
    if (chatFilter === "hosting") {
      return immediateHostProfiles;
    }
    return profilesWithInteractions;
  }, [chatFilter, profiles, chatMessages, profilesWithInteractions, immediateHostProfiles]);

  // Helper para renderizar la píldora de protocolo de salida destacada
  const renderExitProtocolPill = (protocol: ExitProtocol | undefined) => {
    if (!protocol) return null;
    const isFast = protocol === "fast_encounter";
    const isCuddle = protocol === "chill_cuddle";
    const icon = isFast ? "⏱️" : isCuddle ? "🫂" : "🌙";
    const label = isFast
      ? (language === "es" ? "PUNTUAL: Sin sobremesa" : "FAST ENCOUNTER")
      : isCuddle
      ? (language === "es" ? "MIMOS: Ducha y charla" : "SHOWER & CUDDLE")
      : (language === "es" ? "PASAR LA NOCHE: Si hay química" : "SLEEPOVER");
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
    <div className="flex flex-col flex-1 p-3 sm:p-4 pb-48 sm:pb-56 space-y-4 select-none bg-obsidian-deep min-h-[calc(100vh-140px)]">
      {/* CABECERA COMPACTA DE CONVERSACIONES (Sin selector duplicado) */}
      <div className="border-b border-white/10 pb-3 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5" role="tablist">
          {[
            {
              id: "all" as const,
              label: t.chat.tabActive || "Conversaciones",
              count: profilesWithInteractions.length,
            },
            {
              id: "hosting" as const,
              label: t.chat.tabHosting || "Con Casa",
              count: immediateHostProfiles.length,
            },
          ].map((tab) => {
            const isActive =
              chatFilter === "all" || chatFilter === "active"
                ? tab.id === "all"
                : tab.id === "hosting";
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  audioEngine.playStateSwitch(tab.id === "all" ? "open" : "occupied");
                  setChatFilter(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                  isActive
                    ? "bg-electricViolet text-white border border-electricViolet font-extrabold shadow-violet-soft"
                    : "bg-obsidian-surface text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? "bg-black/40 text-white font-black" : "bg-white/10 text-neutral-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN DE CHATS */}
      <div className="space-y-4">
        {/* BANNER TÁCTICO COMPACTO: ACCESO A ZUMBIDOS PENDIENTES */}
        {enrichedReceivedPulses.length > 0 && (
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              setActiveView("pulses");
            }}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-electricViolet/20 via-purple-950/40 to-obsidian-surface border border-electricViolet/40 hover:border-electricViolet flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-violet-soft active:scale-[0.99] group"
          >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-electricViolet/20 border border-electricViolet/50 flex items-center justify-center text-electricViolet-glow flex-shrink-0 shadow-sm">
                  <Activity className="w-5 h-5 animate-pulse stroke-[2.4]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black uppercase text-white tracking-wide">
                      {enrichedReceivedPulses.length}{" "}
                      {enrichedReceivedPulses.length === 1
                        ? (language === "es" ? "Zumbido Recibido" : "Nudge Received")
                        : (language === "es" ? "Zumbidos Recibidos" : "Nudges Received")}
                    </span>
                    {unreadPulsesCount > 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-bloodNeon text-white font-black animate-pulse">
                        {unreadPulsesCount} {language === "es" ? "NUEVOS" : "NEW"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono truncate">
                    {language === "es"
                      ? "Perfiles que te enviaron atracción directa. Toca para devolver zumbido o chatear."
                      : "Profiles who sent direct interest. Tap to return nudge or chat."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Mini Avatares de muestra */}
                <div className="flex -space-x-2 overflow-hidden mr-1">
                  {enrichedReceivedPulses.slice(0, 3).map((item) => (
                    <img
                      key={item.fromProfileId}
                      src={item.profile.avatarUrl}
                      alt={item.profile.codename}
                      className="w-6 h-6 rounded-full border border-black object-cover"
                    />
                  ))}
                </div>
                <ChevronRight className="w-4 h-4 text-electricViolet-glow group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          )}

          {/* RIEL HERO DE CUERPOS CON SITIO DISPONIBLE (Exclusivo en pestaña Conversaciones para evitar duplicar con Con Casa) */}
          {chatFilter === "all" && immediateHostProfiles.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase font-mono tracking-wider text-electricViolet-glow flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {t.chat.immediateHostRailTitle}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {immediateHostProfiles.length} {language === "es" ? "DISPONIBLES" : "AVAILABLE"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {immediateHostProfiles.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      onOpenChat(p.id);
                    }}
                    aria-label={`Abrir chat con ${p.codename}, lugar disponible`}
                    className="bg-obsidian-surface hover:bg-obsidian-hover rounded-2xl border border-electricViolet/30 p-2.5 text-left transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.98] shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-12 h-12 bg-electricViolet/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={p.avatarUrl}
                          alt={p.codename}
                          className="w-8 h-8 rounded-full object-cover bg-obsidian-card border border-electricViolet/50"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-electricViolet rounded-full border border-black animate-pulse" />
                      </div>
                      <div className="truncate min-w-0">
                        <span className="text-xs font-black text-white group-hover:text-electricViolet-glow block truncate">
                          {p.codename}
                        </span>
                        <span className="text-[9px] text-electricViolet-glow font-bold font-mono block">
                          {p.discretizedDistance?.displayLabel || formatDist(p.distanceMeters)}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate flex items-center justify-between">
                      <span className="truncate">{getRoleDisplayLabel(p.role, language)}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-electricViolet/15 text-electricViolet-glow font-mono font-bold">
                        NIVEL {p.intensity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LISTA DE CONVERSACIONES TÁCTICAS COMPACTADAS (MODO OPERATE) */}
          <div className="space-y-2.5 pt-1">
            {filteredChatList.length > 0 ? (
              filteredChatList.map((profile) => {
                const thread = chatMessages[profile.id] || [];
                const lastMsg = thread[thread.length - 1];
                const signalCount = transmissions[profile.id] || 0;
                const activeBoundary = getBoundaryForProfile(profile.id);
                const dossier = getProfileDossier(profile.id);
                const roleAction = getRoleActionMeta(profile.role, language, profile.codename);
                const roleDisplay = getRoleDisplayLabel(profile.role, language);

                // Halo color según estado corporal
                const avatarBorderClass =
                  profile.bodyState === "open"
                    ? "border-electricViolet/80 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                    : profile.bodyState === "occupied"
                    ? "border-bloodNeon/80 shadow-[0_0_12px_rgba(230,25,55,0.4)]"
                    : "border-purple-400/50";

                const unreadCount = thread.filter(
                  (m) => m.senderId !== "me" && m.senderId !== "system" && !m.isRead
                ).length;

                return (
                  <div
                    key={profile.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      audioEngine.playPulse();
                      onOpenChat(profile.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        audioEngine.playPulse();
                        onOpenChat(profile.id);
                      }
                    }}
                    className={`group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 bg-obsidian-surface hover:border-electricViolet/60 shadow-card-elevation cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.99] ${
                      unreadCount > 0
                        ? "border-electricViolet/60 bg-gradient-to-r from-electricViolet/10 via-obsidian-surface to-obsidian-surface shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-electricViolet/40"
                        : "border-white/10 hover:shadow-lg"
                    }`}
                  >
                    {/* IZQUIERDA: AVATAR (TAP PARA PERFIL) + DETALLES DE CONVERSACIÓN */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Avatar táctico interactivo 56x56px */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.playPulse();
                          setSelectedProfile(profile);
                        }}
                        className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                        title={t.pulses?.viewProfile || "Ver Ficha"}
                        aria-label={`${t.pulses?.viewProfile || "Ver Perfil"}: ${profile.codename}`}
                      >
                        <div className={`w-full h-full rounded-2xl overflow-hidden ${avatarBorderClass}`}>
                          <img
                            src={profile.avatarUrl}
                            alt={profile.codename}
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              profile.isFogMode ? "filter blur-[3px] scale-105" : ""
                            }`}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        {profile.bodyState === "open" && (
                          <span className="absolute bottom-1 right-1 w-3 h-3 bg-electricViolet rounded-full border-2 border-black z-10 animate-pulse shadow-violet-soft" />
                        )}
                        {profile.bodyState === "occupied" && (
                          <span className="absolute bottom-1 right-1 w-3 h-3 bg-bloodNeon rounded-full border-2 border-black z-10" />
                        )}
                      </button>

                      {/* Metadata, Último Mensaje y Píldoras Tácticas */}
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span
                              className={`text-sm font-black truncate font-mono ${
                                dossier?.customAlias
                                  ? "text-electricViolet-glow group-hover:text-white"
                                  : "text-white group-hover:text-electricViolet-glow"
                              } transition-colors`}
                            >
                              {dossier?.customAlias || profile.codename}
                            </span>
                            {dossier?.customAlias && (
                              <span className="text-[10px] text-neutral-400 font-mono">
                                ({profile.codename})
                              </span>
                            )}
                            {profile.showAge && (
                              <span className="text-[11px] text-neutral-400 font-medium font-mono">
                                · {profile.age}
                              </span>
                            )}
                            {profile.verification?.isVerified && (
                              <VerificationBadge verification={profile.verification} size="xs" />
                            )}
                            <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                              • {roleDisplay} · {profile.discretizedDistance?.displayLabel || formatDist(profile.distanceMeters)}
                            </span>
                          </div>

                          {/* Timestamp localizado del último mensaje */}
                          {lastMsg && (() => {
                            const timeStr = formatLocaleTime24h(lastMsg.timestamp, language);
                            if (!timeStr) return null;
                            return (
                              <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                {timeStr}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Fila 2: Snippet de Último Mensaje */}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p
                            className={`text-xs truncate font-sans ${
                              unreadCount > 0
                                ? "text-white font-bold"
                                : "text-neutral-400 group-hover:text-neutral-300"
                            }`}
                          >
                            {lastMsg ? (
                              (lastMsg.isBurnOnView || lastMsg.isBurned) ? (
                                <span className="flex items-center gap-1 text-bloodNeon font-mono text-[11px]">
                                  <Flame className="w-3 h-3 animate-pulse" />
                                  <span>{language === "es" ? "Mensaje efímero de lectura única" : "Burn message"}</span>
                                </span>
                              ) : (
                                lastMsg.text
                              )
                            ) : signalCount > 0 ? (
                              <span className="text-electricViolet-glow font-mono text-[11px] flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>{language === "es" ? `Señal emitida (+${signalCount})` : `Pulse sent (+${signalCount})`}</span>
                              </span>
                            ) : (
                              <span className="italic text-neutral-500 text-[11px]">
                                {language === "es" ? "Canal efímero disponible..." : "Channel available..."}
                              </span>
                            )}
                          </p>

                          {profile.isAntiGhost && (
                            <div className="flex-shrink-0">
                              <AntiGhostBadge
                                respectScore={profile.respectScore}
                                responseRateMinutes={profile.responseRateMinutes}
                                size="xs"
                              />
                            </div>
                          )}
                        </div>

                        {/* Fila 3: Píldoras compactas de protocolo de salida y límites traducidos */}
                        {(profile.exitProtocol || profile.onTheClock?.isActive || activeBoundary) && (
                          <div className="pt-1.5 flex flex-wrap items-center gap-1.5 min-w-0">
                            {renderExitProtocolPill(profile.exitProtocol)}

                            {profile.onTheClock?.isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-purple-950/80 border border-electricViolet text-electricViolet-glow font-mono text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                                <span>⚡ YA ({profile.onTheClock.durationMinutes || 45}m)</span>
                              </span>
                            )}

                            {activeBoundary && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-xl font-mono font-bold uppercase">
                                {formatBoundaryProtocolLabel(activeBoundary.protocol, language)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DERECHA: ACCIÓN TÁCTICA CONTEXTUAL (44x44px) */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-electricViolet text-white font-mono text-[10px] font-black shadow-violet-soft">
                          {unreadCount}
                        </span>
                      )}

                      {!lastMsg ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            audioEngine.playPulse();
                            transmitSignal(profile.id);
                          }}
                          className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl bg-electricViolet/15 border border-electricViolet/50 hover:bg-electricViolet hover:text-white text-electricViolet-glow transition-all text-xs font-mono font-black uppercase flex items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                          title={roleAction.actionLabel}
                          aria-label={roleAction.actionLabel}
                        >
                          <span className="text-sm leading-none">{roleAction.icon}</span>
                        </button>
                      ) : (
                        <div className="min-w-[44px] min-h-[44px] rounded-xl bg-white/5 group-hover:bg-electricViolet border border-white/10 group-hover:border-electricViolet text-neutral-300 group-hover:text-white flex items-center justify-center transition-all">
                          <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              /* ESTADO VACÍO DE CONVERSACIONES */
              <div className="bg-obsidian-surface rounded-3xl border border-white/10 p-8 text-center my-6 space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-center mx-auto text-electricViolet shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <MessageSquare className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {t.chat.noChatsTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    {t.chat.noChatsDesc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    setActiveView("grid");
                  }}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-electricViolet text-white font-extrabold text-xs uppercase tracking-wider shadow-violet-soft hover:bg-electricViolet-glow active:scale-95 transition-all cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.pulses?.goToGrid || "Explorar Perfiles"}</span>
                </button>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};


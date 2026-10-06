"use client";

import React, { useState, useMemo } from "react";
import { useVessel, createFallbackProfile } from "@/context/VesselContext";
import {
  MessageSquare,
  Zap,
  Flame,
  LayoutGrid,
  Clock,
  ChevronRight,
  Activity,
  Mic,
  Calendar,
  Sparkles,
  MapPin,
} from "lucide-react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { formatLocaleTime24h, hasHostingCapability, getLocalTodayIso } from "@/lib/calendar/dateLocale";
import { ExitProtocol, VesselProfile } from "@/types/vessel";
import { getActiveAppMode } from "@/lib/storage/localStorageSync";
import { isGhostOrMockProfile, isGhostOrMockProfileId } from "@/lib/firebase/matrixService";

interface DarkroomListViewProps {
  onOpenChat: (profileId: string) => void;
  initialSection?: "chats" | "pulses";
}

export const DarkroomListView: React.FC<DarkroomListViewProps> = ({
  onOpenChat,
}) => {
  const {
    profiles,
    knownProfiles,
    getProfileById,
    chatMessages,
    transmissions,
    receivedPulses,
    unreadPulsesCount,
    diaryEntries,
    activeRendezvous,
    t,
    language,
    setActiveView,
    getProfileDossier,
    setSelectedProfile,
  } = useVessel();

  // Filtro segmentado de la bandeja: "all" | "hosting" | "unread"
  const [chatFilter, setChatFilter] = useState<"all" | "hosting" | "unread">("all");

  // Mapa de perfiles por ID y Codename combinando radar y perfiles conocidos
  const profilesMap = useMemo(() => {
    const map = new Map<string, VesselProfile>();
    Object.values(knownProfiles || {}).forEach((p) => {
      map.set(p.id, p);
      if (p.codename) map.set(p.codename.toLowerCase(), p);
    });
    profiles.forEach((p) => {
      map.set(p.id, p);
      if (p.codename) map.set(p.codename.toLowerCase(), p);
    });
    return map;
  }, [profiles, knownProfiles]);

  // Pulsos recibidos enriquecidos (100% persistentes, nunca se descartan por desconexión)
  const enrichedReceivedPulses = useMemo(() => {
    const isReal = getActiveAppMode() === "real";
    return receivedPulses
      .filter((pulse) => {
        if (isReal && isGhostOrMockProfileId(pulse.fromProfileId)) return false;
        return true;
      })
      .map((pulse) => ({
        ...pulse,
        profile:
          profilesMap.get(pulse.fromProfileId) ||
          (pulse.fromCodename ? profilesMap.get(pulse.fromCodename.toLowerCase()) : undefined) ||
          (getProfileById ? getProfileById(pulse.fromProfileId) : undefined) ||
          createFallbackProfile(pulse.fromProfileId || "usuario"),
      }))
      .filter((item) => {
        if (isReal && item.profile && isGhostOrMockProfile(item.profile)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [receivedPulses, profilesMap, getProfileById]);

  // Obtener todos los IDs de conversación existentes (chatMessages con mensajes o transmisiones con pulsos)
  const conversationPartnerIds = useMemo(() => {
    const isReal = getActiveAppMode() === "real";
    const ids = new Set<string>();
    Object.entries(chatMessages).forEach(([id, msgs]) => {
      if (msgs && msgs.length > 0 && id !== "me" && id !== "system") {
        if (isReal && isGhostOrMockProfileId(id)) return;
        ids.add(id);
      }
    });
    Object.entries(transmissions).forEach(([id, count]) => {
      if (count && count > 0 && id !== "me" && id !== "system") {
        if (isReal && isGhostOrMockProfileId(id)) return;
        ids.add(id);
      }
    });
    return Array.from(ids);
  }, [chatMessages, transmissions]);

  // Perfiles con interacción de chat activa (conversaciones reales 100% persistentes)
  const profilesWithInteractions = useMemo(() => {
    const isReal = getActiveAppMode() === "real";
    return conversationPartnerIds
      .map((id) => profilesMap.get(id) || (getProfileById ? getProfileById(id) : undefined) || createFallbackProfile(id))
      .filter((p): p is VesselProfile => {
        if (!p || !p.id) return false;
        if (isReal && isGhostOrMockProfile(p)) return false;
        return true;
      })
      .sort((a, b) => {
        const msgsA = chatMessages[a.id] || [];
        const msgsB = chatMessages[b.id] || [];
        const lastA = msgsA[msgsA.length - 1];
        const lastB = msgsB[msgsB.length - 1];
        const timeA = lastA ? (lastA.timestamp ? new Date(lastA.timestamp).getTime() : 0) : 0;
        const timeB = lastB ? (lastB.timestamp ? new Date(lastB.timestamp).getTime() : 0) : 0;
        return timeB - timeA;
      });
  }, [conversationPartnerIds, profilesMap, getProfileById, chatMessages]);

  // Perfiles con los que chateás que tienen lugar para recibir
  const hostingChatProfiles = useMemo(() => {
    return profilesWithInteractions.filter((p) => hasHostingCapability(p.mobility));
  }, [profilesWithInteractions]);

  // Perfiles con mensajes sin leer
  const unreadChatProfiles = useMemo(() => {
    return profilesWithInteractions.filter((p) => {
      const thread = chatMessages[p.id] || [];
      return thread.some((m) => m.senderId !== "me" && m.senderId !== "system" && !m.isRead);
    });
  }, [profilesWithInteractions, chatMessages]);

  // Citas agendadas para hoy (Smart Bar)
  const todayUpcomingDates = useMemo(() => {
    const todayIso = getLocalTodayIso();
    return diaryEntries
      .filter((entry) => entry.isUpcoming && entry.date === todayIso)
      .sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
  }, [diaryEntries]);

  // Lista filtrada según pestaña seleccionada
  const filteredChatList = useMemo(() => {
    if (chatFilter === "hosting") return hostingChatProfiles;
    if (chatFilter === "unread") return unreadChatProfiles;
    return profilesWithInteractions;
  }, [chatFilter, profilesWithInteractions, hostingChatProfiles, unreadChatProfiles]);

  // Helper para renderizar micro-píldora de protocolo de salida
  const renderExitProtocolPill = (protocol: ExitProtocol | undefined) => {
    if (!protocol) return null;
    const isFast = protocol === "fast_encounter";
    const isCuddle = protocol === "chill_cuddle";
    const icon = isFast ? "⏱️" : isCuddle ? "🫂" : "🌙";
    const label = isFast
      ? (language === "es" ? "Touch & go" : "Quick exit")
      : isCuddle
      ? (language === "es" ? "Mimos & charla" : "Cuddle & relax")
      : (language === "es" ? "Dormir juntos" : "Sleepover");

    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[9px] font-mono font-bold uppercase">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 p-3 sm:p-4 pb-48 sm:pb-56 space-y-3.5 select-none bg-obsidian-deep min-h-[calc(100vh-140px)]">
      {/* 1. CABECERA LIMPIA: FILTROS SEGMENTADOS DE 1 TOQUE (OPERATE FIRST) */}
      <div className="border-b border-white/10 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5" role="tablist">
          {[
            {
              id: "all" as const,
              label: t.chat.filterAll || (language === "es" ? "Todos" : "All"),
              count: profilesWithInteractions.length,
            },
            {
              id: "hosting" as const,
              label: t.chat.filterHosting || (language === "es" ? "Ponen lugar 🏠" : "Can Host 🏠"),
              count: hostingChatProfiles.length,
            },
            {
              id: "unread" as const,
              label: t.chat.filterUnread || (language === "es" ? "No leídos" : "Unread"),
              count: unreadChatProfiles.length,
            },
          ].map((tab) => {
            const isActive = chatFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  audioEngine.playPulse();
                  setChatFilter(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                  isActive
                    ? "bg-electricViolet text-white border border-electricViolet shadow-violet-soft font-black"
                    : "bg-obsidian-surface text-neutral-400 border border-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                      isActive
                        ? "bg-black/40 text-white"
                        : tab.id === "unread"
                        ? "bg-bloodNeon text-white animate-pulse"
                        : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CHIP DISCRETO DE ZUMBIDOS PENDIENTES (Solo si hay nuevos zumbidos, sin robar pantalla) */}
      {enrichedReceivedPulses.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping flex-shrink-0" />
            <span className="font-mono text-[11px] text-neutral-300 truncate">
              <strong className="text-white">{enrichedReceivedPulses.length}</strong>{" "}
              {enrichedReceivedPulses.length === 1
                ? (language === "es" ? "zumbido recibido" : "nudge received")
                : (language === "es" ? "zumbidos recibidos" : "nudges received")}
              {unreadPulsesCount > 0 && (
                <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded bg-bloodNeon text-white font-bold">
                  {unreadPulsesCount} {language === "es" ? "NUEVOS" : "NEW"}
                </span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              audioEngine.playPulse();
              setActiveView("pulses");
            }}
            className="text-[11px] font-mono font-bold text-electricViolet-glow hover:text-white flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <span>{language === "es" ? "Ver" : "View"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. SMART BAR: CÁPSULAS DE CITAS HOY / PIN ACTIVO (Solo visible si hay actividad) */}
      {(activeRendezvous || todayUpcomingDates.length > 0) && (
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase font-mono tracking-wider text-electricViolet-glow flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-electricViolet" />
              <span>{t.chat.filterUpcoming || (language === "es" ? "Citas de hoy y encuentros activos" : "Today's Dates & Active Meets")}</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {(activeRendezvous ? 1 : 0) + todayUpcomingDates.length} {language === "es" ? "ACTIVAS" : "ACTIVE"}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Cápsula de PIN Activo (Rendezvous) */}
            {activeRendezvous && (() => {
              const targetProfile = profilesMap.get(activeRendezvous.profileId);
              return (
                <button
                  key="rendezvous-capsule"
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    onOpenChat(activeRendezvous.profileId);
                  }}
                  className="flex items-center gap-2.5 p-2 pr-3 rounded-2xl bg-gradient-to-r from-bloodNeon/25 via-obsidian-surface to-obsidian-surface border border-bloodNeon/60 hover:border-bloodNeon text-left transition-all cursor-pointer shadow-blood-glow flex-shrink-0 active:scale-98"
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-bloodNeon bg-neutral-900 flex-shrink-0">
                    {targetProfile?.avatarUrl ? (
                      <img
                        src={targetProfile.avatarUrl}
                        alt={activeRendezvous.profileCodename}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-mono text-bloodNeon font-bold">
                        PIN
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-bloodNeon border border-black animate-ping" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white truncate">
                        {activeRendezvous.profileCodename}
                      </span>
                      <span className="text-[8px] font-mono font-black px-1.5 py-0.2 rounded bg-bloodNeon text-white uppercase">
                        PIN ACTIVO
                      </span>
                    </div>
                    <p className="text-[10px] text-bloodNeon font-mono font-medium truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{language === "es" ? "Encuentro en curso" : "Meet in progress"}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-bloodNeon ml-1 flex-shrink-0" />
                </button>
              );
            })()}

            {/* Cápsulas de Citas Agendadas para Hoy */}
            {todayUpcomingDates.map((entry) => {
              const partnerId = entry.person.profileId;
              const partnerProfile = partnerId ? profilesMap.get(partnerId) : undefined;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    if (partnerId) {
                      onOpenChat(partnerId);
                    }
                  }}
                  className="flex items-center gap-2.5 p-2 pr-3 rounded-2xl bg-gradient-to-r from-electricViolet/20 via-obsidian-surface to-obsidian-surface border border-electricViolet/40 hover:border-electricViolet text-left transition-all cursor-pointer shadow-violet-soft flex-shrink-0 active:scale-98"
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-electricViolet/60 bg-neutral-900 flex-shrink-0">
                    <img
                      src={entry.person.avatarUrl || partnerProfile?.avatarUrl || "/placeholders/avatar.jpg"}
                      alt={entry.person.codename}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-mintNeon border border-black" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white truncate">
                        {entry.person.codename}
                      </span>
                      {entry.time && (
                        <span className="text-[9px] font-mono font-bold text-electricViolet-glow">
                          {entry.time} hs
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono truncate flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-electricViolet flex-shrink-0" />
                      <span>{language === "es" ? "Cita agendada hoy" : "Date today"}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-electricViolet-glow ml-1 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. BANDEJA DE CONVERSACIONES ERGONÓMICAS (ALTURA ~68px, OPERATE MODE) */}
      <div className="space-y-2 pt-1">
        {filteredChatList.length > 0 ? (
          filteredChatList.map((profile) => {
            const thread = chatMessages[profile.id] || [];
            const lastMsg = thread[thread.length - 1];
            const signalCount = transmissions[profile.id] || 0;
            const dossier = getProfileDossier(profile.id);

            const unreadCount = thread.filter(
              (m) => m.senderId !== "me" && m.senderId !== "system" && !m.isRead
            ).length;

            const avatarBorderClass =
              profile.bodyState === "open"
                ? "border-electricViolet shadow-violet-soft"
                : profile.bodyState === "occupied"
                ? "border-bloodNeon shadow-blood-glow"
                : "border-purple-500/40";

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
                className={`group relative flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 bg-obsidian-surface hover:border-electricViolet/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.99] ${
                  unreadCount > 0
                    ? "border-electricViolet/50 bg-gradient-to-r from-electricViolet/10 via-obsidian-surface to-obsidian-surface shadow-[0_0_16px_rgba(139,92,246,0.12)]"
                    : "border-white/10 hover:shadow-md"
                }`}
              >
                {/* IZQUIERDA: AVATAR ERGONÓMICO 48x48px (TAP PARA FICHA) */}
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioEngine.playPulse();
                      setSelectedProfile(profile);
                    }}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 bg-neutral-900 transition-transform cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${avatarBorderClass}`}
                    title={language === "es" ? `Ver ficha de ${profile.codename}` : `View bio of ${profile.codename}`}
                  >
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.codename}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className={`w-full h-full object-cover transition-transform duration-200 ${
                          profile.isFogMode ? "filter blur-[3px]" : ""
                        }`}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center font-mono font-black text-sm bg-purple-950/80 text-electricViolet-glow ${
                        profile.avatarUrl ? "hidden" : "flex"
                      }`}
                    >
                      {(profile.codename || "??").slice(0, 2).toUpperCase()}
                    </div>
                  </button>
                  {profile.bodyState === "open" && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-mintNeon rounded-full border-2 border-black z-10" />
                  )}
                  {profile.bodyState === "occupied" && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-bloodNeon rounded-full border-2 border-black z-10" />
                  )}
                </div>

                {/* CENTRO: INFORMACIÓN JERÁRQUICA LIMPIA (CERO COLISIONES) */}
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  {/* Fila 1: Nombre, edad, verificación y hora */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`text-sm truncate font-mono ${
                          unreadCount > 0
                            ? "text-white font-black"
                            : "text-neutral-100 group-hover:text-electricViolet-glow font-bold"
                        } transition-colors`}
                      >
                        {dossier?.customAlias || profile.codename}
                      </span>
                      {profile.showAge && (
                        <span className="text-[11px] text-neutral-400 font-mono">
                          · {profile.age}
                        </span>
                      )}
                      {profile.verification?.isVerified && (
                        <VerificationBadge verification={profile.verification} size="xs" />
                      )}
                      {profile.isAntiGhost && (
                        <AntiGhostBadge
                          respectScore={profile.respectScore}
                          responseRateMinutes={profile.responseRateMinutes}
                          size="xs"
                        />
                      )}
                    </div>

                    {lastMsg && (() => {
                      const timeStr = formatLocaleTime24h(lastMsg.timestamp, language);
                      if (!timeStr) return null;
                      return (
                        <span
                          className={`text-[10px] font-mono flex-shrink-0 flex items-center gap-1 ${
                            unreadCount > 0 ? "text-electricViolet-glow font-black" : "text-neutral-500"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {timeStr}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Fila 2: Snippet de mensaje y micro-badge derecho */}
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate font-sans ${
                        unreadCount > 0 ? "text-white font-semibold" : "text-neutral-400 group-hover:text-neutral-300"
                      }`}
                    >
                      {lastMsg ? (
                        lastMsg.isBurnOnView || lastMsg.isBurned ? (
                          <span className="flex items-center gap-1 text-bloodNeon font-mono text-[11px]">
                            <Flame className="w-3 h-3 animate-pulse" />
                            <span>{language === "es" ? "Mensaje efímero (1 sola vista)" : "Burn message"}</span>
                          </span>
                        ) : lastMsg.isVoiceMessage ? (
                          <span className="flex items-center gap-1 text-mintNeon font-mono text-[11px]">
                            <Mic className="w-3 h-3" />
                            <span>
                              {language === "es"
                                ? `Audio (${lastMsg.voiceData?.durationSeconds || 0}s)`
                                : `Voice note (${lastMsg.voiceData?.durationSeconds || 0}s)`}
                            </span>
                          </span>
                        ) : lastMsg.isPreFlightChecklist ? (
                          <span className="flex items-center gap-1 text-electricViolet-glow font-mono text-[11px]">
                            <Zap className="w-3 h-3" />
                            <span>{language === "es" ? "Acuerdo de encuentro" : "Pre-flight agreement"}</span>
                          </span>
                        ) : (
                          lastMsg.text
                        )
                      ) : signalCount > 0 ? (
                        <span className="text-electricViolet-glow font-mono text-[11px] flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>
                            {language === "es" ? `Zumbido enviado (+${signalCount})` : `Nudge sent (+${signalCount})`}
                          </span>
                        </span>
                      ) : (
                        <span className="italic text-neutral-500 text-[11px]">
                          {language === "es" ? "Chat listo..." : "Chat ready..."}
                        </span>
                      )}
                    </p>

                    {/* Micro-etiquetas derechas: Pone lugar y contador no leídos */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {hasHostingCapability(profile.mobility) && (
                        <span className="text-[9px] font-mono font-bold text-neutral-400 bg-white/5 border border-white/10 px-1.5 py-0.2 rounded-md hidden xs:inline-flex items-center gap-0.5">
                          🏠 Lugar
                        </span>
                      )}
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-electricViolet text-white font-mono text-[10px] font-black shadow-violet-soft">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fila 3: Micro-tags de protocolo o estado activo (Solo si existen) */}
                  {(profile.exitProtocol || profile.onTheClock?.isActive) && (
                    <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                      {renderExitProtocolPill(profile.exitProtocol)}
                      {profile.onTheClock?.isActive && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-purple-950/80 border border-electricViolet/50 text-electricViolet-glow font-mono text-[9px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                          ⚡ YA ({profile.onTheClock.durationMinutes || 45}m)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* ESTADO VACÍO CONTEXTUAL SEGÚN PESTAÑA */
          <div className="bg-obsidian-surface rounded-3xl border border-white/10 p-8 text-center my-6 space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-center mx-auto text-electricViolet shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <MessageSquare className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {chatFilter === "hosting"
                  ? (language === "es" ? "Sin chats con lugar disponible" : "No chats with host available")
                  : chatFilter === "unread"
                  ? (language === "es" ? "¡Estás al día!" : "All caught up!")
                  : t.chat.noChatsTitle}
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                {chatFilter === "hosting"
                  ? (language === "es"
                      ? "Ninguno de tus chats actuales tiene lugar para recibir en este momento."
                      : "None of your active chats have a place to host right now.")
                  : chatFilter === "unread"
                  ? (language === "es"
                      ? "No tenés mensajes pendientes de lectura en este momento."
                      : "No unread messages right now.")
                  : t.chat.noChatsDesc}
              </p>
            </div>

            {chatFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setChatFilter("all");
                }}
                className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>{language === "es" ? "Ver todos los chats" : "View all chats"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPulse();
                  setActiveView("grid");
                }}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-electricViolet text-white font-extrabold text-xs uppercase tracking-wider shadow-violet-soft hover:bg-electricViolet-glow active:scale-95 transition-all cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                <span>{t.pulses?.goToGrid || (language === "es" ? "Explorar Radar" : "Explore Radar")}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

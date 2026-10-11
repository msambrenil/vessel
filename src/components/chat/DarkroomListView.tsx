"use client";

import React, { useState, useMemo } from "react";
import {
  useRadarMatrix,
  useChat,
  useDiary,
  useSettings,
  createFallbackProfile,
} from "@/context/VesselContext";
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
import { SegmentedTabGroup, SegmentedTabItem } from "@/components/ui/SegmentedTabGroup";
import { TacticalAvatar } from "@/components/ui/TacticalAvatar";
import { TacticalBadge } from "@/components/ui/TacticalBadge";
import { BrutalistButton } from "@/components/ui/BrutalistButton";

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
    transmissions,
    receivedPulses,
    unreadPulsesCount,
    hasMutualPulse,
    setActiveView,
    setSelectedProfile,
  } = useRadarMatrix();

  const {
    chatMessages,
    activeRendezvous,
  } = useChat();

  const {
    diaryEntries,
    getProfileDossier,
  } = useDiary();

  const {
    t,
    language,
  } = useSettings();

  // Filtro segmentado de la bandeja: "all" | "mutual" | "hosting" | "unread"
  const [chatFilter, setChatFilter] = useState<"all" | "mutual" | "hosting" | "unread">("all");

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

  // Perfiles con sintonía / onda mutua activa (toques correspondidos)
  const mutualPulseProfiles = useMemo(() => {
    if (!hasMutualPulse) return [];
    return enrichedReceivedPulses.filter((p) => p.profile && hasMutualPulse(p.profile.id));
  }, [enrichedReceivedPulses, hasMutualPulse]);

  // Obtener todos los IDs de conversación existentes (chatMessages con mensajes, transmisiones con pulsos o toques mutuos)
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
    // Auto-promover perfiles con Onda Mutua 🔥 para que aparezcan de inmediato en la bandeja de chats
    if (hasMutualPulse) {
      enrichedReceivedPulses.forEach((pulse) => {
        if (pulse.profile && hasMutualPulse(pulse.profile.id)) {
          if (isReal && isGhostOrMockProfileId(pulse.profile.id)) return;
          ids.add(pulse.profile.id);
        }
      });
    }
    return Array.from(ids);
  }, [chatMessages, transmissions, enrichedReceivedPulses, hasMutualPulse]);

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
    if (chatFilter === "mutual") return profilesWithInteractions.filter((p) => hasMutualPulse?.(p.id));
    if (chatFilter === "hosting") return hostingChatProfiles;
    if (chatFilter === "unread") return unreadChatProfiles;
    return profilesWithInteractions;
  }, [chatFilter, profilesWithInteractions, hostingChatProfiles, unreadChatProfiles, hasMutualPulse]);

  // Pestañas segmentadas con diseño Brutalista del sistema
  const tabItems = useMemo<SegmentedTabItem<"all" | "mutual" | "hosting" | "unread">[]>(() => {
    return [
      {
        id: "all",
        label: t.chat.filterAll || (language === "es" ? "Todos" : "All"),
        badge: profilesWithInteractions.length > 0 ? (
          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black bg-white/10 text-neutral-300">
            {profilesWithInteractions.length}
          </span>
        ) : undefined,
      },
      ...(mutualPulseProfiles.length > 0
        ? [
            {
              id: "mutual" as const,
              label: language === "es" ? "Onda Mutua 🔥" : "Mutual 🔥",
              badge: (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black bg-mintNeon text-obsidian-deep">
                  {mutualPulseProfiles.length}
                </span>
              ),
              accentClass: "text-mintNeon",
            },
          ]
        : []),
      {
        id: "hosting",
        label: t.chat.filterHosting || (language === "es" ? "Tienen lugar 🏠" : "Can Host 🏠"),
        badge: hostingChatProfiles.length > 0 ? (
          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black bg-white/10 text-neutral-300">
            {hostingChatProfiles.length}
          </span>
        ) : undefined,
      },
      {
        id: "unread",
        label: t.chat.filterUnread || (language === "es" ? "No leídos" : "Unread"),
        badge: unreadChatProfiles.length > 0 ? (
          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black bg-bloodNeon text-white animate-pulse">
            {unreadChatProfiles.length}
          </span>
        ) : undefined,
        accentClass: unreadChatProfiles.length > 0 ? "text-bloodNeon" : undefined,
      },
    ];
  }, [
    t.chat.filterAll,
    t.chat.filterHosting,
    t.chat.filterUnread,
    language,
    profilesWithInteractions.length,
    mutualPulseProfiles.length,
    hostingChatProfiles.length,
    unreadChatProfiles.length,
  ]);

  // Helper para renderizar micro-píldora de protocolo de salida
  const renderExitProtocolPill = (protocol: ExitProtocol | undefined) => {
    if (!protocol) return null;
    const isFast = protocol === "fast_encounter";
    const isCuddle = protocol === "chill_cuddle";
    const icon = isFast ? "⏱️" : isCuddle ? "🫂" : "🌙";
    const label = isFast
      ? (language === "es" ? "Touch & go" : "Quick exit")
      : isCuddle
      ? (language === "es" ? "Tranqui" : "Cuddle")
      : (language === "es" ? "Pasar la noche" : "Sleepover");

    return (
      <TacticalBadge
        variant="purple"
        size="xs"
        className="!px-1.5 !py-0.2"
        icon={<span>{icon}</span>}
      >
        <span>{label}</span>
      </TacticalBadge>
    );
  };

  return (
    <div className="flex flex-col flex-1 p-3 sm:p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-28 space-y-3 select-none bg-obsidian-deep min-h-[calc(100dvh-140px)]">
      {/* 1. CABECERA LIMPIA: FILTROS SEGMENTADOS STICKY (1 TOQUE) */}
      <div className="sticky top-0 z-30 bg-obsidian-deep/95 backdrop-blur-md pt-1 pb-2.5 border-b border-white/10 -mx-3 sm:-mx-4 px-3 sm:px-4">
        <SegmentedTabGroup
          tabs={tabItems}
          activeTab={chatFilter}
          onChange={(id) => setChatFilter(id as typeof chatFilter)}
          variant="obsidian"
          size="default"
          className="w-full overflow-x-auto no-scrollbar"
          ariaLabel={language === "es" ? "Filtros de conversaciones" : "Conversation filters"}
        />
      </div>

      {/* 2. CHIP DISCRETO DE TOQUES PENDIENTES (Solo si hay nuevos toques, sin robar pantalla) */}
      {enrichedReceivedPulses.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-electricViolet animate-ping flex-shrink-0" />
            <span className="font-mono text-[11px] text-neutral-300 truncate">
              <strong className="text-white">{enrichedReceivedPulses.length}</strong>{" "}
              {enrichedReceivedPulses.length === 1
                ? (language === "es" ? "toque recibido" : "tap received")
                : (language === "es" ? "toques recibidos" : "taps received")}
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
            className="text-[11px] font-mono font-bold text-electricViolet-glow hover:text-white flex items-center gap-1 cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:underline"
          >
            <span>{language === "es" ? "Ver" : "View"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. SMART TRAY 1: CITAS DE HOY & PIN ACTIVO (CONFIRMADOS REALES) */}
      {(activeRendezvous || todayUpcomingDates.length > 0) && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase font-mono tracking-wider text-bloodNeon flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-bloodNeon" />
              <span>{language === "es" ? "Citas de hoy & encuentros confirmados" : "Today's Dates & Meets"}</span>
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
                  className="flex items-center gap-2.5 p-2 pr-3 rounded-2xl bg-gradient-to-r from-bloodNeon/25 via-obsidian-surface to-obsidian-surface border border-bloodNeon/60 hover:border-bloodNeon text-left transition-all cursor-pointer shadow-blood-glow flex-shrink-0 active:scale-98 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bloodNeon"
                >
                  <TacticalAvatar
                    src={targetProfile?.avatarUrl}
                    alt={activeRendezvous.profileCodename}
                    codename={activeRendezvous.profileCodename}
                    size="xs"
                    borderVariant="blood"
                    hasUnreadPing={true}
                    pingVariant="blood"
                  />
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
                  className="flex items-center gap-2.5 p-2 pr-3 rounded-2xl bg-gradient-to-r from-electricViolet/20 via-obsidian-surface to-obsidian-surface border border-electricViolet/40 hover:border-electricViolet text-left transition-all cursor-pointer shadow-violet-soft flex-shrink-0 active:scale-98 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electricViolet"
                >
                  <TacticalAvatar
                    src={entry.person.avatarUrl || partnerProfile?.avatarUrl}
                    alt={entry.person.codename}
                    codename={entry.person.codename}
                    size="xs"
                    borderVariant="violet"
                  />
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

      {/* 4. SMART TRAY 2: PEGARON ONDA 🔥 (MATCHES MUTUOS LISTOS PARA HABLAR) */}
      {mutualPulseProfiles.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase font-mono tracking-wider text-mintNeon flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-mintNeon fill-current" />
              <span>{language === "es" ? "Pegaron Onda 🔥 (Matches para chatear)" : "Mutual Matches 🔥"}</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {mutualPulseProfiles.length} {language === "es" ? "NUEVOS" : "NEW"}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {mutualPulseProfiles.map((pulse) => {
              const partnerProfile = pulse.profile;
              if (!partnerProfile) return null;
              return (
                <button
                  key={`mutual-${partnerProfile.id}`}
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    onOpenChat(partnerProfile.id);
                  }}
                  className="flex items-center gap-2.5 p-2 pr-3 rounded-2xl bg-gradient-to-r from-mintNeon/20 via-obsidian-surface to-obsidian-surface border border-mintNeon/40 hover:border-mintNeon text-left transition-all cursor-pointer shadow-mint-glow flex-shrink-0 active:scale-98 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mintNeon"
                >
                  <TacticalAvatar
                    src={partnerProfile.avatarUrl}
                    alt={partnerProfile.codename}
                    codename={partnerProfile.codename}
                    size="xs"
                    borderVariant="emerald"
                    hasUnreadPing={true}
                    pingVariant="emerald"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white truncate">
                        {partnerProfile.codename}
                      </span>
                      <span className="text-[8px] font-mono font-black px-1.5 py-0.2 rounded bg-mintNeon text-obsidian-deep uppercase">
                        ONDA MUTUA 🔥
                      </span>
                    </div>
                    <p className="text-[10px] text-mintNeon font-mono truncate flex items-center gap-1">
                      <Zap className="w-3 h-3 text-mintNeon flex-shrink-0 fill-current" />
                      <span>{language === "es" ? "Toque correspondido · Chateá" : "Mutual tap · Chat"}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-mintNeon ml-1 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. BANDEJA DE CONVERSACIONES ERGONÓMICAS (ALTURA HOMOGÉNEA DE 2 LÍNEAS) */}
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

            // Formateo sintetizado e inequívoco del snippet de última interacción
            let snippetContent: React.ReactNode = null;
            if (lastMsg) {
              if (lastMsg.isBurnOnView || lastMsg.isBurned) {
                snippetContent = (
                  <span className="flex items-center gap-1 text-bloodNeon font-mono text-[11px]">
                    <Flame className="w-3 h-3 animate-pulse" />
                    <span>{language === "es" ? "Mensaje efímero (1 sola vista)" : "Burn message"}</span>
                  </span>
                );
              } else if (lastMsg.isVoiceMessage) {
                snippetContent = (
                  <span className="flex items-center gap-1 text-mintNeon font-mono text-[11px]">
                    <Mic className="w-3 h-3" />
                    <span>
                      {language === "es"
                        ? `Audio (${lastMsg.voiceData?.durationSeconds || 0}s)`
                        : `Voice note (${lastMsg.voiceData?.durationSeconds || 0}s)`}
                    </span>
                  </span>
                );
              } else if (
                lastMsg.isKindClosure ||
                (lastMsg.text && lastMsg.text.includes("PROTOCOLO CERO PLANTONES")) ||
                (lastMsg.text && lastMsg.text.includes("Puntos de Respeto"))
              ) {
                snippetContent = (
                  <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] font-semibold">
                    <span>✌️</span>
                    <span>{language === "es" ? "Salida con onda (+5 Respeto)" : "Kind exit (+5 Respect)"}</span>
                  </span>
                );
              } else if (lastMsg.isSecureWaypoint) {
                snippetContent = (
                  <span className="flex items-center gap-1 text-electricViolet-glow font-mono text-[11px]">
                    <MapPin className="w-3 h-3" />
                    <span>{language === "es" ? "Esquina pactada (Fase 1)" : "Safe waypoint"}</span>
                  </span>
                );
              } else if (lastMsg.isEncounterTicket) {
                snippetContent = (
                  <span className="flex items-center gap-1 text-amber-300 font-mono text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>{language === "es" ? "Ticket de cita enviado" : "Encounter ticket"}</span>
                  </span>
                );
              } else if (lastMsg.isPreFlightChecklist) {
                snippetContent = (
                  <span className="flex items-center gap-1 text-electricViolet-glow font-mono text-[11px]">
                    <Zap className="w-3 h-3" />
                    <span>{language === "es" ? "Acuerdo de encuentro" : "Pre-flight agreement"}</span>
                  </span>
                );
              } else {
                snippetContent = lastMsg.text;
              }
            } else if (hasMutualPulse?.(profile.id)) {
              snippetContent = (
                <span className="text-mintNeon font-mono text-[11px] font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-mintNeon flex-shrink-0 fill-current" />
                  <span>
                    {language === "es" ? "¡Pegaron onda! Toque correspondido" : "Mutual match! Tap returned"}
                  </span>
                </span>
              );
            } else if (signalCount > 0) {
              snippetContent = (
                <span className="text-electricViolet-glow font-mono text-[11px] flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>
                    {language === "es" ? `Toque enviado (+${signalCount})` : `Tap sent (+${signalCount})`}
                  </span>
                </span>
              );
            } else {
              snippetContent = (
                <span className="italic text-neutral-400 text-[11px]">
                  {language === "es" ? "Chat listo..." : "Chat ready..."}
                </span>
              );
            }

            return (
              <div
                key={profile.id}
                className={`group relative flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 bg-obsidian-surface hover:border-electricViolet/50 ${
                  unreadCount > 0
                    ? "border-electricViolet/50 bg-gradient-to-r from-electricViolet/10 via-obsidian-surface to-obsidian-surface shadow-[0_0_16px_rgba(139,92,246,0.12)]"
                    : "border-white/10 hover:shadow-md"
                }`}
              >
                {/* IZQUIERDA: AVATAR TÁCTICO INDEPENDIENTE (CLICK ABRE FICHA DIRECTA) */}
                <div className="relative flex-shrink-0">
                  <TacticalAvatar
                    src={profile.avatarUrl}
                    alt={profile.codename}
                    codename={profile.codename}
                    size="sm"
                    borderVariant={
                      profile.bodyState === "open"
                        ? "emerald"
                        : profile.bodyState === "occupied"
                        ? "blood"
                        : "violet"
                    }
                    bodyState={profile.bodyState}
                    isFogMode={profile.isFogMode}
                    hasUnreadPing={unreadCount > 0}
                    pingVariant="blood"
                    onClick={() => setSelectedProfile(profile)}
                    soundEffect="pulse"
                    ariaLabel={language === "es" ? `Ver ficha de ${profile.codename}` : `View bio of ${profile.codename}`}
                  />
                </div>

                {/* CENTRO Y DERECHA: BOTÓN SEMÁNTICO PRINCIPAL (LÍNEAS 1 Y 2 UNIFORMES) */}
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPulse();
                    onOpenChat(profile.id);
                  }}
                  aria-label={
                    language === "es"
                      ? `Abrir chat con ${dossier?.customAlias || profile.codename}`
                      : `Open chat with ${dossier?.customAlias || profile.codename}`
                  }
                  className="min-w-0 flex-1 flex flex-col justify-center text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-electricViolet rounded-xl p-0.5 transition-transform active:scale-[0.99]"
                >
                  {/* Fila 1: Identidad, micro-tags, hora */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
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
                        <span className="text-[11px] text-neutral-400 font-mono flex-shrink-0">
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
                      {/* Micro-tags integrados en línea 1 para no desfasar la altura del card */}
                      {renderExitProtocolPill(profile.exitProtocol)}
                      {profile.onTheClock?.isActive && (
                        <TacticalBadge
                          variant="violet"
                          size="xs"
                          className="!px-1.5 !py-0.2 !bg-purple-950/80 !border-electricViolet/50 !text-electricViolet-glow font-bold"
                          pulse
                        >
                          <span>⚡ YA</span>
                        </TacticalBadge>
                      )}
                    </div>

                    {lastMsg && (() => {
                      const timeStr = formatLocaleTime24h(lastMsg.timestamp, language);
                      if (!timeStr) return null;
                      return (
                        <span
                          className={`text-[10px] font-mono flex-shrink-0 flex items-center gap-1 ${
                            unreadCount > 0 ? "text-electricViolet-glow font-black" : "text-neutral-400"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {timeStr}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Fila 2: Snippet sintetizado y etiquetas derechas (Lugar / Unread) */}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate font-sans ${
                        unreadCount > 0 ? "text-white font-semibold" : "text-neutral-400 group-hover:text-neutral-300"
                      }`}
                    >
                      {snippetContent}
                    </p>

                    {/* Micro-etiquetas derechas: Tiene depto y contador no leídos */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {hasHostingCapability(profile.mobility) && (
                        <TacticalBadge
                          variant="neutral"
                          size="xs"
                          className="!px-1.5 !py-0.2 !text-neutral-400 !bg-white/5 !border-white/10"
                        >
                          <span>🏠 {language === "es" ? "Depto" : "Apt"}</span>
                        </TacticalBadge>
                      )}
                      {unreadCount > 0 && (
                        <TacticalBadge
                          variant="violet"
                          size="xs"
                          className="!px-2 !py-0.5 !rounded-full shadow-violet-soft font-black text-white !bg-electricViolet"
                        >
                          <span>{unreadCount}</span>
                        </TacticalBadge>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })
        ) : (
          /* ESTADO VACÍO CONTEXTUAL SEGÚN PESTAÑA (BRUTALIST BUTTON EN VEZ DE NATIVO) */
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

            <div className="pt-2 flex justify-center">
              {chatFilter !== "all" ? (
                <BrutalistButton
                  variant="outline"
                  size="default"
                  onClick={() => setChatFilter("all")}
                  soundEffect="pulse"
                  aria-label={language === "es" ? "Ver todos los chats" : "View all chats"}
                >
                  <span>{language === "es" ? "Ver todos los chats" : "View all chats"}</span>
                </BrutalistButton>
              ) : (
                <BrutalistButton
                  variant="primary"
                  size="default"
                  onClick={() => setActiveView("grid")}
                  soundEffect="pulse"
                  aria-label={t.pulses?.goToGrid || (language === "es" ? "Explorar Radar" : "Explore Radar")}
                >
                  <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.pulses?.goToGrid || (language === "es" ? "Explorar Radar" : "Explore Radar")}</span>
                </BrutalistButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Espaciador de seguridad para scroll completo sobre dock de navegación */}
      <div className="h-8 flex-shrink-0" aria-hidden="true" />
    </div>
  );
};

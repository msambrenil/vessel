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
import { ExitProtocol, VesselProfile } from "@/types/vessel";

interface DarkroomListViewProps {
  onOpenChat: (profileId: string) => void;
  initialSection?: "chats" | "pulses";
}

export const DarkroomListView: React.FC<DarkroomListViewProps> = ({
  onOpenChat,
  initialSection,
}) => {
  const {
    profiles,
    chatMessages,
    transmissions,
    receivedPulses,
    returnPulse,
    markPulsesAsRead,
    unreadPulsesCount,
    activeView,
    hasMutualPulse,
    t,
    language,
    formatDist,
    setActiveView,
    getBoundaryForProfile,
    getProfileDossier,
    setSelectedProfile,
    transmitSignal,
  } = useVessel();

  // Sección principal: "chats" (conversaciones) o "pulses" (bandeja de pulsos recibidos/enviados)
  const [activeSection, setActiveSection] = useState<"chats" | "pulses">(
    initialSection || (activeView === "pulses" ? "pulses" : "chats")
  );

  // Sub-filtro dentro de chats: "all" | "active" | "hosting"
  const [chatFilter, setChatFilter] = useState<"all" | "active" | "hosting">("all");

  // Sub-filtro dentro de pulsos: "received" | "sent"
  const [pulseSubTab, setPulseSubTab] = useState<"received" | "sent">("received");

  // Perfiles por ID
  const profilesMap = useMemo(() => {
    const map = new Map<string, VesselProfile>();
    profiles.forEach((p) => map.set(p.id, p));
    return map;
  }, [profiles]);

  // Mensajes no leídos totales
  const unreadMessagesCount = useMemo(() => {
    return Object.values(chatMessages).reduce(
      (acc, msgs) =>
        acc + msgs.filter((m) => m.senderId !== "me" && m.senderId !== "system" && !m.isRead).length,
      0
    );
  }, [chatMessages]);

  // Pulsos recibidos enriquecidos
  const enrichedReceivedPulses = useMemo(() => {
    return receivedPulses
      .map((pulse) => ({
        ...pulse,
        profile: profilesMap.get(pulse.fromProfileId),
      }))
      .filter((item): item is typeof item & { profile: VesselProfile } => Boolean(item.profile))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [receivedPulses, profilesMap]);

  // Pulsos enviados enriquecidos
  const enrichedSentPulses = useMemo(() => {
    return Object.entries(transmissions)
      .filter(([_, count]) => count > 0)
      .map(([profileId, count]) => ({
        profileId,
        count,
        profile: profilesMap.get(profileId),
      }))
      .filter((item): item is typeof item & { profile: VesselProfile } => Boolean(item.profile));
  }, [transmissions, profilesMap]);

  // Marcar pulsos como leídos al entrar a la sección de pulsos recibidos
  useEffect(() => {
    if (activeSection === "pulses" && pulseSubTab === "received" && unreadPulsesCount > 0) {
      const timer = setTimeout(() => {
        markPulsesAsRead();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activeSection, pulseSubTab, unreadPulsesCount, markPulsesAsRead]);

  // Perfiles con interacción de chat activa
  const profilesWithInteractions = useMemo(() => {
    return profiles.filter(
      (p) => (chatMessages[p.id] && chatMessages[p.id].length > 0) || (transmissions[p.id] || 0) > 0
    );
  }, [profiles, chatMessages, transmissions]);

  // Perfiles con hosting disponible inmediato
  const immediateHostProfiles = useMemo(() => {
    return profiles.filter(
      (p) =>
        (p.mobility === "Tengo depto / lugar" ||
          p.mobility === "Tengo sitio" ||
          p.mobility === "Tengo lugar y me muevo" ||
          p.mobility === "Tengo sitio/me desplazo") &&
        p.bodyState === "open"
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

  // Helper de tiempo relativo
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

  // Helper para renderizar la píldora de protocolo de salida destacada
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
      {/* =========================================================
          CABECERA & SELECTOR SEGMENTADO PRINCIPAL: CHATS vs PULSOS
          ========================================================= */}
      <div className="border-b border-white/10 pb-3 space-y-3">
        {/* Selector Segmentado de Alto Contraste (Chats vs Pulsos) */}
        <div className="grid grid-cols-2 p-1 bg-obsidian-surface rounded-2xl border border-white/10 shadow-card-elevation">
          {/* Opción 1: Conversaciones / Chats */}
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === "chats"}
            onClick={() => {
              if (activeSection !== "chats") {
                audioEngine.playPulse();
                setActiveSection("chats");
              }
            }}
            className={`flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              activeSection === "chats"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-4 h-4 stroke-[2.4]" />
            <span>{t.chat.tabActive || "Conversaciones"}</span>
            {unreadMessagesCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 bg-bloodNeon text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center shadow-blood-glow animate-pulse">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Opción 2: Bandeja de Pulsos */}
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === "pulses"}
            onClick={() => {
              if (activeSection !== "pulses") {
                audioEngine.playPulse();
                setActiveSection("pulses");
              }
            }}
            className={`flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet ${
              activeSection === "pulses"
                ? "bg-electricViolet text-white shadow-violet-soft font-extrabold"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="w-4 h-4 stroke-[2.4]" />
            <span>{t.nav.pulses || "Pulsos"}</span>
            {unreadPulsesCount > 0 ? (
              <span className="min-w-[18px] h-[18px] px-1 bg-bloodNeon text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center shadow-blood-glow animate-pulse">
                {unreadPulsesCount > 9 ? "9+" : unreadPulsesCount}
              </span>
            ) : enrichedReceivedPulses.length > 0 ? (
              <span className="min-w-[18px] h-[18px] px-1 bg-white/10 text-neutral-300 text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                {enrichedReceivedPulses.length}
              </span>
            ) : null}
          </button>
        </div>

        {/* =========================================================
            SUB-FILTROS DE CHAT (Cuando activeSection === "chats")
            ========================================================= */}
        {activeSection === "chats" && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5" role="tablist">
            {[
              { id: "all" as const, label: t.chat.tabAll, count: profilesWithInteractions.length },
              {
                id: "active" as const,
                label: language === "es" ? "Con Mensajes" : "Active Only",
                count: profiles.filter((p) => chatMessages[p.id] && chatMessages[p.id].length > 0).length,
              },
              { id: "hosting" as const, label: t.chat.tabHosting, count: immediateHostProfiles.length },
            ].map((tab) => {
              const isActive = chatFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    audioEngine.playStateSwitch(tab.id === "all" ? "open" : "occupied");
                    setChatFilter(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                    isActive
                      ? "bg-white/15 text-white border border-white/30 font-extrabold shadow-sm"
                      : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-black/40 text-white font-black" : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* =========================================================
            SUB-PESTAÑAS DE PULSOS (Cuando activeSection === "pulses")
            ========================================================= */}
        {activeSection === "pulses" && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={pulseSubTab === "received"}
              onClick={() => {
                audioEngine.playPulse();
                setPulseSubTab("received");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                pulseSubTab === "received"
                  ? "bg-white/15 text-white border border-white/30 font-extrabold shadow-sm"
                  : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-mintNeon" />
              <span>{t.pulses?.tabReceived || "Pulsos Recibidos"}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                  pulseSubTab === "received" ? "bg-black/40 text-white font-black" : "bg-white/10 text-neutral-300"
                }`}
              >
                {enrichedReceivedPulses.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={pulseSubTab === "sent"}
              onClick={() => {
                audioEngine.playPulse();
                setPulseSubTab("sent");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                pulseSubTab === "sent"
                  ? "bg-white/15 text-white border border-white/30 font-extrabold shadow-sm"
                  : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-electricViolet-glow" />
              <span>{t.pulses?.tabSent || "Pulsos Enviados"}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                  pulseSubTab === "sent" ? "bg-black/40 text-white font-black" : "bg-white/10 text-neutral-300"
                }`}
              >
                {enrichedSentPulses.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================
          VISTA 1: SECCIÓN DE CHATS
          ========================================================= */}
      {activeSection === "chats" && (
        <div className="space-y-4">
          {/* BANNER TÁCTICO HERO: ACCESO A PULSOS RECIBIDOS PENDIENTES */}
          {enrichedReceivedPulses.length > 0 && (
            <button
              type="button"
              onClick={() => {
                audioEngine.playPulse();
                setActiveSection("pulses");
                setPulseSubTab("received");
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
                      {enrichedReceivedPulses.length === 1 ? "Pulso Recibido" : "Pulsos Recibidos"}
                    </span>
                    {unreadPulsesCount > 0 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-bloodNeon text-white font-black animate-pulse">
                        {unreadPulsesCount} NUEVOS
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono truncate">
                    {language === "es"
                      ? "Perfiles que te enviaron atracción directa. Toca para devolver pulso o chatear."
                      : "Profiles who sent direct interest. Tap to return pulse or chat."}
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

          {/* RIEL HERO DE CUERPOS CON SITIO DISPONIBLE (Cuando se ve pestaña All o Hosting) */}
          {(chatFilter === "all" || chatFilter === "hosting") && immediateHostProfiles.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase font-mono tracking-wider text-electricViolet-glow flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {t.chat.immediateHostRailTitle}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {immediateHostProfiles.length} DISPONIBLES
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
                      <span className="truncate">{p.role}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-electricViolet/15 text-electricViolet-glow font-mono font-bold">
                        NIVEL {p.intensity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LISTA DE CONVERSACIONES TÁCTICAS */}
          <div className="space-y-3 pt-1">
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
                    className={`group relative flex flex-col p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 bg-obsidian-surface hover:border-electricViolet/60 shadow-card-elevation ${
                      unreadCount > 0
                        ? "border-electricViolet/60 bg-gradient-to-b from-electricViolet/10 via-obsidian-surface to-obsidian-surface shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-electricViolet/40"
                        : "border-white/10 hover:shadow-lg"
                    }`}
                  >
                    {/* NIVEL 1: IDENTIDAD, AVATAR CON HALO & TELEMETRÍA */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar táctico interactivo 56x56px */}
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playPulse();
                          setSelectedProfile(profile);
                        }}
                        className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                        title={t.pulses?.viewProfile || "Ver Ficha"}
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

                      {/* Metadata y Resumen de Conversación */}
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            {dossier?.customAlias ? (
                              <button
                                type="button"
                                onClick={() => {
                                  audioEngine.playPulse();
                                  onOpenChat(profile.id);
                                }}
                                className="text-sm font-black text-electricViolet-glow hover:text-white transition-colors truncate font-mono text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
                              >
                                {dossier.customAlias}
                                <span className="text-[10px] text-neutral-400 ml-1 font-normal">
                                  ({profile.codename})
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  audioEngine.playPulse();
                                  onOpenChat(profile.id);
                                }}
                                className="text-sm font-black text-white hover:text-electricViolet-glow transition-colors truncate font-mono text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
                              >
                                {profile.codename}
                              </button>
                            )}
                            {profile.showAge && (
                              <span className="text-[11px] text-neutral-400 font-medium font-mono">
                                {profile.age}
                              </span>
                            )}
                            {profile.verification?.isVerified && (
                              <VerificationBadge verification={profile.verification} size="xs" />
                            )}
                          </div>

                          {/* Timestamp del último mensaje */}
                          {lastMsg && (
                            <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {new Date(lastMsg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        {/* Fila 2: Snippet de Último Mensaje */}
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p
                            onClick={() => {
                              audioEngine.playPulse();
                              onOpenChat(profile.id);
                            }}
                            className={`text-xs truncate cursor-pointer font-sans ${
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
                      </div>
                    </div>

                    {/* NIVEL 2: FILA DEDICADA DE PROTOCOLO DE SALIDA & ON-THE-CLOCK */}
                    <div className="pt-2 mt-2 flex flex-wrap items-center gap-1.5 min-w-0">
                      {renderExitProtocolPill(profile.exitProtocol)}

                      {profile.onTheClock?.isActive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-electricViolet text-electricViolet-glow font-mono text-[9.5px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-electricViolet animate-ping" />
                          <span>⚡ YA ({profile.onTheClock.durationMinutes || 45}m)</span>
                        </span>
                      )}

                      {activeBoundary && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-xl font-mono font-bold uppercase">
                          {activeBoundary.protocol}
                        </span>
                      )}
                    </div>

                    {/* NIVEL 3: BOTONERA ERGONÓMICA AISLADA */}
                    <div className="pt-2.5 mt-2.5 border-t border-white/10 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.playPulse();
                          setSelectedProfile(profile);
                        }}
                        className="min-h-[44px] px-2 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
                        title={t.pulses?.viewProfile || "Ver Ficha"}
                      >
                        <span>{language === "es" ? "Ficha" : "Profile"}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.playPulse();
                          transmitSignal(profile.id);
                        }}
                        className="min-h-[44px] px-2 py-2 rounded-xl bg-electricViolet/15 border border-electricViolet/50 hover:bg-electricViolet hover:text-white text-electricViolet-glow transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95"
                        title={roleAction.actionLabel}
                      >
                        <span className="text-sm leading-none">{roleAction.icon}</span>
                        <span className="truncate">
                          {signalCount > 0 ? `+${signalCount} ${language === "es" ? "Pulsos" : "Pulses"}` : (language === "es" ? "Pulso" : "Pulse")}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.playPulse();
                          onOpenChat(profile.id);
                        }}
                        className="min-h-[44px] px-2 py-2 rounded-xl bg-electricViolet text-white hover:bg-electricViolet-glow shadow-violet-soft transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 font-bold"
                        title={t.chat.openChat || "Abrir Chat"}
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2.4]" />
                        <span className="truncate">{language === "es" ? "Abrir Chat" : "Open Chat"}</span>
                      </button>
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-electricViolet text-white font-extrabold text-xs uppercase tracking-wider shadow-violet-soft hover:bg-electricViolet-glow active:scale-95 transition-all cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.pulses?.goToGrid || "Explorar Perfiles"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          VISTA 2: BANDEJA COMPLETA DE PULSOS (RECIBIDOS & ENVIADOS)
          ========================================================= */}
      {activeSection === "pulses" && (
        <div className="space-y-3">
          {/* SUB-VISTA: PULSOS RECIBIDOS */}
          {pulseSubTab === "received" && (
            <div className="space-y-3">
              {enrichedReceivedPulses.length === 0 ? (
                /* ESTADO VACÍO RECIBIDOS */
                <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-obsidian-surface border border-white/10 space-y-4 my-6">
                  <div className="w-14 h-14 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-center text-electricViolet shadow-violet-soft">
                    <Activity className="w-7 h-7 stroke-[1.8] animate-pulse" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      {t.pulses?.emptyReceivedTitle || "Sin pulsos entrantes"}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {t.pulses?.emptyReceivedDesc || "Nadie te ha enviado un pulso recientemente. Explorá la grilla y transmití tus señales."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setActiveView("grid");
                    }}
                    className="px-5 py-2.5 bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-black uppercase font-mono rounded-full shadow-violet-soft transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                    <span>{t.pulses?.goToGrid || "Explorar Matriz"}</span>
                  </button>
                </div>
              ) : (
                enrichedReceivedPulses.map((pulseItem) => {
                  const p = pulseItem.profile;
                  const isMutual = hasMutualPulse(p.id);
                  const isSentBack = (transmissions[p.id] || 0) > 0;
                  const roleAction = getRoleActionMeta(p.role, language, p.codename);
                  const isImmediateHost =
                    p.mobility === "Tengo depto / lugar" ||
                    p.mobility === "Tengo sitio" ||
                    p.mobility === "Tengo lugar y me muevo" ||
                    p.mobility === "Tengo sitio/me desplazo";

                  return (
                    <div
                      key={`${pulseItem.fromProfileId}-${pulseItem.timestamp}`}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 bg-obsidian-surface shadow-card-elevation ${
                        !pulseItem.isRead
                          ? "border-electricViolet/60 bg-gradient-to-r from-electricViolet/15 via-obsidian-surface to-obsidian-surface shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-electricViolet/40"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Avatar */}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setSelectedProfile(p);
                          }}
                          className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 border-2 border-electricViolet/50 transition-all cursor-pointer active:scale-95"
                          title={t.pulses?.viewProfile || "Ver Ficha"}
                        >
                          <img
                            src={p.avatarUrl}
                            alt={p.codename}
                            className={`w-full h-full object-cover ${p.isFogMode ? "filter blur-[3px]" : ""}`}
                            loading="lazy"
                          />
                          {!pulseItem.isRead && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-bloodNeon rounded-full animate-ping border border-black" />
                          )}
                        </button>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  audioEngine.playPulse();
                                  setSelectedProfile(p);
                                }}
                                className="text-sm font-black text-white hover:text-electricViolet-glow transition-colors truncate font-mono text-left cursor-pointer"
                              >
                                {p.codename}
                              </button>
                              {p.showAge && (
                                <span className="text-[11px] text-neutral-400 font-mono">
                                  {p.age}
                                </span>
                              )}
                              {p.verification?.isVerified && (
                                <VerificationBadge verification={p.verification} size="xs" />
                              )}
                            </div>

                            <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(pulseItem.timestamp)}
                            </span>
                          </div>

                          <div className="text-[11px] text-electricViolet-glow font-mono font-bold mt-0.5">
                            {p.discretizedDistance?.displayLabel || formatDist(p.distanceMeters)}
                          </div>

                          {/* Chips de Rol y Logística */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-neutral-300">
                              {getRoleDisplayLabel(p.role, language)}
                            </span>
                            {isImmediateHost && (
                              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono font-bold flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                <span>{language === "es" ? "Tiene lugar" : "Hosts"}</span>
                              </span>
                            )}
                            {renderExitProtocolPill(p.exitProtocol)}
                          </div>
                        </div>
                      </div>

                      {/* Botonera de Acción para el Pulso Recibido */}
                      <div className="pt-2.5 mt-2.5 border-t border-white/10 grid grid-cols-2 gap-2">
                        {/* Botón 1: Devolver Pulso o Estado */}
                        {isMutual || isSentBack ? (
                          <div className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                            <Flame className="w-4 h-4 text-emerald-400 fill-current" />
                            <span>{language === "es" ? "Sintonía Mutua 🔥" : "Mutual Pulse 🔥"}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              audioEngine.playSignalSent();
                              returnPulse(p.id);
                            }}
                            className="min-h-[44px] px-3 py-2 rounded-xl bg-electricViolet/20 hover:bg-electricViolet text-electricViolet-glow hover:text-white border border-electricViolet/50 transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-violet-soft"
                          >
                            <Zap className="w-4 h-4 stroke-[2.5]" />
                            <span>{language === "es" ? "Devolver Pulso ⚡" : "Return Pulse ⚡"}</span>
                          </button>
                        )}

                        {/* Botón 2: Abrir Chat Directo */}
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            onOpenChat(p.id);
                          }}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-electricViolet text-white hover:bg-electricViolet-glow shadow-violet-soft transition-all text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5 stroke-[2.4]" />
                          <span>{language === "es" ? "Abrir Chat" : "Open Chat"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SUB-VISTA: PULSOS ENVIADOS */}
          {pulseSubTab === "sent" && (
            <div className="space-y-3">
              {enrichedSentPulses.length === 0 ? (
                /* ESTADO VACÍO ENVIADOS */
                <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-obsidian-surface border border-white/10 space-y-4 my-6">
                  <div className="w-14 h-14 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 flex items-center justify-center text-electricViolet shadow-violet-soft">
                    <ArrowUpRight className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      {t.pulses?.emptySentTitle || "Sin pulsos emitidos"}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {t.pulses?.emptySentDesc || "No has transmitido pulsos aún. Toca el rayo en cualquier perfil de la matriz."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playPulse();
                      setActiveView("grid");
                    }}
                    className="px-5 py-2.5 bg-electricViolet hover:bg-electricViolet-glow text-white text-xs font-black uppercase font-mono rounded-full shadow-violet-soft transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
                    <span>{t.pulses?.goToGrid || "Explorar Matriz"}</span>
                  </button>
                </div>
              ) : (
                enrichedSentPulses.map((item) => {
                  const p = item.profile;
                  const isMutual = hasMutualPulse(p.id);

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-obsidian-surface shadow-card-elevation flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            setSelectedProfile(p);
                          }}
                          className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/15 cursor-pointer active:scale-95"
                        >
                          <img
                            src={p.avatarUrl}
                            alt={p.codename}
                            className={`w-full h-full object-cover ${p.isFogMode ? "filter blur-[3px]" : ""}`}
                            loading="lazy"
                          />
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-black text-white truncate">
                              {p.codename}
                            </span>
                            {p.verification?.isVerified && (
                              <VerificationBadge verification={p.verification} size="xs" />
                            )}
                          </div>
                          <div className="text-[10px] text-electricViolet-glow font-mono font-bold">
                            {p.discretizedDistance?.displayLabel || formatDist(p.distanceMeters)}
                          </div>
                          <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                            {item.count} {item.count === 1 ? "pulso emitido" : "pulsos emitidos"}
                            {isMutual && <span className="text-emerald-400 font-bold ml-1.5">🔥 MUTUO</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            audioEngine.playPulse();
                            onOpenChat(p.id);
                          }}
                          className="px-3 py-2 min-h-[40px] rounded-xl bg-electricViolet text-white hover:bg-electricViolet-glow text-xs font-mono font-bold flex items-center gap-1 cursor-pointer active:scale-95 shadow-violet-soft"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{language === "es" ? "Chat" : "Chat"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

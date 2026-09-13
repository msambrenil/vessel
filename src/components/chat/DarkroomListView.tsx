"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { VerificationBadge } from "@/components/auth/VerificationBadge";
import { AntiGhostBadge } from "@/components/auth/AntiGhostBadge";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { DOSSIER_VERDICT_CONFIG } from "@/data/dossierCatalog";
import { getRoleActionMeta, getRoleDisplayLabel } from "@/data/roleActionCatalog";
import { ExitProtocol, VesselProfile } from "@/types/vessel";

interface DarkroomListViewProps {
  onOpenChat: (profileId: string) => void;
}

export const DarkroomListView: React.FC<DarkroomListViewProps> = ({
  onOpenChat,
}) => {
  const {
    profiles,
    chatMessages,
    transmissions,
    t,
    language,
    formatDist,
    setActiveView,
    getBoundaryForProfile,
    getProfileDossier,
    setSelectedProfile,
    transmitSignal,
  } = useVessel();

  const [activeTab, setActiveTab] = useState<"all" | "active" | "signals" | "hosting">("all");

  // Perfiles con interacción activa (mensajes o señales)
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

  // Filtrado según pestaña seleccionada
  const filteredList = useMemo(() => {
    if (activeTab === "active") {
      return profiles.filter((p) => chatMessages[p.id] && chatMessages[p.id].length > 0);
    }
    if (activeTab === "signals") {
      return profiles.filter((p) => (transmissions[p.id] || 0) > 0 && (!chatMessages[p.id] || chatMessages[p.id].length === 0));
    }
    if (activeTab === "hosting") {
      return immediateHostProfiles;
    }
    return profilesWithInteractions;
  }, [activeTab, profiles, chatMessages, transmissions, profilesWithInteractions, immediateHostProfiles]);

  const tabs: {
    id: "all" | "active" | "signals" | "hosting";
    label: string;
    count: number;
  }[] = [
    { id: "all", label: t.chat.tabAll, count: profilesWithInteractions.length },
    {
      id: "active",
      label: t.chat.tabActive,
      count: profiles.filter((p) => chatMessages[p.id] && chatMessages[p.id].length > 0).length,
    },
    {
      id: "signals",
      label: t.chat.tabSignals,
      count: profiles.filter((p) => (transmissions[p.id] || 0) > 0 && (!chatMessages[p.id] || chatMessages[p.id].length === 0)).length,
    },
    { id: "hosting", label: t.chat.tabHosting, count: immediateHostProfiles.length },
  ];

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
      {/* CABECERA TÁCTICA */}
      <div className="border-b border-white/10 pb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-electricViolet/15 border border-electricViolet/40 text-electricViolet-glow shadow-violet-soft">
                <MessageSquare className="w-4 h-4 stroke-[2.4]" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {t.chat.title}
              </h2>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono pl-0.5">
              {t.chat.subtitle}
            </p>
          </div>
        </div>

        {/* PÍLDORAS DE FILTRADO HORIZONTALES */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  audioEngine.playStateSwitch(tab.id === "all" ? "open" : "occupied");
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-95 ${
                  isActive
                    ? "bg-electricViolet text-white border border-electricViolet shadow-violet-soft font-extrabold"
                    : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-black/30 text-white font-black"
                      : "bg-white/10 text-neutral-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIEL HERO DE CUERPOS CON SITIO DISPONIBLE (Cuando se ve pestaña All o Hosting) */}
      {(activeTab === "all" || activeTab === "hosting") && immediateHostProfiles.length > 0 && (
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
                className="bg-obsidian-surface hover:bg-obsidian-hover rounded-2xl border border-electricViolet/30 p-2.5 text-left transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet focus-visible:ring-offset-1 focus-visible:ring-offset-black active:scale-[0.98] shadow-sm relative overflow-hidden"
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
        {filteredList.length > 0 ? (
          filteredList.map((profile) => {
            const thread = chatMessages[profile.id] || [];
            const lastMsg = thread[thread.length - 1];
            const signalCount = transmissions[profile.id] || 0;
            const activeBoundary = getBoundaryForProfile(profile.id);
            const dossier = getProfileDossier(profile.id);
            const roleAction = getRoleActionMeta(profile.role, language, profile.codename);
            const roleDisplay = getRoleDisplayLabel(profile.role, language);
            const hasPlace =
              profile.mobility?.toLowerCase().includes("depto") ||
              profile.mobility?.toLowerCase().includes("sitio") ||
              profile.mobility?.toLowerCase().includes("lugar");

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
                    title={t.pulses.viewProfile}
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
                    {/* Fila 1: Alias / Codename + Edad + Insignias + Timestamp */}
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

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {unreadCount > 0 && (
                          <span className="min-w-[16px] h-[16px] px-1 bg-bloodNeon text-white text-[9px] font-bold font-mono rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,30,56,0.7)] animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {lastMsg ? lastMsg.timestamp : (language === "es" ? "Ahora" : "Now")}
                        </span>
                      </div>
                    </div>

                    {/* Fila 2: Rol • Distancia S2 • Movilidad */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-300 font-mono flex-wrap">
                      <span className="text-electricViolet-glow font-bold">{roleDisplay}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-neutral-300">
                        {profile.discretizedDistance?.displayLabel || formatDist(profile.distanceMeters)}
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

                    {/* Fila 3: Snippet del Mensaje + Badges de Confianza */}
                    <div className="flex items-center justify-between gap-2 mt-1 text-xs">
                      <div className="truncate flex-1">
                        {lastMsg ? (
                          lastMsg.isRendezvousPin ? (
                            <span className="text-bloodNeon font-bold flex items-center gap-1 truncate font-mono text-[11px]">
                              <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
                              {t.chat.rendezvousPinActive}
                            </span>
                          ) : lastMsg.mediaAttachment?.sharedAlbumId ? (
                            lastMsg.isRevoked || lastMsg.mediaAttachment.isRevoked ? (
                              <span className="text-neutral-500 line-through font-medium flex items-center gap-1 truncate font-mono text-[11px]">
                                <FolderLock className="w-3.5 h-3.5 flex-shrink-0 text-bloodNeon/70" />
                                Álbum Revocado: {lastMsg.mediaAttachment.albumTitle}
                              </span>
                            ) : (
                              <span className="text-electricViolet-glow font-bold flex items-center gap-1 truncate font-mono text-[11px]">
                                <FolderLock className="w-3.5 h-3.5 flex-shrink-0" />
                                {t.chat.sharedAlbum}: {lastMsg.mediaAttachment.albumTitle}
                              </span>
                            )
                          ) : lastMsg.mediaAttachment?.mode === "view_once" ? (
                            <span className="text-bloodNeon font-bold flex items-center gap-1 truncate font-mono text-[11px]">
                              <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                              {lastMsg.isBurned ? t.chat.viewOnceBurned : t.chat.ephemeralMsgShort}
                            </span>
                          ) : lastMsg.mediaAttachment ? (
                            <span className="text-concrete-200 font-semibold flex items-center gap-1 truncate text-[11px]">
                              {lastMsg.mediaAttachment.mediaType === "video" ? "📹 Video" : "📷 Foto"}
                              {lastMsg.text ? ` • ${lastMsg.text}` : ""}
                            </span>
                          ) : lastMsg.isBurnOnView ? (
                            <span className="text-electricViolet-glow font-bold flex items-center gap-1 truncate font-mono text-[11px]">
                              <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                              {t.chat.ephemeralMsgShort}
                            </span>
                          ) : lastMsg.isKindClosure ? (
                            <span className="text-emerald-400 font-semibold truncate text-[11px]">
                              {lastMsg.text}
                            </span>
                          ) : (
                            <span className="text-neutral-300 truncate text-[11px] font-sans">
                              {lastMsg.text}
                            </span>
                          )
                        ) : signalCount > 0 ? (
                          <span className="text-electricViolet-glow font-bold flex items-center gap-1 truncate font-mono text-[11px]">
                            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                            {t.chat.signalSentCount} ({signalCount})
                          </span>
                        ) : (
                          <span className="text-neutral-400 truncate text-[11px]">
                            {profile.role} • {profile.hosting}
                          </span>
                        )}
                      </div>

                      {/* Insignia Anti-Ghost Karma */}
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

                {/* NIVEL 2: FILA DEDICADA DE PROTOCOLO DE SALIDA & ON-THE-CLOCK (100% LIBRE DE COLISIONES) */}
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

                {/* NIVEL 3: BOTONERA ERGONÓMICA AISLADA (Touch Targets >= 44px) */}
                <div className="pt-2.5 mt-2.5 border-t border-white/10 grid grid-cols-3 gap-2">
                  {/* Botón 1: Ver Ficha Completa */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioEngine.playPulse();
                      setSelectedProfile(profile);
                    }}
                    className="min-h-[44px] px-2 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95"
                    title={t.pulses.viewProfile}
                  >
                    <span>{language === "es" ? "Ficha" : "Profile"}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {/* Botón 2: Enviar Pulso */}
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

                  {/* Botón 3: Abrir Chat Directo */}
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
          /* ESTADO VACÍO TÁCTICO BRUTALISTA */
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
  );
};

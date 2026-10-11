"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Activity,
  Flame,
  ArrowDownLeft,
  ArrowUpRight,
  LayoutGrid,
  Zap,
  Trash2,
} from "lucide-react";
import {
  useRadarMatrix,
  useAuth,
  useSettings,
  useDiary,
  createFallbackProfile,
} from "@/context/VesselContext";
import { VesselProfile } from "@/types/vessel";
import { PulseCard } from "./PulseCard";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { getActiveAppMode } from "@/lib/storage/localStorageSync";
import { isGhostOrMockProfile, isGhostOrMockProfileId } from "@/lib/firebase/matrixService";
import { SegmentedTabGroup, SegmentedTabItem } from "@/components/ui/SegmentedTabGroup";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import { BrutalistModal } from "@/components/ui/BrutalistModal";

export interface PulsesViewProps {
  onOpenChat: (profileId: string) => void;
}

export const PulsesView: React.FC<PulsesViewProps> = ({ onOpenChat }) => {
  const {
    profiles,
    knownProfiles,
    getProfileById,
    transmissions,
    sentPulsesMeta,
    receivedPulses,
    returnPulse,
    markPulsesAsRead,
    clearPulse,
    clearAllReadPulses,
    unreadPulsesCount,
    hasMutualPulse,
    setActiveView,
    setSelectedProfile,
  } = useRadarMatrix();
  const { myBodyState, setMyBodyState } = useAuth();
  const { t, language, formatDist } = useSettings();
  const { openCreateDiaryModal } = useDiary();

  const [activeTab, setActiveTab] = useState<"received" | "mutual" | "sent">("received");
  const [showConfirmClearModal, setShowConfirmClearModal] = useState(false);

  // Mapas de resolución dual (ID y Codename) combinando perfiles activos y conocidos de la caché
  const { profilesById, profilesByCodename } = useMemo(() => {
    const byId = new Map<string, VesselProfile>();
    const byCode = new Map<string, VesselProfile>();
    Object.values(knownProfiles || {}).forEach((p) => {
      byId.set(p.id, p);
      if (p.codename) {
        byCode.set(p.codename.toLowerCase(), p);
      }
    });
    profiles.forEach((p) => {
      byId.set(p.id, p);
      if (p.codename) {
        byCode.set(p.codename.toLowerCase(), p);
      }
    });
    return { profilesById: byId, profilesByCodename: byCode };
  }, [profiles, knownProfiles]);

  const resolveProfile = useCallback(
    (idOrCodename?: string): VesselProfile | undefined => {
      if (!idOrCodename) return undefined;
      return (
        profilesById.get(idOrCodename) ||
        profilesByCodename.get(idOrCodename.toLowerCase()) ||
        getProfileById(idOrCodename) ||
        createFallbackProfile(idOrCodename)
      );
    },
    [profilesById, profilesByCodename, getProfileById]
  );

  // Hidratación de Toques Recibidos
  const enrichedReceivedPulses = useMemo(() => {
    const isReal = getActiveAppMode() === "real";
    return receivedPulses
      .filter((pulse) => {
        if (isReal && isGhostOrMockProfileId(pulse.fromProfileId)) return false;
        return true;
      })
      .map((pulse) => {
        const profile =
          resolveProfile(pulse.fromProfileId) ||
          resolveProfile(pulse.fromCodename);
        return {
          ...pulse,
          profile,
        };
      })
      .filter((item): item is typeof item & { profile: VesselProfile } => {
        if (!item.profile) return false;
        if (isReal && isGhostOrMockProfile(item.profile)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [receivedPulses, resolveProfile]);

  // Hidratación de Toques Enviados + Toques de Reencuentro ("Te vi en la pista")
  const enrichedSentPulses = useMemo(() => {
    const isReal = getActiveAppMode() === "real";
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
      if (isReal && isGhostOrMockProfileId(profileId)) return;
      const profile = resolveProfile(profileId);
      if (!profile) return;
      if (isReal && isGhostOrMockProfile(profile)) return;
      const meta = sentPulsesMeta?.[profile.id] || sentPulsesMeta?.[profileId];
      itemsMap.set(profile.id, {
        profile,
        timestamp: meta?.lastSentAt || new Date().toISOString(),
      });
    });

    return Array.from(itemsMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [transmissions, sentPulsesMeta, resolveProfile]);

  // Toques Mutuos (química recíproca confirmada)
  const enrichedMutualPulses = useMemo(() => {
    return enrichedReceivedPulses.filter((item) => hasMutualPulse(item.profile.id));
  }, [enrichedReceivedPulses, hasMutualPulse]);

  // Conteo de toques ya vistos que pueden descartarse sin tocar mutuos
  const cleanableReadCount = useMemo(() => {
    return enrichedReceivedPulses.filter(
      (item) => item.isRead && !hasMutualPulse(item.profile.id)
    ).length;
  }, [enrichedReceivedPulses, hasMutualPulse]);

  // Marcar pulsos recibidos como leídos al visualizar la pestaña Recibidos (3.5s para no apagar el badge antes de tiempo)
  useEffect(() => {
    if (activeTab === "received" && unreadPulsesCount > 0) {
      const timer = setTimeout(() => {
        markPulsesAsRead();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, unreadPulsesCount, markPulsesAsRead]);

  // Pestañas segmentadas para el componente del Design System
  const tabs: SegmentedTabItem<"received" | "mutual" | "sent">[] = useMemo(
    () => [
      {
        id: "received",
        label: language === "es" ? "Recibidos" : "Inbox",
        icon: <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />,
        badge: (
          <span
            className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
              unreadPulsesCount > 0
                ? "bg-bloodNeon text-white font-black animate-pulse"
                : activeTab === "received"
                ? "bg-black/40 text-white font-black"
                : "bg-white/10 text-neutral-300"
            }`}
          >
            {enrichedReceivedPulses.length}
          </span>
        ),
      },
      {
        id: "mutual",
        label: language === "es" ? "Onda Mutua" : "Mutual",
        icon: <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
        accentClass:
          "bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 font-black",
        badge: (
          <span
            className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
              activeTab === "mutual"
                ? "bg-emerald-950 text-emerald-300 font-black"
                : "bg-white/10 text-neutral-300"
            }`}
          >
            {enrichedMutualPulses.length}
          </span>
        ),
      },
      {
        id: "sent",
        label: language === "es" ? "Enviados" : "Sent",
        icon: <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />,
        badge: (
          <span
            className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
              activeTab === "sent"
                ? "bg-black/40 text-white font-black"
                : "bg-white/10 text-neutral-300"
            }`}
          >
            {enrichedSentPulses.length}
          </span>
        ),
      },
    ],
    [
      activeTab,
      enrichedMutualPulses.length,
      enrichedReceivedPulses.length,
      enrichedSentPulses.length,
      language,
      unreadPulsesCount,
    ]
  );

  return (
    <section
      aria-label={t.pulses?.title || (language === "es" ? "Toques" : "Taps")}
      className="flex flex-col flex-1 p-3 sm:p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-28 space-y-4 select-none bg-obsidian-deep min-h-[calc(100dvh-140px)]"
    >
      {/* CABECERA TÁCTICA */}
      <header className="border-b border-white/10 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-electricViolet-glow stroke-[2.4] shrink-0" />
              <span className="truncate">{t.pulses?.title || "Toques"}</span>
            </h1>
            <p className="text-xs text-neutral-400 truncate">
              {t.pulses?.subtitle}
            </p>
          </div>

          {cleanableReadCount > 0 && activeTab === "received" && (
            <BrutalistButton
              variant="secondary"
              size="sm"
              soundEffect="pulse"
              onClick={() => setShowConfirmClearModal(true)}
              aria-label={t.pulses?.clearAll || "Limpiar vistos"}
              className="text-xs py-1 px-2.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-neutral-400" />
              <span className="hidden sm:inline">{t.pulses?.clearAll || "Limpiar vistos"}</span>
              <span className="sm:hidden font-mono">({cleanableReadCount})</span>
            </BrutalistButton>
          )}
        </div>

        {/* Selector de Pestañas del Design System */}
        <SegmentedTabGroup
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          size="default"
          variant="obsidian"
          ariaLabel={t.pulses?.title || "Selector de Toques"}
          className="shadow-card-elevation"
        />
      </header>

      {/* PANEL 1: TOQUES RECIBIDOS */}
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
                  <BrutalistButton
                    variant="mint"
                    size="default"
                    soundEffect="pulse"
                    onClick={() => {
                      audioEngine.playStateSwitch("open");
                      setMyBodyState("open");
                    }}
                    className="text-xs font-black uppercase font-mono"
                  >
                    <Zap className="w-4 h-4 mr-1.5 fill-current" />
                    <span>{t.pulses?.activateVisibilityCta || "Ponerme disponible ya"}</span>
                  </BrutalistButton>
                )}

                <BrutalistButton
                  variant="primary"
                  size="default"
                  soundEffect="pulse"
                  onClick={() => setActiveView("grid")}
                  className="text-xs font-black uppercase font-mono"
                >
                  <LayoutGrid className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                  <span>{t.pulses?.goToGrid || "Ver perfiles cerca"}</span>
                </BrutalistButton>
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

      {/* PANEL 2: ONDA MUTUA (CONFIRMADOS PARA ENCUENTRO) */}
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

              <BrutalistButton
                variant="primary"
                size="default"
                soundEffect="pulse"
                onClick={() => setActiveView("grid")}
                className="text-xs font-black uppercase font-mono"
              >
                <LayoutGrid className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                <span>{t.pulses?.goToGrid || "Ver perfiles cerca"}</span>
              </BrutalistButton>
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
                pulseId={item.id}
                language={language}
                t={t}
                formatDist={formatDist}
                onSelectProfile={setSelectedProfile}
                onOpenChat={onOpenChat}
                onScheduleEncounter={(profileId) => openCreateDiaryModal(profileId)}
              />
            ))
          )}
        </div>
      )}

      {/* PANEL 3: TOQUES ENVIADOS */}
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

              <BrutalistButton
                variant="primary"
                size="default"
                soundEffect="pulse"
                onClick={() => setActiveView("grid")}
                className="text-xs font-black uppercase font-mono"
              >
                <LayoutGrid className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                <span>{t.pulses?.goToGrid || "Ver perfiles cerca"}</span>
              </BrutalistButton>
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
                onOpenChat={onOpenChat}
                onScheduleEncounter={(profileId) => openCreateDiaryModal(profileId)}
              />
            ))
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA LIMPIAR VISTOS (Guarda de Seguridad UX) */}
      <BrutalistModal
        isOpen={showConfirmClearModal}
        onClose={() => setShowConfirmClearModal(false)}
        title={t.pulses?.confirmClearTitle || "¿Limpiar toques vistos?"}
        subtitle={t.pulses?.confirmClearDesc || "Vas a ocultar los toques que ya viste y no respondiste."}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-neutral-300 font-mono leading-relaxed">
            {language === "es"
              ? `Se descartarán ${cleanableReadCount} toques vistos sin responder. Los toques mutuos o activos no se verán afectados.`
              : `${cleanableReadCount} seen unreturned nudges will be cleared. Mutual or active connections will remain untouched.`}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <BrutalistButton
              variant="secondary"
              size="default"
              soundEffect="pulse"
              onClick={() => setShowConfirmClearModal(false)}
              className="w-full text-xs font-mono font-bold"
            >
              {t.pulses?.cancelClearAction || "Cancelar"}
            </BrutalistButton>

            <BrutalistButton
              variant="danger"
              size="default"
              soundEffect="pulse"
              onClick={() => {
                clearAllReadPulses();
                setShowConfirmClearModal(false);
              }}
              className="w-full text-xs font-mono font-black"
            >
              {t.pulses?.confirmClearAction || "Limpiar ahora"}
            </BrutalistButton>
          </div>
        </div>
      </BrutalistModal>
    </section>
  );
};

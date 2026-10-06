"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useVessel } from "@/context/VesselContext";
import { BrutalistHeader } from "@/components/brand/BrutalistHeader";
import { IntentHubSelector } from "@/components/matrix/IntentHubSelector";
import { BrutalistNav } from "@/components/navigation/BrutalistNav";
import { ProfileGridSkeleton } from "@/components/matrix/ProfileGridSkeleton";
import { PulsesListSkeleton } from "@/components/pulses/PulsesListSkeleton";
import { ModalHost } from "@/components/modals/ModalHost";
import { BetaVipGateScreen } from "@/components/auth/BetaVipGateScreen";
import { BetaFeedbackFab } from "@/components/beta/BetaFeedbackFab";
import { getLocalVipVerification } from "@/lib/firebase/inviteService";

// Carga perezosa (Code-Splitting) para el radar local-first sin desajuste de hidratación SSR
const ProfileGrid = dynamic(
  () => import("@/components/matrix/ProfileGrid").then((m) => m.ProfileGrid),
  {
    ssr: false,
    loading: () => <ProfileGridSkeleton />,
  }
);

// Carga perezosa (Code-Splitting) para vistas secundarias
const DarkroomListView = dynamic(
  () => import("@/components/chat/DarkroomListView").then((m) => m.DarkroomListView),
  {
    ssr: false,
    loading: () => <PulsesListSkeleton />,
  }
);
const PulsesView = dynamic(
  () => import("@/components/pulses/PulsesView").then((m) => m.PulsesView),
  {
    ssr: false,
    loading: () => <PulsesListSkeleton />,
  }
);
const ProtocolView = dynamic(
  () => import("@/components/account/ProtocolView").then((m) => m.ProtocolView),
  { ssr: false }
);
const DateDiaryView = dynamic(
  () => import("@/components/diary/DateDiaryView").then((m) => m.DateDiaryView),
  { ssr: false }
);

// Banner táctico de telemetría de trayecto y próxima cita agendada
const EnRouteBanner = dynamic(
  () => import("@/components/radar/EnRouteBanner").then((m) => m.EnRouteBanner),
  { ssr: false }
);
const UpcomingEncounterBanner = dynamic(
  () => import("@/components/radar/UpcomingEncounterBanner").then((m) => m.UpcomingEncounterBanner),
  { ssr: false }
);

export default function VesselApp() {
  const {
    activeView,
    setSelectedProfile,
    setActiveChatProfileId,
    enRouteState,
    appMode,
    isAuthenticated,
    authUser,
  } = useVessel();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [vipGateUnlocked, setVipGateUnlocked] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (appMode === "real") {
      const check = getLocalVipVerification(authUser?.uid);
      setVipGateUnlocked(check.verified && isAuthenticated);
    }
  }, [appMode, isAuthenticated, authUser]);

  // Guard de montaje cliente: previene desajustes de hidratación SSR
  // garantizando que el primer pase de renderizado sea idéntico en servidor y cliente.
  if (!isMounted) {
    return (
      <div className="flex flex-col flex-1 relative bg-obsidian text-white min-h-screen w-full selection:bg-electricViolet selection:text-white">
        <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 relative min-h-screen">
          <ProfileGridSkeleton />
        </div>
      </div>
    );
  }

  if (appMode === "real" && (!isAuthenticated || !vipGateUnlocked)) {
    return <BetaVipGateScreen onVipUnlocked={() => setVipGateUnlocked(true)} />;
  }

  return (
    <div className="flex flex-col flex-1 relative bg-obsidian text-white min-h-screen w-full selection:bg-electricViolet selection:text-white">
      {/* Contenedor Responsivo Centralizado */}
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 relative min-h-screen">
        {/* Cabecera Brutalista Unificada & Hub de Sintonías (Sticky Top Consolidado) */}
        <header className="sticky top-0 z-30 bg-obsidian-deep/95 backdrop-blur-md border-b border-white/10 select-none shadow-sm">
          <BrutalistHeader />
          {activeView === "grid" && <IntentHubSelector />}
        </header>

        {/* Banner Táctico de Modo "En Camino" con Telemetría */}
        {enRouteState.isActive && <EnRouteBanner />}

        {/* Recordatorio Táctico de Próxima Cita Agendada (1-Tap Chat & Confirmación) */}
        {activeView === "grid" && <UpcomingEncounterBanner />}

        {/* Vista Activa */}
        <main className="flex-1 flex flex-col">
          {activeView === "grid" && (
            <ProfileGrid
              onSelectProfile={(profile) => setSelectedProfile(profile)}
              onOpenChat={(profileId) => setActiveChatProfileId(profileId)}
            />
          )}

          {activeView === "pulses" && (
            <PulsesView
              onOpenChat={(profileId) => setActiveChatProfileId(profileId)}
            />
          )}

          {activeView === "chat" && (
            <DarkroomListView
              onOpenChat={(profileId) => setActiveChatProfileId(profileId)}
            />
          )}

          {activeView === "diary" && <DateDiaryView />}

          {activeView === "account" && <ProtocolView />}
        </main>

        {/* Barra de Navegación Monolítica */}
        <BrutalistNav />

        {/* Herramientas Flotantes de Tester Beta */}
        <BetaFeedbackFab />

        {/* Orquestador Desacoplado de Modales & Overlays (Fase 4: Arquitectura & Performance) */}
        <ModalHost />
      </div>
    </div>
  );
}

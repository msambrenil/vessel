"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useVessel } from "@/context/VesselContext";
import { BrutalistHeader } from "@/components/brand/BrutalistHeader";
import { StatusToggle } from "@/components/matrix/StatusToggle";
import { BrutalistNav } from "@/components/navigation/BrutalistNav";
import { ProfileGridSkeleton } from "@/components/matrix/ProfileGridSkeleton";
import { ModalHost } from "@/components/modals/ModalHost";

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
  { ssr: false }
);
const ProtocolView = dynamic(
  () => import("@/components/account/ProtocolView").then((m) => m.ProtocolView),
  { ssr: false }
);
const DateDiaryView = dynamic(
  () => import("@/components/diary/DateDiaryView").then((m) => m.DateDiaryView),
  { ssr: false }
);

// Banner táctico de telemetría de trayecto
const EnRouteBanner = dynamic(
  () => import("@/components/radar/EnRouteBanner").then((m) => m.EnRouteBanner),
  { ssr: false }
);

export default function VesselApp() {
  const {
    activeView,
    setSelectedProfile,
    setActiveChatProfileId,
    enRouteState,
  } = useVessel();

  return (
    <div className="flex flex-col flex-1 relative bg-obsidian text-white min-h-screen w-full selection:bg-electricViolet selection:text-white">
      {/* Contenedor Responsivo Centralizado */}
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 relative min-h-screen">
        {/* Cabecera Brutalista Real */}
        <BrutalistHeader />

        {/* Banner Táctico de Modo "En Camino" con Telemetría */}
        {enRouteState.isActive && <EnRouteBanner />}

        {/* Selector de Estado Corporal (Open / Occupied / Dormant) - Exclusivo para vista de exploración */}
        {activeView === "grid" && <StatusToggle />}

        {/* Vista Activa */}
        <main className="flex-1 flex flex-col">
          {activeView === "grid" && (
            <ProfileGrid
              onSelectProfile={(profile) => setSelectedProfile(profile)}
              onOpenChat={(profileId) => setActiveChatProfileId(profileId)}
            />
          )}

          {(activeView === "chat" || activeView === "pulses") && (
            <DarkroomListView
              initialSection={activeView === "pulses" ? "pulses" : "chats"}
              onOpenChat={(profileId) => setActiveChatProfileId(profileId)}
            />
          )}

          {activeView === "diary" && <DateDiaryView />}

          {activeView === "account" && <ProtocolView />}
        </main>

        {/* Barra de Navegación Monolítica */}
        <BrutalistNav />

        {/* Orquestador Desacoplado de Modales & Overlays (Fase 4: Arquitectura & Performance) */}
        <ModalHost />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useVessel } from "@/context/VesselContext";
import { BrutalistHeader } from "@/components/brand/BrutalistHeader";
import { StatusToggle } from "@/components/matrix/StatusToggle";
import { BrutalistNav } from "@/components/navigation/BrutalistNav";
import { ProfileGridSkeleton } from "@/components/matrix/ProfileGridSkeleton";

// Carga perezosa (Code-Splitting) para el radar local-first sin desajuste de hidratación SSR
const ProfileGrid = dynamic(
  () => import("@/components/matrix/ProfileGrid").then((m) => m.ProfileGrid),
  {
    ssr: false,
    loading: () => <ProfileGridSkeleton />,
  }
);
const DynamicFilterDrawer = dynamic(
  () => import("@/components/filters/DynamicFilterDrawer").then((m) => m.DynamicFilterDrawer),
  { ssr: false }
);
const StealthLockScreen = dynamic(
  () => import("@/components/ui/StealthLockScreen").then((m) => m.StealthLockScreen),
  { ssr: false }
);

// Carga perezosa (Code-Splitting) para vistas secundarias
const PulsesView = dynamic(
  () => import("@/components/pulses/PulsesView").then((m) => m.PulsesView),
  { ssr: false }
);
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

// Carga perezosa (Code-Splitting) para modales bajo demanda
const ProfileDetailModal = dynamic(
  () => import("@/components/profile/ProfileDetailModal").then((m) => m.ProfileDetailModal),
  { ssr: false }
);
const DarkroomChatModal = dynamic(
  () => import("@/components/chat/DarkroomChatModal").then((m) => m.DarkroomChatModal),
  { ssr: false }
);
const IdentityVerificationModal = dynamic(
  () => import("@/components/auth/IdentityVerificationModal").then((m) => m.IdentityVerificationModal),
  { ssr: false }
);
const AuthModal = dynamic(
  () => import("@/components/auth/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);
const GenderInterestOnboardingModal = dynamic(
  () => import("@/components/auth/GenderInterestOnboardingModal").then((m) => m.GenderInterestOnboardingModal),
  { ssr: false }
);
const CreateDiaryEntryModal = dynamic(
  () => import("@/components/diary/CreateDiaryEntryModal").then((m) => m.CreateDiaryEntryModal),
  { ssr: false }
);
const GeoBatteryModal = dynamic(
  () => import("@/components/radar/GeoBatteryModal").then((m) => m.GeoBatteryModal),
  { ssr: false }
);
const AppSettingsModal = dynamic(
  () => import("@/components/settings/AppSettingsModal").then((m) => m.AppSettingsModal),
  { ssr: false }
);

// Modales de Suite Táctica (12 Características)
const HostCardModal = dynamic(
  () => import("@/components/logistics/HostCardModal").then((m) => m.HostCardModal),
  { ssr: false }
);
const PreFlightChecklistModal = dynamic(
  () => import("@/components/chat/PreFlightChecklistModal").then((m) => m.PreFlightChecklistModal),
  { ssr: false }
);
const VoiceVibeRecorderModal = dynamic(
  () => import("@/components/profile/VoiceVibeRecorderModal").then((m) => m.VoiceVibeRecorderModal),
  { ssr: false }
);
const EnRouteTrackerModal = dynamic(
  () => import("@/components/radar/EnRouteTrackerModal").then((m) => m.EnRouteTrackerModal),
  { ssr: false }
);
const EnRouteBanner = dynamic(
  () => import("@/components/radar/EnRouteBanner").then((m) => m.EnRouteBanner),
  { ssr: false }
);
const SafetyBeaconModal = dynamic(
  () => import("@/components/safety/SafetyBeaconModal").then((m) => m.SafetyBeaconModal),
  { ssr: false }
);
const DuressPinSettingsModal = dynamic(
  () => import("@/components/safety/DuressPinSettingsModal").then((m) => m.DuressPinSettingsModal),
  { ssr: false }
);
const CalculatorCoverScreen = dynamic(
  () => import("@/components/safety/CalculatorCoverScreen").then((m) => m.CalculatorCoverScreen),
  { ssr: false }
);
const LivenessVerificationModal = dynamic(
  () => import("@/components/auth/LivenessVerificationModal").then((m) => m.LivenessVerificationModal),
  { ssr: false }
);
const SessionRoomModal = dynamic(
  () => import("@/components/cruising/SessionRoomModal").then((m) => m.SessionRoomModal),
  { ssr: false }
);
const DuoLinkModal = dynamic(
  () => import("@/components/cruising/DuoLinkModal").then((m) => m.DuoLinkModal),
  { ssr: false }
);
const UnlimitedPaywallModal = dynamic(
  () => import("@/components/subscription/UnlimitedPaywallModal").then((m) => m.UnlimitedPaywallModal),
  { ssr: false }
);
const VaultAuditModal = dynamic(
  () => import("@/components/profile/VaultAuditModal").then((m) => m.VaultAuditModal),
  { ssr: false }
);
const TravelModeModal = dynamic(
  () => import("@/components/radar/TravelModeModal").then((m) => m.TravelModeModal),
  { ssr: false }
);
const HarmReductionModal = dynamic(
  () => import("@/components/safety/HarmReductionModal").then((m) => m.HarmReductionModal),
  { ssr: false }
);
const ItsExposureModal = dynamic(
  () => import("@/components/diary/ItsExposureModal").then((m) => m.ItsExposureModal),
  { ssr: false }
);
const NightlifeEventsModal = dynamic(
  () => import("@/components/nightlife/NightlifeEventsModal").then((m) => m.NightlifeEventsModal),
  { ssr: false }
);

export default function VesselApp() {
  const {
    activeView,
    selectedProfile,
    setSelectedProfile,
    activeChatProfileId,
    setActiveChatProfileId,
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    isDiaryModalOpen,
    closeCreateDiaryModal,
    isGeoBatteryModalOpen,
    closeGeoBatteryModal,
    isFilterDrawerOpen,
    enRouteState,
    isAppSettingsModalOpen,
    isHostCardModalOpen,
    isPreFlightModalOpen,
    isVoiceRecorderOpen,
    isEnRouteModalOpen,
    isSafetyBeaconModalOpen,
    isDuressPinSettingsOpen,
    isLivenessModalOpen,
    isSessionRoomModalOpen,
    isDuoModalOpen,
    isUnlimitedModalOpen,
    isVaultAuditModalOpen,
    isTravelModalOpen,
    isHarmReductionModalOpen,
    isItsExposureModalOpen,
    isNightlifeModalOpen,
    isCoverScreenActive,
    stealthMode,
    isGenderOnboardingOpen,
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

          {activeView === "pulses" && <PulsesView />}

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

        {/* Drawer de Filtros por Dinámicas y Fetiches (Bajo Demanda) */}
        {isFilterDrawerOpen && <DynamicFilterDrawer />}

        {/* Modal de Detalle de Perfil / Arquitectura */}
        {selectedProfile && (
          <ProfileDetailModal
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
            onOpenChat={(profileId) => {
              setSelectedProfile(null);
              setActiveChatProfileId(profileId);
            }}
          />
        )}

        {/* Modal de Darkroom Chat Efímero */}
        {activeChatProfileId && (
          <DarkroomChatModal
            profileId={activeChatProfileId}
            onClose={() => setActiveChatProfileId(null)}
          />
        )}

        {/* Modal de Autenticación Real & Login / Verificación de Identidad Digital */}
        {isAuthModalOpen && (
          authModalMode === "verify" ? (
            <IdentityVerificationModal onClose={closeAuthModal} />
          ) : (
            <AuthModal onClose={closeAuthModal} initialMode={authModalMode} />
          )
        )}

        {isGenderOnboardingOpen && <GenderInterestOnboardingModal />}

        {/* Modal de Crear / Editar Entrada de Diario de Citas */}
        {isDiaryModalOpen && (
          <CreateDiaryEntryModal onClose={closeCreateDiaryModal} />
        )}

        {/* Modal de Arquitectura Geoespacial Google S2 & Ahorro de Batería */}
        {isGeoBatteryModalOpen && (
          <GeoBatteryModal onClose={closeGeoBatteryModal} />
        )}

        {/* Modal de Configuración Integral de la App & Sesión (Disparado por el Logo) */}
        {isAppSettingsModalOpen && <AppSettingsModal />}

        {/* Modales de la Suite Táctica (12 Características) - Carga y Renderizado Bajo Demanda */}
        {isHostCardModalOpen && <HostCardModal />}
        {isPreFlightModalOpen && <PreFlightChecklistModal />}
        {isVoiceRecorderOpen && <VoiceVibeRecorderModal />}
        {isEnRouteModalOpen && <EnRouteTrackerModal />}
        {isSafetyBeaconModalOpen && <SafetyBeaconModal />}
        {isDuressPinSettingsOpen && <DuressPinSettingsModal />}
        {isLivenessModalOpen && <LivenessVerificationModal />}
        {isSessionRoomModalOpen && <SessionRoomModal />}
        {isDuoModalOpen && <DuoLinkModal />}
        {isUnlimitedModalOpen && <UnlimitedPaywallModal />}
        {isVaultAuditModalOpen && <VaultAuditModal />}
        {isTravelModalOpen && <TravelModeModal />}
        {isHarmReductionModalOpen && <HarmReductionModal />}
        {isItsExposureModalOpen && <ItsExposureModal />}
        {isNightlifeModalOpen && <NightlifeEventsModal />}

        {/* Pantalla Señuelo // Bloc de Notas Brutalista Activo */}
        {isCoverScreenActive && <CalculatorCoverScreen />}

        {/* Pantalla de Bloqueo Discreto / Modo Sigilo */}
        {stealthMode && <StealthLockScreen />}
      </div>
    </div>
  );
}

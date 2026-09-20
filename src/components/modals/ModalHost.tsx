"use client";

import React, { memo } from "react";
import dynamic from "next/dynamic";
import { useVessel } from "@/context/VesselContext";

// ==========================================
// 1. Core Overlays & Navegación Táctica
// ==========================================
const ProfileDetailModal = dynamic(
  () => import("@/components/profile/ProfileDetailModal").then((m) => m.ProfileDetailModal),
  { ssr: false }
);
const DarkroomChatModal = dynamic(
  () => import("@/components/chat/DarkroomChatModal").then((m) => m.DarkroomChatModal),
  { ssr: false }
);
const DynamicFilterDrawer = dynamic(
  () => import("@/components/filters/DynamicFilterDrawer").then((m) => m.DynamicFilterDrawer),
  { ssr: false }
);

// ==========================================
// 2. Auth, Identidad & Onboarding
// ==========================================
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
const LivenessVerificationModal = dynamic(
  () => import("@/components/auth/LivenessVerificationModal").then((m) => m.LivenessVerificationModal),
  { ssr: false }
);

// ==========================================
// 3. Seguridad, Camuflaje & Modo Sigilo
// ==========================================
const CalculatorCoverScreen = dynamic(
  () => import("@/components/safety/CalculatorCoverScreen").then((m) => m.CalculatorCoverScreen),
  { ssr: false }
);
const StealthLockScreen = dynamic(
  () => import("@/components/ui/StealthLockScreen").then((m) => m.StealthLockScreen),
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
const HarmReductionModal = dynamic(
  () => import("@/components/safety/HarmReductionModal").then((m) => m.HarmReductionModal),
  { ssr: false }
);

// ==========================================
// 4. Suite Táctica & Logística
// ==========================================
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
const TravelModeModal = dynamic(
  () => import("@/components/radar/TravelModeModal").then((m) => m.TravelModeModal),
  { ssr: false }
);
const NightlifeEventsModal = dynamic(
  () => import("@/components/nightlife/NightlifeEventsModal").then((m) => m.NightlifeEventsModal),
  { ssr: false }
);

// ==========================================
// 5. Utilidades, Salud & Cuentas
// ==========================================
const AppSettingsModal = dynamic(
  () => import("@/components/settings/AppSettingsModal").then((m) => m.AppSettingsModal),
  { ssr: false }
);
const GeoBatteryModal = dynamic(
  () => import("@/components/radar/GeoBatteryModal").then((m) => m.GeoBatteryModal),
  { ssr: false }
);
const CreateDiaryEntryModal = dynamic(
  () => import("@/components/diary/CreateDiaryEntryModal").then((m) => m.CreateDiaryEntryModal),
  { ssr: false }
);
const ItsExposureModal = dynamic(
  () => import("@/components/diary/ItsExposureModal").then((m) => m.ItsExposureModal),
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

/**
 * ModalHost: Orquestador desacoplado de modales y overlays del sistema VESSEL.
 * Centraliza el code-splitting y renderizado condicional fuera del componente raíz `page.tsx`.
 */
export const ModalHost: React.FC = memo(function ModalHost() {
  const {
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
    isAppSettingsModalOpen,
    isHostCardModalOpen,
    isPreFlightModalOpen,
    isVoiceRecorderOpen,
    isEnRouteModalOpen,
    isSafetyBeaconModalOpen,
    isDuressPinSettingsOpen,
    isLivenessModalOpen,
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
    <>
      {/* 1. Core Overlays */}
      {isFilterDrawerOpen && <DynamicFilterDrawer />}

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

      {activeChatProfileId && (
        <DarkroomChatModal
          profileId={activeChatProfileId}
          onClose={() => setActiveChatProfileId(null)}
        />
      )}

      {/* 2. Auth & Identidad */}
      {isAuthModalOpen && (
        authModalMode === "verify" ? (
          <IdentityVerificationModal onClose={closeAuthModal} />
        ) : (
          <AuthModal onClose={closeAuthModal} initialMode={authModalMode} />
        )
      )}

      {isGenderOnboardingOpen && <GenderInterestOnboardingModal />}
      {isLivenessModalOpen && <LivenessVerificationModal />}

      {/* 3. Seguridad & Camuflaje */}
      {isCoverScreenActive && <CalculatorCoverScreen />}
      {stealthMode && <StealthLockScreen />}
      {isSafetyBeaconModalOpen && <SafetyBeaconModal />}
      {isDuressPinSettingsOpen && <DuressPinSettingsModal />}
      {isHarmReductionModalOpen && <HarmReductionModal />}

      {/* 4. Suite Táctica & Logística */}
      {isHostCardModalOpen && <HostCardModal />}
      {isPreFlightModalOpen && <PreFlightChecklistModal />}
      {isVoiceRecorderOpen && <VoiceVibeRecorderModal />}
      {isEnRouteModalOpen && <EnRouteTrackerModal />}
      {isTravelModalOpen && <TravelModeModal />}
      {isNightlifeModalOpen && <NightlifeEventsModal />}

      {/* 5. Utilidades, Salud & Cuentas */}
      {isAppSettingsModalOpen && <AppSettingsModal />}
      {isGeoBatteryModalOpen && (
        <GeoBatteryModal onClose={closeGeoBatteryModal} />
      )}
      {isDiaryModalOpen && (
        <CreateDiaryEntryModal onClose={closeCreateDiaryModal} />
      )}
      {isItsExposureModalOpen && <ItsExposureModal />}
      {isUnlimitedModalOpen && <UnlimitedPaywallModal />}
      {isVaultAuditModalOpen && <VaultAuditModal />}
    </>
  );
});

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
const DuoLinkModal = dynamic(
  () => import("@/components/profile/DuoLinkModal").then((m) => m.DuoLinkModal),
  { ssr: false }
);
const LoverDossierModal = dynamic(
  () => import("@/components/diary/LoverDossierModal").then((m) => m.LoverDossierModal),
  { ssr: false }
);
const VesselWrappedModal = dynamic(
  () => import("@/components/diary/VesselWrappedModal").then((m) => m.VesselWrappedModal),
  { ssr: false }
);
const QuickShareQrModal = dynamic(
  () => import("@/components/profile/QuickShareQrModal").then((m) => m.QuickShareQrModal),
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
    isVoiceRecorderOpen,
    isEnRouteModalOpen,
    isSafetyBeaconModalOpen,
    isDuressPinSettingsOpen,
    isLivenessModalOpen,
    isUnlimitedModalOpen,
    isTravelModalOpen,
    isHarmReductionModalOpen,
    isItsExposureModalOpen,
    isNightlifeModalOpen,
    isCoverScreenActive,
    isGenderOnboardingOpen,
    isDuoModalOpen,
    isDossierModalOpen,
    isWrappedModalOpen,
  } = useVessel();

  return (
    <>
      {/* 1. Core Overlays */}
      {isFilterDrawerOpen && <DynamicFilterDrawer />}

      {activeChatProfileId && (
        <DarkroomChatModal
          profileId={activeChatProfileId}
          onClose={() => setActiveChatProfileId(null)}
        />
      )}

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
      {isSafetyBeaconModalOpen && <SafetyBeaconModal />}
      {isDuressPinSettingsOpen && <DuressPinSettingsModal />}
      {isHarmReductionModalOpen && <HarmReductionModal />}

      {/* 4. Suite Táctica & Logística */}
      {isHostCardModalOpen && <HostCardModal />}
      {isVoiceRecorderOpen && <VoiceVibeRecorderModal />}
      {isEnRouteModalOpen && <EnRouteTrackerModal />}
      {isTravelModalOpen && <TravelModeModal />}
      {isNightlifeModalOpen && <NightlifeEventsModal />}

      {/* 5. Utilidades, Salud, Cuentas & The Black Vault */}
      {isAppSettingsModalOpen && <AppSettingsModal />}
      {isGeoBatteryModalOpen && (
        <GeoBatteryModal onClose={closeGeoBatteryModal} />
      )}
      {isDiaryModalOpen && (
        <CreateDiaryEntryModal onClose={closeCreateDiaryModal} />
      )}
      {isDossierModalOpen && <LoverDossierModal />}
      {isWrappedModalOpen && <VesselWrappedModal />}
      {isItsExposureModalOpen && <ItsExposureModal />}
      {isUnlimitedModalOpen && <UnlimitedPaywallModal />}
      {isDuoModalOpen && <DuoLinkModal />}
      <QuickShareQrModal />
    </>
  );
});

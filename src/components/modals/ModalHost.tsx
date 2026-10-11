"use client";

import React, { memo } from "react";
import dynamic from "next/dynamic";
import {
  useRadarMatrix,
  useChat,
  useAuth,
  useDiary,
  useSettings,
  useLogistics,
  useSafety,
} from "@/context/VesselContext";

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
// 3. Seguridad & Reducción de Daños
// ==========================================
const HarmReductionModal = dynamic(
  () => import("@/components/safety/HarmReductionModal").then((m) => m.HarmReductionModal),
  { ssr: false }
);

// ==========================================
// 4. Suite Táctica, Logística & Vida Nocturna
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
 * Sub-hosts de modales segmentados por dominio táctico.
 * Cada sub-host se suscribe ÚNICAMENTE a su propio contexto, aislando las
 * mutaciones de alta frecuencia (ej: chat, radar, GPS) del resto del árbol de modales.
 */

const RadarModalHost = memo(function RadarModalHost() {
  const { selectedProfile, setSelectedProfile } = useRadarMatrix();
  const { setActiveChatProfileId } = useChat();

  if (!selectedProfile) return null;

  return (
    <ProfileDetailModal
      profile={selectedProfile}
      onClose={() => setSelectedProfile(null)}
      onOpenChat={(profileId) => {
        setSelectedProfile(null);
        setActiveChatProfileId(profileId);
      }}
    />
  );
});

const ChatModalHost = memo(function ChatModalHost() {
  const { activeChatProfileId, setActiveChatProfileId } = useChat();

  if (!activeChatProfileId) return null;

  return (
    <DarkroomChatModal
      profileId={activeChatProfileId}
      onClose={() => setActiveChatProfileId(null)}
    />
  );
});

const AuthModalHost = memo(function AuthModalHost() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    isLivenessModalOpen,
    isGenderOnboardingOpen,
  } = useAuth();

  if (!isAuthModalOpen && !isGenderOnboardingOpen && !isLivenessModalOpen) {
    return null;
  }

  return (
    <>
      {isAuthModalOpen && (
        authModalMode === "verify" ? (
          <IdentityVerificationModal onClose={closeAuthModal} />
        ) : (
          <AuthModal onClose={closeAuthModal} initialMode={authModalMode} />
        )
      )}
      {isGenderOnboardingOpen && <GenderInterestOnboardingModal />}
      {isLivenessModalOpen && <LivenessVerificationModal />}
    </>
  );
});

const SafetyModalHost = memo(function SafetyModalHost() {
  const { isHarmReductionModalOpen } = useSafety();

  if (!isHarmReductionModalOpen) return null;

  return <HarmReductionModal />;
});

const LogisticsModalHost = memo(function LogisticsModalHost() {
  const {
    isHostCardModalOpen,
    isEnRouteModalOpen,
    isTravelModalOpen,
    isNightlifeModalOpen,
    isGeoBatteryModalOpen,
    closeGeoBatteryModal,
    isVoiceRecorderOpen,
    isDuoModalOpen,
  } = useLogistics();

  if (
    !isHostCardModalOpen &&
    !isVoiceRecorderOpen &&
    !isEnRouteModalOpen &&
    !isTravelModalOpen &&
    !isNightlifeModalOpen &&
    !isGeoBatteryModalOpen &&
    !isDuoModalOpen
  ) {
    return null;
  }

  return (
    <>
      {isHostCardModalOpen && <HostCardModal />}
      {isVoiceRecorderOpen && <VoiceVibeRecorderModal />}
      {isEnRouteModalOpen && <EnRouteTrackerModal />}
      {isTravelModalOpen && <TravelModeModal />}
      {isNightlifeModalOpen && <NightlifeEventsModal />}
      {isGeoBatteryModalOpen && (
        <GeoBatteryModal onClose={closeGeoBatteryModal} />
      )}
      {isDuoModalOpen && <DuoLinkModal />}
    </>
  );
});

const SettingsModalHost = memo(function SettingsModalHost() {
  const { isAppSettingsModalOpen, isUnlimitedModalOpen } = useSettings();

  if (!isAppSettingsModalOpen && !isUnlimitedModalOpen) return null;

  return (
    <>
      {isAppSettingsModalOpen && <AppSettingsModal />}
      {isUnlimitedModalOpen && <UnlimitedPaywallModal />}
    </>
  );
});

const DiaryModalHost = memo(function DiaryModalHost() {
  const {
    isDiaryModalOpen,
    closeCreateDiaryModal,
    isItsExposureModalOpen,
    isDossierModalOpen,
    isWrappedModalOpen,
  } = useDiary();

  if (
    !isDiaryModalOpen &&
    !isDossierModalOpen &&
    !isWrappedModalOpen &&
    !isItsExposureModalOpen
  ) {
    return null;
  }

  return (
    <>
      {isDiaryModalOpen && (
        <CreateDiaryEntryModal onClose={closeCreateDiaryModal} />
      )}
      {isDossierModalOpen && <LoverDossierModal />}
      {isWrappedModalOpen && <VesselWrappedModal />}
      {isItsExposureModalOpen && <ItsExposureModal />}
    </>
  );
});

/**
 * ModalHost: Orquestador desacoplado de modales y overlays del sistema VESSEL.
 * Centraliza el code-splitting y renderizado condicional fuera del componente raíz `page.tsx`.
 * Cada sub-host está aislado reactivamente para evitar cascada de renders al actualizar un solo dominio.
 */
export const ModalHost: React.FC = memo(function ModalHost() {
  return (
    <>
      {/* 1. Core Overlays & Navegación (Chat antes de ProfileDetail para stacking z-index correcto) */}
      <ChatModalHost />
      <RadarModalHost />

      {/* 2. Auth & Identidad */}
      <AuthModalHost />

      {/* 3. Seguridad & Reducción de Daños */}
      <SafetyModalHost />

      {/* 4. Suite Táctica, Logística & Vida Nocturna */}
      <LogisticsModalHost />

      {/* 5. Configuración & Membresías */}
      <SettingsModalHost />

      {/* 6. Agenda & The Black Vault */}
      <DiaryModalHost />

      {/* 7. Pase QR de Contacto Rápido */}
      <QuickShareQrModal />
    </>
  );
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock de subcomponentes para acelerar y aislar la prueba unitaria de ModalHost
vi.mock("@/components/settings/AppSettingsModal", () => ({
  AppSettingsModal: () => <div data-testid="app-settings-modal">AppSettingsModal Content</div>,
}));

vi.mock("@/components/profile/ProfileDetailModal", () => ({
  ProfileDetailModal: ({ profile }: { profile: any }) => (
    <div data-testid="profile-detail-modal">ProfileDetailModal: {profile.name}</div>
  ),
}));

vi.mock("@/components/chat/DarkroomChatModal", () => ({
  DarkroomChatModal: ({ profileId }: { profileId: string }) => (
    <div data-testid="darkroom-chat-modal">DarkroomChatModal: {profileId}</div>
  ),
}));

vi.mock("@/components/auth/AuthModal", () => ({
  AuthModal: () => <div data-testid="auth-modal">AuthModal Content</div>,
}));

vi.mock("@/components/auth/IdentityVerificationModal", () => ({
  IdentityVerificationModal: () => (
    <div data-testid="identity-verification-modal">IdentityVerificationModal Content</div>
  ),
}));

vi.mock("@/components/radar/GeoBatteryModal", () => ({
  GeoBatteryModal: () => <div data-testid="geo-battery-modal">GeoBatteryModal Content</div>,
}));

vi.mock("@/components/safety/CalculatorCoverScreen", () => ({
  CalculatorCoverScreen: () => <div data-testid="calculator-cover-screen">CalculatorCover</div>,
}));

let mockVesselState: Record<string, any> = {};

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => mockVesselState,
}));

// Import dinámico de ModalHost después de registrar los mocks
import { ModalHost } from "@/components/modals/ModalHost";

describe("ModalHost — Orquestador Desacoplado de Modales (Fase 4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVesselState = {
      selectedProfile: null,
      setSelectedProfile: vi.fn(),
      activeChatProfileId: null,
      setActiveChatProfileId: vi.fn(),
      isAuthModalOpen: false,
      authModalMode: "login",
      closeAuthModal: vi.fn(),
      isDiaryModalOpen: false,
      closeCreateDiaryModal: vi.fn(),
      isGeoBatteryModalOpen: false,
      closeGeoBatteryModal: vi.fn(),
      isFilterDrawerOpen: false,
      isAppSettingsModalOpen: false,
      isHostCardModalOpen: false,
      isPreFlightModalOpen: false,
      isVoiceRecorderOpen: false,
      isEnRouteModalOpen: false,
      isSafetyBeaconModalOpen: false,
      isDuressPinSettingsOpen: false,
      isLivenessModalOpen: false,
      isSessionRoomModalOpen: false,
      isDuoModalOpen: false,
      isUnlimitedModalOpen: false,
      isVaultAuditModalOpen: false,
      isTravelModalOpen: false,
      isHarmReductionModalOpen: false,
      isItsExposureModalOpen: false,
      isNightlifeModalOpen: false,
      isCoverScreenActive: false,
      stealthMode: false,
      isGenderOnboardingOpen: false,
    };
  });

  it("no debe renderizar ningún modal cuando todos los flags son falsos o nulos", () => {
    const { container } = render(<ModalHost />);
    expect(container.firstChild).toBeNull();
  });

  it("debe renderizar AppSettingsModal cuando isAppSettingsModalOpen es true", async () => {
    mockVesselState.isAppSettingsModalOpen = true;

    render(<ModalHost />);

    const modal = await screen.findByTestId("app-settings-modal");
    expect(modal).toBeInTheDocument();
  });

  it("debe renderizar ProfileDetailModal cuando selectedProfile está presente", async () => {
    mockVesselState.selectedProfile = { id: "p1", name: "ALEX_CYBER" };

    render(<ModalHost />);

    const modal = await screen.findByTestId("profile-detail-modal");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent("ALEX_CYBER");
  });

  it("debe renderizar DarkroomChatModal cuando activeChatProfileId está presente", async () => {
    mockVesselState.activeChatProfileId = "user-99";

    render(<ModalHost />);

    const modal = await screen.findByTestId("darkroom-chat-modal");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent("user-99");
  });

  it("debe renderizar IdentityVerificationModal cuando isAuthModalOpen es true y authModalMode es verify", async () => {
    mockVesselState.isAuthModalOpen = true;
    mockVesselState.authModalMode = "verify";

    render(<ModalHost />);

    const modal = await screen.findByTestId("identity-verification-modal");
    expect(modal).toBeInTheDocument();
  });

  it("debe renderizar CalculatorCoverScreen cuando isCoverScreenActive es true", async () => {
    mockVesselState.isCoverScreenActive = true;

    render(<ModalHost />);

    const modal = await screen.findByTestId("calculator-cover-screen");
    expect(modal).toBeInTheDocument();
  });
});

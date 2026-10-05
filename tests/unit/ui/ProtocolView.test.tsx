import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProtocolView } from "@/components/account/ProtocolView";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockUpdateMyProfile = vi.fn();
const mockToggleFogMode = vi.fn();
const mockOpenAppSettingsModal = vi.fn();
const mockOpenVoiceRecorder = vi.fn();

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    myBodyState: "open",
    myProfile: {
      codename: "LUCAS_BA",
      age: 28,
      showAge: true,
      avatarUrl: "https://example.com/lucas.jpg",
      isFogMode: false,
      isStylizedAvatar: false,
      verification: { isVerified: true, verifiedAt: "2026-01-01" },
      respectScore: 99,
      totalEncountersVerified: 5,
      genderIdentity: "Hombre Cis",
      pronouns: "Él / He",
      role: "Versátil",
      heightCm: 182,
      weightKg: 79,
      yoSoy: "Atlético / Sport",
      twitterHandle: "lucas_ba",
      mobility: "Tengo depto / lugar",
    },
    currentUserUid: "user-lucas-01",
    updateMyProfile: mockUpdateMyProfile,
    toggleFogMode: mockToggleFogMode,
    myVoiceVibe: null,
    openVoiceRecorder: mockOpenVoiceRecorder,
    deleteMyVoiceVibe: vi.fn(),
    userAlbums: [{ id: "alb-1", name: "Privadas" }],
    myReceivedTestimonials: [],
    boundaries: { "user-02": { profileId: "user-02", protocol: "slow_down" } },
    openAppSettingsModal: mockOpenAppSettingsModal,
    setSelectedProfile: vi.fn(),
    myFullProfile: { id: "user-lucas-01", codename: "LUCAS_BA" },
    language: "es",
    t: TRANSLATIONS.es,
  }),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
    playSignalSent: vi.fn(),
    playError: vi.fn(),
  },
}));

vi.mock("@/components/account/tabs", () => ({
  BioTab: () => <div data-testid="bio-tab">BioTab Content</div>,
  AlbumsTab: () => <div data-testid="albums-tab">AlbumsTab Content</div>,
  KinksTab: () => <div data-testid="kinks-tab">KinksTab Content</div>,
  ReputationTab: () => <div data-testid="reputation-tab">ReputationTab Content</div>,
  BoundariesTab: () => <div data-testid="boundaries-tab">BoundariesTab Content</div>,
  LogisticsTab: () => <div data-testid="logistics-tab">LogisticsTab Content</div>,
}));

describe("ProtocolView — Arquitectura Dual: Modo Fácil (Tarjeta Viva) y Modo Avanzado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("debe renderizar por defecto en Modo Fácil con la Tarjeta Viva del usuario y controles directos", () => {
    render(<ProtocolView />);

    expect(screen.getByText(/✨ Mi Tarjeta/i)).toBeInTheDocument();
    expect(screen.getByText(/⚙️ Modo Avanzado/i)).toBeInTheDocument();
    expect(screen.getAllByText(/LUCAS_BA/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/28 años/i)).toBeInTheDocument();
    expect(screen.getByText(/Tengo depto \/ lugar/i)).toBeInTheDocument();
  });

  it("debe conmutar al Modo Avanzado al hacer clic en el botón de Modo Avanzado", () => {
    render(<ProtocolView />);

    const advancedBtn = screen.getByRole("button", { name: /Modo Avanzado/i });
    fireEvent.click(advancedBtn);

    expect(screen.getByRole("tab", { name: /Ficha/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Bóvedas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Logística/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Seguridad/i })).toBeInTheDocument();
  });

  it("en Modo Avanzado debe renderizar BioTab en la pestaña Ficha", () => {
    render(<ProtocolView />);

    const advancedBtn = screen.getByRole("button", { name: /Modo Avanzado/i });
    fireEvent.click(advancedBtn);

    expect(screen.getByTestId("bio-tab")).toBeInTheDocument();
  });

  it("en Modo Avanzado debe conmutar a la solapa de Bóvedas y renderizar AlbumsTab", () => {
    render(<ProtocolView />);

    const advancedBtn = screen.getByRole("button", { name: /Modo Avanzado/i });
    fireEvent.click(advancedBtn);

    const vaultsTabBtn = screen.getByRole("tab", { name: /Bóvedas/i });
    fireEvent.click(vaultsTabBtn);

    expect(screen.getByTestId("albums-tab")).toBeInTheDocument();
  });

  it("en Modo Avanzado debe conmutar a Logística y renderizar LogisticsTab", () => {
    render(<ProtocolView />);

    const advancedBtn = screen.getByRole("button", { name: /Modo Avanzado/i });
    fireEvent.click(advancedBtn);

    const logisticsTabBtn = screen.getByRole("tab", { name: /Logística/i });
    fireEvent.click(logisticsTabBtn);

    expect(screen.getByTestId("logistics-tab")).toBeInTheDocument();
  });

  it("en Modo Avanzado debe conmutar a Seguridad y renderizar BoundariesTab y ReputationTab", () => {
    render(<ProtocolView />);

    const advancedBtn = screen.getByRole("button", { name: /Modo Avanzado/i });
    fireEvent.click(advancedBtn);

    const securityTabBtn = screen.getByRole("tab", { name: /Seguridad/i });
    fireEvent.click(securityTabBtn);

    expect(screen.getByTestId("boundaries-tab")).toBeInTheDocument();
    expect(screen.getByTestId("reputation-tab")).toBeInTheDocument();
  });

  it("debe invocar toggleFogMode al hacer clic en el switch de Modo Niebla en Modo Fácil", () => {
    render(<ProtocolView />);

    const fogToggle = screen.getByRole("switch", { name: /Modo Niebla/i });
    fireEvent.click(fogToggle);

    expect(mockToggleFogMode).toHaveBeenCalledTimes(1);
  });
});

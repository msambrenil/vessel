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
}));

describe("ProtocolView — Rediseño Táctico en 3 Macro-Paneles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar el Hero Banner con el codename del usuario y el badge 'Pongo Casa'", () => {
    render(<ProtocolView />);

    expect(screen.getAllByText("LUCAS_BA").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Pongo Casa/i)).toBeInTheDocument();
    expect(screen.getByText(/28 años/i)).toBeInTheDocument();
    expect(screen.getAllByText(/MI PERFIL/i).length).toBeGreaterThanOrEqual(1);
  });

  it("debe renderizar las 3 macro-pestañas: Mi Ficha, Fotos & Bóvedas, Privacidad & Respeto", () => {
    render(<ProtocolView />);

    expect(screen.getByRole("tab", { name: /Mi Ficha/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Fotos & Bóvedas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Privacidad & Respeto/i })).toBeInTheDocument();
  });

  it("debe renderizar Datos & Bio y Qué te morbosea en scroll continuo dentro de Mi Perfil", () => {
    render(<ProtocolView />);

    expect(screen.getByTestId("bio-tab")).toBeInTheDocument();
    expect(screen.getByTestId("kinks-tab")).toBeInTheDocument();
  });

  it("debe conmutar al macro-panel de Fotos & Bóvedas y renderizar AlbumsTab", () => {
    render(<ProtocolView />);

    const vaultsTabBtn = screen.getByRole("tab", { name: /Fotos & Bóvedas/i });
    fireEvent.click(vaultsTabBtn);

    expect(screen.getByTestId("albums-tab")).toBeInTheDocument();
  });

  it("debe conmutar al macro-panel de Privacidad & Respeto y renderizar Límites y Anti-Ghost en scroll continuo", () => {
    render(<ProtocolView />);

    const securityTabBtn = screen.getByRole("tab", { name: /Privacidad & Respeto/i });
    fireEvent.click(securityTabBtn);

    expect(screen.getByTestId("boundaries-tab")).toBeInTheDocument();
    expect(screen.getByTestId("reputation-tab")).toBeInTheDocument();
  });

  it("debe invocar toggleFogMode al hacer clic en el switch de Modo Niebla", () => {
    render(<ProtocolView />);

    const fogToggle = screen.getByRole("switch", { name: /Modo Niebla/i });
    fireEvent.click(fogToggle);

    expect(mockToggleFogMode).toHaveBeenCalledTimes(1);
  });
});

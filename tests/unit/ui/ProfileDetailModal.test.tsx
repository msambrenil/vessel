import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileDetailModal } from "@/components/profile/ProfileDetailModal";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import type { VesselProfile } from "@/types/vessel";

const mockTransmitSignal = vi.fn();
const mockSendRendezvousPin = vi.fn();
const mockOpenCreateDiaryModal = vi.fn();
const mockOpenHostCardModal = vi.fn();
const mockOpenUnlimitedModal = vi.fn();
const mockOnOpenChat = vi.fn();
const mockOnClose = vi.fn();

const mockProfile = {
  id: "profile-77",
  codename: "VALENTIN_CYBER",
  avatarUrl: "https://example.com/valentin.jpg",
  galleryUrls: ["https://example.com/valentin.jpg", "https://example.com/valentin2.jpg"],
  age: 26,
  showAge: true,
  role: "Top" as const,
  bodyState: "open" as const,
  mobility: "Tengo depto / lugar" as const,
  exitProtocol: "chill_cuddle" as const,
  yoSoy: "Atlético / Gym",
  heightCm: 182,
  weightKg: 79,
  intensity: 3 as const,
  distanceMeters: 450,
  discretizedDistance: {
    displayLabel: "A 450 m de ti",
    precisionMeters: 152,
    cellId: "s2-cell-123",
  },
  statement: "Diseñador visual y de noche en Under Club.",
  desires: ["Charla post-sexo", "Buen café"],
  intentions: ["Encuentro hoy", "Conexión genuina"],
  boundaries: ["Solo con protección", "Sin fotos faciales"],
  kinks: ["leather", "arnes", "besos"],
  hivStatus: "Negativo en PrEP",
  healthStatus: {
    prep: true,
    testedDate: "Agosto 2026",
    details: "Al día",
  },
  verification: {
    isVerified: true,
    badgeLabel: "Humano Verificado 3D",
    trustScore: 99,
    certificateHash: "0x7F2A",
    hasFacialPrivacy: false,
  },
  isAntiGhost: true,
  respectScore: 98,
  responseRateMinutes: 2,
  totalEncountersVerified: 14,
  privateVault: [],
  testimonials: [],
  coordinates: { lat: -34.58, lng: -58.42 },
  hostCard: {
    amenities: { showerReady: true, privateBathroom: true, drinksReady: true },
    accessNotes: "Edificio con ascensor",
  },
} as unknown as VesselProfile;

const mockGetBoundaryForProfile = vi.fn().mockReturnValue(null);
const mockGetProfileDossier = vi.fn().mockReturnValue(null);
const mockSaveProfileDossier = vi.fn();
const mockDeleteProfileDossier = vi.fn();
const mockSetActiveView = vi.fn();
const mockOpenLivenessModal = vi.fn();
const mockOpenVoiceRecorder = vi.fn();
const mockGetMutualKinkMatches = vi.fn().mockReturnValue([]);
const mockUnlockVault = vi.fn();
const mockValidateEncounter = vi.fn();
const mockPlayVoiceVibe = vi.fn();
const mockStopVoiceVibe = vi.fn();
const mockHasMutualPulse = vi.fn().mockReturnValue(false);

const mockVesselState = {
  myProfile: { codename: "TEST_ME", id: "user-me" },
  currentUserUid: "user-me",
  transmitSignal: mockTransmitSignal,
  sendRendezvousPin: mockSendRendezvousPin,
  transmissions: {},
  openCreateDiaryModal: mockOpenCreateDiaryModal,
  getBoundaryForProfile: mockGetBoundaryForProfile,
  getProfileDossier: mockGetProfileDossier,
  saveProfileDossier: mockSaveProfileDossier,
  deleteProfileDossier: mockDeleteProfileDossier,
  setActiveView: mockSetActiveView,
  openHostCardModal: mockOpenHostCardModal,
  openLivenessModal: mockOpenLivenessModal,
  openVoiceRecorder: mockOpenVoiceRecorder,
  getMutualKinkMatches: mockGetMutualKinkMatches,
  unlockedVaults: [],
  unlockVault: mockUnlockVault,
  validatedEncounters: {},
  validateEncounter: mockValidateEncounter,
  activePlayingVoiceId: null,
  playVoiceVibe: mockPlayVoiceVibe,
  stopVoiceVibe: mockStopVoiceVibe,
  t: TRANSLATIONS.es,
  language: "es",
  isUnlimited: false,
  openUnlimitedModal: mockOpenUnlimitedModal,
  hasMutualPulse: mockHasMutualPulse,
};

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => mockVesselState,
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
    playSignalSent: vi.fn(),
  },
}));

describe("ProfileDetailModal — Refactor Ergonómico de 3 Pestañas (Fase 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar el encabezado y el perfil con la pestaña Vibe por defecto", () => {
    render(
      <ProfileDetailModal
        profile={mockProfile}
        onClose={mockOnClose}
        onOpenChat={mockOnOpenChat}
      />
    );

    expect(screen.getAllByText("VALENTIN_CYBER").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Atlético / Gym")).toBeInTheDocument();
    expect(screen.getByText(/Diseñador visual y de noche/i)).toBeInTheDocument();
    expect(screen.getByText("Charla post-sexo")).toBeInTheDocument();
    expect(screen.getByText("Solo con protección")).toBeInTheDocument();
  });

  it("debe renderizar todas las secciones de forma continua en el scroll unificado (Vibe, Logística y Confianza)", () => {
    render(
      <ProfileDetailModal
        profile={mockProfile}
        onClose={mockOnClose}
        onOpenChat={mockOnOpenChat}
      />
    );

    // 1. Sección Vibe
    expect(screen.getByText(/Diseñador visual y de noche/i)).toBeInTheDocument();

    // 2. Sección Logística & Hospedaje
    expect(screen.getByText(/Disponibilidad de Casa/i)).toBeInTheDocument();
    expect(screen.getByText("TIENE CASA 🏠")).toBeInTheDocument();
    expect(screen.getAllByText("A 450 m de ti").length).toBeGreaterThanOrEqual(1);

    // 3. Sección Confianza & Anti-Ghost
    expect(screen.getByText(/Humano Verificado 3D/i)).toBeInTheDocument();
    expect(screen.getByText(/PROTOCOLO ANTI-GHOSTEO/i)).toBeInTheDocument();
    expect(screen.getByText(/Negativo en PrEP/i)).toBeInTheDocument();
  });

  it("debe enviar un pulso instantáneo al tocar el botón kinetic en el dock", () => {
    render(
      <ProfileDetailModal
        profile={mockProfile}
        onClose={mockOnClose}
        onOpenChat={mockOnOpenChat}
      />
    );

    const pulseBtn = screen.getByLabelText(/Enviar pulso a VALENTIN_CYBER/i);
    fireEvent.click(pulseBtn);

    expect(mockTransmitSignal).toHaveBeenCalledWith("profile-77");
  });

  it("debe abrir el chat efímero al presionar el botón de chat en el dock", () => {
    render(
      <ProfileDetailModal
        profile={mockProfile}
        onClose={mockOnClose}
        onOpenChat={mockOnOpenChat}
      />
    );

    const chatBtn = screen.getByRole("button", { name: /Abrir chat efímero/i });
    fireEvent.click(chatBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChat).toHaveBeenCalledWith("profile-77");
  });

  it("debe cerrar el modal al pulsar la X de cerrar", () => {
    render(
      <ProfileDetailModal
        profile={mockProfile}
        onClose={mockOnClose}
        onOpenChat={mockOnOpenChat}
      />
    );

    const closeBtn = screen.getByLabelText("Cerrar ventana");
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

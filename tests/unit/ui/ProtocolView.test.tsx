import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProtocolView } from "@/components/account/ProtocolView";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockUpdateMyProfile = vi.fn();
const mockToggleFogMode = vi.fn();
const mockOpenAppSettingsModal = vi.fn();
const mockOpenVoiceRecorder = vi.fn();
const mockSetSelectedProfile = vi.fn();

const mockProtocolState = {
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
    intentions: ["Ahora mismo (Inmediato)"],
  },
  myHostCard: {
    hasPlace: true,
    livingArrangement: "solo",
    amenities: { showerReady: true },
    supplies: { condoms: true },
  },
  myKinkMatrix: { armpits: "love", musk: "curious" },
  currentUserUid: "user-lucas-01",
  updateMyProfile: mockUpdateMyProfile,
  toggleFogMode: mockToggleFogMode,
  myVoiceVibe: null,
  openVoiceRecorder: mockOpenVoiceRecorder,
  deleteMyVoiceVibe: vi.fn(),
  userAlbums: [{ id: "alb-1", name: "Privadas", privacy: "private", photos: [] }],
  myReceivedTestimonials: [],
  boundaries: { "user-02": { profileId: "user-02", protocol: "slow_down" } },
  openAppSettingsModal: mockOpenAppSettingsModal,
  setSelectedProfile: mockSetSelectedProfile,
  myFullProfile: { id: "user-lucas-01", codename: "LUCAS_BA" },
  language: "es" as const,
  t: TRANSLATIONS.es,
};

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => mockProtocolState,
  useAuth: () => mockProtocolState,
  useLogistics: () => mockProtocolState,
  useDiary: () => mockProtocolState,
  useRadarMatrix: () => mockProtocolState,
  useChat: () => mockProtocolState,
  useSettings: () => mockProtocolState,
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
    playSignalSent: vi.fn(),
    playError: vi.fn(),
  },
}));

vi.mock("@/components/account/sheets", () => ({
  PhotosSheet: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="photos-sheet">
        <div data-testid="albums-tab">Albums Content</div>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
  VibePhysicalSheet: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="vibe-physical-sheet">
        <div data-testid="bio-tab">Bio Content</div>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
  LogisticsSheet: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="logistics-sheet">
        <div data-testid="logistics-tab">Logistics Content</div>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
  KinksSheet: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="kinks-sheet">
        <div data-testid="kinks-tab">Kinks Content</div>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
  SafetySheet: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="safety-sheet">
        <div data-testid="boundaries-tab">Boundaries Content</div>
        <div data-testid="reputation-tab">Reputation Content</div>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

describe("ProtocolView — Alternativa B: WYSIWYG Bento Hub con Drawers Modulares", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar la Tarjeta Viva superior del usuario con identidad y controles inmediatos", () => {
    render(<ProtocolView />);

    expect(screen.getAllByText(/LUCAS_BA/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/28 años/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Pongo Casa/i).length).toBeGreaterThanOrEqual(1);
  });

  it("debe renderizar los 5 módulos tácticos en el Bento Hub", () => {
    render(<ProtocolView />);

    expect(screen.getByRole("tab", { name: /Álbumes|Bóvedas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Ficha|Onda/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Logística|Casa/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Morbos/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Blindaje|Seguridad/i })).toBeInTheDocument();
  });

  it("debe abrir el Sheet de Fotos al hacer clic en el módulo de Fotos & Álbumes", () => {
    render(<ProtocolView />);

    const photosCard = screen.getByRole("tab", { name: /Álbumes|Bóvedas/i });
    fireEvent.click(photosCard);

    expect(screen.getByTestId("photos-sheet")).toBeInTheDocument();
    expect(screen.getByTestId("albums-tab")).toBeInTheDocument();
  });

  it("debe abrir el Sheet de Onda y Físico al hacer clic en el módulo de Ficha", () => {
    render(<ProtocolView />);

    const bioCard = screen.getByRole("tab", { name: /Ficha|Onda/i });
    fireEvent.click(bioCard);

    expect(screen.getByTestId("vibe-physical-sheet")).toBeInTheDocument();
    expect(screen.getByTestId("bio-tab")).toBeInTheDocument();
  });

  it("debe abrir el Sheet de Logística al hacer clic en Tu Casa & Logística", () => {
    render(<ProtocolView />);

    const logisticsCard = screen.getByRole("tab", { name: /Logística|Casa/i });
    fireEvent.click(logisticsCard);

    expect(screen.getByTestId("logistics-sheet")).toBeInTheDocument();
    expect(screen.getByTestId("logistics-tab")).toBeInTheDocument();
  });

  it("debe abrir el Sheet de Morbos al hacer clic en Morbos & Kinks", () => {
    render(<ProtocolView />);

    const kinksCard = screen.getByRole("tab", { name: /Morbos/i });
    fireEvent.click(kinksCard);

    expect(screen.getByTestId("kinks-sheet")).toBeInTheDocument();
    expect(screen.getByTestId("kinks-tab")).toBeInTheDocument();
  });

  it("debe abrir el Sheet de Seguridad al hacer clic en Blindaje & Cuidado", () => {
    render(<ProtocolView />);

    const safetyCard = screen.getByRole("tab", { name: /Blindaje|Seguridad/i });
    fireEvent.click(safetyCard);

    expect(screen.getByTestId("safety-sheet")).toBeInTheDocument();
    expect(screen.getByTestId("boundaries-tab")).toBeInTheDocument();
    expect(screen.getByTestId("reputation-tab")).toBeInTheDocument();
  });

  it("debe invocar toggleFogMode al hacer clic en el switch de Modo Niebla (BrutalistSwitch)", () => {
    render(<ProtocolView />);

    const fogToggle = screen.getByRole("switch", { name: /Modo Niebla/i });
    fireEvent.click(fogToggle);

    expect(mockToggleFogMode).toHaveBeenCalledTimes(1);
  });

  it("debe permitir previsualizar cómo ven la tarjeta otros usuarios", () => {
    render(<ProtocolView />);

    const previewButtons = screen.getAllByRole("button", { name: /Previsualizar cómo ven|Cómo me ven/i });
    fireEvent.click(previewButtons[0]);

    expect(mockSetSelectedProfile).toHaveBeenCalledWith(
      expect.objectContaining({ codename: "LUCAS_BA" })
    );
  });

  it("debe permitir cambiar de 'Pongo Casa' a 'Voy Yo' en la barra de estado rápido con 1 tap", () => {
    render(<ProtocolView />);

    const voyYoBtn = screen.getByRole("button", { name: /Voy Yo/i });
    fireEvent.click(voyYoBtn);

    expect(mockUpdateMyProfile).toHaveBeenCalledWith(
      expect.objectContaining({ mobility: "Voy a la tuya / Viajo 🚗" })
    );
  });

  it("debe permitir activar o desactivar intenciones del día con 1 tap en la barra de estado rápido", () => {
    render(<ProtocolView />);

    const drinksBtn = screen.getByRole("button", { name: /Previa \/ Bar/i });
    fireEvent.click(drinksBtn);

    expect(mockUpdateMyProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        intentions: expect.arrayContaining(["Pinta previa / Birra"]),
      })
    );
  });
});

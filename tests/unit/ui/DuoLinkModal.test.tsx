import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DuoLinkModal } from "@/components/profile/DuoLinkModal";
import { VesselProfile } from "@/types/vessel";

const mockCloseDuoModal = vi.fn();
const mockLinkDuoPartner = vi.fn();
const mockUnlinkDuoPartner = vi.fn();

const mockPartnerProfile: VesselProfile = {
  id: "partner-01",
  codename: "NICO_BA",
  age: 28,
  role: "Versatile",
  avatarUrl: "https://example.com/nico.jpg",
  distanceMeters: 450,
  bodyState: "open",
  heightCm: 178,
  weightKg: 75,
  bodyArchetype: "Atlético",
  intensity: 2,
  hosting: "Tengo depto / lugar",
  tagline: "Amante del diseño y la música",
  statement: "Explorando dinámicas abiertas",
  verification: {
    isVerified: true,
    verifiedAt: "2026-01-01",
    hasFacialPrivacy: false,
    badgeLabel: "BIO",
    trustScore: 100,
  },
  totalEncountersVerified: 5,
  galleryUrls: [],
  privateVault: [],
  testimonials: [],
  kinks: [],
  healthStatus: { prep: true, testedDate: "2026-08-01", details: "Al día" },
  coordinates: { lat: -34.6, lng: -58.4 },
  showAge: true,
  yoSoy: "Atlético / Deportista",
  mobility: "Tengo depto / lugar",
  hivStatus: "Negativo en PrEP",
};

let mockDuoLinkState = {
  isLinked: false,
  partnerProfileId: undefined as string | undefined,
  partnerCodename: undefined as string | undefined,
  partnerAvatarUrl: undefined as string | undefined,
  jointTitle: undefined as string | undefined,
};

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    isDuoModalOpen: true,
    closeDuoModal: mockCloseDuoModal,
    myDuoLink: mockDuoLinkState,
    linkDuoPartner: mockLinkDuoPartner,
    unlinkDuoPartner: mockUnlinkDuoPartner,
    profiles: [mockPartnerProfile],
    favoriteProfileIds: ["partner-01"],
    myProfile: {
      id: "my-user-id",
      codename: "SANTI_BA",
      avatarUrl: "https://example.com/santi.jpg",
    },
    language: "es",
  });
  return {
    useVessel: mockCtx,
    useAuth: mockCtx,
    useSettings: mockCtx,
    useRadarMatrix: mockCtx,
    useChat: mockCtx,
    useLogistics: mockCtx,
    useDiary: mockCtx,
    useSafety: mockCtx,
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
    playError: vi.fn(),
  },
}));

describe("DuoLinkModal — Gestión del Modo Pareja / Dúo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDuoLinkState = {
      isLinked: false,
      partnerProfileId: undefined,
      partnerCodename: undefined,
      partnerAvatarUrl: undefined,
      jointTitle: undefined,
    };
  });

  it("renderiza la pantalla para vincular pareja cuando no está enlazado", () => {
    render(<DuoLinkModal />);

    expect(screen.getByText(/MODO DÚO \/\/ PAREJA VINCULADA/i)).toBeInTheDocument();
    expect(screen.getByText("DISPONIBLE")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ej: Santi & Nico/i)).toBeInTheDocument();
    expect(screen.getAllByText("NICO_BA").length).toBeGreaterThanOrEqual(1);
  });

  it("permite seleccionar una pareja de favoritos y vincular", () => {
    render(<DuoLinkModal />);

    const partnerBtns = screen.getAllByText("NICO_BA");
    fireEvent.click(partnerBtns[0]);

    const linkBtn = screen.getByRole("button", { name: /Vincular con @NICO_BA/i });
    expect(linkBtn).toBeEnabled();

    fireEvent.click(linkBtn);
    expect(mockLinkDuoPartner).toHaveBeenCalledWith(
      mockPartnerProfile,
      "SANTI_BA & NICO_BA"
    );
  });

  it("cuando está vinculado, muestra la ficha conjunta y el botón para desvincular", () => {
    mockDuoLinkState = {
      isLinked: true,
      partnerProfileId: "partner-01",
      partnerCodename: "NICO_BA",
      partnerAvatarUrl: "https://example.com/nico.jpg",
      jointTitle: "Santi & Nico // Pareja Abierta",
    };

    render(<DuoLinkModal />);

    expect(screen.getByText("ACTIVO")).toBeInTheDocument();
    expect(screen.getByText("Santi & Nico // Pareja Abierta")).toBeInTheDocument();

    const unlinkBtn = screen.getByRole("button", { name: /Desvincular Modo Dúo/i });
    expect(unlinkBtn).toBeInTheDocument();

    fireEvent.click(unlinkBtn);
    expect(mockUnlinkDuoPartner).toHaveBeenCalled();
  });
});

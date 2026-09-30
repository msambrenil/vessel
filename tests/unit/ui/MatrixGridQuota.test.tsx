import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileGrid } from "@/components/matrix/ProfileGrid";
import { ProfileCard } from "@/components/matrix/ProfileCard";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { MOCK_PROFILES } from "@/data/mockProfiles";
import { FREE_TIER_LIMITS } from "@/lib/business/freeTierLimits";

const mockOpenUnlimitedModal = vi.fn();
const mockOnSelectProfile = vi.fn();
const mockOnOpenChat = vi.fn();

let mockIsUnlimited = false;

vi.mock("@/context/VesselContext", () => ({
  useRadarMatrix: () => ({
    matrixTab: "people",
    setMatrixTab: vi.fn(),
    filteredProfiles: MOCK_PROFILES,
    filters: {
      bodyStates: ["open", "occupied", "dormant"],
      roles: [],
      minIntensity: 1,
      maxDistanceKm: 5,
      immediateHostOnly: false,
      selectedKinks: [],
      energyVibes: [],
      onlyAntiGhost: false,
      searchQuery: "",
      onlyVerified: false,
      onlyMutualKinks: false,
    },
    setFilters: vi.fn(),
    resetFilters: vi.fn(),
    setIsFilterDrawerOpen: vi.fn(),
    isOnTheClockFilterActive: false,
    setIsOnTheClockFilterActive: vi.fn(),
    setActiveView: vi.fn(),
    transmissions: {},
    transmitSignal: vi.fn(),
    getMutualKinkMatches: vi.fn().mockReturnValue([]),
    hasMutualPulse: vi.fn().mockReturnValue(false),
  }),
  useChat: () => ({
    getBoundaryForProfile: vi.fn().mockReturnValue(null),
  }),
  useDiary: () => ({
    getProfileDossier: vi.fn().mockReturnValue(null),
  }),
  useSettings: () => ({
    t: TRANSLATIONS.es,
    language: "es",
    isUnlimited: mockIsUnlimited,
    openUnlimitedModal: mockOpenUnlimitedModal,
  }),
  useAuth: () => ({
    currentUserUid: "test-uid",
    openAuthModal: vi.fn(),
  }),
  useLogistics: () => ({
    travelMode: { isActive: false, cityName: "", country: "", virtualCoords: { lat: 0, lng: 0 } },
    openTravelModal: vi.fn(),
    openNightlifeModal: vi.fn(),
    tacticalHotspots: [],
    nightlifeEvents: [],
  }),
  useSafety: () => ({
    travelMode: { isActive: false, cityName: "", country: "", virtualCoords: { lat: 0, lng: 0 } },
    tacticalHotspots: [],
    proposeTacticalHotspot: vi.fn(),
    rateTacticalHotspot: vi.fn(),
    reportTacticalHotspot: vi.fn(),
    nightlifeEvents: [],
  }),
  useVessel: () => ({
    tacticalHotspots: [],
    nightlifeEvents: [],
    travelMode: { isActive: false, cityName: "", country: "", virtualCoords: { lat: 0, lng: 0 } },
    openTravelModal: vi.fn(),
    myCoordinates: { lat: -34.5885, lng: -58.4376 },
    currentUserUid: "test-uid",
    language: "es",
    t: TRANSLATIONS.es,
    appMode: "test",
    openUnlimitedModal: mockOpenUnlimitedModal,
  }),
}));

describe("Cuota de Matriz Estilo Grindr (99 Perfiles + Card Promocional + 110 Mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsUnlimited = false;
  });

  describe("Dataset de Prueba (110 Perfiles)", () => {
    it("debe contener exactamente 110 perfiles en MOCK_PROFILES", () => {
      expect(MOCK_PROFILES.length).toBe(110);
    });

    it("todos los perfiles deben tener ID único, coordenadas y roles válidos", () => {
      const ids = new Set(MOCK_PROFILES.map((p) => p.id));
      expect(ids.size).toBe(110);

      for (const p of MOCK_PROFILES) {
        expect(p.id).toBeDefined();
        expect(p.codename).toBeDefined();
        expect(p.avatarUrl).toBeDefined();
        expect(p.role).toBeDefined();
        expect(p.coordinates).toBeDefined();
        expect(typeof p.coordinates.lat).toBe("number");
        expect(typeof p.coordinates.lng).toBe("number");
      }
    });

    it("la constante FREE_TIER_LIMITS.maxFreeProfilesInMatrix debe ser 99", () => {
      expect(FREE_TIER_LIMITS.maxFreeProfilesInMatrix).toBe(99);
    });
  });

  describe("ProfileGrid — Inserción de Card Promocional y Bloqueo en Free Tier", () => {
    it("en Plan Gratuito, debe renderizar la card promocional inmediatamente tras el perfil 99", () => {
      mockIsUnlimited = false;

      render(
        <ProfileGrid
          onSelectProfile={mockOnSelectProfile}
          onOpenChat={mockOnOpenChat}
        />
      );

      const promoCard = screen.getByTestId("matrix-unlimited-promo-card");
      expect(promoCard).toBeInTheDocument();
      expect(promoCard).toHaveTextContent(/DESBLOQUEÁ TODA LA MATRIZ/i);
      expect(promoCard).toHaveTextContent(/99 personas/i);

      // El botón de la card promocional debe abrir el modal de membresía
      const unlockBtn = screen.getByTestId("matrix-promo-unlock-btn");
      fireEvent.click(unlockBtn);
      expect(mockOpenUnlimitedModal).toHaveBeenCalled();
    });

    it("en Plan Unlimited, NO debe renderizar la card promocional de venta", () => {
      mockIsUnlimited = true;

      render(
        <ProfileGrid
          onSelectProfile={mockOnSelectProfile}
          onOpenChat={mockOnOpenChat}
        />
      );

      expect(screen.queryByTestId("matrix-unlimited-promo-card")).toBeNull();
    });
  });

  describe("ProfileCard — Comportamiento con isLockedByGridLimit", () => {
    it("si isLockedByGridLimit es false, el tap en la tarjeta abre el perfil normalmente", () => {
      const profile = MOCK_PROFILES[0]; // perfil dentro de los 99
      render(
        <ProfileCard
          profile={profile}
          onSelect={mockOnSelectProfile}
          onOpenChat={mockOnOpenChat}
          isLockedByGridLimit={false}
        />
      );

      const card = screen.getByTestId(`profile-card-${profile.id}`);
      fireEvent.click(card);

      expect(mockOnSelectProfile).toHaveBeenCalledWith(profile);
      expect(mockOpenUnlimitedModal).not.toHaveBeenCalled();
      expect(screen.queryByTestId("quota-locked-badge")).toBeNull();
    });

    it("si isLockedByGridLimit es true en Free Tier, muestra badge/overlay y el click abre el modal de membresía en vez del perfil", () => {
      const profile = MOCK_PROFILES[100]; // perfil 101 (fuera de cuota)
      render(
        <ProfileCard
          profile={profile}
          onSelect={mockOnSelectProfile}
          onOpenChat={mockOnOpenChat}
          isLockedByGridLimit={true}
        />
      );

      // Debe mostrar el badge y overlay de 99+
      expect(screen.getByTestId("quota-locked-badge")).toBeInTheDocument();
      expect(screen.getByTestId("quota-locked-overlay")).toBeInTheDocument();

      // Click en la tarjeta
      const card = screen.getByTestId(`profile-card-${profile.id}`);
      fireEvent.click(card);

      // NO debe abrir el perfil
      expect(mockOnSelectProfile).not.toHaveBeenCalled();
      // DEBE invocar el modal de Unlimited
      expect(mockOpenUnlimitedModal).toHaveBeenCalled();
    });

    it("si isLockedByGridLimit es true pero el usuario es Unlimited, la tarjeta no se bloquea", () => {
      mockIsUnlimited = true;
      const profile = MOCK_PROFILES[100];

      render(
        <ProfileCard
          profile={profile}
          onSelect={mockOnSelectProfile}
          onOpenChat={mockOnOpenChat}
          isLockedByGridLimit={true}
        />
      );

      expect(screen.queryByTestId("quota-locked-badge")).toBeNull();
      expect(screen.queryByTestId("quota-locked-overlay")).toBeNull();

      const card = screen.getByTestId(`profile-card-${profile.id}`);
      fireEvent.click(card);

      expect(mockOnSelectProfile).toHaveBeenCalledWith(profile);
      expect(mockOpenUnlimitedModal).not.toHaveBeenCalled();
    });
  });
});

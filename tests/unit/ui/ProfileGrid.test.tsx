import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileGrid } from "@/components/matrix/ProfileGrid";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { MOCK_PROFILES } from "@/data/mockProfiles";

const mockSetMatrixTab = vi.fn();
const mockOpenTravelModal = vi.fn();
const mockOpenUnlimitedModal = vi.fn();
const mockOnSelectProfile = vi.fn();
const mockOnOpenChat = vi.fn();

let mockMatrixTab: "people" | "places" = "people";
let mockTravelMode = {
  isActive: false,
  cityName: "Berlín",
  country: "Alemania",
  virtualCoords: { lat: 52.52, lng: 13.405 },
};

vi.mock("@/context/VesselContext", () => ({
  useRadarMatrix: () => ({
    matrixTab: mockMatrixTab,
    setMatrixTab: (tab: "people" | "places") => {
      mockMatrixTab = tab;
      mockSetMatrixTab(tab);
    },
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
    favoriteProfileIds: ["fav-01", "fav-02"],
    isFavoriteProfile: (id: string) => ["fav-01", "fav-02"].includes(id),
    toggleFavoriteProfile: vi.fn(),
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
    isUnlimited: false,
    openUnlimitedModal: mockOpenUnlimitedModal,
  }),
  useAuth: () => ({
    currentUserUid: "test-uid",
    openAuthModal: vi.fn(),
  }),
  useLogistics: () => ({
    travelMode: mockTravelMode,
    openTravelModal: mockOpenTravelModal,
    openNightlifeModal: vi.fn(),
    tacticalHotspots: [],
    nightlifeEvents: [],
  }),
  useSafety: () => ({
    travelMode: mockTravelMode,
    tacticalHotspots: [],
    proposeTacticalHotspot: vi.fn(),
    rateTacticalHotspot: vi.fn(),
    reportTacticalHotspot: vi.fn(),
    nightlifeEvents: [],
  }),
  useVessel: () => ({
    tacticalHotspots: [],
    checkInHotspot: vi.fn(),
    checkOutHotspot: vi.fn(),
    proposeHotspot: vi.fn(),
    confirmHotspot: vi.fn(),
    rateHotspot: vi.fn(),
    reportHotspot: vi.fn(),
    nightlifeEvents: [],
    toggleEventRsvp: vi.fn(),
    travelMode: mockTravelMode,
    openTravelModal: mockOpenTravelModal,
    myCoordinates: { lat: -34.5885, lng: -58.4376 },
    currentUserUid: "test-uid",
    language: "es",
    t: TRANSLATIONS.es,
  }),
}));

describe("ProfileGrid — División en Personas/Lugares y Modo Viajero", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatrixTab = "people";
    mockTravelMode = {
      isActive: false,
      cityName: "Berlín",
      country: "Alemania",
      virtualCoords: { lat: 52.52, lng: 13.405 },
    };
  });

  it("no renderiza el switcher segmentado redundante de Personas vs Lugares (ahora en IntentHubSelector)", () => {
    render(
      <ProfileGrid
        onSelectProfile={mockOnSelectProfile}
        onOpenChat={mockOnOpenChat}
      />
    );

    expect(screen.queryByTestId("matrix-tab-people")).not.toBeInTheDocument();
    expect(screen.queryByTestId("matrix-tab-places")).not.toBeInTheDocument();
  });

  it("en pestaña Personas, muestra la barra de búsqueda de perfiles y el botón de Modo Viajero", () => {
    render(
      <ProfileGrid
        onSelectProfile={mockOnSelectProfile}
        onOpenChat={mockOnOpenChat}
      />
    );

    expect(screen.getByTestId("people-search-input")).toBeInTheDocument();

    const travelBtn = screen.getByTestId("people-travel-mode-button");
    expect(travelBtn).toBeInTheDocument();

    fireEvent.click(travelBtn);
    expect(mockOpenTravelModal).toHaveBeenCalled();
  });

  it("en pestaña Lugares, muestra búsqueda de lugares y botón de Modo Viajero de lugares", () => {
    mockMatrixTab = "places";

    render(
      <ProfileGrid
        onSelectProfile={mockOnSelectProfile}
        onOpenChat={mockOnOpenChat}
      />
    );

    expect(screen.getByTestId("places-search-input")).toBeInTheDocument();
    expect(screen.getByTestId("propose-place-header-button")).toBeInTheDocument();

    const travelBtn = screen.getByTestId("places-travel-mode-button");
    expect(travelBtn).toBeInTheDocument();

    fireEvent.click(travelBtn);
    expect(mockOpenTravelModal).toHaveBeenCalled();
  });

  it("muestra el indicador de ciudad activa en Modo Viajero cuando está activo", () => {
    mockTravelMode = {
      isActive: true,
      cityName: "Tokio",
      country: "Japón",
      virtualCoords: { lat: 35.6762, lng: 139.6503 },
    };

    render(
      <ProfileGrid
        onSelectProfile={mockOnSelectProfile}
        onOpenChat={mockOnOpenChat}
      />
    );

    const travelBtn = screen.getByTestId("people-travel-mode-button");
    expect(travelBtn).toHaveTextContent("Tokio");
  });

  it("renderiza la píldora de filtro Favoritos con el contador de favoritos en la Matrix", () => {
    render(
      <ProfileGrid
        onSelectProfile={mockOnSelectProfile}
        onOpenChat={mockOnOpenChat}
      />
    );

    const favPill = screen.getByTestId("filter-pill-favorites");
    expect(favPill).toBeInTheDocument();
    expect(favPill).toHaveTextContent("Favoritos");
    expect(favPill).toHaveTextContent("2");
  });

  it("utiliza la cuadrícula táctica de 2 columnas en mobile, 3 en tablet y 4 en desktop", () => {
    const { container } = render(
      <ProfileGrid
        onSelectProfile={mockOnSelectProfile}
        onOpenChat={mockOnOpenChat}
      />
    );

    const gridContainer = container.querySelector(".grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-4");
    expect(gridContainer).toBeInTheDocument();
  });
});

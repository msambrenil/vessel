import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RadarBottomCommandBar } from "@/components/matrix/RadarBottomCommandBar";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockSetFilters = vi.fn();
const mockResetFilters = vi.fn();
const mockSetIsFilterDrawerOpen = vi.fn();
const mockOpenTravelModal = vi.fn();
const mockOnSortByChange = vi.fn();
const mockOnProposePlace = vi.fn();

let mockMatrixTab: "people" | "places" = "people";

vi.mock("@/context/VesselContext", () => ({
  useRadarMatrix: () => ({
    matrixTab: mockMatrixTab,
    setMatrixTab: vi.fn(),
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
      onlyFavorites: false,
    },
    setFilters: mockSetFilters,
    resetFilters: mockResetFilters,
    setIsFilterDrawerOpen: mockSetIsFilterDrawerOpen,
    isOnTheClockFilterActive: false,
    setIsOnTheClockFilterActive: vi.fn(),
    favoriteProfileIds: ["fav-01", "fav-02"],
    operatingIntent: "now",
    intentClusters: [],
  }),
  useSettings: () => ({
    language: "es",
    t: TRANSLATIONS.es,
  }),
  useLogistics: () => ({
    travelMode: {
      isActive: false,
      cityName: "Berlín",
      country: "Alemania",
      virtualCoords: null,
    },
    openTravelModal: mockOpenTravelModal,
  }),
  useAuth: () => ({
    myProfile: {
      id: "test-user",
      codename: "Test User",
      bodyState: "open",
    },
  }),
}));

describe("RadarBottomCommandBar — Barra Táctica Inferior Deslizable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatrixTab = "people";
  });

  it("en pestaña 'people', renderiza los controles de búsqueda de personas, modo viajero y preferencias", () => {
    render(<RadarBottomCommandBar />);

    expect(screen.getByTestId("people-search-input")).toBeInTheDocument();
    expect(screen.getByTestId("people-travel-mode-button")).toBeInTheDocument();
    expect(screen.getByTestId("filter-pill-favorites")).toBeInTheDocument();
  });

  it("al tocar el botón de Modo Viajero en pestaña personas, abre el modal de viaje", () => {
    render(<RadarBottomCommandBar />);

    const travelBtn = screen.getByTestId("people-travel-mode-button");
    fireEvent.click(travelBtn);
    expect(mockOpenTravelModal).toHaveBeenCalled();
  });

  it("permite desplegar el buscador de morbos y fetiches en el bloque colapsable", () => {
    render(<RadarBottomCommandBar />);

    const kinkHeader = screen.getByText(/5\. Fetiches y morbos/i);
    fireEvent.click(kinkHeader);

    expect(screen.getByTestId("kink-search-bottom-bar")).toBeInTheDocument();
  });

  it("en pestaña 'places', renderiza búsqueda de lugares, botón de viaje y proponer lugar", () => {
    mockMatrixTab = "places";

    render(<RadarBottomCommandBar onProposePlace={mockOnProposePlace} />);

    expect(screen.getByTestId("places-search-input")).toBeInTheDocument();
    expect(screen.getByTestId("places-travel-mode-button")).toBeInTheDocument();

    const proposeBtn = screen.getByTestId("propose-place-header-button");
    expect(proposeBtn).toBeInTheDocument();

    fireEvent.click(proposeBtn);
    expect(mockOnProposePlace).toHaveBeenCalled();
  });

  it("invoca onSortByChange al seleccionar un criterio de ordenamiento", () => {
    render(<RadarBottomCommandBar onSortByChange={mockOnSortByChange} />);

    const onlineBtn = screen.getByTestId("sort-option-recent");
    fireEvent.click(onlineBtn);
    expect(mockOnSortByChange).toHaveBeenCalledWith("recent");
  });

  it("renderiza los bloques estructurados de filtros sin scroll horizontal en orden y preferencias", () => {
    render(<RadarBottomCommandBar />);

    // Verificar presencia de los bloques lógicos Bento organizados por prioridad
    expect(screen.getByText(/1\. Rol y posición/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Distancia y viaje/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Preferencias y logística/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Ordenar perfiles por/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Fetiches y morbos/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Onda y sustancias/i)).toBeInTheDocument();

    // Filtros de logística rápida presentes
    expect(screen.getByText(/Con lugar ya/i)).toBeInTheDocument();
    expect(screen.getByText(/Verificados 3D/i)).toBeInTheDocument();
    expect(screen.getByText(/Cero plantones/i)).toBeInTheDocument();
    expect(screen.getByText(/Deseos mutuos/i)).toBeInTheDocument();

    // Botón de aplicar filtros en footer
    expect(screen.getByRole("button", { name: /Aplicar Filtros/i })).toBeInTheDocument();
  });

  it("permite alternar el filtro de Con lugar ya", () => {
    render(<RadarBottomCommandBar />);

    const hostBtn = screen.getByText(/Con lugar ya/i).closest("button");
    expect(hostBtn).not.toBeNull();
    fireEvent.click(hostBtn!);

    expect(mockSetFilters).toHaveBeenCalled();
  });

  it("al presionar 'Aplicar Filtros' en el footer, cierra el drawer llamando a setIsFilterDrawerOpen(false)", () => {
    render(<RadarBottomCommandBar />);

    const applyBtn = screen.getByRole("button", { name: /Aplicar Filtros/i });
    fireEvent.click(applyBtn);

    expect(mockSetIsFilterDrawerOpen).toHaveBeenCalledWith(false);
  });
});


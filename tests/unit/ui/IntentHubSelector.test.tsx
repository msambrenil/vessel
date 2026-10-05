import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntentHubSelector } from "@/components/matrix/IntentHubSelector";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockSetOperatingIntent = vi.fn();
const mockSetMatrixTab = vi.fn();
const mockStartOnTheClock = vi.fn();
const mockStopOnTheClock = vi.fn();

let mockOperatingIntent: "now" | "nightlife" | "kink" | "stealth" = "now";
let mockMatrixTab: "people" | "places" = "people";
let mockOnTheClock: {
  isActive: boolean;
  durationMinutes: number;
  startedAt: string | null;
  expiresAt: string | null;
} = {
  isActive: false,
  durationMinutes: 60,
  startedAt: null,
  expiresAt: null,
};

vi.mock("@/context/VesselContext", () => ({
  useRadarMatrix: () => ({
    operatingIntent: mockOperatingIntent,
    setOperatingIntent: (intent: "now" | "nightlife" | "kink" | "stealth") => {
      mockOperatingIntent = intent;
      mockSetOperatingIntent(intent);
    },
    matrixTab: mockMatrixTab,
    setMatrixTab: (tab: "people" | "places") => {
      mockMatrixTab = tab;
      mockSetMatrixTab(tab);
    },
    myOnTheClock: mockOnTheClock,
    startOnTheClock: mockStartOnTheClock,
    stopOnTheClock: mockStopOnTheClock,
    intentClusters: [],
  }),
  useSettings: () => ({
    language: "es",
    t: TRANSLATIONS.es,
  }),
  useAuth: () => ({
    myProfile: {
      id: "test-user",
      codename: "Test User",
      bodyState: "open",
    },
  }),
}));

describe("IntentHubSelector — Selector Táctico de Sintonías", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOperatingIntent = "now";
    mockMatrixTab = "people";
    mockOnTheClock = {
      isActive: false,
      durationMinutes: 60,
      startedAt: null,
      expiresAt: null,
    };
  });

  it("renderiza los 4 modos ordenados: Pinta ya, Morbos y Fetiches, Discreto, y Boliches y Lugares", () => {
    render(<IntentHubSelector />);

    expect(screen.getByTestId("intent-tab-now")).toBeInTheDocument();
    expect(screen.getByTestId("intent-tab-kink")).toBeInTheDocument();
    expect(screen.getByTestId("intent-tab-stealth")).toBeInTheDocument();
    expect(screen.getByTestId("intent-tab-nightlife")).toBeInTheDocument();

    expect(screen.getByTitle(TRANSLATIONS.es.intents.now)).toBeInTheDocument();
    expect(screen.getByTitle(TRANSLATIONS.es.intents.kink)).toBeInTheDocument();
    expect(screen.getByTitle(TRANSLATIONS.es.intents.stealth)).toBeInTheDocument();
    expect(screen.getByTitle(TRANSLATIONS.es.intents.nightlife)).toBeInTheDocument();
  });

  it("al tocar Boliches y Lugares, invoca setMatrixTab('places') y setOperatingIntent('nightlife')", () => {
    render(<IntentHubSelector />);

    const nightlifeTab = screen.getByTestId("intent-tab-nightlife");
    fireEvent.click(nightlifeTab);

    expect(mockSetMatrixTab).toHaveBeenCalledWith("places");
    expect(mockSetOperatingIntent).toHaveBeenCalledWith("nightlife");
  });

  it("al tocar pestaña kink o stealth, invoca setMatrixTab('people') con los modos correspondientes", () => {
    render(<IntentHubSelector />);

    const kinkTab = screen.getByTestId("intent-tab-kink");
    fireEvent.click(kinkTab);
    expect(mockSetMatrixTab).toHaveBeenCalledWith("people");
    expect(mockSetOperatingIntent).toHaveBeenCalledWith("kink");

    const stealthTab = screen.getByTestId("intent-tab-stealth");
    fireEvent.click(stealthTab);
    expect(mockSetMatrixTab).toHaveBeenCalledWith("people");
    expect(mockSetOperatingIntent).toHaveBeenCalledWith("stealth");
  });

  it("al tocar Pinta ya, invoca setMatrixTab('people') y setOperatingIntent('now')", () => {
    mockMatrixTab = "places";
    render(<IntentHubSelector />);

    const nowTab = screen.getByTestId("intent-tab-now");
    fireEvent.click(nowTab);
    expect(mockSetMatrixTab).toHaveBeenCalledWith("people");
    expect(mockSetOperatingIntent).toHaveBeenCalledWith("now");
  });
});

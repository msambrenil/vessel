import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntentHubSelector } from "@/components/matrix/IntentHubSelector";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockSetOperatingIntent = vi.fn();
const mockStartOnTheClock = vi.fn();
const mockStopOnTheClock = vi.fn();

let mockOperatingIntent: "now" | "nightlife" | "kink" | "stealth" = "now";
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
    mockOnTheClock = {
      isActive: false,
      durationMinutes: 60,
      startedAt: null,
      expiresAt: null,
    };
  });

  it("renderiza los 4 modos de sintonía operativa (YA, Noche, Kink, Sigilo)", () => {
    render(<IntentHubSelector />);

    expect(screen.getByTitle("Ahora")).toBeInTheDocument();
    expect(screen.getByTitle("Noche")).toBeInTheDocument();
    expect(screen.getByTitle("Kink & Morbos")).toBeInTheDocument();
    expect(screen.getByTitle("Modo Discreto")).toBeInTheDocument();
  });

  it("al tocar una pestaña de modo, invoca setOperatingIntent", () => {
    render(<IntentHubSelector />);

    const nightlifeTab = screen.getByTitle("Noche");
    fireEvent.click(nightlifeTab);

    expect(mockSetOperatingIntent).toHaveBeenCalledWith("nightlife");
  });

  it("permite activar el disparador Listo YA (On The Clock)", () => {
    render(<IntentHubSelector />);

    const clockBtn = screen.getByTitle("Activar disponibilidad inmediata (1 hora)");
    fireEvent.click(clockBtn);

    expect(mockStartOnTheClock).toHaveBeenCalledWith(60, "Disponible ahora");
  });

  it("permite desactivar Listo YA cuando está activo", () => {
    mockOnTheClock = {
      isActive: true,
      durationMinutes: 60,
      startedAt: "2026-10-04T12:00:00Z",
      expiresAt: "2026-10-04T13:00:00Z",
    };

    render(<IntentHubSelector />);

    const clockBtn = screen.getByTitle("Desactivar Listo YA");
    fireEvent.click(clockBtn);

    expect(mockStopOnTheClock).toHaveBeenCalled();
  });
});

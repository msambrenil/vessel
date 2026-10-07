import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BetaFeedbackMenuSection } from "@/components/beta/BetaFeedbackFab";

const mockSetSimulatedLocationActive = vi.fn();

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    language: "es",
    appMode: "mock",
    isSimulatedLocationActive: true,
    setSimulatedLocationActive: mockSetSimulatedLocationActive,
    myCoordinates: { lat: -33.13, lng: -64.34 },
    isLocating: false,
  }),
}));

vi.mock("@/lib/storage/localStorageSync", () => ({
  isLocalEnvironment: () => true,
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playSubBass: vi.fn(),
    playPulse: vi.fn(),
  },
}));

describe("BetaFeedbackMenuSection — Laboratorio Táctico de Beta Tester en Menú Superior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza la sección integrada con la píldora de Río Cuarto y título del lab", () => {
    render(<BetaFeedbackMenuSection />);

    expect(screen.getByTestId("beta-tester-lab-section")).toBeInTheDocument();
    expect(screen.getByText("BETA TESTER LAB")).toBeInTheDocument();
    expect(screen.getByTestId("beta-toggle-location-pill")).toBeInTheDocument();
    expect(screen.getByText("RÍO CUARTO")).toBeInTheDocument();
    expect(screen.getByText(/Saavedra 620/i)).toBeInTheDocument();
  });

  it("al hacer click en la píldora alterna la ubicación simulada", async () => {
    render(<BetaFeedbackMenuSection />);

    const pill = screen.getByTestId("beta-toggle-location-pill");
    await React.act(async () => {
      fireEvent.click(pill);
    });

    expect(mockSetSimulatedLocationActive).toHaveBeenCalledWith(false);
  });

  it("renderiza botones para reportar bugs y sensores de diagnóstico", () => {
    const mockClose = vi.fn();
    render(<BetaFeedbackMenuSection onCloseMenu={mockClose} />);

    const bugBtn = screen.getByRole("button", { name: /reportar bug/i });
    expect(bugBtn).toBeInTheDocument();
    fireEvent.click(bugBtn);
    expect(mockClose).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TravelModeModal } from "@/components/radar/TravelModeModal";

const mockCloseTravelModal = vi.fn();
const mockSetTravelModeCity = vi.fn();
const mockResetTravelMode = vi.fn();

vi.mock("@/context/VesselContext", () => {
  const ctx = () => ({
    isTravelModalOpen: true,
    closeTravelModal: mockCloseTravelModal,
    travelMode: {
      isActive: false,
      cityName: null,
      country: null,
      coordinates: null,
    },
    setTravelModeCity: mockSetTravelModeCity,
    resetTravelMode: mockResetTravelMode,
    language: "es",
    t: {
      tacticalSuite: {
        unlimited: {
          travelMode: "Modo Viajero Táctico",
        },
      },
    },
  });
  return {
    useVessel: ctx,
    useLogistics: ctx,
    useSettings: ctx,
    useAuth: ctx,
    useRadarMatrix: ctx,
    useChat: ctx,
    useDiary: ctx,
    useSafety: ctx,
  };
});

describe("TravelModeModal — Modo Viajero y Destinos Argentinos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el modal con el título traducido y destinos tácticos de Argentina", () => {
    render(<TravelModeModal />);

    expect(screen.getByText("Modo Viajero Táctico")).toBeInTheDocument();
    expect(screen.getByText("Buenos Aires")).toBeInTheDocument();
    expect(screen.getByText("Córdoba")).toBeInTheDocument();
    expect(screen.getByText("Rosario")).toBeInTheDocument();
    expect(screen.getByText("Mendoza")).toBeInTheDocument();
    expect(screen.getByText("Mar del Plata")).toBeInTheDocument();
  });

  it("al hacer clic en una ciudad argentina como Mendoza, despacha setTravelModeCity con coordenadas", () => {
    render(<TravelModeModal />);

    const mendozaBtn = screen.getByRole("button", { name: /Mendoza/i });
    fireEvent.click(mendozaBtn);

    expect(mockSetTravelModeCity).toHaveBeenCalledWith(
      "Mendoza",
      "Argentina",
      expect.objectContaining({ lat: -32.8895, lng: -68.8458 })
    );
  });

  it("el pie de ayuda está 100% en español sin anglicismos de Travel Mode", () => {
    render(<TravelModeModal />);

    expect(
      screen.getByText(/Al activar el Modo Viajero, el radar de proximidad y la grilla cargan los perfiles locales/i)
    ).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatusToggle } from "@/components/matrix/StatusToggle";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockStartOnTheClock = vi.fn();
const mockStopOnTheClock = vi.fn();
const mockSetMyBodyState = vi.fn();

let mockOnTheClockState = {
  isActive: false,
  expiresAt: null as string | null,
  durationMinutes: 60,
  startedAt: undefined as string | undefined,
};

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    myBodyState: "open",
    setMyBodyState: mockSetMyBodyState,
    myOnTheClock: mockOnTheClockState,
    startOnTheClock: mockStartOnTheClock,
    stopOnTheClock: mockStopOnTheClock,
    t: TRANSLATIONS.es,
    language: "es",
  }),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playSubBass: vi.fn(),
    playStateSwitch: vi.fn(),
    playPulse: vi.fn(),
  },
}));

describe("StatusToggle — Botón Listo YA con Reloj Fucsia Neón Dinámico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnTheClockState = {
      isActive: false,
      expiresAt: null,
      durationMinutes: 60,
      startedAt: undefined,
    };
  });

  it("renderiza el botón Listo YA en estado inactivo con borde fucsia sutil y texto correcto", () => {
    render(<StatusToggle />);

    const readyBtn = screen.getByTestId("status-toggle-ready-now-button");
    expect(readyBtn).toBeInTheDocument();
    expect(readyBtn).toHaveAttribute("aria-pressed", "false");
    expect(readyBtn).toHaveTextContent("LISTO YA");

    // En reposo no debe haber anillo de reloj activo
    expect(
      screen.queryByTestId("on-the-clock-fuchsia-clock-border")
    ).toBeNull();
  });

  it("al hacer click en reposo, dispara startOnTheClock con 60 minutos", () => {
    render(<StatusToggle />);

    const readyBtn = screen.getByTestId("status-toggle-ready-now-button");
    fireEvent.click(readyBtn);

    expect(mockStartOnTheClock).toHaveBeenCalledWith(60);
  });

  it("cuando está activo recién iniciado (60 min), renderiza el anillo completo de reloj en fucsia neón", () => {
    const now = Date.now();
    mockOnTheClockState = {
      isActive: true,
      expiresAt: new Date(now + 60 * 60 * 1000).toISOString(),
      durationMinutes: 60,
      startedAt: new Date(now).toISOString(),
    };

    render(<StatusToggle />);

    const readyBtn = screen.getByTestId("status-toggle-ready-now-button");
    expect(readyBtn).toHaveAttribute("aria-pressed", "true");
    expect(readyBtn).toHaveTextContent(/LISTO YA · 60m/);

    const clockRing = screen.getByTestId("on-the-clock-fuchsia-clock-border");
    expect(clockRing).toBeInTheDocument();
    // Gradiente conic inicial completo en fucsia neón
    expect(clockRing.style.background).toContain("conic-gradient");
    expect(clockRing.style.background).toContain("#ff007f");
    expect(clockRing.style.background).toContain("#ff2a85");
  });

  it("cuando han transcurrido 30 minutos (quedan 30 min), el anillo calcula el ángulo a 180° y muestra 30m", () => {
    const now = Date.now();
    mockOnTheClockState = {
      isActive: true,
      expiresAt: new Date(now + 30 * 60 * 1000).toISOString(),
      durationMinutes: 60,
      startedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    };

    render(<StatusToggle />);

    const readyBtn = screen.getByTestId("status-toggle-ready-now-button");
    expect(readyBtn).toHaveTextContent(/LISTO YA · 30m/);

    const clockRing = screen.getByTestId("on-the-clock-fuchsia-clock-border");
    expect(clockRing).toBeInTheDocument();
    // A los 30 min (mitad de reloj), el sector 0 a 180deg está apagado y el resto fucsia
    expect(clockRing.style.background).toContain("180deg");
    expect(clockRing.style.background).toContain("#ffffff");
  });

  it("al hacer click cuando está activo, invoca stopOnTheClock", () => {
    mockOnTheClockState = {
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      durationMinutes: 60,
      startedAt: new Date().toISOString(),
    };

    render(<StatusToggle />);

    const readyBtn = screen.getByTestId("status-toggle-ready-now-button");
    fireEvent.click(readyBtn);

    expect(mockStopOnTheClock).toHaveBeenCalled();
  });

  it("renderiza la cabecera 'MI ESTADO' y los 3 estados claros: ACTIVO, OCUPADO, INCÓGNITO", () => {
    render(<StatusToggle />);

    // Cabecera táctica sin confusión con "disponibilidad"
    expect(screen.getByText("MI ESTADO")).toBeInTheDocument();
    expect(screen.getByText(/EMITIENDO:/)).toBeInTheDocument();

    // Segmented control y píldora de emisión: ACTIVO (aparece en ambos), OCUPADO, INCÓGNITO
    expect(screen.getAllByText("ACTIVO").length).toBe(2);
    expect(screen.getByText("Visible en radar")).toBeInTheDocument();

    expect(screen.getByText("OCUPADO")).toBeInTheDocument();
    expect(screen.getByText("No disponible")).toBeInTheDocument();

    expect(screen.getByText("INCÓGNITO")).toBeInTheDocument();
    expect(screen.getByText("De incógnito")).toBeInTheDocument();
  });

  it("al seleccionar OCUPADO, dispara setMyBodyState con 'occupied'", () => {
    render(<StatusToggle />);

    const occupiedBtn = screen.getByRole("radio", { name: /OCUPADO/i });
    fireEvent.click(occupiedBtn);

    expect(mockSetMyBodyState).toHaveBeenCalledWith("occupied");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RendezvousSheet } from "@/components/chat/RendezvousSheet";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import type { VesselProfile } from "@/types/vessel";

const mockSendPreFlightChecklist = vi.fn();
const mockSendSecureWaypoint = vi.fn();
const mockSendRendezvousPin = vi.fn();
const mockStartEnRoute = vi.fn();

const mockTargetProfile = {
  id: "target-42",
  codename: "NEON_VIPER",
  avatarUrl: "https://example.com/avatar.jpg",
  age: 28,
  role: "Versatile" as const,
  bodyState: "open" as const,
  mobility: "Tengo depto / lugar" as const,
  exitProtocol: "fast_encounter" as const,
  respectScore: 98,
  hosting: "Tengo depto / lugar" as const,
} as unknown as VesselProfile;

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    sendPreFlightChecklist: mockSendPreFlightChecklist,
    sendSecureWaypoint: mockSendSecureWaypoint,
    sendRendezvousPin: mockSendRendezvousPin,
    startEnRoute: mockStartEnRoute,
    language: "es",
    t: TRANSLATIONS.es,
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
    playSignalSent: vi.fn(),
  },
}));

describe("RendezvousSheet — Asistente Unificado de Cita (Fase 2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no debe renderizar nada si isOpen es false", () => {
    const { container } = render(
      <RendezvousSheet
        isOpen={false}
        onClose={vi.fn()}
        targetProfile={mockTargetProfile}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe renderizar el asistente y el paso 1 (Sintonía) cuando isOpen es true", () => {
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={vi.fn()}
        targetProfile={mockTargetProfile}
      />
    );

    expect(screen.getByText("ASISTENTE DE ENCUENTRO")).toBeInTheDocument();
    expect(screen.getByText(/NEON_VIPER/i)).toBeInTheDocument();
    expect(screen.getByText("Ritmo y Duración del Encuentro")).toBeInTheDocument();
    expect(screen.getByText("Solo Oral")).toBeInTheDocument();
    expect(screen.getByText("Penetración")).toBeInTheDocument();
  });

  it("debe renderizar todos los módulos Bento en pantalla única (Dónde, Cuándo, Puntos Claros, Telemetría)", () => {
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={vi.fn()}
        targetProfile={mockTargetProfile}
      />
    );

    // Módulo 1: Lugar & Logística
    expect(screen.getByText(/1\. ¿Quién Pone el Lugar o Punto de Encuentro\?/i)).toBeInTheDocument();
    expect(screen.getByText("Recibo en mi lugar")).toBeInTheDocument();
    expect(screen.getByText(/PIN de Encuentro/i)).toBeInTheDocument();

    // Módulo 2: Fecha & Hora
    expect(screen.getByText(/2\. Fecha & Hora del Encuentro/i)).toBeInTheDocument();
    expect(screen.getByText(/Ahora \(\+30m\)/i)).toBeInTheDocument();

    // Módulo 3: Puntos Claros
    expect(screen.getByText(/3\. Puntos Claros \(Ritmo y Cuidados\)/i)).toBeInTheDocument();
    expect(screen.getByText("Ritmo y Duración del Encuentro")).toBeInTheDocument();
    expect(screen.getByText("Solo Oral")).toBeInTheDocument();

    // Módulo 4: Telemetría En Camino
    expect(screen.getByText(/4\. Telemetría "Voy en Camino"/i)).toBeInTheDocument();
  });

  it("debe ejecutar las acciones atómicas y cerrar el sheet al confirmar en un solo click", async () => {
    const handleClose = vi.fn();
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={handleClose}
        targetProfile={mockTargetProfile}
      />
    );

    // Confirmar directamente en la vista Bento (sin pasos intermedios)
    const confirmBtn = screen.getByRole("button", { name: /Confirmar y Blindar Encuentro/i });
    fireEvent.click(confirmBtn);

    // Comprobar despachos
    expect(mockSendPreFlightChecklist).toHaveBeenCalledTimes(1);
    expect(mockSendPreFlightChecklist).toHaveBeenCalledWith("target-42", expect.any(Object));

    expect(mockSendSecureWaypoint).toHaveBeenCalledTimes(1);
    expect(mockSendSecureWaypoint).toHaveBeenCalledWith(
      "target-42",
      expect.any(String),
      expect.any(String),
      undefined
    );

    // Cierre asíncrono
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it("debe invocar onClose al hacer click en el botón cerrar (X)", () => {
    const handleClose = vi.fn();
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={handleClose}
        targetProfile={mockTargetProfile}
      />
    );

    const closeBtn = screen.getByLabelText("Cerrar asistente");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("debe permitir pactar en 1 toque con 'Pactar Express' sin recorrer los 3 pasos", async () => {
    const handleClose = vi.fn();
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={handleClose}
        targetProfile={mockTargetProfile}
      />
    );

    expect(screen.getByText(/Pactar Express \(1 Toque\)/i)).toBeInTheDocument();
    const expressBtn = screen.getByRole("button", { name: /Mandar Ya/i });
    fireEvent.click(expressBtn);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
    expect(mockSendRendezvousPin).toHaveBeenCalledTimes(1);
  });

  it("debe activar En Route al confirmar si la telemetría está activa", async () => {
    const handleClose = vi.fn();
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={handleClose}
        targetProfile={mockTargetProfile}
      />
    );

    // Activar telemetría En Camino
    const toggleTelemetryBtn = screen.getByRole("button", { name: /APAGADO/i });
    fireEvent.click(toggleTelemetryBtn);

    // Confirmar
    const confirmBtn = screen.getByRole("button", { name: /Confirmar y Blindar Encuentro/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    expect(mockStartEnRoute).toHaveBeenCalledWith(
      expect.objectContaining({ id: "target-42", codename: "NEON_VIPER" }),
      20
    );
  });
});

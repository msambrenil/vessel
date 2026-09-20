import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RendezvousSheet } from "@/components/chat/RendezvousSheet";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import type { VesselProfile } from "@/types/vessel";

const mockSendPreFlightChecklist = vi.fn();
const mockSendSecureWaypoint = vi.fn();
const mockSendRendezvousPin = vi.fn();
const mockStartSafetyBeacon = vi.fn();
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

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    sendPreFlightChecklist: mockSendPreFlightChecklist,
    sendSecureWaypoint: mockSendSecureWaypoint,
    sendRendezvousPin: mockSendRendezvousPin,
    startSafetyBeacon: mockStartSafetyBeacon,
    startEnRoute: mockStartEnRoute,
    language: "es",
    t: TRANSLATIONS.es,
  }),
}));

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

  it("debe avanzar a través de los pasos 1 -> 2 -> 3 correctamente", () => {
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={vi.fn()}
        targetProfile={mockTargetProfile}
      />
    );

    // En paso 1, hacer click en Continuar
    const nextBtn1 = screen.getByRole("button", { name: /Continuar/i });
    fireEvent.click(nextBtn1);

    // Debe mostrar paso 2: Lugar & Logística
    expect(screen.getByText("¿Quién Pone el Lugar o Punto de Encuentro?")).toBeInTheDocument();
    expect(screen.getByText("Recibo en mi lugar")).toBeInTheDocument();
    expect(screen.getByText("Rendezvous PIN")).toBeInTheDocument();

    // En paso 2, hacer click en Continuar
    const nextBtn2 = screen.getByRole("button", { name: /Continuar/i });
    fireEvent.click(nextBtn2);

    // Debe mostrar paso 3: Blindaje Guardián SOS & ETA
    expect(screen.getByText("Guardián Silencioso (Dead-Man Switch)")).toBeInTheDocument();
    expect(screen.getByText(/Compartir Telemetría/i)).toBeInTheDocument();
  });

  it("debe permitir retroceder con el botón 'Atrás'", () => {
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={vi.fn()}
        targetProfile={mockTargetProfile}
      />
    );

    // Avanzar a paso 2
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(screen.getByText("¿Quién Pone el Lugar o Punto de Encuentro?")).toBeInTheDocument();

    // Retroceder a paso 1
    const backBtn = screen.getByRole("button", { name: /Atrás/i });
    fireEvent.click(backBtn);
    expect(screen.getByText("Ritmo y Duración del Encuentro")).toBeInTheDocument();
  });

  it("debe ejecutar las acciones atómicas y cerrar el sheet al confirmar", async () => {
    const handleClose = vi.fn();
    render(
      <RendezvousSheet
        isOpen={true}
        onClose={handleClose}
        targetProfile={mockTargetProfile}
      />
    );

    // Avanzar paso 1 -> paso 2
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    // Avanzar paso 2 -> paso 3
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    // Confirmar en paso 3
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

    // Guardián activado (default 60 min)
    expect(mockStartSafetyBeacon).toHaveBeenCalledTimes(1);

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
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PulseCard } from "@/components/pulses/PulseCard";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import type { VesselProfile } from "@/types/vessel";

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
    playSignalSent: vi.fn(),
  },
}));

const mockProfile: VesselProfile = {
  id: "pulse-user-01",
  codename: "LEO_TACTICAL",
  avatarUrl: "https://example.com/leo.jpg",
  galleryUrls: [],
  age: 29,
  showAge: true,
  role: "Top",
  bodyState: "open",
  mobility: "Tengo depto / lugar",
  exitProtocol: "chill_cuddle",
  yoSoy: "Musculoso",
  heightCm: 180,
  weightKg: 82,
  intensity: 3,
  distanceMeters: 600,
  discretizedDistance: {
    displayLabel: "A 600 m de ti",
    precisionMeters: 152,
    cellId: "cell-600",
  },
  statement: "Encuentro tranquilo",
  desires: [],
  intentions: [],
  boundaries: [],
  kinks: ["arnes"],
  hivStatus: "Negativo en PrEP",
  healthStatus: {
    prep: true,
    testedDate: "Septiembre 2026",
  },
  verification: {
    isVerified: true,
    badgeLabel: "Humano Verificado",
    trustScore: 95,
  },
  isAntiGhost: true,
  respectScore: 92,
  responseRateMinutes: 5,
  totalEncountersVerified: 8,
  privateVault: [],
  testimonials: [],
  coordinates: { lat: -34.58, lng: -58.42 },
} as unknown as VesselProfile;

describe("PulseCard — Doble Consentimiento y Tarjeta de Sintonía (Fase 4)", () => {
  const onSelectProfile = vi.fn();
  const onReturnPulse = vi.fn();
  const onOpenChat = vi.fn();
  const onScheduleEncounter = vi.fn();
  const onDismissPulse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza la Tarjeta de Revisión de Sintonía para pulsos recibidos no mutuos", () => {
    render(
      <PulseCard
        profile={mockProfile}
        mode="received"
        isMutual={false}
        pulseId="pulse-123"
        language="es"
        t={TRANSLATIONS.es}
        formatDist={(m) => `${m}m`}
        onSelectProfile={onSelectProfile}
        onReturnPulse={onReturnPulse}
        onOpenChat={onOpenChat}
        onScheduleEncounter={onScheduleEncounter}
        onDismissPulse={onDismissPulse}
      />
    );

    expect(screen.getByTestId("pulse-sintonia-review")).toBeInTheDocument();
    expect(screen.getByText("LEO_TACTICAL")).toBeInTheDocument();
    expect(screen.getByText(/Doble Consentimiento Requerido/i)).toBeInTheDocument();
    expect(screen.getByText("Tiene Lugar 🏠")).toBeInTheDocument();
    expect(screen.getByText(/PrEP Activa/i)).toBeInTheDocument();
  });

  it("permite declinar con respeto un pulso recibido sin fricción", async () => {
    const { audioEngine } = await import("@/lib/audio/SubBassAudioEngine");

    render(
      <PulseCard
        profile={mockProfile}
        mode="received"
        isMutual={false}
        pulseId="pulse-123"
        language="es"
        t={TRANSLATIONS.es}
        formatDist={(m) => `${m}m`}
        onSelectProfile={onSelectProfile}
        onReturnPulse={onReturnPulse}
        onOpenChat={onOpenChat}
        onScheduleEncounter={onScheduleEncounter}
        onDismissPulse={onDismissPulse}
      />
    );

    const declineBtn = screen.getByRole("button", { name: /Declinar con Respeto/i });
    fireEvent.click(declineBtn);

    expect(audioEngine.playPulse).toHaveBeenCalled();
    expect(onDismissPulse).toHaveBeenCalledWith("pulse-123");
  });

  it("al aceptar sintonía, emite sub-bass a 60Hz, retorna el pulso y abre el chat directamente", async () => {
    const { audioEngine } = await import("@/lib/audio/SubBassAudioEngine");

    render(
      <PulseCard
        profile={mockProfile}
        mode="received"
        isMutual={false}
        pulseId="pulse-123"
        language="es"
        t={TRANSLATIONS.es}
        formatDist={(m) => `${m}m`}
        onSelectProfile={onSelectProfile}
        onReturnPulse={onReturnPulse}
        onOpenChat={onOpenChat}
        onScheduleEncounter={onScheduleEncounter}
        onDismissPulse={onDismissPulse}
      />
    );

    const acceptBtn = screen.getByRole("button", { name: /Aceptar Sintonía/i });
    fireEvent.click(acceptBtn);

    expect(audioEngine.playSubBass).toHaveBeenCalledWith(60);
    expect(onReturnPulse).toHaveBeenCalledWith("pulse-user-01");
    expect(onOpenChat).toHaveBeenCalledWith("pulse-user-01");
  });

  it("muestra acciones de encuentro cuando el pulso es mutuo", () => {
    render(
      <PulseCard
        profile={mockProfile}
        mode="mutual"
        isMutual={true}
        pulseId="pulse-123"
        language="es"
        t={TRANSLATIONS.es}
        formatDist={(m) => `${m}m`}
        onSelectProfile={onSelectProfile}
        onReturnPulse={onReturnPulse}
        onOpenChat={onOpenChat}
        onScheduleEncounter={onScheduleEncounter}
        onDismissPulse={onDismissPulse}
      />
    );

    expect(screen.queryByTestId("pulse-sintonia-review")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agendar Encuentro/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Abrir Conversación/i })).toBeInTheDocument();
  });
});

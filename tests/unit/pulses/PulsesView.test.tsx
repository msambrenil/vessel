import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PulsesView } from "@/components/pulses/PulsesView";
import type { VesselProfile, ReceivedPulse } from "@/types/vessel";

const { mockAudioEngine, mockContextState } = vi.hoisted(() => {
  const profile1 = {
    id: "profile-1",
    codename: "ALEX_TEST",
    avatarUrl: "https://example.com/alex.jpg",
    age: 28,
    showAge: true,
    role: "Versátil",
    mobility: "Tengo depto / lugar",
    distanceMeters: 400,
  } as unknown as VesselProfile;

  const mockPulse: ReceivedPulse = {
    id: "pulse-1",
    fromProfileId: "profile-1",
    fromCodename: "ALEX_TEST",
    timestamp: new Date().toISOString(),
    isRead: true,
  };

  return {
    mockAudioEngine: {
      playPulse: vi.fn(),
      playSubBass: vi.fn(),
      playStateSwitch: vi.fn(),
    },
    mockContextState: {
      profiles: [profile1],
      knownProfiles: { "profile-1": profile1 },
      getProfileById: vi.fn((id: string) => (id === "profile-1" ? profile1 : undefined)),
      myBodyState: "open",
      setMyBodyState: vi.fn(),
      transmissions: { "profile-1": 1 },
      sentPulsesMeta: {},
      receivedPulses: [mockPulse],
      returnPulse: vi.fn(),
      markPulsesAsRead: vi.fn(),
      clearPulse: vi.fn(),
      clearAllReadPulses: vi.fn(),
      unreadPulsesCount: 0,
      hasMutualPulse: vi.fn((id: string) => id === "profile-1"),
      t: {
        pulses: {
          title: "Toques",
          subtitle: "Quiénes te tiraron onda o tienen química con vos",
          tabMutual: "Onda Mutua 🔥",
          tabReceived: "Te tiraron onda",
          tabSent: "Enviados",
          clearAll: "Limpiar vistos",
          confirmClearTitle: "¿Limpiar toques vistos?",
          confirmClearDesc: "Vas a ocultar los toques que ya viste y no respondiste.",
          confirmClearAction: "Limpiar ahora",
          cancelClearAction: "Cancelar",
          emptyReceivedTitle: "Bandeja tranquila por ahora",
          emptyReceivedDesc: "Nadie te tiró onda todavía.",
          emptyMutualTitle: "Sin ondas mutuas todavía",
          emptyMutualDesc: "Cuando haya química van a aparecer acá.",
          emptySentTitle: "No tiraste toques todavía",
          emptySentDesc: "Tirale onda a quienes te gusten.",
          goToGrid: "Ver perfiles cerca",
        },
      },
      language: "es" as const,
      formatDist: (m: number) => `${m}m`,
      setActiveView: vi.fn(),
      setSelectedProfile: vi.fn(),
      openCreateDiaryModal: vi.fn(),
    },
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => mockContextState,
  useRadarMatrix: () => mockContextState,
  useAuth: () => mockContextState,
  useSettings: () => mockContextState,
  useDiary: () => mockContextState,
  createFallbackProfile: (id: string) => ({ id, codename: id }),
}));

describe("PulsesView — Estandarización Design System y Pestañas Segmentadas", () => {
  const onOpenChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza la cabecera y el selector de pestañas segmentado del Design System", () => {
    render(<PulsesView onOpenChat={onOpenChat} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByText("Recibidos")).toBeInTheDocument();
    expect(screen.getByText("Onda Mutua")).toBeInTheDocument();
    expect(screen.getByText("Enviados")).toBeInTheDocument();
  });

  it("permite cambiar de pestaña activando sonido táctico y mostrando contenido", () => {
    render(<PulsesView onOpenChat={onOpenChat} />);

    const mutualTab = screen.getByText("Onda Mutua");
    fireEvent.click(mutualTab);

    expect(mockAudioEngine.playSubBass).toHaveBeenCalled();
  });

  it("muestra el modal de confirmación antes de limpiar toques leídos para prevenir borrados accidentales", () => {
    mockContextState.hasMutualPulse.mockReturnValue(false);

    render(<PulsesView onOpenChat={onOpenChat} />);

    const clearBtn = screen.getByRole("button", { name: /Limpiar vistos/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    expect(screen.getByText(/¿Limpiar toques vistos\?/i)).toBeInTheDocument();

    const confirmActionBtn = screen.getByRole("button", { name: /Limpiar ahora/i });
    fireEvent.click(confirmActionBtn);

    expect(mockContextState.clearAllReadPulses).toHaveBeenCalled();
  });
});

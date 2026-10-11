import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EncounterContextBar } from "@/components/chat/EncounterContextBar";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { getLocalTodayIso } from "@/lib/calendar/dateLocale";
import type { VesselProfile, RendezvousPin, DiaryEntry } from "@/types/vessel";

const { mockAudioEngine, mockBarState } = vi.hoisted(() => {
  const profile: VesselProfile = {
    id: "profile-10",
    codename: "GONZA_BA",
    avatarUrl: "https://example.com/gonza.jpg",
    age: 28,
    showAge: true,
    role: "Activo",
    distanceMeters: 600,
  } as unknown as VesselProfile;

  return {
    mockAudioEngine: {
      playPulse: vi.fn(),
      playSubBass: vi.fn(),
    },
    mockBarState: {
      profile,
      activeRendezvous: null as RendezvousPin | null,
      diaryEntries: [] as DiaryEntry[],
    },
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    activeRendezvous: mockBarState.activeRendezvous,
    diaryEntries: mockBarState.diaryEntries,
    language: "es" as const,
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

describe("EncounterContextBar — Barra Contextual Dinámica (Paso 5)", () => {
  const onOpenRendezvousSheet = vi.fn();
  const onOpenEnRoute = vi.fn();
  const onCancelRendezvousPin = vi.fn();
  const onOpenDossier = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockBarState.activeRendezvous = null;
    mockBarState.diaryEntries = [];
  });

  it("no renderiza nada si no hay cita hoy, ni PIN activo, ni alerta SOS", () => {
    const { container } = render(
      <EncounterContextBar
        profile={mockBarState.profile}
        onOpenRendezvousSheet={onOpenRendezvousSheet}
        onOpenEnRoute={onOpenEnRoute}
        onOpenDossier={onOpenDossier}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza la barra de PIN Activo cuando hay un encuentro en curso con este perfil", () => {
    mockBarState.activeRendezvous = {
      id: "pin-bar-1",
      profileId: "profile-10",
      profileCodename: "GONZA_BA",
      locationName: "Av. Corrientes 1200",
      instructions: "Av. Corrientes 1200, piso 4",
      distanceMeters: 600,
      expiresInMinutes: 45,
    };

    render(
      <EncounterContextBar
        profile={mockBarState.profile}
        onOpenRendezvousSheet={onOpenRendezvousSheet}
        onOpenEnRoute={onOpenEnRoute}
        onCancelRendezvousPin={onCancelRendezvousPin}
        onOpenDossier={onOpenDossier}
      />
    );

    expect(screen.getByText(/Encuentro Activo/i)).toBeInTheDocument();

    const cancelBtn = screen.getByTitle(/Finalizar PIN de encuentro/i);
    fireEvent.click(cancelBtn);
    expect(onCancelRendezvousPin).toHaveBeenCalled();
  });

  it("renderiza la barra de 'Cita hoy' con hora y lugar acordados", () => {
    const todayIso = getLocalTodayIso();
    mockBarState.diaryEntries = [
      {
        id: "diary-1",
        date: todayIso,
        time: "22:30",
        isUpcoming: true,
        person: {
          profileId: "profile-10",
          codename: "GONZA_BA",
          avatarUrl: "https://example.com/gonza.jpg",
        },
        location: {
          name: "Depto Gonza",
          category: "home_private",
        },
      } as unknown as DiaryEntry,
    ];

    render(
      <EncounterContextBar
        profile={mockBarState.profile}
        onOpenRendezvousSheet={onOpenRendezvousSheet}
        onOpenEnRoute={onOpenEnRoute}
        onOpenDossier={onOpenDossier}
      />
    );

    expect(screen.getByText(/Cita hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/22:30 hs/i)).toBeInTheDocument();
    expect(screen.getByText(/Depto Gonza/i)).toBeInTheDocument();

    const enRouteBtn = screen.getByRole("button", { name: /Estoy yendo/i });
    fireEvent.click(enRouteBtn);
    expect(onOpenEnRoute).toHaveBeenCalled();
  });
});

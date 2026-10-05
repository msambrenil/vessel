import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DarkroomListView } from "@/components/chat/DarkroomListView";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import type { VesselProfile, ChatMessage, RendezvousPin } from "@/types/vessel";

const { mockAudioEngine, mockListState } = vi.hoisted(() => {
  const profileHost: VesselProfile = {
    id: "profile-1",
    codename: "MARTIN_HOST",
    avatarUrl: "https://example.com/martin.jpg",
    age: 29,
    showAge: true,
    role: "Activo",
    hosting: "Tengo depto / lugar",
    mobility: "Tengo depto / lugar",
    bodyState: "open",
    distanceMeters: 450,
  } as unknown as VesselProfile;

  const profileGuest: VesselProfile = {
    id: "profile-2",
    codename: "LEO_GUEST",
    avatarUrl: "https://example.com/leo.jpg",
    age: 26,
    showAge: true,
    role: "Pasivo",
    hosting: "Puedo moverme / ir",
    mobility: "Puedo moverme / ir",
    bodyState: "occupied",
    distanceMeters: 1200,
  } as unknown as VesselProfile;

  return {
    mockAudioEngine: {
      playPulse: vi.fn(),
      playSubBass: vi.fn(),
    },
    mockListState: {
      profiles: [profileHost, profileGuest],
      chatMessages: {
        "profile-1": [
          {
            id: "msg-1",
            senderId: "profile-1",
            text: "¿Sale previa hoy?",
            timestamp: "21:30",
            isRead: false,
          },
        ] as ChatMessage[],
        "profile-2": [
          {
            id: "msg-2",
            senderId: "me",
            text: "Dale, voy para allá",
            timestamp: "20:00",
            isRead: true,
          },
        ] as ChatMessage[],
      },
      activeRendezvous: null as RendezvousPin | null,
      diaryEntries: [],
    },
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    profiles: mockListState.profiles,
    chatMessages: mockListState.chatMessages,
    transmissions: [],
    receivedPulses: [],
    unreadPulsesCount: 0,
    diaryEntries: mockListState.diaryEntries,
    activeRendezvous: mockListState.activeRendezvous,
    t: TRANSLATIONS.es,
    language: "es" as const,
    setActiveView: vi.fn(),
    getProfileDossier: vi.fn().mockReturnValue(null),
    setSelectedProfile: vi.fn(),
  }),
}));

describe("DarkroomListView — Smart Flow & Filtros Segmentados (Paso 5)", () => {
  const onOpenChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockListState.activeRendezvous = null;
  });

  it("renderiza la lista de conversaciones y abre el chat al hacer click", () => {
    render(<DarkroomListView onOpenChat={onOpenChat} />);

    expect(screen.getByText("MARTIN_HOST")).toBeInTheDocument();
    expect(screen.getByText("LEO_GUEST")).toBeInTheDocument();
    expect(screen.getByText("¿Sale previa hoy?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("MARTIN_HOST"));
    expect(onOpenChat).toHaveBeenCalledWith("profile-1");
  });

  it("filtra por 'Ponen lugar' mostrando solo los perfiles que reciben", () => {
    render(<DarkroomListView onOpenChat={onOpenChat} />);

    const hostFilterTab = screen.getByRole("tab", { name: /Tienen lugar/i });
    fireEvent.click(hostFilterTab);

    expect(screen.getByText("MARTIN_HOST")).toBeInTheDocument();
    expect(screen.queryByText("LEO_GUEST")).not.toBeInTheDocument();
  });

  it("filtra por 'No leídos' mostrando solo conversaciones con mensajes pendientes", () => {
    render(<DarkroomListView onOpenChat={onOpenChat} />);

    const unreadFilterTab = screen.getByRole("tab", { name: /No leídos/i });
    fireEvent.click(unreadFilterTab);

    expect(screen.getByText("MARTIN_HOST")).toBeInTheDocument();
    expect(screen.queryByText("LEO_GUEST")).not.toBeInTheDocument();
  });

  it("muestra la Smart Bar cuando hay un punto de encuentro activo (Rendezvous PIN)", () => {
    mockListState.activeRendezvous = {
      id: "pin-1",
      profileId: "profile-1",
      profileCodename: "MARTIN_HOST",
      locationName: "Depto Martin",
      instructions: "Barrio Güemes, timbre B",
      distanceMeters: 450,
      expiresInMinutes: 60,
    };

    render(<DarkroomListView onOpenChat={onOpenChat} />);

    expect(screen.getByText("PIN ACTIVO")).toBeInTheDocument();
    expect(screen.getByText("Encuentro en curso")).toBeInTheDocument();

    fireEvent.click(screen.getByText("PIN ACTIVO"));
    expect(onOpenChat).toHaveBeenCalledWith("profile-1");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DarkroomListView } from "@/components/chat/DarkroomListView";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import type { VesselProfile } from "@/types/vessel";

const { mockAudioEngine, mockVesselState } = vi.hoisted(() => {
  const profile1: VesselProfile = {
    id: "profile-1",
    codename: "MATEO_PALERMO",
    avatarUrl: "https://example.com/mateo.jpg",
    age: 24,
    showAge: true,
    role: "versatile",
    bodyState: "open",
    mobility: "has_place",
    distanceMeters: 350,
  } as unknown as VesselProfile;

  const profile2: VesselProfile = {
    id: "profile-2",
    codename: "FACU_RECOLETA",
    avatarUrl: null,
    age: 29,
    showAge: true,
    role: "active",
    bodyState: "occupied",
    distanceMeters: 800,
  } as unknown as VesselProfile;

  return {
    mockAudioEngine: {
      playPulse: vi.fn(),
      playSubBass: vi.fn(),
    },
    mockVesselState: {
      profiles: [profile1, profile2],
      knownProfiles: { "profile-1": profile1, "profile-2": profile2 },
      chatMessages: {
        "profile-1": [
          {
            id: "m-1",
            senderId: "profile-1",
            text: "¿Qué hacés hoy?",
            timestamp: "14:30",
            isRead: false,
          },
        ],
        "profile-2": [],
      },
      transmissions: { "profile-1": 1 },
      receivedPulses: [],
      unreadPulsesCount: 0,
      hasMutualPulse: vi.fn((id: string) => id === "profile-1"),
      diaryEntries: [],
      activeRendezvous: null,
      getProfileDossier: vi.fn(() => null),
      setSelectedProfile: vi.fn(),
      setActiveView: vi.fn(),
      getProfileById: vi.fn((id: string) => (id === "profile-1" ? profile1 : profile2)),
    },
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

vi.mock("@/context/VesselContext", () => {
  const getMockState = () => ({
    ...mockVesselState,
    language: "es" as const,
    t: TRANSLATIONS.es,
  });

  return {
    useVessel: getMockState,
    useSettings: getMockState,
    useAuth: getMockState,
    useSafety: getMockState,
    useRadarMatrix: getMockState,
    useChat: getMockState,
    useLogistics: getMockState,
    useDiary: getMockState,
    createFallbackProfile: (id: string) => ({ id, codename: id } as any),
  };
});

describe("DarkroomListView — Bandeja de Conversaciones (Refactor & Estandarización)", () => {
  const onOpenChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el selector segmentado de pestañas del sistema de diseño", () => {
    render(<DarkroomListView onOpenChat={onOpenChat} />);
    
    // SegmentedTabGroup renders role="tablist"
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
    expect(screen.getByText("Todos")).toBeInTheDocument();
    expect(screen.getByText("Tienen lugar")).toBeInTheDocument();
    expect(screen.getByText("No leídos")).toBeInTheDocument();
  });

  it("renderiza la lista de conversaciones sin anidar botones interactivos", () => {
    render(<DarkroomListView onOpenChat={onOpenChat} />);

    // Mateo codename should be visible
    expect(screen.getByText("MATEO_PALERMO")).toBeInTheDocument();

    // Clicking avatar triggers setSelectedProfile without triggering onOpenChat
    const avatar = screen.getByLabelText("Ver ficha de MATEO_PALERMO");
    fireEvent.click(avatar);
    expect(mockVesselState.setSelectedProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: "profile-1" })
    );
    expect(onOpenChat).not.toHaveBeenCalled();

    // Clicking conversation body opens the chat
    const chatTrigger = screen.getByRole("button", {
      name: /Abrir chat con MATEO_PALERMO/i,
    });
    fireEvent.click(chatTrigger);
    expect(onOpenChat).toHaveBeenCalledWith("profile-1");
  });

  it("filtra por no leídos cuando se selecciona la pestaña No leídos", () => {
    render(<DarkroomListView onOpenChat={onOpenChat} />);

    const unreadTab = screen.getByText("No leídos");
    fireEvent.click(unreadTab);

    // Mateo has unread message so it stays visible
    expect(screen.getByText("MATEO_PALERMO")).toBeInTheDocument();
  });
});

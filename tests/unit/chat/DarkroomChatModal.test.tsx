import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { DarkroomChatModal } from "@/components/chat/DarkroomChatModal";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import type { VesselProfile, ChatMessage } from "@/types/vessel";

const { mockAudioEngine, mockTestState } = vi.hoisted(() => {
  const partner: VesselProfile = {
    id: "partner-99",
    codename: "NICO_MED",
    avatarUrl: "https://example.com/nico.jpg",
    galleryUrls: [],
    age: 31,
    showAge: true,
    role: "Versátil",
    bodyState: "open",
    mobility: "Tengo depto / lugar",
    exitProtocol: "fast_encounter",
    yoSoy: "Atlético",
    heightCm: 178,
    weightKg: 75,
    intensity: 2,
    distanceMeters: 300,
    statement: "Médico de guardia",
    kinks: ["besos", "masajes"],
    healthStatus: {
      prep: true,
      testedDate: "Septiembre 2026",
    },
    verification: {
      isVerified: true,
      badgeLabel: "Verificado",
    },
    isAntiGhost: true,
    respectScore: 99,
    privateVault: [],
    testimonials: [],
    coordinates: { lat: -34.58, lng: -58.42 },
  } as unknown as VesselProfile;

  return {
    mockAudioEngine: {
      playPulse: vi.fn(),
      playSubBass: vi.fn(),
      playSignalSent: vi.fn(),
      playStateSwitch: vi.fn(),
      playVaultUnlock: vi.fn(),
      playError: vi.fn(),
    },
    mockTestState: {
      partner,
      hasMutual: true,
      messages: [] as ChatMessage[],
    },
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    myProfile: { codename: "TEST_USER", id: "user-me" },
    profiles: [mockTestState.partner],
    chatMessages: {
      "partner-99": mockTestState.messages,
    },
    markMessagesAsRead: vi.fn(),
    sendChatMessage: vi.fn(),
    sendVoiceMessage: vi.fn(),
    sendKindClosureMessage: vi.fn(),
    sendRendezvousPin: vi.fn(),
    activeRendezvous: null,
    cancelRendezvousPin: vi.fn(),
    sendSecureWaypoint: vi.fn(),
    unlockPhase2Waypoint: vi.fn(),
    cancelSecureWaypoint: vi.fn(),
    burnMessage: vi.fn(),
    revokeAlbumAccessInChat: vi.fn(),
    unrevokeAlbumAccessInChat: vi.fn(),
    validatedEncounters: {},
    validateEncounter: vi.fn(),
    openCreateDiaryModal: vi.fn(),
    getBoundaryForProfile: vi.fn().mockReturnValue(null),
    getChatRetentionForProfile: vi.fn().mockReturnValue("persistent"),
    getProfileDossier: vi.fn().mockReturnValue(null),
    toggleChatRetention: vi.fn(),
    clearChatHistory: vi.fn(),
    openEnRouteModal: vi.fn(),
    openHostCardModal: vi.fn(),
    openSafetyBeaconModal: vi.fn(),
    safetyBeacon: null,
    userAlbums: [],
    registerAlbumSharedWith: vi.fn(),
    t: TRANSLATIONS.es,
    language: "es" as const,
    formatDist: (m: number) => `${m}m`,
    setSelectedProfile: vi.fn(),
    archivePhotosToDossier: vi.fn(),
    openLoverDossierModal: vi.fn(),
    updateEncounterTicketStatus: vi.fn(),
    confirmH2Ticket: vi.fn(),
    hasMutualPulse: (id: string) => (id === "partner-99" ? mockTestState.hasMutual : false),
  }),
}));

describe("DarkroomChatModal — Pinned Pre-Flight Agreement Banner (Fase 4)", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTestState.hasMutual = true;
    mockTestState.messages = [];
  });

  it("renderiza el banner fijado de sintonía cuando existe sintonía mutua", () => {
    render(<DarkroomChatModal profileId="partner-99" onClose={onClose} />);

    const banner = screen.getByTestId("pinned-preflight-banner");
    expect(banner).toBeInTheDocument();
    expect(within(banner).getByText("Sintonía Mutua")).toBeInTheDocument();
    expect(within(banner).getByText(/PrEP e I=I/i)).toBeInTheDocument();
    expect(within(banner).getByText(/Sin sobremesa/i)).toBeInTheDocument();
  });

  it("permite presionar 'Ajustar ⚡' en el banner para calibrar el acuerdo", () => {
    render(<DarkroomChatModal profileId="partner-99" onClose={onClose} />);

    const adjustBtn = screen.getByRole("button", { name: /Ajustar sintonía/i });
    expect(adjustBtn).toBeInTheDocument();
    fireEvent.click(adjustBtn);

    expect(mockAudioEngine.playSubBass).toHaveBeenCalledWith(60);
  });

  it("muestra 'Pacto Confirmado' si el hilo contiene un PreFlightChecklist explícito", () => {
    mockTestState.messages = [
      {
        id: "msg-pf-1",
        senderId: "me",
        text: "Acuerdo enviado",
        isPreFlightChecklist: true,
        preFlightData: {
          id: "pf-1",
          senderId: "user-me",
          receiverId: "partner-99",
          tempo: "rough_dom",
          dynamics: ["kink_gear"],
          protection: "prep_doxypep",
          vibe: "100_sober",
          createdAt: new Date().toISOString(),
        },
        timestamp: "14:30",
        isRead: true,
      },
    ];

    render(<DarkroomChatModal profileId="partner-99" onClose={onClose} />);

    const banner = screen.getByTestId("pinned-preflight-banner");
    expect(within(banner).getByText("Pacto Confirmado")).toBeInTheDocument();
    expect(within(banner).getByText(/Dominación & Fuerte/i)).toBeInTheDocument();
    expect(within(banner).getByText(/PrEP \+ Doxy-PEP/i)).toBeInTheDocument();
  });

  it("abre la Ficha del chongo al hacer click en el botón 'Ficha' de la cabecera", () => {
    render(<DarkroomChatModal profileId="partner-99" onClose={onClose} />);

    const dossierBtn = screen.getByRole("button", { name: /Ver ficha y datos/i });
    expect(dossierBtn).toBeInTheDocument();
    fireEvent.click(dossierBtn);

    // ChatProfileDrawer debe abrirse mostrando su encabezado
    expect(screen.getByText(/Ficha del chongo/i)).toBeInTheDocument();
    expect(mockAudioEngine.playPulse).toHaveBeenCalled();
  });

  it("renderiza la pastilla compacta inline para álbumes revocados", () => {
    mockTestState.messages = [
      {
        id: "msg-revoked-album-1",
        senderId: "me",
        text: "",
        timestamp: "14:35",
        isRead: true,
        mediaAttachment: {
          mediaType: "photo",
          mode: "permanent",
          url: "https://example.com/thumb.jpg",
          sharedAlbumId: "album-1",
          albumTitle: "PRIVADO HOT",
          albumPrivacy: "private",
          albumPhotoCount: 5,
          isRevoked: true,
        },
      },
    ];

    render(<DarkroomChatModal profileId="partner-99" onClose={onClose} />);

    // Verifica que se muestre el aviso compacto y la acción de re-compartir
    expect(screen.getByText(/Dejaste de compartir tu álbum acá/i)).toBeInTheDocument();
    expect(screen.getByText(/Compartir de nuevo/i)).toBeInTheDocument();
  });
});

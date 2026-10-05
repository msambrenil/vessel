import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatProfileDrawer } from "@/components/chat/ChatProfileDrawer";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import type { VesselProfile } from "@/types/vessel";

const { mockAudioEngine, mockDrawerContext } = vi.hoisted(() => {
  const profile: VesselProfile = {
    id: "profile-drawer-1",
    codename: "RAMIRO_MDQ",
    avatarUrl: "https://example.com/ramiro.jpg",
    age: 33,
    showAge: true,
    role: "Versátil Activo",
    distanceMeters: 800,
    respectScore: 98,
    verification: {
      isVerified: true,
      badgeLabel: "3D Verificado",
    },
    isAntiGhost: true,
  } as unknown as VesselProfile;

  return {
    mockAudioEngine: {
      playPulse: vi.fn(),
    },
    mockDrawerContext: {
      profile,
      setSelectedProfile: vi.fn(),
      openEnRouteModal: vi.fn(),
      openSafetyBeaconModal: vi.fn(),
      openCreateDiaryModal: vi.fn(),
      getProfileDossier: vi.fn().mockReturnValue(null),
    },
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    language: "es" as const,
    formatDist: (m: number) => `${m}m`,
    setSelectedProfile: mockDrawerContext.setSelectedProfile,
    getProfileDossier: mockDrawerContext.getProfileDossier,
    openEnRouteModal: mockDrawerContext.openEnRouteModal,
    openSafetyBeaconModal: mockDrawerContext.openSafetyBeaconModal,
    openCreateDiaryModal: mockDrawerContext.openCreateDiaryModal,
    t: TRANSLATIONS.es,
  }),
}));

describe("ChatProfileDrawer — Ficha Táctica On-Demand (Paso 5)", () => {
  const onClose = vi.fn();
  const onOpenRendezvousSheet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada si isOpen es false", () => {
    const { container } = render(
      <ChatProfileDrawer
        isOpen={false}
        onClose={onClose}
        profile={mockDrawerContext.profile}
        onOpenRendezvousSheet={onOpenRendezvousSheet}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renderiza el perfil completo, el respeto y las acciones tácticas cuando isOpen es true", () => {
    render(
      <ChatProfileDrawer
        isOpen={true}
        onClose={onClose}
        profile={mockDrawerContext.profile}
        onOpenRendezvousSheet={onOpenRendezvousSheet}
      />
    );

    expect(screen.getByText("RAMIRO_MDQ")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Coordinar Encuentro/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Estoy yendo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardián SOS/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar Nota Privada/i })).toBeInTheDocument();
  });

  it("dispara onOpenRendezvousSheet al presionar 'Coordinar Encuentro'", () => {
    render(
      <ChatProfileDrawer
        isOpen={true}
        onClose={onClose}
        profile={mockDrawerContext.profile}
        onOpenRendezvousSheet={onOpenRendezvousSheet}
      />
    );

    const planBtn = screen.getByRole("button", { name: /Coordinar Encuentro/i });
    fireEvent.click(planBtn);
    expect(onOpenRendezvousSheet).toHaveBeenCalled();
  });

  it("cierra el drawer al presionar el botón de cierre", () => {
    render(
      <ChatProfileDrawer
        isOpen={true}
        onClose={onClose}
        profile={mockDrawerContext.profile}
        onOpenRendezvousSheet={onOpenRendezvousSheet}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /Cerrar ficha/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});

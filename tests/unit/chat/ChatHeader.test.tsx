import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import type { VesselProfile } from "@/types/vessel";

const mockAudioEngine = vi.hoisted(() => ({
  playPulse: vi.fn(),
  playSubBass: vi.fn(),
  playVaultUnlock: vi.fn(),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

describe("ChatHeader — Cabecera Modular del Chat", () => {
  const profile: VesselProfile = {
    id: "profile-santi",
    codename: "SANTI_BELGRANO",
    avatarUrl: "https://example.com/santi.jpg",
    age: 27,
    showAge: true,
    role: "versatile",
    bodyState: "open",
    mobility: "has_place",
    hosting: "Lugar propio",
    distanceMeters: 450,
  } as unknown as VesselProfile;

  const onClose = vi.fn();
  const onToggleRetention = vi.fn();
  const onOpenDossier = vi.fn();
  const onOpenRendezvous = vi.fn();
  const onToggleTacticalMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza la identidad del perfil, avatar táctico y botón de volver", () => {
    render(
      <ChatHeader
        profile={profile}
        language="es"
        currentRetention="persistent"
        isTogglingRetention={false}
        onToggleRetention={onToggleRetention}
        onClose={onClose}
        onOpenDossier={onOpenDossier}
        onOpenRendezvous={onOpenRendezvous}
        onToggleTacticalMenu={onToggleTacticalMenu}
        isTacticalMenuOpen={false}
      />
    );

    expect(screen.getByText("SANTI_BELGRANO")).toBeInTheDocument();
    expect(screen.getByText("· 27")).toBeInTheDocument();
    expect(screen.getByText("Versátil")).toBeInTheDocument();
    expect(screen.getByText("450m")).toBeInTheDocument();

    const backBtn = screen.getByLabelText("Volver a mensajes");
    fireEvent.click(backBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("permite abrir el asistente de citas y el menú táctico", () => {
    render(
      <ChatHeader
        profile={profile}
        language="es"
        currentRetention="persistent"
        isTogglingRetention={false}
        onToggleRetention={onToggleRetention}
        onClose={onClose}
        onOpenDossier={onOpenDossier}
        onOpenRendezvous={onOpenRendezvous}
        onToggleTacticalMenu={onToggleTacticalMenu}
        isTacticalMenuOpen={false}
      />
    );

    const rendezvousBtn = screen.getByLabelText("Coordinar cita segura");
    fireEvent.click(rendezvousBtn);
    expect(onOpenRendezvous).toHaveBeenCalled();

    const moreBtn = screen.getByLabelText("Más herramientas tácticas");
    fireEvent.click(moreBtn);
    expect(onToggleTacticalMenu).toHaveBeenCalled();
  });
});

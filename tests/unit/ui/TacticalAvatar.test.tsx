import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TacticalAvatar } from "@/components/ui/TacticalAvatar";

const { mockAudioEngine } = vi.hoisted(() => ({
  mockAudioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
  },
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

describe("TacticalAvatar — Primitiva UX del Design System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza la imagen correctamente cuando se provee src", () => {
    render(
      <TacticalAvatar
        src="https://example.com/avatar.jpg"
        alt="Perfil de Leo"
        codename="LEO_TACTICAL"
      />
    );

    const img = screen.getByRole("img", { name: /Perfil de Leo/i });
    expect(img).toBeInTheDocument();
  });

  it("renderiza las iniciales tácticas en fallback si no hay src o falla la imagen", () => {
    render(
      <TacticalAvatar
        src={null}
        alt="Perfil de Alex"
        codename="ALEX_RAVER"
      />
    );

    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("renderiza un botón accesible y emite audio cuando se provee onClick", () => {
    const handleClick = vi.fn();
    render(
      <TacticalAvatar
        src="https://example.com/avatar.jpg"
        alt="Perfil de Leo"
        codename="LEO_TACTICAL"
        onClick={handleClick}
        soundEffect="subbass"
      />
    );

    const btn = screen.getByRole("button", { name: /Perfil de Leo/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(mockAudioEngine.playSubBass).toHaveBeenCalledWith(60);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("muestra el indicador animado de ping cuando hasUnreadPing es true", () => {
    render(
      <TacticalAvatar
        src="https://example.com/avatar.jpg"
        alt="Perfil de Leo"
        codename="LEO_TACTICAL"
        hasUnreadPing={true}
        pingVariant="blood"
      />
    );

    expect(screen.getByTestId("tactical-avatar-ping")).toBeInTheDocument();
  });

  it("muestra el indicador de bodyState open u occupied correctamente", () => {
    const { rerender } = render(
      <TacticalAvatar
        alt="Perfil de Leo"
        codename="LEO"
        bodyState="open"
      />
    );

    expect(screen.getByTestId("tactical-avatar-bodystate-open")).toBeInTheDocument();

    rerender(
      <TacticalAvatar
        alt="Perfil de Leo"
        codename="LEO"
        bodyState="occupied"
      />
    );

    expect(screen.getByTestId("tactical-avatar-bodystate-occupied")).toBeInTheDocument();
  });
});

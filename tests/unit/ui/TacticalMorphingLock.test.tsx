import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TacticalMorphingLock } from "@/components/ui/TacticalMorphingLock";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

describe("TacticalMorphingLock — Candado Táctico Microinteractivo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar como icono decorativo cuando no se pasa callback de acción", () => {
    const { container } = render(<TacticalMorphingLock isLocked={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("debe renderizar como botón interactivo accesible cuando asButton es true", () => {
    const handleToggle = vi.fn();
    render(
      <TacticalMorphingLock
        isLocked={true}
        onToggle={handleToggle}
        asButton={true}
        label="Bóveda Cifrada"
      />
    );

    const button = screen.getByRole("button", { name: /Bóveda Cifrada/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledWith(false);
  });

  it("debe reproducir playVaultUnlock al desbloquearse y playPulse al bloquearse", () => {
    const playUnlockSpy = vi.spyOn(audioEngine, "playVaultUnlock");
    const playPulseSpy = vi.spyOn(audioEngine, "playPulse");

    const { rerender } = render(
      <TacticalMorphingLock isLocked={true} soundEffect={true} />
    );

    // Cambiar a desbloqueado
    rerender(<TacticalMorphingLock isLocked={false} soundEffect={true} />);
    expect(playUnlockSpy).toHaveBeenCalledTimes(1);

    // Cambiar de vuelta a bloqueado
    rerender(<TacticalMorphingLock isLocked={true} soundEffect={true} />);
    expect(playPulseSpy).toHaveBeenCalledTimes(1);
  });

  it("no debe disparar eventos si está deshabilitado", () => {
    const handleToggle = vi.fn();
    render(
      <TacticalMorphingLock
        isLocked={true}
        onToggle={handleToggle}
        asButton={true}
        disabled={true}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleToggle).not.toHaveBeenCalled();
  });
});

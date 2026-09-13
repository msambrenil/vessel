import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistButton } from "@/components/ui/BrutalistButton";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

describe("BrutalistButton — Primitiva Táctica de UI (Convención 44px & 5 Estados)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar con el texto proporcionado y variante primary por defecto", () => {
    render(<BrutalistButton>Mandar Pulso</BrutalistButton>);
    const button = screen.getByRole("button", { name: /Mandar Pulso/i });

    expect(button).toBeInTheDocument();
    expect(button.className).toContain("bg-electricViolet");
    expect(button.className).toContain("min-h-[44px]"); // Touch target mínimo de 44px
  });

  it("debe incluir los 5 estados obligatorios en sus clases de Tailwind", () => {
    render(<BrutalistButton variant="primary">Acción</BrutalistButton>);
    const button = screen.getByRole("button", { name: /Acción/i });

    // 1. Default (bg-electricViolet)
    expect(button.className).toContain("bg-electricViolet");
    // 2. Hover
    expect(button.className).toContain("hover:bg-electricViolet-glow");
    // 3. Active
    expect(button.className).toContain("active:scale-[0.97]");
    // 4. Focus
    expect(button.className).toContain("focus-visible:ring-electricViolet");
    // 5. Disabled
    expect(button.className).toContain("disabled:opacity-40");
  });

  it("debe renderizar la variante 'danger' con tokens Blood Neon", () => {
    render(<BrutalistButton variant="danger">Eliminar</BrutalistButton>);
    const button = screen.getByRole("button", { name: /Eliminar/i });

    expect(button.className).toContain("bg-bloodNeon");
    expect(button.className).toContain("focus-visible:ring-bloodNeon");
  });

  it("debe respetar el tamaño 'icon' como un cuadrado táctil estricto de 44x44px", () => {
    render(<BrutalistButton size="icon" aria-label="Cerrar">✕</BrutalistButton>);
    const button = screen.getByRole("button", { name: /Cerrar/i });

    expect(button.className).toContain("w-11");
    expect(button.className).toContain("h-11");
    expect(button.className).toContain("min-w-[44px]");
    expect(button.className).toContain("min-h-[44px]");
  });

  it("debe ejecutar el callback onClick y disparar el efecto de sonido configurado", () => {
    const playPulseSpy = vi.spyOn(audioEngine, "playPulse");
    const handleClick = vi.fn();

    render(
      <BrutalistButton soundEffect="pulse" onClick={handleClick}>
        Confirmar
      </BrutalistButton>
    );

    const button = screen.getByRole("button", { name: /Confirmar/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(playPulseSpy).toHaveBeenCalledTimes(1);
  });

  it("no debe emitir eventos ni sonidos si está en estado 'disabled'", () => {
    const playPulseSpy = vi.spyOn(audioEngine, "playPulse");
    const handleClick = vi.fn();

    render(
      <BrutalistButton disabled onClick={handleClick}>
        Deshabilitado
      </BrutalistButton>
    );

    const button = screen.getByRole("button", { name: /Deshabilitado/i });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(playPulseSpy).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it("debe mostrar spinner de carga y bloquear interacción cuando isLoading es true", () => {
    const handleClick = vi.fn();

    render(
      <BrutalistButton isLoading onClick={handleClick}>
        Guardando
      </BrutalistButton>
    );

    const button = screen.getByRole("button", { name: /Guardando/i });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
});

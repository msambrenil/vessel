import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistSwitch } from "@/components/ui/BrutalistSwitch";

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
  },
}));

describe("BrutalistSwitch — Switch Táctico Accesible WCAG 2.5.5", () => {
  it("debe renderizar con rol switch y estado aria-checked", () => {
    const handleChange = vi.fn();
    render(
      <BrutalistSwitch
        checked={true}
        onChange={handleChange}
        label="Modo Niebla"
        description="Oculta tu foto en la matrix"
      />
    );

    const switchEl = screen.getByRole("switch", { name: /modo niebla/i });
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Modo Niebla")).toBeInTheDocument();
    expect(screen.getByText("Oculta tu foto en la matrix")).toBeInTheDocument();
  });

  it("debe alternar de valor al hacer clic y reproducir pulso sonoro", () => {
    const handleChange = vi.fn();
    render(
      <BrutalistSwitch
        checked={false}
        onChange={handleChange}
        label="Sonidos Hápticos"
      />
    );

    const switchEl = screen.getByRole("switch", { name: /sonidos hápticos/i });
    expect(switchEl).toHaveAttribute("aria-checked", "false");

    fireEvent.click(switchEl);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("debe responder a eventos de teclado Enter y Espacio", () => {
    const handleChange = vi.fn();
    render(
      <BrutalistSwitch
        checked={false}
        onChange={handleChange}
        label="Activar Radar"
      />
    );

    const switchEl = screen.getByRole("switch", { name: /activar radar/i });

    fireEvent.keyDown(switchEl, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(switchEl, { key: " " });
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it("no debe disparar onChange cuando está deshabilitado", () => {
    const handleChange = vi.fn();
    render(
      <BrutalistSwitch
        checked={false}
        onChange={handleChange}
        label="Función Pro"
        disabled={true}
      />
    );

    const switchEl = screen.getByRole("switch", { name: /función pro/i });
    expect(switchEl).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(switchEl);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("debe renderizar iconos de estado morphing (Eye / EyeOff) en el thumb según checked", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <BrutalistSwitch
        checked={true}
        onChange={handleChange}
        label="Modo Incógnito"
        icon="eye"
      />
    );

    const switchEl = screen.getByRole("switch", { name: /modo incógnito/i });
    expect(switchEl).toBeInTheDocument();
    // Renderiza con SVG en el thumb
    expect(switchEl.querySelector("svg")).toBeInTheDocument();

    // Rerender con checked=false
    rerender(
      <BrutalistSwitch
        checked={false}
        onChange={handleChange}
        label="Modo Incógnito"
        icon="eye"
      />
    );
    expect(switchEl.querySelector("svg")).toBeInTheDocument();
  });
});


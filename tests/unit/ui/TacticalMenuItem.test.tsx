import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TacticalMenuItem } from "@/components/ui/TacticalMenuItem";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

describe("TacticalMenuItem — Primitiva Táctica para Menús y Acciones (44px & Accesibilidad)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar con rol semántico menuitem, target táctil mínimo de 44px y título", () => {
    render(<TacticalMenuItem title="Mi Opción Táctica" />);
    const item = screen.getByRole("menuitem");

    expect(item).toBeInTheDocument();
    expect(item.className).toContain("min-h-[44px]");
    expect(screen.getByText("Mi Opción Táctica")).toBeInTheDocument();
  });

  it("debe renderizar subtítulo e icono cuando se proporcionan", () => {
    render(
      <TacticalMenuItem
        title="Audio Sub-Bass"
        subtitle="Resonancia analógica activa"
        icon={<span data-testid="icon-sample">🔊</span>}
      />
    );

    expect(screen.getByText("Audio Sub-Bass")).toBeInTheDocument();
    expect(screen.getByText("Resonancia analógica activa")).toBeInTheDocument();
    expect(screen.getByTestId("icon-sample")).toBeInTheDocument();
  });

  it("debe renderizar un TacticalBadge cuando se pasa badge como texto y badgeVariant", () => {
    render(
      <TacticalMenuItem
        title="Verificación 3D"
        badge="✓ OK"
        badgeVariant="emerald"
      />
    );

    const badge = screen.getByText("✓ OK");
    expect(badge).toBeInTheDocument();
  });

  it("debe disparar efecto de audio pulse por defecto y llamar al handler onClick", () => {
    const playPulseSpy = vi.spyOn(audioEngine, "playPulse");
    const handleClick = vi.fn();

    render(
      <TacticalMenuItem
        title="Configuración"
        onClick={handleClick}
      />
    );

    const item = screen.getByRole("menuitem");
    fireEvent.click(item);

    expect(playPulseSpy).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("debe respetar soundEffect='subbass' y disparar playSubBass", () => {
    const playSubBassSpy = vi.spyOn(audioEngine, "playSubBass");
    const handleClick = vi.fn();

    render(
      <TacticalMenuItem
        title="Radar Resonante"
        soundEffect="subbass"
        onClick={handleClick}
      />
    );

    const item = screen.getByRole("menuitem");
    fireEvent.click(item);

    expect(playSubBassSpy).toHaveBeenCalledWith(60);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("debe no reproducir audio si soundEffect='none'", () => {
    const playPulseSpy = vi.spyOn(audioEngine, "playPulse");
    const playSubBassSpy = vi.spyOn(audioEngine, "playSubBass");
    const handleClick = vi.fn();

    render(
      <TacticalMenuItem
        title="Silencioso"
        soundEffect="none"
        onClick={handleClick}
      />
    );

    const item = screen.getByRole("menuitem");
    fireEvent.click(item);

    expect(playPulseSpy).not.toHaveBeenCalled();
    expect(playSubBassSpy).not.toHaveBeenCalled();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("debe respetar el estado disabled y no emitir clics ni audio", () => {
    const playPulseSpy = vi.spyOn(audioEngine, "playPulse");
    const handleClick = vi.fn();

    render(
      <TacticalMenuItem
        title="Deshabilitado"
        disabled
        onClick={handleClick}
      />
    );

    const item = screen.getByRole("menuitem");
    expect(item).toBeDisabled();

    fireEvent.click(item);
    expect(playPulseSpy).not.toHaveBeenCalled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("debe soportar reenvío de ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<TacticalMenuItem ref={ref} title="Con Ref" />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.getAttribute("role")).toBe("menuitem");
  });
});

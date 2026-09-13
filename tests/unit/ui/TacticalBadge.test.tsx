import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { TacticalBadge } from "@/components/ui/TacticalBadge";

describe("TacticalBadge — Insignia Semántica Táctica", () => {
  it("debe renderizar el contenido con la variante neutral por defecto", () => {
    render(<TacticalBadge>En línea</TacticalBadge>);
    const badge = screen.getByText("En línea");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-neutral-300");
  });

  it("debe aplicar estilos correctos según la variante seleccionada", () => {
    const { rerender } = render(<TacticalBadge variant="amber">Activo</TacticalBadge>);
    expect(screen.getByText("Activo").className).toContain("text-champagneGold");

    rerender(<TacticalBadge variant="blood">Alerta</TacticalBadge>);
    expect(screen.getByText("Alerta").className).toContain("text-bloodNeon");

    rerender(<TacticalBadge variant="emerald">Verificado</TacticalBadge>);
    expect(screen.getByText("Verificado").className).toContain("text-emerald-400");

    rerender(<TacticalBadge variant="purple">Límites</TacticalBadge>);
    expect(screen.getByText("Límites").className).toContain("text-purple-300");
  });

  it("debe mostrar un punto de pulso animado cuando pulse={true}", () => {
    const { container } = render(
      <TacticalBadge variant="amber" pulse>
        Radar ON
      </TacticalBadge>
    );

    const pulseDot = container.querySelector(".animate-ping");
    expect(pulseDot).toBeInTheDocument();
    expect(pulseDot?.className).toContain("bg-champagneGold");
  });

  it("debe renderizar el ícono opcional cuando se proporciona", () => {
    render(
      <TacticalBadge icon={<span data-testid="custom-icon">⚡</span>}>
        Turbo
      </TacticalBadge>
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});

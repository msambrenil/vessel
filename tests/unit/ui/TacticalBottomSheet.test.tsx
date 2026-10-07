import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TacticalBottomSheet } from "@/components/ui/design-system/TacticalBottomSheet";

describe("TacticalBottomSheet — Componente de Sheet Deslizable (App Shell 2.0)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza en modo peeking por defecto con título y barra flotante", () => {
    render(
      <TacticalBottomSheet title="Sintonía Activa">
        <div>Contenido Expandido</div>
      </TacticalBottomSheet>
    );

    expect(screen.getByTestId("bottom-sheet-peek-bar")).toBeInTheDocument();
    expect(screen.getAllByText("Sintonía Activa").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("bottom-sheet-backdrop")).not.toBeInTheDocument();
  });

  it("al tocar la barra peeking se expande y muestra la cabecera con botón de colapso", () => {
    render(
      <TacticalBottomSheet title="Sintonía Activa">
        <div>Contenido Expandido</div>
      </TacticalBottomSheet>
    );

    const peekBar = screen.getByTestId("bottom-sheet-peek-bar");
    fireEvent.click(peekBar);

    expect(screen.getByTestId("bottom-sheet-drag-handle")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-sheet-collapse-btn")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-sheet-backdrop")).toBeInTheDocument();
  });

  it("al tocar el botón de colapso, vuelve a modo peeking", () => {
    render(
      <TacticalBottomSheet title="Sintonía Activa">
        <div>Contenido Expandido</div>
      </TacticalBottomSheet>
    );

    // Expandir
    fireEvent.click(screen.getByTestId("bottom-sheet-peek-bar"));
    expect(screen.getByTestId("bottom-sheet-collapse-btn")).toBeInTheDocument();

    // Colapsar
    fireEvent.click(screen.getByTestId("bottom-sheet-collapse-btn"));
    expect(screen.getByTestId("bottom-sheet-peek-bar")).toBeInTheDocument();
    expect(screen.queryByTestId("bottom-sheet-backdrop")).not.toBeInTheDocument();
  });

  it("al hacer click en el backdrop oscuro translúcido, colapsa el sheet", () => {
    render(
      <TacticalBottomSheet title="Sintonía Activa">
        <div>Contenido Expandido</div>
      </TacticalBottomSheet>
    );

    fireEvent.click(screen.getByTestId("bottom-sheet-peek-bar"));
    const backdrop = screen.getByTestId("bottom-sheet-backdrop");
    fireEvent.click(backdrop);

    expect(screen.getByTestId("bottom-sheet-peek-bar")).toBeInTheDocument();
    expect(screen.queryByTestId("bottom-sheet-backdrop")).not.toBeInTheDocument();
  });

  it("al presionar Escape en el teclado cuando está expandido, se colapsa", () => {
    render(
      <TacticalBottomSheet title="Sintonía Activa">
        <div>Contenido Expandido</div>
      </TacticalBottomSheet>
    );

    fireEvent.click(screen.getByTestId("bottom-sheet-peek-bar"));
    expect(screen.getByTestId("bottom-sheet-collapse-btn")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByTestId("bottom-sheet-peek-bar")).toBeInTheDocument();
  });

  it("mantiene el contenido hijo en el DOM para accesibilidad y testing en estado peeking", () => {
    render(
      <TacticalBottomSheet title="Sintonía Activa">
        <button data-testid="accessible-action-btn">Acción</button>
      </TacticalBottomSheet>
    );

    expect(screen.getByTestId("accessible-action-btn")).toBeInTheDocument();
  });
});

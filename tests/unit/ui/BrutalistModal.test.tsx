import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistModal } from "@/components/ui/BrutalistModal";

describe("BrutalistModal — Contenedor Modal Táctico Impeccable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no debe renderizar nada cuando isOpen es false", () => {
    const { container } = render(
      <BrutalistModal isOpen={false} onClose={vi.fn()} title="Título Modal">
        <p>Contenido Oculto</p>
      </BrutalistModal>
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe renderizar título, subtítulo, ícono y contenido cuando isOpen es true", () => {
    render(
      <BrutalistModal
        isOpen={true}
        onClose={vi.fn()}
        title="Protocolo de Seguridad"
        subtitle="Monitoreo Activo"
        icon="🛡️"
      >
        <p>Cuerpo del Modal</p>
      </BrutalistModal>
    );

    expect(screen.getByText("Protocolo de Seguridad")).toBeInTheDocument();
    expect(screen.getByText("Monitoreo Activo")).toBeInTheDocument();
    expect(screen.getByText("🛡️")).toBeInTheDocument();
    expect(screen.getByText("Cuerpo del Modal")).toBeInTheDocument();
  });

  it("debe invocar onClose al hacer clic en el botón de cierre táctil (44px)", () => {
    const handleClose = vi.fn();
    render(
      <BrutalistModal isOpen={true} onClose={handleClose} title="Cerrar Test">
        <div>Contenido</div>
      </BrutalistModal>
    );

    const closeBtn = screen.getByRole("button", { name: /Cerrar modal/i });
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn.className).toContain("min-w-[44px]");
    expect(closeBtn.className).toContain("min-h-[44px]");

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("debe invocar onClose al presionar la tecla Escape", () => {
    const handleClose = vi.fn();
    render(
      <BrutalistModal isOpen={true} onClose={handleClose} title="Escape Test">
        <div>Contenido</div>
      </BrutalistModal>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("debe bloquear y restaurar el overflow del body al abrir y cerrar", () => {
    const { unmount } = render(
      <BrutalistModal isOpen={true} onClose={vi.fn()} title="Scroll Lock">
        <div>Contenido</div>
      </BrutalistModal>
    );

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("debe soportar la variante fullscreen con altura 100dvh", () => {
    render(
      <BrutalistModal
        isOpen={true}
        onClose={vi.fn()}
        variant="fullscreen"
        title="Dossier Completo"
      >
        <div>Vista Inmersiva</div>
      </BrutalistModal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("h-[100dvh]");
    expect(screen.getByText("Vista Inmersiva")).toBeInTheDocument();
  });

  it("debe vincular aria-labelledby y aria-describedby con los encabezados semánticos", () => {
    render(
      <BrutalistModal
        isOpen={true}
        onClose={vi.fn()}
        title="Título Accesible"
        subtitle="Descripción Accesible"
      >
        <div>Contenido accesible</div>
      </BrutalistModal>
    );

    const dialog = screen.getByRole("dialog");
    const labelledById = dialog.getAttribute("aria-labelledby");
    const describedById = dialog.getAttribute("aria-describedby");

    expect(labelledById).toBeTruthy();
    expect(describedById).toBeTruthy();

    const titleEl = screen.getByText("Título Accesible");
    const subtitleEl = screen.getByText("Descripción Accesible");

    expect(titleEl.getAttribute("id")).toBe(labelledById);
    expect(subtitleEl.getAttribute("id")).toBe(describedById);
  });

  it("debe atrapar el foco dentro del diálogo en eventos de tecla Tab (Focus Trap)", () => {
    render(
      <BrutalistModal
        isOpen={true}
        onClose={vi.fn()}
        title="Focus Trap Test"
      >
        <button type="button" data-testid="first-input">Primero</button>
        <button type="button" data-testid="second-input">Segundo</button>
      </BrutalistModal>
    );

    const closeBtn = screen.getByRole("button", { name: /Cerrar modal/i });
    const secondBtn = screen.getByTestId("second-input");

    // Simulamos Shift+Tab desde el primer elemento enfocable (el botón de cierre): debe ciclar al último elemento
    closeBtn.focus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(secondBtn);
  });
});


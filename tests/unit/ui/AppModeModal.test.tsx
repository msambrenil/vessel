import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppModeModal } from "@/components/settings/AppModeModal";

const mockSetAppMode = vi.fn();
const mockResetModeData = vi.fn();

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    appMode: "test",
    setAppMode: mockSetAppMode,
    resetModeData: mockResetModeData,
    language: "es",
  }),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playSubBass: vi.fn(),
    playPulse: vi.fn(),
  },
}));

describe("AppModeModal — Selector de Entorno Operativo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no debe renderizar nada cuando isOpen es false", () => {
    const { container } = render(
      <AppModeModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe renderizar los modos y el estado actual cuando isOpen es true", () => {
    render(<AppModeModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/ENTORNO OPERATIVO/i)).toBeInTheDocument();
    expect(screen.getByText(/Modo de Prueba \(Mock\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Modo Real \(Producción Local\)/i)).toBeInTheDocument();
    expect(screen.getByText(/🧪 TEST DATA/i)).toBeInTheDocument();
  });

  it("debe invocar setAppMode('real') al hacer clic en Modo Real", () => {
    render(<AppModeModal isOpen={true} onClose={vi.fn()} />);

    const realModeBtn = screen.getByRole("button", {
      name: /Modo Real \(Producción Local\)/i,
    });
    fireEvent.click(realModeBtn);

    expect(mockSetAppMode).toHaveBeenCalledWith("real");
  });

  it("debe invocar onClose al hacer clic en el botón de cerrar", () => {
    const handleClose = vi.fn();
    render(<AppModeModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", {
      name: /Cerrar selector de entorno/i,
    });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

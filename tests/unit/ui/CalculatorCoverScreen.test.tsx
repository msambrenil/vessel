import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalculatorCoverScreen } from "@/components/safety/CalculatorCoverScreen";

const mockSetCoverScreenActive = vi.fn();
let mockAppDisguiseMode = "calculator";

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    isCoverScreenActive: true,
    setCoverScreenActive: mockSetCoverScreenActive,
    appDisguise: {
      mode: mockAppDisguiseMode,
    },
    language: "es",
  }),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    triggerTacticalPulse: vi.fn(),
  },
}));

describe("CalculatorCoverScreen — Camuflaje Bimodal (Calculadora vs Bloc de Notas)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppDisguiseMode = "calculator";
  });

  it("en modo calculadora, renderiza una calculadora funcional con display numérico y realiza operaciones", () => {
    render(<CalculatorCoverScreen />);

    expect(screen.getByText(/CALCULADORA\.SYS/i)).toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(1);

    // 5 + 3 = 8
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "=" }));

    expect(screen.getAllByText("8").length).toBe(2);
  });

  it("en modo calculadora, al ingresar 0000= desbloquea la pantalla de camuflaje", () => {
    render(<CalculatorCoverScreen />);

    const zeroBtn = screen.getByRole("button", { name: "0" });
    fireEvent.click(zeroBtn);
    fireEvent.click(zeroBtn);
    fireEvent.click(zeroBtn);
    fireEvent.click(zeroBtn);

    const equalsBtn = screen.getByRole("button", { name: "=" });
    fireEvent.click(equalsBtn);

    expect(mockSetCoverScreenActive).toHaveBeenCalledWith(false);
  });

  it("en modo bloc de notas, renderiza los menús en español y textarea funcional", () => {
    mockAppDisguiseMode = "notes";
    render(<CalculatorCoverScreen />);

    expect(screen.getByText(/NOTAS_DEL_SISTEMA\.TXT/i)).toBeInTheDocument();
    expect(screen.getByText("Archivo")).toBeInTheDocument();
    expect(screen.getByText("Edición")).toBeInTheDocument();
    expect(screen.getByText("Formato")).toBeInTheDocument();
    expect(screen.getByText("Ver")).toBeInTheDocument();
    expect(screen.getByText("Ayuda")).toBeInTheDocument();
    expect(screen.getByText(/LISTO \/\/ INSERTAR/i)).toBeInTheDocument();
  });
});

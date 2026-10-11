import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoundaryManagerModal } from "@/components/chat/BoundaryManagerModal";

const mockApplyBoundaryProtocol = vi.fn();
const mockRemoveBoundaryProtocol = vi.fn();
const mockOnClose = vi.fn();
let mockExistingBoundary: any = null;

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    profiles: [
      {
        id: "target-1",
        codename: "LEO_PALERMO",
        avatarUrl: "https://example.com/avatar.jpg",
      },
    ],
    getBoundaryForProfile: () => mockExistingBoundary,
    applyBoundaryProtocol: mockApplyBoundaryProtocol,
    removeBoundaryProtocol: mockRemoveBoundaryProtocol,
    language: "es",
    t: {
      boundaries: {
        modalTitle: "Límites & Desconexión Gradual",
        modalSub: "Gestión de Privacidad",
        restoreBtn: "Restaurar Conexión",
        tabPresets: "Protocolos 1-Tap",
        tabCustom: "A Medida",
      },
    },
  });
  return {
    useVessel: mockCtx,
    useAuth: mockCtx,
    useSettings: mockCtx,
    useRadarMatrix: mockCtx,
    useChat: mockCtx,
    useLogistics: mockCtx,
    useDiary: mockCtx,
    useSafety: mockCtx,
  };
});

describe("BoundaryManagerModal — Desconexión Gradual y Humanización en Español", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistingBoundary = null;
  });

  it("renderiza el modal con el nombre del perfil y los presets éticos de 1 toque", () => {
    render(<BoundaryManagerModal profileId="target-1" onClose={mockOnClose} />);

    expect(screen.getByText(/LEO_PALERMO/i)).toBeInTheDocument();
    expect(screen.getByText("Cierre Amable y Archivo")).toBeInTheDocument();
    expect(screen.getByText("Pausa Temporal")).toBeInTheDocument();
    expect(screen.getByText("Desvanecimiento Silencioso")).toBeInTheDocument();
    expect(screen.getByText("Límite Estricto")).toBeInTheDocument();
    expect(screen.getByText("+5 Respeto")).toBeInTheDocument();
  });

  it("cuando hay un protocolo activo, muestra la etiqueta humana sin tokens crudos en inglés (POLITE_ARCHIVE)", () => {
    mockExistingBoundary = {
      protocol: "polite_archive",
      chatStatus: "readonly",
      radarVisibility: "attenuated",
      publicAlbumsVisible: true,
      privateVaultRevoked: true,
      appliedAt: "2026-09-21",
    };

    render(<BoundaryManagerModal profileId="target-1" onClose={mockOnClose} />);

    expect(screen.getByText(/Protocolo Activo: Cierre Respetuoso/i)).toBeInTheDocument();
    expect(screen.getByText(/Chat: Solo Lectura • Radar: Atenuado/i)).toBeInTheDocument();
    expect(screen.queryByText("POLITE_ARCHIVE")).not.toBeInTheDocument();
    expect(screen.queryByText("readonly")).not.toBeInTheDocument();
  });

  it("al presionar el botón de aplicar protocolo, invoca applyBoundaryProtocol con el preset seleccionado", () => {
    render(<BoundaryManagerModal profileId="target-1" onClose={mockOnClose} />);

    const applyBtn = screen.getByRole("button", { name: /Aplicar Protocolo de Cierre/i });
    fireEvent.click(applyBtn);

    expect(mockApplyBoundaryProtocol).toHaveBeenCalledWith(
      "target-1",
      expect.objectContaining({
        protocol: "polite_archive",
        chatStatus: "readonly",
        radarVisibility: "attenuated",
      })
    );
  });
});

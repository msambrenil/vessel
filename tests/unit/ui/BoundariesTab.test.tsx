import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoundariesTab } from "@/components/account/tabs/BoundariesTab";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockRemoveBoundaryProtocol = vi.fn();
const mockUseVessel = vi.fn();

vi.mock("@/context/VesselContext", () => {
  const mockFn = () => mockUseVessel();
  return {
    useVessel: mockFn,
    useAuth: mockFn,
    useSettings: mockFn,
    useRadarMatrix: mockFn,
    useChat: mockFn,
    useLogistics: mockFn,
    useDiary: mockFn,
    useSafety: mockFn,
  };
});

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playVesselCrescendoAlert: vi.fn(),
    playSignalSent: vi.fn(),
    triggerTacticalPulse: vi.fn(),
  },
}));

vi.mock("@/components/account/LocationPrivacySection", () => ({
  LocationPrivacySection: () => <div data-testid="location-privacy-section">Location Privacy Mock</div>,
}));

vi.mock("@/components/chat/BoundaryManagerModal", () => ({
  BoundaryManagerModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="boundary-modal">
      <button onClick={onClose}>Cerrar</button>
    </div>
  ),
}));

describe("BoundariesTab — Bento Hub (Separación de Identidad vs Ajustes)", () => {
  const baseVesselState = {
    boundaries: {
      "user-1": {
        protocol: "polite_archive",
        chatStatus: "muted",
        publicAlbumsVisible: false,
      },
    },
    removeBoundaryProtocol: mockRemoveBoundaryProtocol,
    profiles: [
      {
        id: "user-1",
        codename: "GABRIEL_X",
        avatarUrl: "https://example.com/gabriel.jpg",
      },
    ],
    language: "es",
    t: TRANSLATIONS.es,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVessel.mockReturnValue(baseVesselState);
  });

  it("renderiza la sección de Privacidad de Ubicación y Límites sin duplicar ajustes de sistema", () => {
    render(<BoundariesTab />);

    expect(screen.getByTestId("location-privacy-section")).toBeInTheDocument();
    expect(screen.getByText(/LÍMITES Y DESPEDIDA SIN DRAMA/i)).toBeInTheDocument();

    // Aislamiento REQ-1: Los ajustes de sistema no deben existir aquí
    expect(screen.queryByText(/CUENTA & SESIÓN OPERATIVA/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/EXPERIENCIA SENSORIAL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ALMACENAMIENTO & SINCRONIZACIÓN/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MEMORIA LOCAL & PURGA/i)).not.toBeInTheDocument();
  });

  it("muestra conexiones limitadas activas y permite restaurar la conexión", () => {
    render(<BoundariesTab />);

    expect(screen.getByText("GABRIEL_X")).toBeInTheDocument();
    expect(screen.getByText(/CIERRE RESPETUOSO/i)).toBeInTheDocument();

    const restoreBtn = screen.getByRole("button", { name: /restaurar conexión completa/i });
    fireEvent.click(restoreBtn);

    expect(mockRemoveBoundaryProtocol).toHaveBeenCalledWith("user-1");
  });

  it("permite abrir el modal de edición de límites granulares", () => {
    render(<BoundariesTab />);

    const editBtn = screen.getByRole("button", { name: /editar límites de esta conexión/i });
    fireEvent.click(editBtn);

    expect(screen.getByTestId("boundary-modal")).toBeInTheDocument();
  });

  it("muestra estado vacío amigable cuando no hay límites configurados", () => {
    mockUseVessel.mockReturnValue({
      ...baseVesselState,
      boundaries: {},
    });

    render(<BoundariesTab />);

    expect(screen.getByText(/No tenés conexiones limitadas activas/i)).toBeInTheDocument();
  });
});

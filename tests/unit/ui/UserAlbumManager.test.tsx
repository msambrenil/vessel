import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserAlbumManager } from "@/components/account/UserAlbumManager";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockRevokeAlbumAccessGlobally = vi.fn();
const mockUnshareAlbumGlobally = vi.fn();

let mockUserPlan = "free";

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    userAlbums: [
      {
        id: "alb-public-1",
        title: "Sesión Palermo",
        description: "Fotos al aire libre",
        privacy: "public",
        coverUrl: "https://example.com/cover1.jpg",
        photos: [
          { id: "p1", url: "https://example.com/p1.jpg", mediaType: "photo" },
          { id: "p2", url: "https://example.com/p2.jpg", mediaType: "photo" },
        ],
        sharedWithProfileIds: [],
        createdAt: "2026-02-01T12:00:00Z",
      },
      {
        id: "alb-private-1",
        title: "Privadas & Arnés",
        description: "Solo con autorización",
        privacy: "private",
        coverUrl: "https://example.com/cover2.jpg",
        photos: [
          { id: "p3", url: "https://example.com/p3.jpg", mediaType: "photo" },
        ],
        sharedWithProfileIds: ["user-lucas-02"],
        createdAt: "2026-02-05T12:00:00Z",
      },
    ],
    userPlan: mockUserPlan,
    openUnlimitedModal: vi.fn(),
    revokeAlbumAccessGlobally: mockRevokeAlbumAccessGlobally,
    unshareAlbumGlobally: mockUnshareAlbumGlobally,
    getSharedChatIdsForAlbum: () => ["chat-01"],
    language: "es",
    t: TRANSLATIONS.es,
  });
  return {
    FREE_TIER_LIMITS: { maxPublicAlbums: 1, maxPrivateAlbums: 1 },
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

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
  },
}));

describe("UserAlbumManager — Alternativa 1 (Evolución Táctica Integrada)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserPlan = "free";
  });

  it("debe renderizar el título 'Tus Álbumes' sin mención a 'Bóveda'", () => {
    render(<UserAlbumManager />);

    expect(screen.getByText("Tus Álbumes")).toBeInTheDocument();
    expect(screen.queryByText(/bóveda de fotos/i)).not.toBeInTheDocument();
  });

  it("NO debe renderizar el carrusel redundante de foto de portada", () => {
    render(<UserAlbumManager />);

    expect(
      screen.queryByText(/foto principal de portada \(avatar en cards\)/i)
    ).not.toBeInTheDocument();
  });

  it("debe renderizar pestañas segmentadas (SegmentedTabGroup) con 'Todos', 'Públicos' y 'Con Llave'", () => {
    render(<UserAlbumManager />);

    expect(screen.getByText(/Todos \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Públicos \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Con Llave \(1\)/i)).toBeInTheDocument();
  });

  it("debe mostrar los álbumes con sus insignias de privacidad actualizadas ('Público' y 'Con Llave')", () => {
    render(<UserAlbumManager />);

    expect(screen.getByText("Sesión Palermo")).toBeInTheDocument();
    expect(screen.getByText("Privadas & Arnés")).toBeInTheDocument();
    expect(screen.getByText("Público")).toBeInTheDocument();
    expect(screen.getAllByText("Con Llave").length).toBeGreaterThanOrEqual(1);
  });

  it("debe permitir revocar llaves de álbum compartido con BrutalistButton", () => {
    render(<UserAlbumManager />);

    const revokeBtns = screen.getAllByRole("button", { name: /revocar/i });
    expect(revokeBtns.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(revokeBtns[revokeBtns.length - 1]);
    expect(mockRevokeAlbumAccessGlobally).toHaveBeenCalledWith("alb-private-1");
    expect(mockUnshareAlbumGlobally).toHaveBeenCalledWith("alb-private-1");
  });

  it("debe abrir el modal de Crear Álbum (CreateAlbumModal) montado en portal con z-[70] al hacer clic en Nuevo Álbum", () => {
    mockUserPlan = "unlimited";
    render(<UserAlbumManager />);

    const newAlbumBtn = screen.getByRole("button", { name: /nuevo álbum/i });
    fireEvent.click(newAlbumBtn);

    const dialog = screen.getByRole("dialog", { name: /crear nuevo álbum/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass("z-[70]");
  });
});

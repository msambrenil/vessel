import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  generateQrMatrix,
  encodeQuickSharePayload,
  decodeQuickSharePayload,
  buildQuickShareUrl,
  QuickShareQrPayload,
} from "@/lib/qr/tacticalQrEngine";
import { QuickShareQrModal } from "@/components/profile/QuickShareQrModal";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockToggleFavoriteProfile = vi.fn();
const mockSendPulse = vi.fn();
const mockSetSelectedProfile = vi.fn();
const mockSetActiveChatProfileId = vi.fn();
const mockSetActiveView = vi.fn();

let mockCodename = "LUCAS_BA";

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    myProfile: {
      codename: mockCodename,
      age: 28,
      showAge: true,
      role: "Versátil",
      avatarUrl: "https://example.com/lucas.jpg",
      verification: { isVerified: true },
    },
    myFullProfile: {
      id: "user-lucas-01",
      codename: mockCodename,
      age: 28,
      showAge: true,
      role: "Versátil",
    },
    currentUserUid: "user-lucas-01",
    profiles: [],
    favoriteProfileIds: [],
    toggleFavoriteProfile: mockToggleFavoriteProfile,
    transmitSignal: mockSendPulse,
    setSelectedProfile: mockSetSelectedProfile,
    setActiveChatProfileId: mockSetActiveChatProfileId,
    setActiveView: mockSetActiveView,
    language: "es",
    t: TRANSLATIONS.es,
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

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playSubBass: vi.fn(),
    playSignalSent: vi.fn(),
    playError: vi.fn(),
  },
}));

describe("tacticalQrEngine — Motor QR Sin Dependencias", () => {
  it("genera una matriz 29x29 con patrones Finder ISO 7x7 en las 3 esquinas", () => {
    const matrix = generateQrMatrix("https://vessel.app/?v_qr=test");
    expect(matrix.length).toBe(29);
    expect(matrix[0].length).toBe(29);

    // Esquina superior izquierda (0,0) -> borde y centro verdaderos
    expect(matrix[0][0]).toBe(true);
    expect(matrix[3][3]).toBe(true);
    expect(matrix[1][1]).toBe(false);

    // Esquina superior derecha (0, 22)
    expect(matrix[0][22]).toBe(true);
    expect(matrix[3][25]).toBe(true);

    // Esquina inferior izquierda (22, 0)
    expect(matrix[22][0]).toBe(true);
    expect(matrix[25][3]).toBe(true);
  });

  it("codifica y decodifica un QuickShareQrPayload válido tanto por URL como por Código de Fiesta", () => {
    const now = Date.now();
    const payload: QuickShareQrPayload = {
      v: 1,
      uid: "user-party-99",
      codename: "MATEO_PALERMO",
      role: "Activo",
      age: 31,
      verified: true,
      autoPulse: true,
      partyCode: "VSL-9K4M",
      iat: now,
      exp: now + 3600_000,
    };

    const url = buildQuickShareUrl(payload, "https://vessel.app");
    const decodedFromUrl = decodeQuickSharePayload(url, now);
    expect(decodedFromUrl.ok).toBe(true);
    if (decodedFromUrl.ok) {
      expect(decodedFromUrl.payload.uid).toBe("user-party-99");
      expect(decodedFromUrl.payload.codename).toBe("MATEO_PALERMO");
      expect(decodedFromUrl.payload.partyCode).toBe("VSL-9K4M");
    }

    // Decodificación por Código de Fiesta corto
    const decodedFromPartyCode = decodeQuickSharePayload("VSL-9K4M", now);
    expect(decodedFromPartyCode.ok).toBe(true);
  });

  it("rechaza tokens vencidos con error 'expired_token'", () => {
    const now = Date.now();
    const expiredPayload: QuickShareQrPayload = {
      v: 1,
      uid: "user-old",
      codename: "EXPIRED_USER",
      autoPulse: true,
      partyCode: "VSL-2222",
      iat: now - 7200_000,
      exp: now - 1000,
    };
    const token = encodeQuickSharePayload(expiredPayload);
    const res = decodeQuickSharePayload(token, now);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("expired_token");
    }
  });
});

describe("QuickShareQrModal — UI & Flujo de Fiesta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCodename = "LUCAS_BA";
  });

  it("renderiza el QR gigante, el alias @LUCAS_BA, el Código de Fiesta y los switches WCAG", () => {
    render(<QuickShareQrModal isOpen={true} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("@LUCAS_BA")).toBeInTheDocument();
    expect(screen.getByTestId("qr-party-code").textContent).toMatch(/^VSL-[A-Z0-9]{4}$/);

    const brightnessSwitch = screen.getByRole("switch", {
      name: /Brillo Óptico Máximo/i,
    });
    const stealthSwitch = screen.getByRole("switch", {
      name: /Ocultar Rol y Edad en Pantalla/i,
    });

    expect(brightnessSwitch).toHaveAttribute("aria-checked", "false");
    fireEvent.click(brightnessSwitch);
    expect(brightnessSwitch).toHaveAttribute("aria-checked", "true");

    expect(stealthSwitch).toHaveAttribute("aria-checked", "false");
    fireEvent.click(stealthSwitch);
    expect(stealthSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("muestra el Empty State cuando el usuario aún no configuró su Alias ('ANON')", () => {
    mockCodename = "ANON";
    render(<QuickShareQrModal isOpen={true} />);

    expect(
      screen.getByText(/Completá tu Alias antes de compartir/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Configurar Mi Alias/i })
    ).toBeInTheDocument();
  });

  it("permite previsualizar el escaneo y muestra la tarjeta de contacto capturado", () => {
    render(<QuickShareQrModal isOpen={true} />);

    const simulateBtn = screen.getByRole("button", {
      name: /Probar cómo me ven al escanear/i,
    });
    fireEvent.click(simulateBtn);

    expect(screen.getByTestId("qr-connected-card")).toBeInTheDocument();
    expect(
      screen.getByText(/¡Contacto Capturado con Éxito!/i)
    ).toBeInTheDocument();
  });
});

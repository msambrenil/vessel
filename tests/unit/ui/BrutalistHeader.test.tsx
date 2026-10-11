import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistHeader } from "@/components/brand/BrutalistHeader";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockOpenAuthModal = vi.fn();
const mockOpenUnlimitedModal = vi.fn();
const mockOpenHarmReductionModal = vi.fn();
const mockOpenAppSettingsModal = vi.fn();
const mockSetActiveView = vi.fn();
const mockSetActiveChatProfileId = vi.fn();
const mockUpdateAppSettings = vi.fn();
const mockStartOnTheClock = vi.fn();
const mockStopOnTheClock = vi.fn();

const mockAudioEngine = vi.hoisted(() => ({
  playPulse: vi.fn(),
  triggerTacticalPulse: vi.fn(),
  playSubBass: vi.fn(),
  getIsAudioUnlocked: vi.fn(() => true),
  subscribeAudioUnlocked: vi.fn(() => () => {}),
  unlockAudioOnUserGesture: vi.fn(async () => {}),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

let mockIsAuthenticated = false;
let mockUserPlan = "free";
let mockActiveRendezvous: { profileId: string; profileCodename: string } | null = null;
let mockHarmReductionSession: { isActive: boolean } | null = null;
let mockOnTheClock: {
  isActive: boolean;
  durationMinutes: number;
  startedAt: string | null;
  expiresAt: string | null;
} = {
  isActive: false,
  durationMinutes: 60,
  startedAt: null,
  expiresAt: null,
};

vi.mock("@/context/VesselContext", () => {
  const getMockState = () => ({
    activeRendezvous: mockActiveRendezvous,
    setActiveChatProfileId: mockSetActiveChatProfileId,
    myProfile: {
      codename: "ALEX_TACTICAL",
      verification: { isVerified: false },
    },
    openAuthModal: mockOpenAuthModal,
    setActiveView: mockSetActiveView,
    authUser: mockIsAuthenticated ? { email: "alex@vessel.app", uid: "user-123" } : null,
    isAuthenticated: mockIsAuthenticated,
    userPlan: mockUserPlan,
    openUnlimitedModal: mockOpenUnlimitedModal,
    harmReductionSession: mockHarmReductionSession,
    openHarmReductionModal: mockOpenHarmReductionModal,
    openAppSettingsModal: mockOpenAppSettingsModal,
    appSettings: { soundEnabled: true },
    updateAppSettings: mockUpdateAppSettings,
    myOnTheClock: mockOnTheClock,
    startOnTheClock: mockStartOnTheClock,
    stopOnTheClock: mockStopOnTheClock,
    language: "es",
    t: TRANSLATIONS.es,
  });

  return {
    useVessel: getMockState,
    useSettings: getMockState,
    useAuth: getMockState,
    useSafety: getMockState,
    useRadarMatrix: getMockState,
    useChat: getMockState,
    useLogistics: getMockState,
    useDiary: getMockState,
  };
});

describe("BrutalistHeader — Cabecera Táctica Zen (Fase 2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
    mockUserPlan = "free";
    mockActiveRendezvous = null;
    mockHarmReductionSession = null;
    mockOnTheClock = {
      isActive: false,
      durationMinutes: 60,
      startedAt: null,
      expiresAt: null,
    };
  });

  it("renderiza la marca VESSEL y la cápsula unificada de usuario de 44px", () => {
    render(<BrutalistHeader />);

    expect(screen.getByTitle(/VESSEL · Matriz & Radar/i)).toBeInTheDocument();
    expect(screen.getByTestId("header-user-menu-btn")).toBeInTheDocument();
    expect(screen.getByText(/Invitado/i)).toBeInTheDocument();
  });

  it("mantiene la zona central limpia cuando no hay emergencias activas", () => {
    render(<BrutalistHeader />);

    expect(screen.queryByText(/UBICACIÓN ACTIVA/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SESIÓN ACTIVA/i)).not.toBeInTheDocument();
  });

  it("al hacer clic en el botón de usuario, despliega el menú táctico con las 5 opciones", () => {
    render(<BrutalistHeader />);

    const menuBtn = screen.getByTestId("header-user-menu-btn");
    fireEvent.click(menuBtn);

    expect(screen.getByTestId("header-tactical-menu")).toBeInTheDocument();
    expect(screen.getByText(/Audio Sub-Bass/i)).toBeInTheDocument();
    expect(screen.getByText(/Mi Pase QR de Fiesta/i)).toBeInTheDocument();
    expect(screen.getByText(/Verificar Identidad 3D/i)).toBeInTheDocument();
    expect(screen.getByText(/Mejorar a Unlimited/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingresar con mi Cuenta/i)).toBeInTheDocument();
  });

  it("permite abrir el modal de verificación 3D desde el menú táctico", () => {
    render(<BrutalistHeader />);

    fireEvent.click(screen.getByTestId("header-user-menu-btn"));
    const verifyItem = screen.getByText(/Verificar Identidad 3D/i);
    fireEvent.click(verifyItem);

    expect(mockOpenAuthModal).toHaveBeenCalledWith("verify");
    expect(screen.queryByTestId("header-tactical-menu")).not.toBeInTheDocument();
  });

  it("permite abrir el modal de VESSEL UNLIMITED desde el menú táctico", () => {
    render(<BrutalistHeader />);

    fireEvent.click(screen.getByTestId("header-user-menu-btn"));
    const unlimitedItem = screen.getByText(/Mejorar a Unlimited/i);
    fireEvent.click(unlimitedItem);

    expect(mockOpenUnlimitedModal).toHaveBeenCalled();
    expect(screen.queryByTestId("header-tactical-menu")).not.toBeInTheDocument();
  });

  it("permite activar el disparador Estoy listo (On The Clock) directamente desde el header", () => {
    render(<BrutalistHeader />);

    const readyBtn = screen.getByTitle("Activar disponibilidad inmediata (1 hora)");
    fireEvent.click(readyBtn);

    expect(mockStartOnTheClock).toHaveBeenCalledWith(60, "Disponible ahora");
  });

  it("permite desactivar LISTO desde el header cuando está activo", () => {
    mockOnTheClock = {
      isActive: true,
      durationMinutes: 60,
      startedAt: "2026-10-04T12:00:00Z",
      expiresAt: "2026-10-04T13:00:00Z",
    };

    render(<BrutalistHeader />);

    const readyBtn = screen.getByTitle(/Listo ahora activo/i);
    fireEvent.click(readyBtn);

    expect(mockStopOnTheClock).toHaveBeenCalled();
  });

  it("debe renderizar los bloques de Beta Tester Lab y Versión de Prueba en el menú táctico", () => {
    render(<BrutalistHeader />);

    const userMenuBtn = screen.getByTestId("header-user-menu-btn");
    fireEvent.click(userMenuBtn);

    expect(screen.getByTestId("beta-tester-lab-section")).toBeInTheDocument();
    expect(screen.getByTestId("test-environment-section")).toBeInTheDocument();
    expect(screen.getByText(/VERSIÓN DE PRUEBA/i)).toBeInTheDocument();
  });
});

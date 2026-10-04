import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistHeader } from "@/components/brand/BrutalistHeader";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockOpenAuthModal = vi.fn();
const mockOpenUnlimitedModal = vi.fn();
const mockOpenHarmReductionModal = vi.fn();
const mockSetActiveView = vi.fn();
const mockSetActiveChatProfileId = vi.fn();
const mockUpdateAppSettings = vi.fn();

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
let mockSafetyBeacon: { isActive: boolean } | null = null;
let mockActiveRendezvous: { profileId: string; profileCodename: string } | null = null;
let mockHarmReductionSession: { isActive: boolean } | null = null;

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
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
    safetyBeacon: mockSafetyBeacon,
    harmReductionSession: mockHarmReductionSession,
    openHarmReductionModal: mockOpenHarmReductionModal,
    appSettings: { soundEnabled: true },
    updateAppSettings: mockUpdateAppSettings,
    t: TRANSLATIONS.es,
  }),
}));

describe("BrutalistHeader — Cabecera Táctica Zen (Fase 2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
    mockUserPlan = "free";
    mockSafetyBeacon = null;
    mockActiveRendezvous = null;
    mockHarmReductionSession = null;
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
});

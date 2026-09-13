import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/domains/AuthContext";
import {
  saveToStorage,
  removeFromStorage,
  STORAGE_KEYS,
} from "@/lib/storage/localStorageSync";

// Simular el observador de Firebase Auth para controlar el estado del usuario en tests
let mockAuthCallback: ((user: any) => void) | null = null;
const mockLogoutUser = vi.fn();

vi.mock("@/lib/firebase/authService", () => ({
  onAuthChange: vi.fn((cb) => {
    mockAuthCallback = cb;
    return () => {
      mockAuthCallback = null;
    };
  }),
  logoutUser: () => mockLogoutUser(),
  loginWithGoogle: vi.fn(),
  loginWithEmail: vi.fn(),
  registerWithEmail: vi.fn(),
  resetPassword: vi.fn(),
  signInAsGuest: vi.fn(),
  linkGuestWithGoogle: vi.fn(),
  linkGuestWithEmail: vi.fn(),
}));

vi.mock("@/lib/firebase/userDataService", () => ({
  saveFullUserDataToCloud: vi.fn(),
  subscribeToFullUserData: vi.fn(() => () => {}),
}));

const mockCleanupUserSessionData = vi.fn();
vi.mock("@/context/domains/SettingsContext", () => ({
  useSettings: () => ({
    language: "es",
    appMode: "test",
    cleanupUserSessionData: mockCleanupUserSessionData,
  }),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playVaultUnlock: vi.fn(),
    playSignalSent: vi.fn(),
    playStateSwitch: vi.fn(),
    playSubBass: vi.fn(),
  },
}));

describe("AuthSessionLogout — Coherencia Absoluta de Cierre de Sesión & Anti-Resurrección", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    mockAuthCallback = null;
  });

  it("debe iniciar en estado Invitado / Deslogueado (isAuthenticated=false, isAnonymous=true) si no hay usuario", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Firebase emite usuario nulo (no autenticado)
    act(() => {
      if (mockAuthCallback) {
        mockAuthCallback(null);
      }
    });

    expect(result.current.authUser).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAnonymous).toBe(true);
    expect(result.current.myProfile.verification.isVerified).toBe(false);
    expect(result.current.myProfile.verification.badgeLabel).toBe("NO VERIFICADO");
  });

  it("debe pasar a isAuthenticated=true y isAnonymous=false cuando Firebase emite usuario con cuenta", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const mockUser = {
      uid: "user-real-999",
      email: "test@vessel.app",
      displayName: "ALEX",
      isAnonymous: false,
      providerData: [{ providerId: "google.com" }],
    };

    act(() => {
      if (mockAuthCallback) {
        mockAuthCallback(mockUser);
      }
    });

    expect(result.current.authUser).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAnonymous).toBe(false);
    expect(result.current.currentUserUid).toBe("user-real-999");
  });

  it("debe mantener isAnonymous=true e isAuthenticated=false si la sesión es temporal de invitado (guest)", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const guestUser = {
      uid: "guest-anon-456",
      isAnonymous: true,
      providerData: [],
    };

    act(() => {
      if (mockAuthCallback) {
        mockAuthCallback(guestUser);
      }
    });

    expect(result.current.authUser).toEqual(guestUser);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAnonymous).toBe(true);
  });

  it("debe cerrar sesión limpiando memoria, llamando a cleanupUserSessionData y purgando storage", async () => {
    // 1. Sembrar datos de sesión en storage
    saveToStorage(STORAGE_KEYS.PROFILE, { codename: "ALEX_ACTIVE", verification: { isVerified: true } }, "test");
    saveToStorage(STORAGE_KEYS.PROFILE, { codename: "ALEX_ACTIVE" }); // Clave un-scoped

    const { result } = renderHook(() => useAuth(), { wrapper });

    const mockUser = {
      uid: "user-real-999",
      email: "alex@vessel.app",
      isAnonymous: false,
    };

    act(() => {
      if (mockAuthCallback) {
        mockAuthCallback(mockUser);
      }
    });

    expect(result.current.isAuthenticated).toBe(true);

    // 2. Ejecutar logout
    await act(async () => {
      await result.current.logout();
    });

    // Validar que se llamó al servicio de Firebase
    expect(mockLogoutUser).toHaveBeenCalledTimes(1);

    // Validar reseteo reactivo en memoria
    expect(result.current.authUser).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAnonymous).toBe(true);
    expect(result.current.currentUserUid).toBe("local-user");
    expect(result.current.myProfile.verification.isVerified).toBe(false);

    // Validar que se limpiaron datos en SettingsContext
    expect(mockCleanupUserSessionData).toHaveBeenCalledTimes(1);

    // Validar purga total de localStorage (tanto scoped como no prefijada)
    expect(window.localStorage.getItem("test_vessel_user_profile_v1")).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.PROFILE)).toBeNull();
  });

  it("debe permanecer en modo Invitado sin resucitar perfil previo tras un reload", async () => {
    // 1. Guardar y luego desloguear
    saveToStorage(STORAGE_KEYS.PROFILE, { codename: "OLD_USER" }, "test");
    removeFromStorage(STORAGE_KEYS.PROFILE, "test");

    // 2. Montar AuthProvider simulando recarga de página sin sesión en Firebase
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      if (mockAuthCallback) {
        mockAuthCallback(null);
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAnonymous).toBe(true);
    // No debe tener el codename viejo
    expect(result.current.myProfile.codename).not.toBe("OLD_USER");
    expect(result.current.myProfile.verification.isVerified).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IdentityVerificationModal } from "@/components/auth/IdentityVerificationModal";

const mockLoginWithGoogle = vi.fn();
const mockLinkAccountWithGoogle = vi.fn();
const mockOpenAuthModal = vi.fn();
const mockVerifyIdentity = vi.fn();

vi.mock("@/context/VesselContext", () => ({
  useVessel: () => ({
    verifyIdentity: mockVerifyIdentity,
    myProfile: { codename: "TEST_USER", verification: { isVerified: false } },
    currentUserUid: "unauthenticated",
    loginWithGoogle: mockLoginWithGoogle,
    linkAccountWithGoogle: mockLinkAccountWithGoogle,
    isAnonymous: false,
    openAuthModal: mockOpenAuthModal,
    t: {
      auth: {
        modalTitle: "VERIFICACIÓN DE IDENTIDAD DIGITAL",
        modalSub: "Protocolo Anti-Bot",
        step1: "1. OAuth",
        step2: "2. Biometría",
        step3: "3. Privacidad",
        step4: "4. Credencial",
        fogOptionTitle: "Modo Niebla",
        fogOptionDesc: "Difuminar rostro",
      },
    },
  }),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: {
    playPulse: vi.fn(),
    playVaultUnlock: vi.fn(),
    playSignalSent: vi.fn(),
    playSubBass: vi.fn(),
  },
}));

vi.mock("@/lib/firebase/identityDeduplicationService", () => ({
  registerUniqueIdentity: vi.fn().mockResolvedValue({ isUnique: true }),
}));

describe("IdentityVerificationModal — Flujo Limpio de Verificación Google y Liveness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe mostrar Continuar con Google y Verificación Directa Liveness", () => {
    render(<IdentityVerificationModal onClose={vi.fn()} />);

    expect(screen.getByText(/Continuar con Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Verificación Directa VESSEL Liveness/i)).toBeInTheDocument();
  });

  it("NO debe mostrar opciones obsoletas de 𝕏 (Twitter) ni Instagram", () => {
    render(<IdentityVerificationModal onClose={vi.fn()} />);

    expect(screen.queryByText(/Continuar con 𝕏/i)).toBeNull();
    expect(screen.queryByText(/Twitter/i)).toBeNull();
    expect(screen.queryByText(/Instagram/i)).toBeNull();
  });

  it("debe invocar loginWithGoogle al pulsar Continuar con Google", async () => {
    mockLoginWithGoogle.mockResolvedValueOnce({
      success: true,
      user: { uid: "google-123", displayName: "Google User", photoURL: "https://photo.test" },
    });

    render(<IdentityVerificationModal onClose={vi.fn()} />);

    const googleBtn = screen.getByRole("button", { name: /Continuar con Google/i });
    fireEvent.click(googleBtn);

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByText(/Identidad Visual & Privacidad/i)).toBeInTheDocument();
    });
  });

  it("debe abrir el modal de login de email al hacer clic en el enlace alternativo", () => {
    const handleClose = vi.fn();
    render(<IdentityVerificationModal onClose={handleClose} />);

    const emailLink = screen.getByText(/Iniciar Sesión \/ Registrarse/i);
    fireEvent.click(emailLink);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockOpenAuthModal).toHaveBeenCalledWith("login");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileCard } from "@/components/matrix/ProfileCard";
import { VesselProfile } from "@/types/vessel";
import { TRANSLATIONS } from "@/lib/i18n/translations";
import { MOCK_PROFILES } from "@/data/mockProfiles";

// Mock de VesselContext hooks usados por ProfileCard
vi.mock("@/context/VesselContext", () => ({
  useRadarMatrix: () => ({
    transmissions: {},
    transmitSignal: vi.fn(),
    getMutualKinkMatches: vi.fn().mockReturnValue([]),
    hasMutualPulse: vi.fn().mockReturnValue(false),
  }),
  useChat: () => ({
    getBoundaryForProfile: vi.fn().mockReturnValue(null),
  }),
  useDiary: () => ({
    getProfileDossier: vi.fn().mockReturnValue(null),
  }),
  useSettings: () => ({
    t: TRANSLATIONS.es,
    language: "es",
    isUnlimited: false,
    openUnlimitedModal: vi.fn(),
  }),
}));

const createMockProfile = (overrides?: Partial<VesselProfile>): VesselProfile => ({
  ...MOCK_PROFILES[0],
  id: "vessel-distant-01",
  codename: "Nox",
  role: "Versatile",
  age: 28,
  showAge: true,
  distanceMeters: 1400,
  bodyState: "open",
  isCurrentUser: false,
  onTheClock: undefined,
  discretizedDistance: {
    rawMeters: 1400,
    displayLabel: "~1.4km",
    rangeCategory: "1.2-2.5km",
    isObfuscated: true,
  },
  ...overrides,
});

describe("ProfileCard — Píldora de Telemetría Táctica & Ausencia de Colisión", () => {
  const mockOnSelect = vi.fn();
  const mockOnOpenChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("en perfiles lejanos (>1km), no debe renderizar badge en top-left para evitar colisión", () => {
    const distantProfile = createMockProfile({ distanceMeters: 1500 });
    const { container } = render(
      <ProfileCard
        profile={distantProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    // El badge flotante top-left ya no debe existir (eliminando la colisión con la píldora derecha)
    const topLeftBadge = container.querySelector(".absolute.top-2.left-2");
    expect(topLeftBadge).toBeNull();
  });

  it("en perfiles lejanos (>1km), debe unificar la señal remota en la píldora superior derecha con tag REMOTO y satélite", () => {
    const distantProfile = createMockProfile({ distanceMeters: 1500 });
    render(
      <ProfileCard
        profile={distantProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    // Debe mostrar la píldora con REMOTO y la distancia
    expect(screen.getByText("REMOTO")).toBeInTheDocument();
    expect(screen.getByText("~1.4km")).toBeInTheDocument();
  });

  it("al presionar la foto o cuerpo de la card, abre la página del perfil completo llamando a onSelect", () => {
    const distantProfile = createMockProfile({ distanceMeters: 1500, bodyState: "open" });
    render(
      <ProfileCard
        profile={distantProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    const baseButton = screen.getByRole("button", { name: /ver perfil de nox/i });
    fireEvent.click(baseButton);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(distantProfile);
  });

  it("al presionar la píldora de la distancia, no debe pasar nada (no abre perfil ni modales)", () => {
    const distantProfile = createMockProfile({ distanceMeters: 1500 });
    render(
      <ProfileCard
        profile={distantProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    const distancePill = screen.getByTestId("distance-telemetry-pill");
    fireEvent.click(distancePill);

    expect(mockOnSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("en perfiles cercanos (<=1km), muestra la distancia en la píldora sin tag REMOTO y sin acción al clic", () => {
    const localProfile = createMockProfile({
      distanceMeters: 250,
      discretizedDistance: {
        rawMeters: 250,
        displayLabel: "250m",
        rangeCategory: "150-300m",
        isObfuscated: true,
      },
    });
    render(
      <ProfileCard
        profile={localProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    expect(screen.queryByText("REMOTO")).toBeNull();
    expect(screen.getByText("250m")).toBeInTheDocument();

    const distancePill = screen.getByTestId("distance-telemetry-pill");
    fireEvent.click(distancePill);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("renderiza el borde animado neón fucsia (border beam) en perfiles con membresía activa (userPlan: unlimited)", () => {
    const paidProfile = createMockProfile({
      userPlan: "unlimited",
      isUnlimited: true,
    });
    const { container } = render(
      <ProfileCard
        profile={paidProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    const borderBeam = screen.getByTestId("neon-fuchsia-border-beam");
    expect(borderBeam).toBeInTheDocument();
    expect(borderBeam).toHaveClass("border-beam-fuchsia");

    const card = container.querySelector(".group.relative");
    expect(card?.className).toContain("border-fuchsia-500/50");
  });

  it("no renderiza el borde neón fucsia en perfiles estándar sin membresía paga", () => {
    const freeProfile = createMockProfile({
      userPlan: "free",
      isUnlimited: false,
    });
    render(
      <ProfileCard
        profile={freeProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    expect(screen.queryByTestId("neon-fuchsia-border-beam")).toBeNull();
  });

  it("aplica el gradiente oscuro inferior calibrado al 46% para proteger legibilidad sin oscurecer la parte superior", () => {
    const { container } = render(
      <ProfileCard
        profile={createMockProfile()}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    const gradient = container.querySelector(".h-\\[46\\%\\].bg-gradient-to-t");
    expect(gradient).not.toBeNull();
    expect(gradient?.className).toContain("from-black");
    expect(gradient?.className).toContain("to-transparent");
  });

  it("no renderiza la píldora de protocolo ni abre la ventana modal del protocolo", () => {
    const fullProfile = createMockProfile({
      verification: {
        isVerified: true,
        method: "biometric_3d",
        hasFacialPrivacy: false,
        badgeLabel: "ID VERIFIED // BIO",
        trustScore: 100,
      },
      exitProtocol: "fast_encounter",
    });
    render(
      <ProfileCard
        profile={fullProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    expect(screen.queryByText("PUNTUAL")).toBeNull();
    expect(screen.queryByRole("dialog", { name: /dossier táctico/i })).toBeNull();
  });
});


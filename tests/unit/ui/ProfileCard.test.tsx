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

  it("al presionar la píldora superior, debe abrir el popover de telemetría con explicación detallada", () => {
    const distantProfile = createMockProfile({ distanceMeters: 1500, bodyState: "open" });
    render(
      <ProfileCard
        profile={distantProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    // Presionar la píldora superior derecha (aria-label="Telemetría & Radar")
    const telemetryButton = screen.getByRole("button", { name: /telemetría & radar/i });
    fireEvent.click(telemetryButton);

    // Debe mostrar el popover de telemetría
    expect(screen.getByText(/telemetría & radar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/activo/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/discretización google s2/i)).toBeInTheDocument();
    expect(screen.getByText(/señal remota \(> 1.0 km\)/i)).toBeInTheDocument();
  });

  it("al presionar el botón cerrar del popover de telemetría, debe cerrarse", () => {
    const distantProfile = createMockProfile({ distanceMeters: 1500 });
    render(
      <ProfileCard
        profile={distantProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    // Abrir popover
    const telemetryButton = screen.getByRole("button", { name: /telemetría & radar/i });
    fireEvent.click(telemetryButton);
    expect(screen.getByText(/telemetría & radar/i)).toBeInTheDocument();

    // Cerrar popover (botón ✕ Cerrar)
    const closeBtn = screen.getByRole("button", { name: /cerrar/i });
    fireEvent.click(closeBtn);
    // El popover se cierra, la descripción de estado corporal ya no está
    expect(screen.queryByText(/disponible para encuentro/i)).toBeNull();
  });

  it("en perfiles cercanos (<=1km), muestra la telemetría de radio local", () => {
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

    // No debe decir REMOTO
    expect(screen.queryByText("REMOTO")).toBeNull();
    expect(screen.getByText("250m")).toBeInTheDocument();

    // Abrir popover
    const telemetryButton = screen.getByRole("button", { name: /telemetría & radar/i });
    fireEvent.click(telemetryButton);

    // Debe indicar radio local táctico
    expect(screen.getByText(/radio local táctico/i)).toBeInTheDocument();
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

  it("muestra el chip de verificación por email (MAIL) en la píldora de protocolo", () => {
    const emailVerifiedProfile = createMockProfile({
      verification: {
        isVerified: true,
        method: "email",
        hasFacialPrivacy: false,
        badgeLabel: "ID VERIFIED // EMAIL",
        trustScore: 99,
      },
      exitProtocol: "fast_encounter",
    });
    render(
      <ProfileCard
        profile={emailVerifiedProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    const mailBadge = screen.getByTestId("capsule-verification-mail");
    expect(mailBadge).toBeInTheDocument();
    expect(mailBadge).toHaveTextContent("MAIL");
    expect(screen.getByText("PUNTUAL")).toBeInTheDocument();
  });

  it("muestra el chip de verificación por SMS en la píldora de protocolo", () => {
    const smsVerifiedProfile = createMockProfile({
      verification: {
        isVerified: true,
        method: "phone_sms",
        hasFacialPrivacy: false,
        badgeLabel: "ID VERIFIED // SMS",
        trustScore: 99,
      },
    });
    render(
      <ProfileCard
        profile={smsVerifiedProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    const smsBadge = screen.getByTestId("capsule-verification-sms");
    expect(smsBadge).toBeInTheDocument();
    expect(smsBadge).toHaveTextContent("SMS");
  });

  it("cuando un perfil tiene protocolo, verificación y múltiples indicadores, compacta los extras en +N para no desbordar la tarjeta", () => {
    const fullProfile = createMockProfile({
      verification: {
        isVerified: true,
        method: "biometric_3d",
        hasFacialPrivacy: false,
        badgeLabel: "ID VERIFIED // BIO",
        trustScore: 100,
      },
      exitProtocol: "fast_encounter",
      isAntiGhost: true,
      respectScore: 95,
      isFogMode: true,
      audioNote: { duration: "0:05", label: "Nota de voz" },
      privateVault: [],
    });
    render(
      <ProfileCard
        profile={fullProfile}
        onSelect={mockOnSelect}
        onOpenChat={mockOnOpenChat}
      />
    );

    // Debe mostrar protocolo y verificación
    expect(screen.getByText("PUNTUAL")).toBeInTheDocument();
    expect(screen.getByText("BIO")).toBeInTheDocument();

    // Debe mostrar el badge compacto +3 para los indicadores restantes (antiGhost, fog, audio)
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("al presionar la píldora de protocolo, el popover muestra la descripción detallada del protocolo", () => {
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

    // Presionar la píldora de protocolo
    const capsuleButton = screen.getByRole("button", { name: /encuentro puntual/i });
    fireEvent.click(capsuleButton);

    // Debe mostrar la descripción enriquecida en el popover
    expect(screen.getByText(/cita directa y eficiente sin sobremesa prolongada/i)).toBeInTheDocument();
    expect(screen.getByText(/biometría facial 3d/i)).toBeInTheDocument();
  });
});


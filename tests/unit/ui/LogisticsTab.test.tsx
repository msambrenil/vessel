import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LogisticsTab } from "@/components/account/tabs/LogisticsTab";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockUpdateMyHostCard = vi.fn();

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    myHostCard: {
      hasPlace: true,
      livingArrangement: "solo",
      spaceType: "private_apt",
      amenities: {
        showerReady: true,
        cleanTowels: true,
        elevator: false,
        easyParking: false,
        acOrHeating: true,
      },
      pets: "none",
      supplies: {
        condoms: true,
        lube: true,
        poppers: false,
        wipes: true,
      },
      notes: "Timbre 4B",
    },
    updateMyHostCard: mockUpdateMyHostCard,
    myProfile: {
      mobility: "Tengo depto / lugar",
    },
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
  },
}));

vi.mock("@/components/account/tabs/KinksTab", () => ({
  KinksTab: () => <div data-testid="kinks-tab">KinksTab Content</div>,
}));

vi.mock("@/components/profile/ExitProtocolSelector", () => ({
  ExitProtocolSelector: () => <div>ExitProtocolSelector</div>,
}));

vi.mock("@/components/profile/SubstanceAtmosphereSelector", () => ({
  SubstanceAtmosphereSelector: () => <div>SubstanceAtmosphereSelector</div>,
}));

describe("LogisticsTab — Bloque Integrado '¿Cómo es mi casa?' (Sin Modal & Sin Banda Sonora)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar el título '¿CÓMO ES MI CASA?' y tag 'PONGO CASA'", () => {
    render(<LogisticsTab />);

    expect(screen.getByText("¿CÓMO ES MI CASA?")).toBeInTheDocument();
    expect(screen.getByText("PONGO CASA")).toBeInTheDocument();
    expect(
      screen.getByText("Convivencia, comodidades y cosas listas para el encuentro sin vueltas")
    ).toBeInTheDocument();
  });

  it("debe permitir alternar disponibilidad de lugar con BrutalistSwitch", () => {
    render(<LogisticsTab />);

    const switchEl = screen.getByRole("switch", { name: /tengo lugar \/ pongo casa/i });
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("aria-checked", "true");

    fireEvent.click(switchEl);
    expect(mockUpdateMyHostCard).toHaveBeenCalledWith({ hasPlace: false });
  });

  it("debe renderizar opciones de convivencia y disparar actualización al seleccionar", () => {
    render(<LogisticsTab />);

    expect(screen.getByText("¿Con quién vivís?")).toBeInTheDocument();
    const roommatesBtn = screen.getByRole("button", { name: /con compas/i });
    fireEvent.click(roommatesBtn);

    expect(mockUpdateMyHostCard).toHaveBeenCalledWith({ livingArrangement: "roommates" });
  });

  it("debe permitir conmutar comodidades (amenities) directamente in-place", () => {
    render(<LogisticsTab />);

    const showerBtn = screen.getByRole("button", { name: /ducha lista/i });
    expect(showerBtn).toBeInTheDocument();

    fireEvent.click(showerBtn);
    expect(mockUpdateMyHostCard).toHaveBeenCalledWith({
      amenities: expect.objectContaining({ showerReady: false }),
    });
  });

  it("debe permitir conmutar insumos (supplies) in-place", () => {
    render(<LogisticsTab />);

    const poppersBtn = screen.getByRole("button", { name: /poppers/i });
    fireEvent.click(poppersBtn);

    expect(mockUpdateMyHostCard).toHaveBeenCalledWith({
      supplies: expect.objectContaining({ poppers: true }),
    });
  });

  it("NO debe incluir controles de banda sonora ni clima acústico", () => {
    render(<LogisticsTab />);

    expect(screen.queryByText(/banda sonora/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/clima acústico/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/síntesis analógica/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /configurar mi lugar/i })).not.toBeInTheDocument();
  });
});

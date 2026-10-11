import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BioTab } from "@/components/account/tabs/BioTab";
import { KinksTab } from "@/components/account/tabs/KinksTab";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockUpdateMyProfile = vi.fn();
const mockSetKinkPreference = vi.fn();

let mockKinkMatrix: Record<string, string> = {
  armpits: "love",
  musk: "curious",
  jockstrap: "pass",
};

const mockMyProfile = {
  codename: "LUCAS_BA",
  age: 28,
  showAge: true,
  genderIdentity: "Hombre Cis",
  pronouns: "Él",
  genderInterests: ["all" as const],
  role: "Versatile" as const,
  heightCm: 182,
  weightKg: 79,
  yoSoy: "Atlético / Sport" as const,
  mobility: "Tengo depto / lugar" as const,
  hivStatus: "PrEP Negativo" as const,
  twitterHandle: "lucas_ba",
  intentions: ["Ahora mismo (Inmediato)"],
  boundaries: ["Solo sexo seguro con protección"],
  energyVibes: ["fogoso" as const],
};

vi.mock("@/context/VesselContext", () => {
  const mockCtx = () => ({
    myProfile: mockMyProfile,
    myOnTheClock: { isActive: false },
    myKinkMatrix: mockKinkMatrix,
    setKinkPreference: mockSetKinkPreference,
    updateMyProfile: mockUpdateMyProfile,
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
    playSuccess: vi.fn(),
  },
}));

describe("BioTab — Barra Flotante de Guardado Reactivo (Single Source of Truth)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el Alias en modo Single Source of Truth con botón 'Cambiar Alias'", () => {
    render(<BioTab />);
    expect(screen.getByText("@LUCAS_BA")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cambiar alias/i })).toBeInTheDocument();
  });

  it("la barra flotante de guardado no se muestra si no hay cambios (isDirty: false)", () => {
    render(<BioTab />);
    expect(screen.queryByRole("button", { name: /guardar ahora/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /descartar/i })).not.toBeInTheDocument();
  });

  it("la barra flotante ('Guardar cambios' / 'Descartar') se activa automáticamente al modificar un campo (isDirty: true)", () => {
    render(<BioTab />);
    expect(screen.queryByRole("button", { name: /guardar cambios/i })).not.toBeInTheDocument();

    // Modificar usuario de X / Twitter
    const twitterInput = screen.getByDisplayValue("lucas_ba");
    fireEvent.change(twitterInput, { target: { value: "lucas_night" } });

    const saveNowBtn = screen.getByRole("button", { name: /guardar cambios/i });
    const discardBtn = screen.getByRole("button", { name: /descartar/i });
    expect(saveNowBtn).toBeInTheDocument();
    expect(discardBtn).toBeInTheDocument();
    expect(saveNowBtn.className).toContain("shadow-violet-soft");
  });

  it("renderiza el bloque de roles que busca para encuentros con opción de limpiar filtro", () => {
    render(<BioTab />);
    expect(screen.getByText(/roles que buscás para encuentros/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ abierto a todos/i)).toBeInTheDocument();
  });

  it("renderiza el campo de teléfono celular y aísla preferencias de sistema fuera de la ficha", () => {
    render(<BioTab />);
    expect(screen.getByLabelText(/teléfono celular/i)).toBeInTheDocument();
    expect(screen.queryByText(/preferencias de la aplicación/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/idioma de interfaz/i)).not.toBeInTheDocument();
  });

  it("renderiza chips 1-tap de contextura física completa sin dropdown duplicado", () => {
    render(<BioTab />);
    expect(screen.getByText(/contextura física \(1-tap\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🏃 Atlético/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /💪 Grandote/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /⚡ Flaco/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🐻 Oso/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🐺 Peludo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🧔 Maduro/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/contextura general/i)).not.toBeInTheDocument();
  });

  it("renderiza micro-pills con íconos para roles, intenciones y fantasías", () => {
    render(<BioTab />);
    expect(screen.getByRole("button", { name: /⚡ Activo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🔄 Versa/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🔥 Coger ya/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🍻 Birra \/ Chill/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /🔥 Al palo/i })).toBeInTheDocument();
  });
});

describe("KinksTab — Colores Semánticos de Fetiches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aplica verde cuando 'Me encanta' está activo", () => {
    render(<KinksTab />);
    // Buscar los botones de amor activos
    const loveBtns = screen.getAllByRole("button", { name: /me encanta/i });
    const activeLoveBtn = loveBtns.find((b) => b.className.includes("bg-emerald-500"));
    expect(activeLoveBtn).toBeDefined();
    expect(activeLoveBtn?.className).toContain("bg-emerald-500");
  });

  it("aplica amarillo cuando 'Curioso' o 'Curiosidad' está activo", () => {
    render(<KinksTab />);
    const curiousBtns = screen.getAllByRole("button", { name: /curiosi/i });
    const activeCuriousBtn = curiousBtns.find((b) => b.className.includes("bg-amber-400"));
    expect(activeCuriousBtn).toBeDefined();
    expect(activeCuriousBtn?.className).toContain("bg-amber-400");
  });

  it("aplica rojo cuando 'Paso' está activo", () => {
    render(<KinksTab />);
    const passBtns = screen.getAllByRole("button", { name: /paso/i });
    const activePassBtn = passBtns.find((b) => b.className.includes("bg-bloodNeon"));
    expect(activePassBtn).toBeDefined();
    expect(activePassBtn?.className).toContain("bg-bloodNeon");
  });
});

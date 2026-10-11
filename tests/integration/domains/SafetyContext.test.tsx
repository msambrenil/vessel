import { describe, it, expect } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { SafetyProvider, useSafety } from "@/context/domains/SafetyContext";

describe("SafetyContext — Integración de Seguridad y Reducción de Daños", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SafetyProvider>{children}</SafetyProvider>
  );

  it("debe inicializarse con sigilo inactivo, sonido habilitado y sesión de reducción inactiva", () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    expect(result.current.stealthMode).toBe(false);
    expect(result.current.soundEnabled).toBe(true);
    expect(result.current.harmReductionSession.isActive).toBe(false);
    expect(result.current.isHarmReductionModalOpen).toBe(false);
  });

  it("debe alternar el modo sigilo reactivamente", () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    expect(result.current.stealthMode).toBe(false);

    act(() => {
      result.current.toggleStealthMode();
    });
    expect(result.current.stealthMode).toBe(true);

    act(() => {
      result.current.toggleStealthMode();
    });
    expect(result.current.stealthMode).toBe(false);
  });

  it("debe alternar el estado de sonido", () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    expect(result.current.soundEnabled).toBe(true);

    act(() => {
      result.current.toggleSound();
    });
    expect(result.current.soundEnabled).toBe(false);

    act(() => {
      result.current.toggleSound();
    });
    expect(result.current.soundEnabled).toBe(true);
  });

  it("debe abrir y cerrar el modal de reducción de daños", () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    expect(result.current.isHarmReductionModalOpen).toBe(false);

    act(() => {
      result.current.openHarmReductionModal();
    });
    expect(result.current.isHarmReductionModalOpen).toBe(true);

    act(() => {
      result.current.closeHarmReductionModal();
    });
    expect(result.current.isHarmReductionModalOpen).toBe(false);
  });

  it("debe gestionar el ciclo de vida de reducción de daños: iniciar, registrar dosis, agua y finalizar", () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    act(() => {
      result.current.startHarmReductionSession();
    });

    expect(result.current.harmReductionSession.isActive).toBe(true);
    expect(result.current.harmReductionSession.totalWaterCups).toBe(1);
    expect(result.current.harmReductionSession.doses).toHaveLength(0);

    act(() => {
      result.current.logHarmReductionDose("MDMA", "Media pastilla");
    });

    expect(result.current.harmReductionSession.doses).toHaveLength(1);
    expect(result.current.harmReductionSession.doses[0].substanceLabel).toBe("MDMA");

    act(() => {
      result.current.drinkWaterAck();
    });

    expect(result.current.harmReductionSession.totalWaterCups).toBe(2);

    act(() => {
      result.current.endHarmReductionSession();
    });

    expect(result.current.harmReductionSession.isActive).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { SafetyProvider, useSafety } from "@/context/domains/SafetyContext";

describe("SafetyContext — Integración del Guardián Silencioso & Dead-Man Switch", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SafetyProvider>{children}</SafetyProvider>
  );

  it("debe inicializarse con el Guardián desarmado y pantalla de cobertura inactiva", () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    expect(result.current.safetyBeacon.isActive).toBe(false);
    expect(result.current.safetyBeacon.isAlarmTriggered).toBe(false);
    expect(result.current.isSafetyBeaconModalOpen).toBe(false);
    expect(result.current.isCoverScreenActive).toBe(false);
  });

  it("debe armar el Guardián Silencioso con PIN de desactivación hasheado", async () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    await act(async () => {
      result.current.startSafetyBeacon({
        durationMinutes: 45,
        emergencyName: "Alejandro",
        emergencyPhone: "+5491100001111",
        locationText: "Palermo Soho, Honduras 4800",
        targetCodename: "Vessel-99",
        pinCode: "1234",
        duressCode: "9999",
      });
    });

    expect(result.current.safetyBeacon.isActive).toBe(true);
    expect(result.current.safetyBeacon.durationMinutes).toBe(45);
    expect(result.current.safetyBeacon.emergencyContactName).toBe("Alejandro");
    expect(result.current.safetyBeacon.targetProfileCodename).toBe("Vessel-99");
    expect(result.current.safetyBeacon.isAlarmTriggered).toBe(false);
    // El PIN almacenado debe estar protegido (hasheado con salt o longitud SHA-256)
    expect(result.current.safetyBeacon.pinCode).not.toBe("1234");
    expect(result.current.safetyBeacon.pinCode.length).toBeGreaterThan(10);
  });

  it("debe rechazar la desactivación si se ingresa un PIN erróneo", async () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    await act(async () => {
      result.current.startSafetyBeacon({
        durationMinutes: 30,
        emergencyName: "Contacto",
        emergencyPhone: "123",
        locationText: "Centro",
        targetCodename: "X",
        pinCode: "5678",
      });
    });

    expect(result.current.safetyBeacon.isActive).toBe(true);

    let success = false;
    await act(async () => {
      success = result.current.deactivateSafetyBeacon("0000");
    });

    expect(success).toBe(false);
    // El guardián sigue activo protegiendo al usuario
    expect(result.current.safetyBeacon.isActive).toBe(true);
  });

  it("debe desactivar el Guardián Silencioso exitosamente al ingresar el PIN correcto", async () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    await act(async () => {
      result.current.startSafetyBeacon({
        durationMinutes: 30,
        emergencyName: "Contacto",
        emergencyPhone: "123",
        locationText: "Centro",
        targetCodename: "X",
        pinCode: "4321",
      });
    });

    expect(result.current.safetyBeacon.isActive).toBe(true);

    let success = false;
    await act(async () => {
      success = result.current.deactivateSafetyBeacon("4321");
    });

    expect(success).toBe(true);
    expect(result.current.safetyBeacon.isActive).toBe(false);
  });

  it("debe activar el modo señuelo de pantalla de cobertura ante trigger de coacción (Duress)", async () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    expect(result.current.isCoverScreenActive).toBe(false);

    act(() => {
      result.current.triggerSafetyDuress();
    });

    // Se activa inmediatamente la pantalla de cobertura (camuflaje de notas o calculadora)
    expect(result.current.isCoverScreenActive).toBe(true);
  });

  it("debe extender el temporizador del Guardián Silencioso", async () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    await act(async () => {
      result.current.startSafetyBeacon({
        durationMinutes: 30,
        emergencyName: "Contacto",
        emergencyPhone: "123",
        locationText: "Centro",
        targetCodename: "X",
        pinCode: "1111",
      });
    });

    expect(result.current.safetyBeacon.durationMinutes).toBe(30);

    act(() => {
      result.current.extendSafetyBeacon(15);
    });

    expect(result.current.safetyBeacon.durationMinutes).toBe(45);
  });

  it("debe alternar la pantalla de cobertura con toggleCoverScreen", () => {
    const { result } = renderHook(() => useSafety(), { wrapper });

    expect(result.current.isCoverScreenActive).toBe(false);

    act(() => {
      result.current.toggleCoverScreen();
    });
    expect(result.current.isCoverScreenActive).toBe(true);

    act(() => {
      result.current.toggleCoverScreen();
    });
    expect(result.current.isCoverScreenActive).toBe(false);
  });
});

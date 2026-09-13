import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { LogisticsProvider, useLogistics } from "@/context/domains/LogisticsContext";
import * as hotspotService from "@/lib/firebase/hotspotService";

// Mock de AuthContext para aislar el dominio de Logística
vi.mock("@/context/domains/AuthContext", () => ({
  useAuth: () => ({
    currentUserUid: "user-alpha-001",
    myProfile: {
      codename: "VesselTester",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    },
    myBodyState: "open",
  }),
}));

// Mock de SettingsContext para aislar el dominio de Logística
vi.mock("@/context/domains/SettingsContext", () => ({
  useSettings: () => ({
    language: "es",
    appMode: "test",
  }),
}));

// Mock del servicio de hotspots en Firebase
vi.mock("@/lib/firebase/hotspotService", () => ({
  subscribeToHotspots: vi.fn((_onUpdate) => () => {}),
  checkInHotspotCloud: vi.fn().mockResolvedValue(undefined),
  checkOutHotspotCloud: vi.fn().mockResolvedValue(undefined),
}));

describe("LogisticsHotspots — Integración de Check-in Táctico y Preservación de Estado", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LogisticsProvider>{children}</LogisticsProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe inicializar la lista de hotspots tácticos con valores coherentes", () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });

    expect(result.current.tacticalHotspots.length).toBeGreaterThan(0);
    const firstHotspot = result.current.tacticalHotspots[0];
    expect(firstHotspot).toHaveProperty("id");
    expect(firstHotspot).toHaveProperty("name");
    expect(firstHotspot).toHaveProperty("activeVesselsCount");
    expect(firstHotspot).toHaveProperty("isCheckedIn");
  });

  it("debe realizar check-in optimista: incrementa activeVesselsCount y activa isCheckedIn", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });

    const targetHotspot = result.current.tacticalHotspots[0];
    const initialCount = targetHotspot.activeVesselsCount;
    const targetId = targetHotspot.id;

    await act(async () => {
      result.current.checkInHotspot(targetId);
    });

    const updated = result.current.tacticalHotspots.find((h) => h.id === targetId);
    expect(updated).toBeDefined();
    expect(updated?.isCheckedIn).toBe(true);
    expect(updated?.activeVesselsCount).toBe(initialCount + 1);

    // Debe invocar el servicio de persistencia en la nube
    expect(hotspotService.checkInHotspotCloud).toHaveBeenCalledWith(targetId);
  });

  it("debe realizar check-out seguro: decrementa activeVesselsCount sin bajar de 0 y desactiva isCheckedIn", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });

    const targetId = result.current.tacticalHotspots[0].id;

    // Primero hacemos check-in
    await act(async () => {
      result.current.checkInHotspot(targetId);
    });

    const afterCheckIn = result.current.tacticalHotspots.find((h) => h.id === targetId)!;
    const countBeforeCheckOut = afterCheckIn.activeVesselsCount;

    // Ejecutamos check-out
    await act(async () => {
      result.current.checkOutHotspot(targetId);
    });

    const afterCheckOut = result.current.tacticalHotspots.find((h) => h.id === targetId);
    expect(afterCheckOut?.isCheckedIn).toBe(false);
    expect(afterCheckOut?.activeVesselsCount).toBe(countBeforeCheckOut - 1);

    // Debe invocar el servicio en la nube
    expect(hotspotService.checkOutHotspotCloud).toHaveBeenCalledWith(targetId);
  });

  it("no debe permitir que el contador decrezca por debajo de 0", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });

    const targetId = result.current.tacticalHotspots[0].id;

    // Forzamos checkouts múltiples
    await act(async () => {
      result.current.checkOutHotspot(targetId);
      result.current.checkOutHotspot(targetId);
      result.current.checkOutHotspot(targetId);
      result.current.checkOutHotspot(targetId);
    });

    const updated = result.current.tacticalHotspots.find((h) => h.id === targetId);
    expect(updated?.activeVesselsCount).toBeGreaterThanOrEqual(0);
  });
});

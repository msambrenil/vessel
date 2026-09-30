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
  proposeHotspotCloud: vi.fn().mockResolvedValue(undefined),
  confirmHotspotCloud: vi.fn().mockResolvedValue(undefined),
  rateHotspotCloud: vi.fn().mockResolvedValue(undefined),
  reportHotspotCloud: vi.fn().mockResolvedValue(undefined),
  adminUpdateHotspotStatusCloud: vi.fn().mockResolvedValue(undefined),
  adminDismissReportsCloud: vi.fn().mockResolvedValue(undefined),
  adminDeleteHotspotCloud: vi.fn().mockResolvedValue(undefined),
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

  // --- Tests de Gobernanza Comunitaria & Moderación ---

  it("debe proponer un nuevo hotspot con estado 'proposed' y 1 confirmación inicial del autor", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });

    let created: any;
    await act(async () => {
      created = await result.current.proposeHotspot({
        name: "Parque Centenario - Zona Norte",
        category: "cruising_area",
        address: "Av. Díaz Vélez & Leopoldo Marechal",
        description: "Zona con poca luz cerca del anfiteatro",
        discretionLevel: "high",
        bestHours: "23:00 - 03:00",
      });
    });

    expect(created).toBeDefined();
    expect(created.status).toBe("proposed");
    expect(created.confirmationsCount).toBe(1);
    expect(created.confirmedByUserIds).toContain("user-alpha-001");
    expect(created.creatorUserId).toBe("user-alpha-001");
    expect(created.creatorAlias).toBe("VesselTester");

    // Verificar que está en la lista del estado
    const found = result.current.tacticalHotspots.find((h) => h.id === created.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Parque Centenario - Zona Norte");

    expect(hotspotService.proposeHotspotCloud).toHaveBeenCalled();
  });

  it("debe evitar confirmaciones duplicadas del mismo usuario", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });

    // Proponemos un punto (el usuario ya lo confirmó automáticamente)
    let created: any;
    await act(async () => {
      created = await result.current.proposeHotspot({
        name: "Bosques de Palermo Cruising",
        category: "cruising_area",
      });
    });

    // Intentamos confirmar de nuevo con el mismo usuario
    let confirmRes: any;
    await act(async () => {
      confirmRes = await result.current.confirmHotspot(created.id);
    });

    expect(confirmRes.success).toBe(false);
    expect(confirmRes.alreadyConfirmed).toBe(true);
    expect(confirmRes.activated).toBe(false);
  });

  it("debe calificar un hotspot con estrellas y recalcular el promedio", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });
    
    let created: any;
    await act(async () => {
      created = await result.current.proposeHotspot({ name: "Punto Rating Test" });
    });

    await act(async () => {
      const ok = await result.current.rateHotspot(created.id, 5, ["discreto", "seguro"]);
      expect(ok).toBe(true);
    });

    const updated = result.current.tacticalHotspots.find((h) => h.id === created.id);
    expect(updated?.rating).toBe(5);
    expect(updated?.ratingsCount).toBe(1);
    expect(updated?.ratings?.[0].tags).toContain("discreto");
    expect(hotspotService.rateHotspotCloud).toHaveBeenCalled();

    // Si el mismo usuario recalifica con 3 estrellas, actualiza su nota previa
    await act(async () => {
      await result.current.rateHotspot(created.id, 3, ["iluminado"]);
    });

    const updatedAgain = result.current.tacticalHotspots.find((h) => h.id === created.id);
    expect(updatedAgain?.rating).toBe(3);
    expect(updatedAgain?.ratingsCount).toBe(1);
    expect(updatedAgain?.ratings?.[0].score).toBe(3);
  });

  it("debe rechazar denuncias con comentarios menores a 10 caracteres", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });
    const targetId = result.current.tacticalHotspots[0].id;

    let repRes: any;
    await act(async () => {
      repRes = await result.current.reportHotspot(targetId, "safety_hazard", "corto");
    });

    expect(repRes.success).toBe(false);
    expect(repRes.error).toContain("al menos 10 caracteres");
    expect(hotspotService.reportHotspotCloud).not.toHaveBeenCalled();
  });

  it("debe registrar denuncia válida y transicionar a 'flagged' al acumular reportes", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });
    // Usamos hotspot_06 que tiene 0 reportes o creamos uno nuevo
    let created: any;
    await act(async () => {
      created = await result.current.proposeHotspot({ name: "Punto Test Denuncia" });
    });

    // Reporte 1
    await act(async () => {
      const res = await result.current.reportHotspot(
        created.id,
        "police_raid",
        "Hay patrulleros rondando de forma continua."
      );
      expect(res.success).toBe(true);
    });

    let current = result.current.tacticalHotspots.find((h) => h.id === created.id);
    expect(current?.reportsCount).toBe(1);
    expect(current?.status).toBe("proposed"); // Aún no llega al umbral de 2

    // Reporte 2 -> Debe pasar a "flagged"
    await act(async () => {
      await result.current.reportHotspot(
        created.id,
        "safety_hazard",
        "Pusieron reflectores potentes en toda la zona."
      );
    });

    current = result.current.tacticalHotspots.find((h) => h.id === created.id);
    expect(current?.reportsCount).toBe(2);
    expect(current?.status).toBe("flagged");
    expect(hotspotService.reportHotspotCloud).toHaveBeenCalled();
  });

  it("debe permitir a la administración suspender, restaurar y eliminar hotspots", async () => {
    const { result } = renderHook(() => useLogistics(), { wrapper });
    const targetId = result.current.tacticalHotspots[0].id;

    // 1. Admin suspende
    await act(async () => {
      await result.current.adminUpdateHotspotStatus(targetId, "suspended");
    });
    let h = result.current.tacticalHotspots.find((item) => item.id === targetId);
    expect(h?.status).toBe("suspended");
    expect(hotspotService.adminUpdateHotspotStatusCloud).toHaveBeenCalledWith(targetId, "suspended");

    // 2. Admin desestima reportes y restaura a active
    await act(async () => {
      await result.current.adminDismissReports(targetId);
    });
    h = result.current.tacticalHotspots.find((item) => item.id === targetId);
    expect(h?.status).toBe("active");
    expect(h?.reportsCount).toBe(0);
    expect(h?.reports).toEqual([]);
    expect(hotspotService.adminDismissReportsCloud).toHaveBeenCalledWith(targetId);

    // 3. Admin elimina hotspot
    await act(async () => {
      await result.current.adminDeleteHotspot(targetId);
    });
    h = result.current.tacticalHotspots.find((item) => item.id === targetId);
    expect(h).toBeUndefined();
    expect(hotspotService.adminDeleteHotspotCloud).toHaveBeenCalledWith(targetId);
  });
});

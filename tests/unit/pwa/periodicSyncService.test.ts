import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  registerPeriodicGeoSync,
  unregisterPeriodicGeoSync,
  triggerOneOffSyncFallback,
  VESSEL_PERIODIC_SYNC_TAG,
  VESSEL_ONE_OFF_SYNC_TAG,
} from "@/lib/pwa/periodicSyncService";

describe("periodicSyncService — PWA Periodic Background Sync adaptado a Batería", () => {
  let mockRegister: ReturnType<typeof vi.fn>;
  let mockUnregister: ReturnType<typeof vi.fn>;
  let mockOneOffRegister: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRegister = vi.fn().mockResolvedValue(undefined);
    mockUnregister = vi.fn().mockResolvedValue(undefined);
    mockOneOffRegister = vi.fn().mockResolvedValue(undefined);

    const mockServiceWorker = {
      ready: Promise.resolve({
        periodicSync: {
          register: mockRegister,
          unregister: mockUnregister,
          getTags: vi.fn().mockResolvedValue([]),
        },
        sync: {
          register: mockOneOffRegister,
        },
      }),
    };

    Object.defineProperty(navigator, "serviceWorker", {
      value: mockServiceWorker,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe registrar sincronización periódica a 15 minutos en modo foreground_active con batería normal", async () => {
    const success = await registerPeriodicGeoSync("foreground_active", 85, "open");
    expect(success).toBe(true);
    expect(mockRegister).toHaveBeenCalledWith(VESSEL_PERIODIC_SYNC_TAG, {
      minInterval: 15 * 60 * 1000,
    });
  });

  it("debe espaciar la sincronización a 60 minutos cuando el modo es eco_saver", async () => {
    const success = await registerPeriodicGeoSync("eco_saver", 50, "open");
    expect(success).toBe(true);
    expect(mockRegister).toHaveBeenCalledWith(VESSEL_PERIODIC_SYNC_TAG, {
      minInterval: 60 * 60 * 1000,
    });
  });

  it("debe desregistrar la sincronización automática si la batería es crítica (<= 15%)", async () => {
    const success = await registerPeriodicGeoSync("foreground_active", 10, "open");
    expect(success).toBe(true);
    expect(mockUnregister).toHaveBeenCalledWith(VESSEL_PERIODIC_SYNC_TAG);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("debe desregistrar la sincronización automática si el estado corporal es dormant", async () => {
    const success = await registerPeriodicGeoSync("foreground_active", 90, "dormant");
    expect(success).toBe(true);
    expect(mockUnregister).toHaveBeenCalledWith(VESSEL_PERIODIC_SYNC_TAG);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("debe desregistrar manualmente con unregisterPeriodicGeoSync", async () => {
    const success = await unregisterPeriodicGeoSync();
    expect(success).toBe(true);
    expect(mockUnregister).toHaveBeenCalledWith(VESSEL_PERIODIC_SYNC_TAG);
  });

  it("debe recurrir a One-Off Sync como fallback si periodicSync no está disponible", async () => {
    // Simular navegador sin periodicSync pero con sync
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve({
          sync: {
            register: mockOneOffRegister,
          },
        }),
      },
      configurable: true,
      writable: true,
    });

    const success = await registerPeriodicGeoSync("foreground_active", 80, "open");
    expect(success).toBe(true);
    expect(mockOneOffRegister).toHaveBeenCalledWith(VESSEL_ONE_OFF_SYNC_TAG);
  });

  it("debe disparar triggerOneOffSyncFallback con éxito", async () => {
    const success = await triggerOneOffSyncFallback();
    expect(success).toBe(true);
    expect(mockOneOffRegister).toHaveBeenCalledWith(VESSEL_ONE_OFF_SYNC_TAG);
  });
});

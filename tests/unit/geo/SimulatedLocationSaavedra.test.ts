import { describe, it, expect, beforeEach } from "vitest";
import { SAAVEDRA_620_COORDS } from "@/context/domains/LogisticsContext";
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from "@/lib/storage/localStorageSync";

describe("Ubicación Táctica Saavedra 620 (Río Cuarto) & Control Beta", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("debe tener las coordenadas fijas exactas de Saavedra 620 en Río Cuarto, Córdoba", () => {
    expect(SAAVEDRA_620_COORDS).toEqual({
      lat: -33.1325,
      lng: -64.347,
    });
  });

  it("debe inicializar la ubicación simulada en true por defecto para beta testers", () => {
    const isSimulated = loadFromStorage<boolean>(
      STORAGE_KEYS.BETA_SIMULATED_LOCATION,
      true
    );
    expect(isSimulated).toBe(true);
  });

  it("debe persistir el cambio cuando el tester desactiva la simulación para usar GPS real", () => {
    saveToStorage(STORAGE_KEYS.BETA_SIMULATED_LOCATION, false);
    const isSimulated = loadFromStorage<boolean>(
      STORAGE_KEYS.BETA_SIMULATED_LOCATION,
      true
    );
    expect(isSimulated).toBe(false);
  });

  it("debe permitir reactivar Saavedra 620 guardando el estado en almacenamiento compartido", () => {
    saveToStorage(STORAGE_KEYS.BETA_SIMULATED_LOCATION, false);
    saveToStorage(STORAGE_KEYS.BETA_SIMULATED_LOCATION, true);
    const isSimulated = loadFromStorage<boolean>(
      STORAGE_KEYS.BETA_SIMULATED_LOCATION,
      false
    );
    expect(isSimulated).toBe(true);
  });
});

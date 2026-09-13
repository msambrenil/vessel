import { describe, it, expect, beforeEach } from "vitest";
import {
  BatteryStateEngine,
  INITIAL_BATTERY_STATE,
  BatteryEngineConfig,
} from "@/lib/geo/BatteryStateEngine";

describe("BatteryStateEngine — Motor Adaptativo de Batería y Muestreo de Geoposición", () => {
  let engine: BatteryStateEngine;

  beforeEach(() => {
    engine = new BatteryStateEngine();
  });

  describe("Estado Inicial y Configuración por Defecto", () => {
    it("debe contener valores iniciales seguros para primer plano", () => {
      expect(INITIAL_BATTERY_STATE.mode).toBe("foreground_active");
      expect(INITIAL_BATTERY_STATE.level).toBe(85);
      expect(INITIAL_BATTERY_STATE.isCharging).toBe(false);
      expect(INITIAL_BATTERY_STATE.updateIntervalSeconds).toBe(30);
      expect(INITIAL_BATTERY_STATE.highAccuracyGps).toBe(true);
      expect(INITIAL_BATTERY_STATE.autoEcoActive).toBe(false);
    });

    it("los getters de instancia deben retornar los valores iniciales correctos", () => {
      expect(engine.getBatteryLevel()).toBe(85);
      expect(engine.getIsCharging()).toBe(false);
    });
  });

  describe("resolveEngineState — Transiciones de Estado y Frecuencia de Muestreo", () => {
    const baseConfig: BatteryEngineConfig = {
      isDocumentVisible: true,
      myBodyState: "open",
      manualEcoSaver: false,
      activeView: "grid",
    };

    it("debe resolver a 'foreground_active' en primer plano con batería saludable", () => {
      const state = engine.resolveEngineState(baseConfig);

      expect(state.mode).toBe("foreground_active");
      expect(state.updateIntervalSeconds).toBe(30); // Alta frecuencia GPS
      expect(state.highAccuracyGps).toBe(true);
      expect(state.autoEcoActive).toBe(false);
    });

    it("debe activar 'eco_saver' cuando se solicita manualmente el modo ahorro", () => {
      const state = engine.resolveEngineState({
        ...baseConfig,
        manualEcoSaver: true,
      });

      expect(state.mode).toBe("eco_saver");
      expect(state.updateIntervalSeconds).toBe(300); // 5 minutos (ahorro intensivo)
      expect(state.highAccuracyGps).toBe(false);
    });

    it("debe activar 'passive_geofence' cuando el usuario está en estado 'dormant' (incógnito)", () => {
      const state = engine.resolveEngineState({
        ...baseConfig,
        myBodyState: "dormant",
      });

      expect(state.mode).toBe("passive_geofence");
      expect(state.updateIntervalSeconds).toBe(0); // Cero polling activo, solo cruces de celda Geohash
      expect(state.highAccuracyGps).toBe(false);
    });

    it("debe cambiar a 'background_coarse' cuando la ventana pasa a segundo plano", () => {
      const state = engine.resolveEngineState({
        ...baseConfig,
        isDocumentVisible: false,
      });

      expect(state.mode).toBe("background_coarse");
      expect(state.updateIntervalSeconds).toBe(900); // 15 minutos (triangulación coarse)
      expect(state.highAccuracyGps).toBe(false);
    });

    it("prioridad: manualEcoSaver prevalece sobre background o dormant", () => {
      const state = engine.resolveEngineState({
        isDocumentVisible: false,
        myBodyState: "dormant",
        manualEcoSaver: true,
        activeView: "grid",
      });

      expect(state.mode).toBe("eco_saver");
      expect(state.updateIntervalSeconds).toBe(300);
      expect(state.highAccuracyGps).toBe(false);
    });
  });

  describe("Manejo de Suscripciones", () => {
    it("debe permitir suscribir y desuscribir callbacks sin fallas", () => {
      const callback = () => {};
      const unsubscribe = engine.subscribe(callback);

      expect(typeof unsubscribe).toBe("function");
      // Desuscripción idempotente
      expect(() => unsubscribe()).not.toThrow();
    });
  });
});

import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import {
  PwaRegister,
  canTriggerReload,
  isDevEnvironment,
} from "@/components/pwa/PwaRegister";

describe("VESSEL // PwaRegister & Circuit Breaker", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("canTriggerReload (Circuit Breaker)", () => {
    it("debe permitir la primera recarga y registrar el timestamp en sessionStorage", () => {
      const allowed = canTriggerReload("Test Primera Recarga");
      expect(allowed).toBe(true);

      const raw = sessionStorage.getItem("vessel_pwa_reload_guard");
      expect(raw).toBeTruthy();
      const record = JSON.parse(raw!);
      expect(record.count).toBe(1);
      expect(record.reason).toBe("Test Primera Recarga");
    });

    it("debe bloquear una segunda recarga si ocurre dentro de los 15 segundos (cooldown)", () => {
      const first = canTriggerReload("Primera");
      expect(first).toBe(true);

      // Intento inmediato siguiente
      const second = canTriggerReload("Segunda Inmediata");
      expect(second).toBe(false);
    });

    it("debe bloquear si se superan las 3 recargas por minuto", () => {
      // Simular 3 recargas previas
      const now = Date.now();
      sessionStorage.setItem(
        "vessel_pwa_reload_guard",
        JSON.stringify({
          timestamp: now - 16000, // Pasaron 16s del último
          reason: "Tercera",
          count: 3,
        })
      );

      // Cuarta recarga dentro del minuto
      const fourth = canTriggerReload("Cuarta Recarga");
      expect(fourth).toBe(false);
    });
  });

  describe("isDevEnvironment", () => {
    it("debe detectar localhost como entorno de desarrollo", () => {
      expect(isDevEnvironment()).toBe(true); // happy-dom corre en localhost por defecto
    });
  });

  describe("PwaRegister Component", () => {
    it("no debe registrar service worker en entorno de desarrollo", () => {
      const unregisterMock = vi.fn().mockResolvedValue(true);
      const getRegistrationsMock = vi.fn().mockResolvedValue([{ unregister: unregisterMock }]);

      Object.defineProperty(navigator, "serviceWorker", {
        value: {
          getRegistrations: getRegistrationsMock,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });

      render(<PwaRegister />);

      expect(getRegistrationsMock).toHaveBeenCalled();
    });
  });
});

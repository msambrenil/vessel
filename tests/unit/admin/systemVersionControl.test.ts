import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CURRENT_SYSTEM_VERSION,
  SYSTEM_BUILD_TIMESTAMP,
  SYSTEM_BUILD_FORMATTED,
  SYSTEM_CHANGELOG,
} from "@/lib/version/systemVersion";
import {
  getSystemControlState,
  triggerForceReload,
  triggerForceLogout,
  subscribeToSystemControl,
} from "@/lib/version/systemControlService";
import { StaffMember } from "@/types/admin";
import { getAdminAuditLogs } from "@/lib/admin/adminService";

const mockSuperadmin: StaffMember = {
  id: "staff-super-01",
  name: "Architect Ops",
  email: "admin@vessel.network",
  role: "superadmin",
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  lastLoginAt: "2026-10-06T19:00:00Z",
};

describe("VESSEL // Sistema de Versión y Control Remoto", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe("Constantes de Versión y Changelog Oficial", () => {
    it("debe tener una versión válida semver que comience con 'v'", () => {
      expect(CURRENT_SYSTEM_VERSION).toMatch(/^v\d+\.\d+\.\d+/);
      expect(CURRENT_SYSTEM_VERSION).toBe("v2.5.0");
    });

    it("debe contener la fecha de build en formato ISO y localizado ART", () => {
      expect(SYSTEM_BUILD_TIMESTAMP).toContain("2026");
      expect(SYSTEM_BUILD_FORMATTED).toContain("ART");
    });

    it("debe contener el registro histórico de versiones con la versión actual marcada como isCurrent", () => {
      expect(SYSTEM_CHANGELOG.length).toBeGreaterThan(0);
      const current = SYSTEM_CHANGELOG.find((entry) => entry.isCurrent);
      expect(current).toBeDefined();
      expect(current?.version).toBe(CURRENT_SYSTEM_VERSION);
      expect(current?.changes.length).toBeGreaterThan(3);
    });
  });

  describe("Servicio de Control Maestro (systemControlService)", () => {
    it("debe devolver el estado inicial por defecto si no hay sobreescrituras", async () => {
      const state = await getSystemControlState("test");
      expect(state.currentVersion).toBe(CURRENT_SYSTEM_VERSION);
      expect(state.forceReloadTimestamp).toBe(0);
      expect(state.forceLogoutTimestamp).toBe(0);
    });

    it("debe disparar forzado de recarga, actualizar timestamp y registrar auditoría", async () => {
      const beforeTime = Date.now() - 10;
      const updated = await triggerForceReload(mockSuperadmin, "test");

      expect(updated.forceReloadTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(updated.lastAction).toBe("RELOAD_TRIGGERED");
      expect(updated.lastActionBy).toContain("Architect Ops");

      // Comprobar persistencia
      const state = await getSystemControlState("test");
      expect(state.forceReloadTimestamp).toBe(updated.forceReloadTimestamp);

      // Comprobar log de auditoría
      const logs = getAdminAuditLogs("test");
      const reloadLog = logs.find((l) => l.action === "SYSTEM_FORCE_RELOAD");
      expect(reloadLog).toBeDefined();
      expect(reloadLog?.operatorName).toBe("Architect Ops");
    });

    it("debe disparar forzado de cierre de sesión, actualizar timestamp y registrar auditoría", async () => {
      const beforeTime = Date.now() - 10;
      const updated = await triggerForceLogout(mockSuperadmin, "test");

      expect(updated.forceLogoutTimestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(updated.lastAction).toBe("LOGOUT_TRIGGERED");
      expect(updated.lastActionBy).toContain("Architect Ops");

      // Comprobar log de auditoría
      const logs = getAdminAuditLogs("test");
      const logoutLog = logs.find((l) => l.action === "SYSTEM_FORCE_LOGOUT");
      expect(logoutLog).toBeDefined();
      expect(logoutLog?.operatorName).toBe("Architect Ops");
    });

    it("debe notificar inmediatamente al suscriptor en tiempo real", async () => {
      let notifiedState: any = null;
      const unsub = subscribeToSystemControl((st) => {
        notifiedState = st;
      }, "test");

      await triggerForceReload(mockSuperadmin, "test");
      expect(notifiedState).not.toBeNull();
      expect(notifiedState?.lastAction).toBe("RELOAD_TRIGGERED");

      unsub();
    });
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  checkIsAdminAuthorized,
  getStaffMembers,
  getActiveStaffSession,
  setActiveStaffSession,
  applyUserModeration,
  adjustUserKarma,
  verifyUserProfile,
  toggleUserForcedFogMode,
  changeUserPlan,
  clearUserDuressAlert,
  getAdminAuditLogs,
  logAdminAction,
  getManagedProfiles,
  saveManagedProfiles,
  isTestOrMockProfileId,
  isTestOrMockProfile,
  deleteUserByAdmin,
  recordDeletedUserId,
  isDeletedUserId,
  getDeletedUserIds,
  DEFAULT_STAFF_MEMBERS,
} from "@/lib/admin/adminService";
import { ManagedUserProfile } from "@/types/admin";
import { MOCK_PROFILES } from "@/data/mockProfiles";

describe("adminService — Consola Administrativa & Autorización RBAC", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_ADMIN_EMAILS = "admin@vessel.network,ojitos@vessel.app,msambrenil@gmail.com";
    process.env.ADMIN_MASTER_PASSCODE = "VESSEL-ROOT-2026";
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("checkIsAdminAuthorized", () => {
    it("debe autorizar inmediatamente cuando se provee la clave maestra correcta, incluso sin email", () => {
      const isAuth = checkIsAdminAuthorized(null, "VESSEL-ROOT-2026");
      expect(isAuth).toBe(true);
    });

    it("debe autorizar con clave maestra incluso si el email no está en la lista blanca", () => {
      const isAuth = checkIsAdminAuthorized("usuario.externo@gmail.com", "VESSEL-ROOT-2026");
      expect(isAuth).toBe(true);
    });

    it("debe rechazar un código maestro inválido", () => {
      const isAuth = checkIsAdminAuthorized("usuario.externo@gmail.com", "CLAVE-INCORRECTA");
      expect(isAuth).toBe(false);
    });

    it("debe autorizar a un usuario si su email figura en la lista blanca", () => {
      const isAuth1 = checkIsAdminAuthorized("msambrenil@gmail.com");
      const isAuth2 = checkIsAdminAuthorized("ADMIN@VESSEL.NETWORK ");
      expect(isAuth1).toBe(true);
      expect(isAuth2).toBe(true);
    });

    it("debe rechazar a un usuario cuyo email no figura en la lista blanca y no envía clave maestra", () => {
      const isAuth = checkIsAdminAuthorized("hacker@malicious.com");
      expect(isAuth).toBe(false);
    });
  });

  describe("Staff Management & Sesión de Operador", () => {
    it("debe cargar la lista de staff por defecto en modo de prueba", () => {
      const staff = getStaffMembers("test");
      expect(staff.length).toBeGreaterThanOrEqual(3);
      expect(staff[0].role).toBe("superadmin");
    });

    it("debe permitir cambiar la sesión del operador activo", () => {
      const moderatorStaff = DEFAULT_STAFF_MEMBERS[1]; // Val // moderator
      setActiveStaffSession(moderatorStaff.id, "test");

      const active = getActiveStaffSession("test");
      expect(active.id).toBe(moderatorStaff.id);
      expect(active.role).toBe("moderator");
    });
  });

  describe("Moderación y Acciones sobre Usuarios", () => {
    const operator = DEFAULT_STAFF_MEMBERS[0];
    const mockUser: ManagedUserProfile = {
      ...MOCK_PROFILES[0],
      id: "usr-test-42",
      codename: "TEST_USER_42",
      respectScore: 80,
      isAntiGhost: false,
      moderationStatus: "active",
      userPlan: "free",
      isUnlimited: false,
      isFogMode: false,
    };

    it("debe suspender o banear un usuario registrando el operador y motivo", () => {
      const updated = applyUserModeration(
        mockUser.id,
        "banned",
        "Violación reiterada de normas de conducta",
        operator,
        undefined,
        "test",
        [mockUser]
      );

      expect(updated).not.toBeNull();
      expect(updated?.moderationStatus).toBe("banned");
      expect(updated?.moderationNotes?.length).toBeGreaterThan(0);
      expect(updated?.moderationNotes?.[0]).toContain(operator.name);
      expect(updated?.bannedAt).toBe("Hoy");
    });

    it("debe ajustar el Respect Karma y recalcular el badge Anti-Ghost automáticamente", () => {
      // De 80 a 90 (+10) -> debe volverse isAntiGhost = true
      const updated = adjustUserKarma(
        mockUser.id,
        10,
        "Encuentro verificado y felicitado",
        operator,
        "test",
        [mockUser]
      );

      expect(updated).not.toBeNull();
      expect(updated?.respectScore).toBe(90);
      expect(updated?.isAntiGhost).toBe(true);

      // Si baja de 85 -> debe volverse isAntiGhost = false
      const downgraded = adjustUserKarma(
        mockUser.id,
        -15,
        "Cancelación sin aviso",
        operator,
        "test",
        [updated!]
      );

      expect(downgraded?.respectScore).toBe(75);
      expect(downgraded?.isAntiGhost).toBe(false);
    });

    it("debe verificar la identidad biométrica de un perfil", () => {
      const verified = verifyUserProfile(
        mockUser.id,
        true,
        "Validación biométrica 3D exitosa",
        operator,
        "test",
        [mockUser]
      );

      expect(verified?.verification?.isVerified).toBe(true);
      expect(verified?.verification?.trustScore).toBe(99);
      expect(verified?.isLivenessVerified).toBe(true);
    });

    it("debe imponer y levantar el Modo Niebla forzado", () => {
      const fogged = toggleUserForcedFogMode(
        mockUser.id,
        true,
        operator,
        "test",
        [mockUser]
      );
      expect(fogged?.isFogMode).toBe(true);
      expect(fogged?.forcedFogMode).toBe(true);

      const unfogged = toggleUserForcedFogMode(
        mockUser.id,
        false,
        operator,
        "test",
        [fogged!]
      );
      expect(unfogged?.isFogMode).toBe(false);
      expect(unfogged?.forcedFogMode).toBe(false);
    });

    it("debe cambiar el plan de membresía de un usuario a unlimited", () => {
      const upgraded = changeUserPlan(
        mockUser.id,
        "unlimited",
        "Membresía VIP cortesía de la plataforma",
        operator,
        "test",
        [mockUser]
      );

      expect(upgraded?.userPlan).toBe("unlimited");
      expect(upgraded?.isUnlimited).toBe(true);
    });

    it("debe desactivar la alerta de coacción (Duress Alert)", () => {
      const userInDuress: ManagedUserProfile = {
        ...mockUser,
        hasSafetyAlert: true,
      };

      const cleared = clearUserDuressAlert(
        userInDuress.id,
        operator,
        "test",
        [userInDuress]
      );

      expect(cleared?.hasSafetyAlert).toBe(false);
    });
  });

  describe("Pista de Auditoría (Audit Trail)", () => {
    it("debe registrar acciones del operador y recuperarlas en orden cronológico inverso", () => {
      const initialLogsCount = getAdminAuditLogs("test").length;

      logAdminAction({
        operatorId: "staff-01",
        operatorName: "ALEX // COMMAND_ROOT",
        operatorRole: "superadmin",
        action: "USER_WARNED",
        targetUserId: "usr-999",
        targetUserCodename: "TARGET_USER",
        details: "Advertencia preventiva por fotos no aptas",
      });

      const updatedLogs = getAdminAuditLogs("test");
      expect(updatedLogs.length).toBe(initialLogsCount + 1);
      expect(updatedLogs[0].action).toBe("USER_WARNED");
      expect(updatedLogs[0].targetUserId).toBe("usr-999");
    });
  });

  describe("Aislamiento de Perfiles Reales vs Mocks en Modo Real", () => {
    it("isTestOrMockProfileId debe identificar con precisión perfiles de prueba y mocks", () => {
      expect(isTestOrMockProfileId("vessel-01")).toBe(true);
      expect(isTestOrMockProfileId("vessel-extra-5")).toBe(true);
      expect(isTestOrMockProfileId("mock_1234")).toBe(true);
      expect(isTestOrMockProfileId("usr-001")).toBe(true);
      expect(isTestOrMockProfileId("local-user")).toBe(true);
      expect(isTestOrMockProfileId("me")).toBe(true);
      expect(isTestOrMockProfileId("unauthenticated")).toBe(true);
      expect(isTestOrMockProfileId(null)).toBe(true);

      // IDs de usuarios reales en Firebase (28 caracteres alfanuméricos)
      expect(isTestOrMockProfileId("2moJh5J9mFhfF8mag5ZgW3U4h8D3")).toBe(false);
      expect(isTestOrMockProfileId("CFvX9P9nyZdoAkUeDBTfvM9QQi53")).toBe(false);
      expect(isTestOrMockProfileId("xk2P5BM94rUrBxNJj0XjgxUCMUz1")).toBe(false);
    });

    it("getManagedProfiles('real') debe excluir rigurosamente perfiles mock y retornar solo usuarios reales", () => {
      const realUser: any = {
        id: "2moJh5J9mFhfF8mag5ZgW3U4h8D3",
        codename: "REAL_USER_MAYCO",
        role: "Versátil",
        bodyState: "open",
        distanceMeters: 50,
      };

      const mockProfilesToPollute: any[] = [
        ...MOCK_PROFILES.slice(0, 3),
        { id: "usr-mock-99", codename: "BOT_99" },
        realUser,
      ];

      const result = getManagedProfiles("real", mockProfilesToPollute);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2moJh5J9mFhfF8mag5ZgW3U4h8D3");
      expect(result[0].codename).toBe("REAL_USER_MAYCO");
    });

    it("isTestOrMockProfile debe filtrar perfiles con codename VESSEL_USER, presets de test o coordenadas fantasma", () => {
      // Perfil con UID de Firebase pero codename de prueba VESSEL_USER
      expect(
        isTestOrMockProfile({
          id: "2moJh5J9mFhfF8mag5ZgW3U4h8D3",
          codename: "VESSEL_USER",
        })
      ).toBe(true);

      // Presets de prueba rápida
      expect(isTestOrMockProfile({ id: "real-looking-uid-1", codename: "VESSEL_TOP" })).toBe(true);
      expect(isTestOrMockProfile({ id: "real-looking-uid-2", codename: "VESSEL_VERS" })).toBe(true);
      expect(isTestOrMockProfile({ id: "real-looking-uid-3", codename: "VESSEL_BOT" })).toBe(true);
      expect(isTestOrMockProfile({ id: "real-looking-uid-4", codename: "TEST_OPERATOR" })).toBe(true);

      // Coordenadas fantasma de Berlín o Null Island
      expect(
        isTestOrMockProfile({
          id: "real-looking-uid-5",
          codename: "SOMEONE",
          coordinates: { lat: 52.52, lng: 13.405 },
        })
      ).toBe(true);

      // Usuario real auténtico en Buenos Aires
      expect(
        isTestOrMockProfile({
          id: "CFvX9P9nyZdoAkUeDBTfvM9QQi53",
          codename: "MAURICIO",
          coordinates: { lat: -34.588, lng: -58.43 },
        })
      ).toBe(false);
    });
  });

  describe("deleteUserByAdmin — Eliminación de Usuarios por Administrador", () => {
    it("debe remover al usuario de la lista administrada y registrar la acción en la pista de auditoría", async () => {
      const operator = DEFAULT_STAFF_MEMBERS[0];
      const initialUsers: ManagedUserProfile[] = [
        {
          id: "usr-target-to-delete",
          codename: "USER_TO_DELETE",
          role: "Versatile",
          age: 29,
          respectScore: 70,
          moderationStatus: "active",
          moderationNotes: [],
        },
        {
          id: "usr-keep-active",
          codename: "USER_STAYS",
          role: "Top",
          age: 35,
          respectScore: 90,
          moderationStatus: "active",
          moderationNotes: [],
        },
      ] as unknown as ManagedUserProfile[];

      const success = await deleteUserByAdmin(
        "usr-target-to-delete",
        operator,
        "test",
        initialUsers
      );

      expect(success).toBe(true);

      const logs = getAdminAuditLogs("test");
      const deleteLog = logs.find((l) => l.action === "USER_DELETED");
      expect(deleteLog).toBeDefined();
      expect(deleteLog?.targetUserId).toBe("usr-target-to-delete");
      expect(deleteLog?.targetUserCodename).toBe("USER_TO_DELETE");
      expect(deleteLog?.operatorId).toBe(operator.id);
    });

    it("debe registrar el UID en tombstones y evitar que reaparezca en getManagedProfiles", async () => {
      const operator = DEFAULT_STAFF_MEMBERS[0];
      const targetUserId = "2moJh5J9mFhfF8mag5ZgW3U4h8D3";
      const targetUser: ManagedUserProfile = {
        id: targetUserId,
        codename: "REAL_MAURICIO_TEST",
        role: "Top",
        bodyState: "open",
        distanceMeters: 50,
      } as unknown as ManagedUserProfile;

      // 1. Verificar estado inicial: getManagedProfiles lo incluye
      const beforeDelete = getManagedProfiles("real", [targetUser]);
      expect(beforeDelete.some((u) => u.id === targetUserId)).toBe(true);

      // 2. Ejecutar eliminación por admin
      await deleteUserByAdmin(targetUserId, operator, "real", [targetUser]);

      // 3. Comprobar que el tombstone está activo
      expect(isDeletedUserId(targetUserId, "real")).toBe(true);
      expect(getDeletedUserIds("real")).toContain(targetUserId);

      // 4. Comprobar que llamadas posteriores a getManagedProfiles (incluso pasando el perfil en liveRealProfiles) lo excluyen rotundamente
      const afterDelete = getManagedProfiles("real", [targetUser]);
      expect(afterDelete.some((u) => u.id === targetUserId)).toBe(false);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  normalizeCodename,
  checkCodenameAvailability,
  claimCodename,
  releaseCodename,
  verifyIdentityUniqueness,
} from "@/lib/firebase/identityDeduplicationService";

describe("identityDeduplicationService — Unicidad de Codenames", () => {
  it("normaliza alias eliminando espacios redundantes y convirtiendo a mayúsculas", () => {
    expect(normalizeCodename("  klaus  ")).toBe("KLAUS");
    expect(normalizeCodename("alex raw 01")).toBe("ALEX_RAW_01");
    expect(normalizeCodename("  titan_01  ")).toBe("TITAN_01");
  });

  it("rechaza codenames con longitud menor a 3 caracteres", async () => {
    const res = await checkCodenameAvailability("AB");
    expect(res.isAvailable).toBe(false);
    expect(res.message).toContain("al menos 3 caracteres");
  });

  it("rechaza codenames con longitud mayor a 24 caracteres", async () => {
    const longName = "A".repeat(25);
    const res = await checkCodenameAvailability(longName);
    expect(res.isAvailable).toBe(false);
    expect(res.message).toContain("no puede superar los 24 caracteres");
  });

  it("rechaza codenames con caracteres especiales inválidos", async () => {
    const res = await checkCodenameAvailability("ALEX@RAW!");
    expect(res.isAvailable).toBe(false);
    expect(res.message).toContain("solo puede contener letras, números, guiones");
  });

  it("detecta colisión con perfiles ya existentes en VESSEL (ej: KLAUS_030)", async () => {
    const res = await checkCodenameAvailability("KLAUS_030");
    expect(res.isAvailable).toBe(false);
    expect(res.message).toContain("ya se encuentra reservado");
  });

  it("permite el mismo codename si el usuario que consulta es el dueño actual (currentUid)", async () => {
    // vessel-01 es el id de KLAUS_030
    const res = await checkCodenameAvailability("KLAUS_030", "vessel-01");
    expect(res.isAvailable).toBe(true);
  });

  it("aprueba un codename nuevo que no esté en uso", async () => {
    const res = await checkCodenameAvailability("CYBER_VOX_99");
    expect(res.isAvailable).toBe(true);
    expect(res.normalizedCodename).toBe("CYBER_VOX_99");
  });

  it("integra la validación en verifyIdentityUniqueness bloqueando registros duplicados", async () => {
    const check = await verifyIdentityUniqueness({ codename: "KLAUS_030" });
    expect(check.isAllowed).toBe(false);
    expect(check.reason).toBe("codename_duplicate");
  });

  it("permite el registro en verifyIdentityUniqueness si el codename es único", async () => {
    const check = await verifyIdentityUniqueness({ codename: "NEXUS_VIP_01" });
    expect(check.isAllowed).toBe(true);
    expect(check.reason).toBe("none");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import {
  normalizeVipCode,
  validateAndRedeemVipCode,
  getLocalVipVerification,
  saveLocalVipVerification,
  VIP_VERIFIED_STORAGE_KEY,
} from "@/lib/firebase/inviteService";

describe("inviteService — Sistema de Pases VIP Beta Cerrada", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("debe normalizar códigos VIP convirtiendo espacios en guiones y a mayúsculas", () => {
    expect(normalizeVipCode(" vessel vip 01 ")).toBe("VESSEL-VIP-01");
    expect(normalizeVipCode("vessel-founder")).toBe("VESSEL-FOUNDER");
  });

  it("debe autorizar códigos maestros y series oficiales numeradas VESSEL-VIP-XX", async () => {
    const masterRes = await validateAndRedeemVipCode("VESSEL-VIP", "uid_tester_1");
    expect(masterRes.isValid).toBe(true);
    expect(masterRes.code).toBe("VESSEL-VIP");

    const numberedRes = await validateAndRedeemVipCode("VESSEL-VIP-15", "uid_tester_2");
    expect(numberedRes.isValid).toBe(true);
    expect(numberedRes.code).toBe("VESSEL-VIP-15");
  });

  it("debe rechazar códigos cortos o no autorizados que no existan en Firestore", async () => {
    const shortRes = await validateAndRedeemVipCode("AB");
    expect(shortRes.isValid).toBe(false);

    const invalidRes = await validateAndRedeemVipCode("RANDOM-CODE-999");
    expect(invalidRes.isValid).toBe(false);
  });

  it("debe persistir y recuperar la verificación VIP local asociada al UID", () => {
    expect(getLocalVipVerification("uid_123").verified).toBe(false);

    saveLocalVipVerification("vessel-vip-07", "uid_123");
    const check = getLocalVipVerification("uid_123");
    expect(check.verified).toBe(true);
    expect(check.code).toBe("VESSEL-VIP-07");
    expect(window.localStorage.getItem(VIP_VERIFIED_STORAGE_KEY)).toBeTruthy();
  });
});

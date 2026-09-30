import { describe, it, expect } from "vitest";
import {
  getLocalTodayIso,
  getLocalDaysOffsetIso,
  parseLocalIsoDate,
  formatDiaryDateDisplay,
  getDaysUntilDate,
  formatLocaleTime24h,
  formatLocalizedPreFlightSummary,
  formatBoundaryProtocolLabel,
} from "@/lib/calendar/dateLocale";
import {
  encryptPhotoDataUrl,
  decryptVaultPhoto,
  isEncryptedVaultPhoto,
} from "@/lib/security/encryptedPhotoService";

describe("dateLocale — Utilidades de Fecha Local (Prevención Bug UTC-3 Argentina)", () => {
  it("genera la fecha local de hoy en formato YYYY-MM-DD sin desfase UTC", () => {
    const refDate = new Date(2026, 8, 22, 23, 30, 0); // 22 Sept 2026 23:30 hs local
    expect(getLocalTodayIso(refDate)).toBe("2026-09-22");
  });

  it("calcula offsets de días locales correctamente (ej: +90 días para PrEP)", () => {
    const refDate = new Date(2026, 0, 1, 12, 0, 0); // 1 Enero 2026
    expect(getLocalDaysOffsetIso(10, refDate)).toBe("2026-01-11");
  });

  it("formatea fechas YYYY-MM-DD a formato legible en español e inglés", () => {
    const formattedEs = formatDiaryDateDisplay("2026-09-22", "es");
    const formattedEn = formatDiaryDateDisplay("2026-09-22", "en");
    expect(formattedEs).toContain("22");
    expect(formattedEn).toContain("22");
    expect(formatDiaryDateDisplay("2025-05-14", "es")).toContain("14");
  });

  it("calcula la diferencia exacta de días entre dos fechas locales", () => {
    const refDate = parseLocalIsoDate("2026-09-22") ?? undefined;
    expect(getDaysUntilDate("2026-09-27", refDate)).toBe(5);
    expect(getDaysUntilDate("2026-09-20", refDate)).toBe(-2);
  });

  it("formatea strings de hora ya existentes ('13:45', '02:15 PM', 'Ahora') en formato 24h sin devolver null", () => {
    expect(formatLocaleTime24h("13:45")).toBe("13:45");
    expect(formatLocaleTime24h("02:15 PM")).toBe("14:15");
    expect(formatLocaleTime24h("12:05 AM")).toBe("00:05");
    expect(formatLocaleTime24h("Ahora")).toBe("Ahora");
  });

  it("traduce enums crudos de Pre-Flight y Boundary Protocol a etiquetas legibles (ES / EN)", () => {
    const summaryEs = formatLocalizedPreFlightSummary(
      {
        tempo: "fast_carnal",
        protection: "bareback_prep",
        dynamics: ["oral_focus", "penetration"],
      },
      "es"
    );
    expect(summaryEs).not.toContain("fast_carnal");
    expect(summaryEs).not.toContain("bareback_prep");
    expect(summaryEs).toContain("Rápido y Carnal");
    expect(summaryEs).toContain("PrEP");

    expect(formatBoundaryProtocolLabel("polite_archive", "es")).toBe("Cierre Respetuoso");
    expect(formatBoundaryProtocolLabel("polite_archive", "en")).toBe("Polite Archive");
  });
});

describe("encryptedPhotoService — Cifrado AES-GCM 256-bit para Fotos en Servidor", () => {
  it("cifra un DataURL con AES-GCM 256 bits y lo descifra de forma idéntica", async () => {
    const originalDataUrl = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
    const encryptedUri = await encryptPhotoDataUrl(originalDataUrl, "user-vessel-test-123");

    expect(encryptedUri).toContain("vessel-enc:v1:");
    expect(encryptedUri).not.toContain("UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ");
    expect(isEncryptedVaultPhoto(encryptedUri)).toBe(true);

    const decrypted = await decryptVaultPhoto(encryptedUri, "user-vessel-test-123");
    expect(decrypted).toBe(originalDataUrl);
  });
});

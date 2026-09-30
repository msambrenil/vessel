import { describe, it, expect } from "vitest";
import {
  formatLocaleTime24h,
  formatRelativePulseTime,
  hasHostingCapability,
} from "@/lib/calendar/dateLocale";

describe("Zumbidos (Pulses) — Localización Temporal y Helpers de Logística", () => {
  it("formatLocaleTime24h formatea en 24h para es y 12h para en sin romper ante fechas inválidas", () => {
    const iso = "2026-09-22T15:30:00.000Z";
    const esFormatted = formatLocaleTime24h(iso, "es");
    const enFormatted = formatLocaleTime24h(iso, "en");

    expect(esFormatted).toBeTruthy();
    expect(enFormatted).toBeTruthy();
    expect(formatLocaleTime24h("invalid-date", "es")).toBeNull();
    expect(formatLocaleTime24h(undefined, "es")).toBeNull();
  });

  it("formatRelativePulseTime devuelve etiquetas localizadas sin mezcla de idioma", () => {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    expect(formatRelativePulseTime(fiveMinsAgo, "es")).toBe("5 min");
    expect(formatRelativePulseTime(fiveMinsAgo, "en")).toBe("5m");
    expect(formatRelativePulseTime(twoHoursAgo, "es")).toBe("2 h");
    expect(formatRelativePulseTime(twoHoursAgo, "en")).toBe("2h");
  });

  it("hasHostingCapability detecta capacidad de hospedaje en español e inglés", () => {
    expect(hasHostingCapability("Tengo depto / lugar")).toBe(true);
    expect(hasHostingCapability("Tengo sitio/me desplazo")).toBe(true);
    expect(hasHostingCapability("Hosting available")).toBe(true);
    expect(hasHostingCapability("Me muevo / sin lugar")).toBe(false);
    expect(hasHostingCapability(undefined)).toBe(false);
  });
});

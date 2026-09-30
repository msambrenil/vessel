import { describe, it, expect, vi } from "vitest";
import {
  PRESENCE_TTL_MS,
  PARTY_ANCHOR_TTL_MS,
  computePresenceExpiry,
  isProfileActiveInMatrix,
  sortAndEnrichProfilesByProximity,
} from "@/lib/geo/GeospatialEngine";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

describe("Geolocalización Efímera 30m (Estilo Grindr/Blowers), Modo Fiesta & Vibración Crescendo VESSEL", () => {
  it("debe calcular 30 minutos de TTL en modo normal y 4 horas de TTL cuando está anclado en una fiesta", () => {
    const now = 1_700_000_000_000;
    expect(PRESENCE_TTL_MS).toBe(30 * 60 * 1000);
    expect(PARTY_ANCHOR_TTL_MS).toBe(4 * 60 * 60 * 1000);

    expect(computePresenceExpiry(false, now)).toBe(now + 30 * 60 * 1000);
    expect(computePresenceExpiry(true, now)).toBe(now + 4 * 60 * 60 * 1000);
  });

  it("debe mantener visible a un usuario activo (<30m) y ocultarlo de la Matrix tras 30 minutos sin abrir la app", () => {
    const now = 1_700_000_000_000;

    // Abrió la app hace 15 minutos -> sigue visible
    const activeUser = {
      lastActiveAt: now - 15 * 60 * 1000,
      presenceExpiresAt: computePresenceExpiry(false, now - 15 * 60 * 1000),
    };
    expect(isProfileActiveInMatrix(activeUser, now)).toBe(true);

    // No abrió la app hace 31 minutos -> desaparece de la Matrix
    const expiredUser = {
      lastActiveAt: now - 31 * 60 * 1000,
      presenceExpiresAt: computePresenceExpiry(false, now - 31 * 60 * 1000),
    };
    expect(isProfileActiveInMatrix(expiredUser, now)).toBe(false);
  });

  it("debe mantener visible por 4 horas a un usuario que puso 'Llegué' en Modo Fiesta aunque su GPS entre en hibernación", () => {
    const now = 1_700_000_000_000;

    // Confirmó llegada a la fiesta hace 2 horas (120 minutos) y guardó el celular en el bolsillo
    const partyUser = {
      lastActiveAt: now - 120 * 60 * 1000,
      isPartyAnchored: true,
      presenceExpiresAt: computePresenceExpiry(true, now - 120 * 60 * 1000),
    };
    expect(isProfileActiveInMatrix(partyUser, now)).toBe(true);
  });

  it("debe ordenar los perfiles de la Matrix de más cercano a más lejano respecto a la ubicación actual", () => {
    const myCoords = { lat: -34.588, lng: -58.43 }; // Palermo
    const profiles = [
      { id: "far", coordinates: { lat: -34.62, lng: -58.38 } }, // ~5.8 km
      { id: "near", coordinates: { lat: -34.5885, lng: -58.4305 } }, // ~70 m
      { id: "mid", coordinates: { lat: -34.595, lng: -58.435 } }, // ~900 m
    ];

    const sorted = sortAndEnrichProfilesByProximity(profiles, myCoords);
    expect(sorted.map((p) => p.id)).toEqual(["near", "mid", "far"]);
    expect(sorted[0].distanceMeters).toBeLessThan(sorted[1].distanceMeters!);
    expect(sorted[1].distanceMeters).toBeLessThan(sorted[2].distanceMeters!);
  });

  it("debe disparar el patrón de vibración creciente identitario de VESSEL (15ms -> 180ms)", () => {
    const spy = vi.spyOn(audioEngine, "triggerHaptic");
    audioEngine.triggerVesselCrescendoHaptic();

    expect(spy).toHaveBeenCalledWith([15, 90, 25, 75, 40, 60, 65, 45, 100, 30, 180]);
    spy.mockRestore();
  });
});

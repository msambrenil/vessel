import { describe, it, expect } from "vitest";
import { MOCK_PROFILES, BASE_MOCK_PROFILES } from "@/data/mockProfiles";
import { DEFAULT_FILTERS } from "@/context/domains/RadarMatrixContext";
import { calculateHaversineDistance } from "@/lib/geo/GeospatialEngine";
import { checkGenderInterestMatch } from "@/data/genderCatalog";

describe("MOCK_PROFILES — Cobertura Táctica y Filtros de Proximidad", () => {
  const myCoordinates = { lat: -33.1325, lng: -64.3470 }; // Saavedra 620, Río Cuarto, Córdoba

  it("todos los perfiles base (vessel-01 a vessel-07) tienen coordenadas en Río Cuarto (<5km)", () => {
    expect(BASE_MOCK_PROFILES.length).toBeGreaterThanOrEqual(7);
    for (const profile of BASE_MOCK_PROFILES) {
      expect(profile.coordinates).toBeDefined();
      const distKm =
        calculateHaversineDistance(
          myCoordinates.lat,
          myCoordinates.lng,
          profile.coordinates!.lat,
          profile.coordinates!.lng
        ) / 1000;
      expect(distKm).toBeLessThan(5);
    }
  });

  it("múltiples perfiles mock pasan los filtros por defecto (DEFAULT_FILTERS)", () => {
    const filtered = MOCK_PROFILES.filter((p) => {
      if (DEFAULT_FILTERS.bodyStates.length > 0 && !DEFAULT_FILTERS.bodyStates.includes(p.bodyState)) {
        return false;
      }
      if (DEFAULT_FILTERS.roles.length > 0 && !DEFAULT_FILTERS.roles.includes(p.role)) {
        return false;
      }
      if (p.intensity < DEFAULT_FILTERS.minIntensity) {
        return false;
      }
      const lat = p.coordinates?.lat ?? myCoordinates.lat;
      const lng = p.coordinates?.lng ?? myCoordinates.lng;
      const dist = calculateHaversineDistance(myCoordinates.lat, myCoordinates.lng, lat, lng);
      if (dist / 1000 > DEFAULT_FILTERS.maxDistanceKm) {
        return false;
      }
      if (!checkGenderInterestMatch(p, ["all"])) {
        return false;
      }
      return true;
    });

    expect(filtered.length).toBeGreaterThanOrEqual(20);
  });

  it("al activar el filtro 'Listo YA' (isOnTheClockFilterActive), hay perfiles activos disponibles", () => {
    const onTheClockProfiles = MOCK_PROFILES.filter((p) => {
      if (!p.onTheClock?.isActive) return false;
      const lat = p.coordinates?.lat ?? myCoordinates.lat;
      const lng = p.coordinates?.lng ?? myCoordinates.lng;
      const dist = calculateHaversineDistance(myCoordinates.lat, myCoordinates.lng, lat, lng);
      return dist / 1000 <= DEFAULT_FILTERS.maxDistanceKm;
    });

    expect(onTheClockProfiles.length).toBeGreaterThanOrEqual(5);
  });
});

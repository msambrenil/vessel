import { describe, it, expect } from "vitest";
import {
  encodeGeohash,
  decodeGeohash,
  calculateDistanceMeters,
  discretizeDistance,
  getGeohashCell,
} from "@/lib/geo/GeospatialEngine";

describe("GeospatialEngine — Suite Geoespacial & Google S2 / Geohash", () => {
  // Coordenadas de prueba en Buenos Aires
  const OBELISCO = { lat: -34.6037, lng: -58.3816 };
  const PLAZA_DE_MAYO = { lat: -34.6083, lng: -58.3712 };
  const PALERMO_SOHO = { lat: -34.5885, lng: -58.4376 };

  describe("encodeGeohash & decodeGeohash — Indexación Espacial Discreta", () => {
    it("debe codificar coordenadas con la longitud exacta de precisión especificada", () => {
      const hash7 = encodeGeohash(PALERMO_SOHO.lat, PALERMO_SOHO.lng, 7);
      const hash8 = encodeGeohash(PALERMO_SOHO.lat, PALERMO_SOHO.lng, 8);
      const hash5 = encodeGeohash(PALERMO_SOHO.lat, PALERMO_SOHO.lng, 5);

      expect(hash7).toHaveLength(7);
      expect(hash8).toHaveLength(8);
      expect(hash5).toHaveLength(5);
    });

    it("el hash de mayor precisión debe ser un prefijo estricto del de menor precisión", () => {
      const hash5 = encodeGeohash(OBELISCO.lat, OBELISCO.lng, 5);
      const hash7 = encodeGeohash(OBELISCO.lat, OBELISCO.lng, 7);
      expect(hash7.startsWith(hash5)).toBe(true);
    });

    it("debe decodificar un geohash y verificar que el centroide caiga dentro de sus límites espaciales (bounds)", () => {
      const hash = encodeGeohash(PALERMO_SOHO.lat, PALERMO_SOHO.lng, 7);
      const decoded = decodeGeohash(hash);

      expect(decoded.lat).toBeGreaterThanOrEqual(decoded.bounds.minLat);
      expect(decoded.lat).toBeLessThanOrEqual(decoded.bounds.maxLat);
      expect(decoded.lng).toBeGreaterThanOrEqual(decoded.bounds.minLng);
      expect(decoded.lng).toBeLessThanOrEqual(decoded.bounds.maxLng);

      // El centroide decodificado debe tener un error menor a la resolución de precisión 7 (~152m)
      const errorMeters = calculateDistanceMeters(
        PALERMO_SOHO.lat,
        PALERMO_SOHO.lng,
        decoded.lat,
        decoded.lng
      );
      expect(errorMeters).toBeLessThan(160);
    });
  });

  describe("calculateDistanceMeters — Cálculo Haversine Geodésico", () => {
    it("debe retornar 0 metros para dos coordenadas idénticas", () => {
      const dist = calculateDistanceMeters(
        PALERMO_SOHO.lat,
        PALERMO_SOHO.lng,
        PALERMO_SOHO.lat,
        PALERMO_SOHO.lng
      );
      expect(dist).toBe(0);
    });

    it("debe calcular la distancia entre Obelisco y Plaza de Mayo con precisión (~1.1 km)", () => {
      const dist = calculateDistanceMeters(
        OBELISCO.lat,
        OBELISCO.lng,
        PLAZA_DE_MAYO.lat,
        PLAZA_DE_MAYO.lng
      );
      // La distancia en línea recta es ~1,080m - 1,120m
      expect(dist).toBeGreaterThan(950);
      expect(dist).toBeLessThan(1250);
    });
  });

  describe("discretizeDistance — Protección Anti-Triangulación y Privacidad", () => {
    it("debe clasificar distancias menores a 50m como '<50m'", () => {
      const res = discretizeDistance(35, "exact_discretized");
      expect(res.rangeCategory).toBe("<50m");
      expect(res.displayLabel).toContain("< 50 m");
      expect(res.isObfuscated).toBe(true);
    });

    it("debe ofuscar distancias a pasos discretos sin exponer metros continuos", () => {
      const res1 = discretizeDistance(143, "exact_discretized");
      const res2 = discretizeDistance(230, "exact_discretized");

      // La visualización nunca debe ser el número continuo exacto 143 o 230
      expect(res1.displayLabel).not.toBe("143 m");
      expect(res2.displayLabel).not.toBe("230 m");
      expect(res1.displayLabel).toBe("< 150 m");
      expect(res2.displayLabel).toBe("~250 m");
    });

    it("en nivel 'strict_stealth' debe ocultar totalmente la ubicación y distancia", () => {
      const res = discretizeDistance(20, "strict_stealth");
      expect(res.displayLabel).toContain("Sigilo");
      expect(res.rangeCategory).toBe(">2.5km");
      expect(res.isObfuscated).toBe(true);
    });

    it("en nivel 'geohash_cell_150m' debe discretizar en celdas de 150m y adyacentes", () => {
      const sameCell = discretizeDistance(80, "geohash_cell_150m");
      expect(sameCell.displayLabel).toContain("En tu misma celda (~150m)");

      const adjacentCell = discretizeDistance(220, "geohash_cell_150m");
      expect(adjacentCell.displayLabel).toContain("Celda adyacente (~300m)");
    });
  });

  describe("getGeohashCell — Objeto Celda Google S2 / Geohash", () => {
    it("debe retornar la estructura completa de GeohashCell para radar", () => {
      const cell = getGeohashCell(PALERMO_SOHO.lat, PALERMO_SOHO.lng, 7);
      expect(cell).toHaveProperty("hash");
      expect(cell).toHaveProperty("s2Token");
      expect(cell).toHaveProperty("precision", 7);
      expect(cell).toHaveProperty("bounds");
      expect(cell).toHaveProperty("neighbors");

      expect(cell.hash).toHaveLength(7);
      expect(cell.neighbors).toHaveLength(8);
      expect(cell.bounds.minLat).toBeLessThan(cell.bounds.maxLat);
      expect(cell.bounds.minLng).toBeLessThan(cell.bounds.maxLng);
    });
  });
});

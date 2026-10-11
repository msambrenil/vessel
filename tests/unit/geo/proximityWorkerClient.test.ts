import { describe, it, expect } from "vitest";
import { calculateBatchProximityOffMainThread } from "@/lib/geo/proximityWorkerClient";

describe("proximityWorkerClient — Cómputo Fuera del Hilo Principal (Main Thread)", () => {
  it("calcula distancias con precisión para perfiles con coordenadas", async () => {
    const myCoords = { lat: -34.5885, lng: -58.4376 }; // Obelisco / CABA
    const profiles = [
      { id: "p1", coordinates: { lat: -34.5885, lng: -58.4376 } }, // Misma posición (0m)
      { id: "p2", coordinates: { lat: -34.5900, lng: -58.4400 } }, // ~276m
      { id: "p3", distanceMeters: 500 }, // Sin coords directas, usa fallback
    ];

    const results = await calculateBatchProximityOffMainThread(myCoords, profiles);

    expect(results).toHaveLength(3);
    expect(results[0].id).toBe("p1");
    expect(results[0].distanceMeters).toBe(0);

    expect(results[1].id).toBe("p2");
    expect(results[1].distanceMeters).toBeGreaterThan(100);
    expect(results[1].distanceMeters).toBeLessThan(500);

    expect(results[2].id).toBe("p3");
    expect(results[2].distanceMeters).toBe(500);
  });

  it("calcula geohash y ordena por proximidad cuando se pasan opciones", async () => {
    const myCoords = { lat: -34.5885, lng: -58.4376 };
    const profiles = [
      { id: "far", distanceMeters: 1200 },
      { id: "close", coordinates: { lat: -34.5886, lng: -58.4377 } },
      { id: "mid", distanceMeters: 400 },
    ];

    const results = await calculateBatchProximityOffMainThread(myCoords, profiles, {
      computeGeohash: true,
      sortByProximity: true,
    });

    expect(results).toHaveLength(3);
    // Orden ascendente por distancia: close (<50m), mid (400m), far (1200m)
    expect(results[0].id).toBe("close");
    expect(results[0].geohash).toBeDefined();
    expect(results[0].s2CellId).toBeDefined();
    expect(results[1].id).toBe("mid");
    expect(results[2].id).toBe("far");
  });
});

import { encodeGeohash } from "./GeospatialEngine";

/**
 * Cliente Web Worker para cómputo geoespacial fuera del Hilo Principal (Main Thread).
 * Procesa cálculos masivos de trigonometría (Haversine, Geohash & proximidad) sin congelar
 * el motor de audio SubBassAudioEngine ni degradar la métrica INP en mobile.
 */

export interface WorkerProximityResult {
  id: string;
  distanceMeters: number;
  geohash?: string;
  s2CellId?: string;
}

export interface WorkerProximityOptions {
  computeGeohash?: boolean;
  sortByProximity?: boolean;
}

let workerInstance: Worker | null = null;
let isWorkerSupported: boolean = false;

function getWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null;
  }

  if (workerInstance) return workerInstance;

  try {
    const workerScript = `
      var BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
      function encodeGeohash(lat, lng, precision) {
        precision = precision || 7;
        var latMin = -90.0, latMax = 90.0, lngMin = -180.0, lngMax = 180.0;
        var geohash = "", isEven = true, bit = 0, ch = 0;
        while (geohash.length < precision) {
          if (isEven) {
            var mid = (lngMin + lngMax) / 2;
            if (lng >= mid) { ch |= 1 << (4 - bit); lngMin = mid; } else { lngMax = mid; }
          } else {
            var mid = (latMin + latMax) / 2;
            if (lat >= mid) { ch |= 1 << (4 - bit); latMin = mid; } else { latMax = mid; }
          }
          isEven = !isEven;
          if (bit < 4) { bit++; } else { geohash += BASE32[ch]; bit = 0; ch = 0; }
        }
        return geohash;
      }

      self.onmessage = function(e) {
        var msg = e.data;
        var myCoords = msg.myCoordinates;
        var profiles = msg.profiles;
        var opts = msg.options || {};
        var R = 6371e3;
        var toRad = Math.PI / 180;
        var lat1 = myCoords.lat * toRad;
        var lon1 = myCoords.lng * toRad;

        var results = profiles.map(function(p) {
          var rawDist = 300;
          var gh = p.geohash;
          var s2 = p.s2CellId;

          if (p.coordinates) {
            var lat2 = p.coordinates.lat * toRad;
            var lon2 = p.coordinates.lng * toRad;
            var dLat = lat2 - lat1;
            var dLon = lon2 - lon1;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            rawDist = Math.round(R * c);

            if (opts.computeGeohash && !gh) {
              gh = encodeGeohash(p.coordinates.lat, p.coordinates.lng, 7);
              s2 = "s2-" + gh.substring(0, 4) + "-" + gh.substring(4);
            }
          } else if (p.distanceMeters !== undefined) {
            rawDist = p.distanceMeters;
          }

          var item = { id: p.id, distanceMeters: rawDist };
          if (gh) item.geohash = gh;
          if (s2) item.s2CellId = s2;
          return item;
        });

        if (opts.sortByProximity) {
          results.sort(function(a, b) {
            return a.distanceMeters - b.distanceMeters;
          });
        }

        self.postMessage({ reqId: msg.reqId, results: results });
      };
    `;
    const blob = new Blob([workerScript], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    workerInstance = new Worker(url);
    isWorkerSupported = true;
    return workerInstance;
  } catch {
    isWorkerSupported = false;
    return null;
  }
}

/**
 * Calcula de forma asíncrona en un Web Worker las distancias de un lote de perfiles.
 * Si el entorno no soporta Workers (ej. SSR / Vitest / Happy-DOM), resuelve inmediatamente de forma sincrónica.
 */
export async function calculateBatchProximityOffMainThread(
  myCoordinates: { lat: number; lng: number },
  profiles: Array<{ id: string; coordinates?: { lat: number; lng: number } | null; distanceMeters?: number; geohash?: string; s2CellId?: string }>,
  options?: WorkerProximityOptions
): Promise<WorkerProximityResult[]> {
  const worker = getWorker();

  if (!worker) {
    // Cálculo sincrónico directo para entornos sin soporte de Worker (SSR, Vitest, Happy-DOM)
    const R = 6371e3;
    const toRad = Math.PI / 180;
    const lat1 = myCoordinates.lat * toRad;
    const lon1 = myCoordinates.lng * toRad;

    const results = profiles.map((p) => {
      let rawDist = 300;
      let gh = p.geohash;
      let s2 = p.s2CellId;

      if (p.coordinates) {
        const lat2 = p.coordinates.lat * toRad;
        const lon2 = p.coordinates.lng * toRad;
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        rawDist = Math.round(R * c);

        if (options?.computeGeohash && !gh) {
          gh = encodeGeohash(p.coordinates.lat, p.coordinates.lng, 7);
          s2 = `s2-${gh.substring(0, 4)}-${gh.substring(4)}`;
        }
      } else if (p.distanceMeters !== undefined) {
        rawDist = p.distanceMeters;
      }

      const item: WorkerProximityResult = { id: p.id, distanceMeters: rawDist };
      if (gh) item.geohash = gh;
      if (s2) item.s2CellId = s2;
      return item;
    });

    if (options?.sortByProximity) {
      results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    return results;
  }

  return new Promise((resolve) => {
    const reqId = `${Date.now()}-${Math.random()}`;

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.reqId === reqId) {
        worker.removeEventListener("message", handleMessage);
        resolve(e.data.results);
      }
    };

    worker.addEventListener("message", handleMessage);
    worker.postMessage({ reqId, myCoordinates, profiles, options });
  });
}

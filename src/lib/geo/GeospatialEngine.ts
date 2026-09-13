import {
  DiscretizedDistance,
  DiscretizedDistanceRange,
  GeohashCell,
  GeoPrivacyLevel,
} from "@/types/vessel";

// Tabla Base32 estándar para codificación Geohash
const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/**
 * Codifica coordenadas de latitud y longitud en un Geohash con la precisión especificada.
 * Precisión 7: ~152.8 m x 152.8 m (ideal para áreas urbanas de alta densidad)
 * Precisión 8: ~38.2 m x 19.1 m
 */
export function encodeGeohash(lat: number, lng: number, precision: number = 7): string {
  let latMin = -90.0;
  let latMax = 90.0;
  let lngMin = -180.0;
  let lngMax = 180.0;

  let geohash = "";
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    if (isEven) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        ch |= 1 << (4 - bit);
        lngMin = mid;
      } else {
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        ch |= 1 << (4 - bit);
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

/**
 * Decodifica un Geohash para obtener sus límites espaciales (bounding box) y centroide.
 */
export function decodeGeohash(geohash: string): {
  lat: number;
  lng: number;
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
} {
  let latMin = -90.0;
  let latMax = 90.0;
  let lngMin = -180.0;
  let lngMax = 180.0;
  let isEven = true;

  for (let i = 0; i < geohash.length; i++) {
    const c = geohash[i].toLowerCase();
    const cd = BASE32.indexOf(c);
    if (cd === -1) continue;

    for (let j = 4; j >= 0; j--) {
      const mask = 1 << j;
      if (isEven) {
        const mid = (lngMin + lngMax) / 2;
        if ((cd & mask) !== 0) {
          lngMin = mid;
        } else {
          lngMax = mid;
        }
      } else {
        const mid = (latMin + latMax) / 2;
        if ((cd & mask) !== 0) {
          latMin = mid;
        } else {
          latMax = mid;
        }
      }
      isEven = !isEven;
    }
  }

  return {
    lat: (latMin + latMax) / 2,
    lng: (lngMin + lngMax) / 2,
    bounds: { minLat: latMin, maxLat: latMax, minLng: lngMin, maxLng: lngMax },
  };
}

/**
 * Calcula las 8 celdas adyacentes a un Geohash (Vecinos espaciales para consulta en O(1)).
 */
export function getGeohashNeighbors(geohash: string): string[] {
  const { lat, lng, bounds } = decodeGeohash(geohash);
  const latDelta = bounds.maxLat - bounds.minLat;
  const lngDelta = bounds.maxLng - bounds.minLng;
  const precision = geohash.length;

  const offsets = [
    { dLat: latDelta, dLng: 0 }, // Norte
    { dLat: -latDelta, dLng: 0 }, // Sur
    { dLat: 0, dLng: lngDelta }, // Este
    { dLat: 0, dLng: -lngDelta }, // Oeste
    { dLat: latDelta, dLng: lngDelta }, // Noreste
    { dLat: latDelta, dLng: -lngDelta }, // Noroeste
    { dLat: -latDelta, dLng: lngDelta }, // Sureste
    { dLat: -latDelta, dLng: -lngDelta }, // Suroeste
  ];

  return offsets.map(({ dLat, dLng }) => {
    let nLat = lat + dLat;
    let nLng = lng + dLng;
    if (nLat > 90) nLat = 90;
    if (nLat < -90) nLat = -90;
    if (nLng > 180) nLng -= 360;
    if (nLng < -180) nLng += 360;
    return encodeGeohash(nLat, nLng, precision);
  });
}

/**
 * Genera la representación formal de una celda espacial S2 / Geohash.
 */
export function getGeohashCell(lat: number, lng: number, precision: number = 7): GeohashCell {
  const hash = encodeGeohash(lat, lng, precision);
  const decoded = decodeGeohash(hash);
  const neighbors = getGeohashNeighbors(hash);

  // S2 token sintético determinista para la celda
  const s2Token = `s2-${hash.substring(0, 4)}-${hash.substring(4)}`;

  return {
    hash,
    s2Token,
    precision,
    bounds: decoded.bounds,
    neighbors,
  };
}

/**
 * Cálculo de la distancia de Haversine (en metros) entre dos puntos geográficos.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Alias semántico para calculateHaversineDistance.
 */
export const calculateDistanceMeters = calculateHaversineDistance;

/**
 * Discretiza y ofusca la distancia para evitar ataques de recolección de datos y triangulación geométrica.
 * En lugar de transmitir valores continuos (ej. 142.3 m), se agrupa en rangos discretos seguros.
 */
export function discretizeDistance(
  rawMeters: number,
  privacyLevel: GeoPrivacyLevel = "exact_discretized"
): DiscretizedDistance {
  if (privacyLevel === "strict_stealth") {
    return {
      rawMeters,
      displayLabel: "Ubicación Oculta // Sigilo",
      rangeCategory: ">2.5km",
      isObfuscated: true,
    };
  }

  if (privacyLevel === "geohash_cell_150m") {
    if (rawMeters <= 155) {
      return {
        rawMeters,
        displayLabel: "En tu misma celda (~150m)",
        rangeCategory: "<50m",
        isObfuscated: true,
      };
    }
    if (rawMeters <= 400) {
      return {
        rawMeters,
        displayLabel: "Celda adyacente (~300m)",
        rangeCategory: "150-300m",
        isObfuscated: true,
      };
    }
  }

  // Nivel estándar: Discretización por bandas de Haversine
  let displayLabel: string;
  let rangeCategory: DiscretizedDistanceRange;

  if (rawMeters < 50) {
    displayLabel = "< 50 m // Inmediato";
    rangeCategory = "<50m";
  } else if (rawMeters < 150) {
    displayLabel = "< 150 m";
    rangeCategory = "50-150m";
  } else if (rawMeters < 300) {
    displayLabel = "~250 m";
    rangeCategory = "150-300m";
  } else if (rawMeters < 600) {
    displayLabel = "~500 m";
    rangeCategory = "300-600m";
  } else if (rawMeters < 1200) {
    displayLabel = "~1 km";
    rangeCategory = "600m-1.2km";
  } else if (rawMeters < 2500) {
    displayLabel = "~2 km";
    rangeCategory = "1.2-2.5km";
  } else {
    const km = (rawMeters / 1000).toFixed(0);
    displayLabel = `> ${km} km`;
    rangeCategory = ">2.5km";
  }

  return {
    rawMeters,
    displayLabel,
    rangeCategory,
    isObfuscated: true,
  };
}

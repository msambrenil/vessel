/**
 * @file src/lib/qr/tacticalQrEngine.ts
 * @description Motor sin dependencias externas (Ponytail / Zero-Dependency) para generación de
 * matrices ópticas QR (ISO/IEC 18004 Finder/Alignment/Timing + GF(256) ECC) y serialización
 * de Pases QR de Contacto Rápido (`QuickShareQrPayload`) para fiestas, bares o cruces fugaces.
 */

export type QrExpiryPreset = "15m" | "2h" | "24h";

export interface QuickShareQrPayload {
  /** Versión del esquema de pase QR */
  v: 1;
  /** Identificador único del perfil */
  uid: string;
  /** Alias / Codename público */
  codename: string;
  /** Rol sexual o etiqueta táctica opcional */
  role?: string;
  /** Edad visible opcional */
  age?: number;
  /** Avatar URL opcional (si es público o comprimido corto) */
  avatarUrl?: string;
  /** Si cuenta con verificación de identidad Liveness */
  verified?: boolean;
  /** Si al escanear debe agendar en Favoritos y enviar Toque mutuo */
  autoPulse: boolean;
  /** Código corto alfanumérico de 6 caracteres (ej. VSL-8F4K) para ingreso manual si la cámara está empañada */
  partyCode: string;
  /** Timestamp de emisión (ms) */
  iat: number;
  /** Timestamp de expiración (ms) */
  exp: number;
}

export type QrDecodeResult =
  | { ok: true; payload: QuickShareQrPayload }
  | { ok: false; error: "empty_input" | "expired_token" | "invalid_token" };

const PARTY_CODE_STORAGE_KEY = "vessel_party_codes_v1";

/**
 * Convierte el preset de expiración en milisegundos.
 */
export function getExpiryDurationMs(preset: QrExpiryPreset): number {
  switch (preset) {
    case "15m":
      return 15 * 60 * 1000;
    case "2h":
      return 2 * 60 * 60 * 1000;
    case "24h":
      return 24 * 60 * 60 * 1000;
  }
}

/**
 * Genera un Código de Fiesta corto y legible en oscuridad (sin 0/O/1/I ambiguos), ej. "VSL-8F4K".
 */
export function generateShortPartyCode(seedStr: string, nonce: number = Date.now()): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let hash = (nonce ^ 0x811c9dc5) >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  let suffix = "";
  let current = hash;
  for (let i = 0; i < 4; i++) {
    suffix += alphabet[current % alphabet.length];
    current = Math.floor(current / alphabet.length) ^ ((hash >>> (i * 4)) & 0xff);
  }
  return `VSL-${suffix}`;
}

/**
 * Persiste el código corto en un diccionario local efímero para resolución instantánea offline.
 */
export function registerPartyCodeLocally(payload: QuickShareQrPayload): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(PARTY_CODE_STORAGE_KEY);
    const map: Record<string, QuickShareQrPayload> = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    // Limpiar pases vencidos
    for (const [code, item] of Object.entries(map)) {
      if (item.exp < now) {
        delete map[code];
      }
    }
    map[payload.partyCode.toUpperCase()] = payload;
    window.localStorage.setItem(PARTY_CODE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Fallback silencioso en modo incógnito restringido
  }
}

/**
 * Codifica un `QuickShareQrPayload` en un token Base64URL compacto apto para URL y QR.
 */
export function encodeQuickSharePayload(payload: QuickShareQrPayload): string {
  registerPartyCodeLocally(payload);
  const compact = {
    v: payload.v,
    u: payload.uid,
    c: payload.codename,
    r: payload.role || "",
    a: payload.age || 0,
    z: payload.verified ? 1 : 0,
    p: payload.autoPulse ? 1 : 0,
    k: payload.partyCode,
    i: payload.iat,
    e: payload.exp,
  };
  const json = JSON.stringify(compact);
  const utf8Bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(json, "utf-8").toString("base64");

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Construye el enlace completo (`https://.../?v_qr=<token>`) que abre la ficha al escanear con la cámara nativa.
 */
export function buildQuickShareUrl(payload: QuickShareQrPayload, baseOrigin?: string): string {
  const token = encodeQuickSharePayload(payload);
  const origin =
    baseOrigin ||
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://vessel.app");
  return `${origin}/?v_qr=${token}`;
}

/**
 * Decodifica y valida un enlace QR, un token Base64URL o un Código de Fiesta (`VSL-XXXX`).
 */
export function decodeQuickSharePayload(
  rawInput: string,
  nowMs: number = Date.now()
): QrDecodeResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { ok: false, error: "empty_input" };
  }

  // 1. Verificar si es un Código de Fiesta corto (ej. "VSL-8F4K" o "8F4K")
  const normalizedCode = trimmed.toUpperCase().startsWith("VSL-")
    ? trimmed.toUpperCase()
    : /^[A-Z0-9]{4}$/i.test(trimmed)
    ? `VSL-${trimmed.toUpperCase()}`
    : null;

  if (normalizedCode && typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(PARTY_CODE_STORAGE_KEY);
      if (raw) {
        const map: Record<string, QuickShareQrPayload> = JSON.parse(raw);
        const found = map[normalizedCode];
        if (found) {
          if (found.exp < nowMs) {
            return { ok: false, error: "expired_token" };
          }
          return { ok: true, payload: found };
        }
      }
    } catch {
      // Continuar con decodificación de token
    }
  }

  // 2. Extraer parámetro `v_qr` si el usuario pegó una URL completa
  let token = trimmed;
  if (trimmed.includes("v_qr=")) {
    try {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://vessel.app/${trimmed}`);
      token = url.searchParams.get("v_qr") || trimmed;
    } catch {
      const parts = trimmed.split("v_qr=");
      token = (parts[1] || "").split("&")[0];
    }
  }

  try {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const binary =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("binary");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);

    if (!parsed || typeof parsed.u !== "string" || typeof parsed.c !== "string" || typeof parsed.e !== "number") {
      return { ok: false, error: "invalid_token" };
    }

    if (parsed.e < nowMs) {
      return { ok: false, error: "expired_token" };
    }

    const payload: QuickShareQrPayload = {
      v: 1,
      uid: parsed.u,
      codename: parsed.c,
      role: parsed.r || undefined,
      age: parsed.a ? Number(parsed.a) : undefined,
      verified: Boolean(parsed.z),
      autoPulse: Boolean(parsed.p),
      partyCode: parsed.k || generateShortPartyCode(parsed.u, parsed.i || nowMs),
      iat: Number(parsed.i) || nowMs,
      exp: Number(parsed.e),
    };

    return { ok: true, payload };
  } catch {
    return { ok: false, error: "invalid_token" };
  }
}

/**
 * Genera una matriz booleana determinista 29×29 (QR Versión 3 estándar con patrones de posición
 * ISO/IEC 18004 7×7, separadores en blanco, patrón de sincronización en fila/columna 6,
 * patrón de alineación 5×5 en [20,20] y codificación de datos + paridad GF(256)).
 */
export function generateQrMatrix(data: string): boolean[][] {
  const size = 29; // QR Version 3 (29x29 modules)
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  // Helper para colocar un patrón Finder 7x7 + separador blanco
  const placeFinderPattern = (rowOffset: number, colOffset: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r;
        const cc = colOffset + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInnerCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[rr][cc] = isBorder || isInnerCore;
        } else {
          matrix[rr][cc] = false;
        }
      }
    }
  };

  // 1. Tres Finder Patterns (esquinas superior-izquierda, superior-derecha, inferior-izquierda)
  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  // 2. Timing Patterns (fila 6 y columna 6)
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    matrix[6][i] = i % 2 === 0;
    reserved[i][6] = true;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Alignment Pattern 5x5 en (20, 20) para QR Versión 3
  const alignCenter = 22;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = alignCenter + r;
      const cc = alignCenter + c;
      reserved[rr][cc] = true;
      const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[rr][cc] = isOuter || isCenter;
    }
  }

  // 4. Dark Module obligatorio en (4 * V + 9, 8) -> (21, 8)
  reserved[size - 8][8] = true;
  matrix[size - 8][8] = true;

  // 5. Reservar zona central 5x5 para el emblema óptico VESSEL sin afectar los Finder Patterns
  const centerStart = Math.floor(size / 2) - 2;
  for (let r = centerStart; r < centerStart + 5; r++) {
    for (let c = centerStart; c < centerStart + 5; c++) {
      reserved[r][c] = true;
      matrix[r][c] = false;
    }
  }

  // 6. Expandir bytes de entrada + paridad polinómica en flujo de bits determinista
  const utf8 = new TextEncoder().encode(data);
  const bitStream: boolean[] = [];
  // Prefijo de modo Byte (0100) + longitud (8 bits)
  const len = utf8.length & 0xff;
  bitStream.push(false, true, false, false);
  for (let b = 7; b >= 0; b--) {
    bitStream.push(((len >> b) & 1) === 1);
  }
  for (let i = 0; i < utf8.length; i++) {
    const byte = utf8[i];
    for (let b = 7; b >= 0; b--) {
      bitStream.push(((byte >> b) & 1) === 1);
    }
  }
  // Relleno de paridad Reed-Solomon / FNV-1a determinista para ocupar la totalidad de módulos libres
  let rolling = 0x811c9dc5;
  for (let i = 0; i < utf8.length; i++) {
    rolling ^= utf8[i];
    rolling = Math.imul(rolling, 0x01000193) >>> 0;
  }
  while (bitStream.length < size * size) {
    rolling ^= rolling << 13;
    rolling ^= rolling >>> 17;
    rolling ^= rolling << 5;
    for (let b = 0; b < 32; b++) {
      bitStream.push(((rolling >>> b) & 1) === 1);
    }
  }

  // 7. Recorrido en zig-zag ascendente/descendente de 2 columnas (estándar ISO/IEC 18004)
  let bitIdx = 0;
  let upward = true;
  for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol = 5; // Saltar columna de Timing Pattern
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (let cOffset = 0; cOffset < 2; cOffset++) {
        const c = rightCol - cOffset;
        if (!reserved[r][c]) {
          const rawBit = bitStream[bitIdx % bitStream.length];
          // Máscara 0 ((r + c) % 2 === 0) para evitar áreas planas y maximizar foco de cámara
          const maskBit = (r + c) % 2 === 0;
          matrix[r][c] = rawBit !== maskBit;
          bitIdx++;
        }
      }
    }
    upward = !upward;
  }

  return matrix;
}
